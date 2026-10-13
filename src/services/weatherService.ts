import { stationConfig } from '@/config/station';
import { formatDayOfWeek, formatTimeHour, getWeatherCondition } from '@/lib/weatherUtils';
import type { DailyForecast, HourlyForecast, WeatherData } from '@/types/weather';

interface OpenMeteoApiResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    surface_pressure: number;
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

export async function fetchWeatherData(): Promise<WeatherData> {
  const { latitude, longitude, timezone, name } = stationConfig;

  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', latitude.toString());
  url.searchParams.set('longitude', longitude.toString());
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m,surface_pressure',
  );
  url.searchParams.set(
    'daily',
    'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,sunrise,sunset',
  );
  url.searchParams.set('hourly', 'temperature_2m,weather_code,precipitation_probability');
  url.searchParams.set('timezone', timezone);

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch weather data: ${res.status} ${res.statusText}`);
  }

  const data: OpenMeteoApiResponse = await res.json();

  const isDay = Boolean(data.current.is_day);
  const currentCondition = getWeatherCondition(data.current.weather_code, isDay);

  const daily: DailyForecast[] = data.daily.time.map((dateStr, idx) => ({
    date: dateStr,
    dayOfWeek: formatDayOfWeek(dateStr),
    weatherCode: data.daily.weather_code[idx],
    condition: getWeatherCondition(data.daily.weather_code[idx], true),
    tempMax: Math.round(data.daily.temperature_2m_max[idx]),
    tempMin: Math.round(data.daily.temperature_2m_min[idx]),
    precipitationProbability: data.daily.precipitation_probability_max[idx] ?? 0,
    uvIndexMax: Math.round(data.daily.uv_index_max[idx] ?? 0),
    sunrise: data.daily.sunrise[idx],
    sunset: data.daily.sunset[idx],
  }));

  const nowIso = new Date().toISOString();
  // Filter next 24 hours
  const hourly: HourlyForecast[] = data.hourly.time
    .map((timeStr, idx) => ({
      time: timeStr,
      hour: formatTimeHour(timeStr),
      temperature: Math.round(data.hourly.temperature_2m[idx]),
      weatherCode: data.hourly.weather_code[idx],
      condition: getWeatherCondition(data.hourly.weather_code[idx], true),
      precipitationProbability: data.hourly.precipitation_probability[idx] ?? 0,
    }))
    .filter((h) => h.time >= nowIso.slice(0, 13))
    .slice(0, 24);

  return {
    stationName: name,
    current: {
      temperature: Math.round(data.current.temperature_2m * 10) / 10,
      apparentTemperature: Math.round(data.current.apparent_temperature * 10) / 10,
      humidity: Math.round(data.current.relative_humidity_2m),
      weatherCode: data.current.weather_code,
      condition: currentCondition,
      windSpeed: Math.round(data.current.wind_speed_10m * 10) / 10,
      pressure: Math.round(data.current.surface_pressure),
      precipitation: data.current.precipitation,
      isDay,
      time: data.current.time,
    },
    daily,
    hourly,
    updatedAt: new Date(),
  };
}
