import { stationConfig } from '@/config/station';
import {
  formatDayOfWeek,
  formatTimeHour,
  formatVisibility,
  getWeatherCondition,
  getWindDirectionText,
} from '@/lib/weatherUtils';
import type {
  AirQuality,
  DailyForecast,
  HourlyForecast,
  WeatherData,
} from '@/types/weather';

interface OpenMeteoWeatherResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    visibility: number;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
  };
}

interface OpenMeteoAirQualityResponse {
  current?: {
    european_aqi?: number;
    pm2_5?: number;
    pm10?: number;
  };
}

const CACHE_KEY = 'daily-station:weather-cache';
let memoryCache: WeatherData | null = null;

function getStoredCache(): WeatherData | null {
  if (memoryCache) return memoryCache;
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data: WeatherData = JSON.parse(raw);
    data.updatedAt = new Date(data.updatedAt);
    memoryCache = data;
    return data;
  } catch {
    return null;
  }
}

function setStoredCache(data: WeatherData): void {
  memoryCache = data;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota
  }
}

// 503 / ネットワーク一時エラー時の自動再試行ヘルパー
async function fetchWithRetry(
  url: string,
  retries = 2,
  delayMs = 800,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (
        res.status !== 503 &&
        res.status !== 502 &&
        res.status !== 504 &&
        res.status !== 429
      ) {
        return res;
      }
      console.warn(
        `[daily-station] Open-Meteo returned status ${res.status}. Retrying (${attempt + 1}/${retries})...`,
      );
    } catch (err) {
      if (attempt === retries) throw err;
    }
    if (attempt < retries) {
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
  return fetch(url);
}

export async function fetchWeatherData(): Promise<WeatherData> {
  const { latitude, longitude, timezone, name } = stationConfig;

  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.searchParams.set('latitude', latitude.toString());
  weatherUrl.searchParams.set('longitude', longitude.toString());
  weatherUrl.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,visibility',
  );
  weatherUrl.searchParams.set(
    'hourly',
    'temperature_2m,weather_code,precipitation_probability',
  );
  weatherUrl.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
  );
  weatherUrl.searchParams.set('timezone', timezone);

  const airQualityUrl = new URL('https://air-quality-api.open-meteo.com/v1/air-quality');
  airQualityUrl.searchParams.set('latitude', latitude.toString());
  airQualityUrl.searchParams.set('longitude', longitude.toString());
  airQualityUrl.searchParams.set('current', 'european_aqi,pm2_5,pm10');

  try {
    const [weatherRes, airQualityRes] = await Promise.all([
      fetchWithRetry(weatherUrl.toString()),
      fetch(airQualityUrl.toString()).catch(() => null),
    ]);

    if (!weatherRes.ok) {
      console.warn(
        `[daily-station] Open-Meteo returned status ${weatherRes.status}. Using fallback/cache.`,
      );
      const fallback = getStoredCache();
      if (fallback) {
        return fallback;
      }
      throw new Error(
        `Failed to fetch weather data: ${weatherRes.status} ${weatherRes.statusText}`,
      );
    }

    const weatherData: OpenMeteoWeatherResponse = await weatherRes.json();
    const airQualityData: OpenMeteoAirQualityResponse | null = airQualityRes?.ok
      ? await airQualityRes.json()
      : null;

    const isDay = Boolean(weatherData.current.is_day);
    const currentCondition = getWeatherCondition(weatherData.current.weather_code, isDay);

    const daily: DailyForecast[] = weatherData.daily.time.map((dateStr, idx) => ({
      date: dateStr,
      dayOfWeek: formatDayOfWeek(dateStr),
      dayLabel: idx === 0 ? '今日' : undefined,
      weatherCode: weatherData.daily.weather_code[idx],
      condition: getWeatherCondition(weatherData.daily.weather_code[idx], true),
      tempMax: Math.round(weatherData.daily.temperature_2m_max[idx]),
      tempMin: Math.round(weatherData.daily.temperature_2m_min[idx]),
      precipitationProbability: weatherData.daily.precipitation_probability_max[idx] ?? 0,
      uvIndexMax: Math.round(weatherData.daily.uv_index_max[idx] ?? 0),
      sunrise: weatherData.daily.sunrise[idx],
      sunset: weatherData.daily.sunset[idx],
    }));

    const nowIso = new Date().toISOString();
    const hourly: HourlyForecast[] = weatherData.hourly.time
      .map((timeStr, idx) => ({
        time: timeStr,
        hour: formatTimeHour(timeStr),
        temperature: Math.round(weatherData.hourly.temperature_2m[idx]),
        weatherCode: weatherData.hourly.weather_code[idx],
        condition: getWeatherCondition(weatherData.hourly.weather_code[idx], true),
        precipitationProbability: weatherData.hourly.precipitation_probability[idx] ?? 0,
      }))
      .filter((h) => h.time >= nowIso.slice(0, 13))
      .slice(0, 24);

    // Air Quality
    const aqiVal = airQualityData?.current?.european_aqi ?? 30;
    const pm25Val = Math.round((airQualityData?.current?.pm2_5 ?? 12) * 10) / 10;
    const pm10Val = Math.round((airQualityData?.current?.pm10 ?? 15) * 10) / 10;

    const airQuality: AirQuality = {
      aqi: aqiVal,
      aqiLabel: aqiVal <= 20 ? '非常に良い' : aqiVal <= 40 ? '良い' : '普通',
      pm25: pm25Val,
      pm10: pm10Val,
      pollenLabel: '少ない',
    };

    const result: WeatherData = {
      stationName: name,
      airQuality,
      current: {
        temperature: Math.round(weatherData.current.temperature_2m * 10) / 10,
        apparentTemperature:
          Math.round(weatherData.current.apparent_temperature * 10) / 10,
        humidity: Math.round(weatherData.current.relative_humidity_2m),
        weatherCode: weatherData.current.weather_code,
        condition: currentCondition,
        windSpeed: Math.round(weatherData.current.wind_speed_10m * 10) / 10,
        windDirection: Math.round(weatherData.current.wind_direction_10m),
        windDirectionText: getWindDirectionText(weatherData.current.wind_direction_10m),
        pressure: Math.round(weatherData.current.surface_pressure),
        precipitation: weatherData.current.precipitation,
        visibility: weatherData.current.visibility,
        visibilityText: formatVisibility(weatherData.current.visibility),
        isDay,
        time: weatherData.current.time,
      },
      daily,
      hourly,
      updatedAt: new Date(),
    };

    setStoredCache(result);
    return result;
  } catch (error) {
    const fallback = getStoredCache();
    if (fallback) {
      console.warn('[daily-station] Fetch failed, serving cached weather data.');
      return fallback;
    }
    throw error;
  }
}
