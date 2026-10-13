export interface WeatherCondition {
  label: string;
  iconName: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  weatherCode: number;
  condition: WeatherCondition;
  windSpeed: number;
  windDirection: number;
  windDirectionText: string;
  pressure: number;
  precipitation: number;
  visibility: number;
  visibilityText: string;
  isDay: boolean;
  time: string;
}

export interface AirQuality {
  aqi: number;
  aqiLabel: string;
  pm25: number;
  pm10: number;
  pollenLabel: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
  dayLabel?: string; // "今日" | "昨日" など
  weatherCode: number;
  condition: WeatherCondition;
  tempMax: number;
  tempMin: number;
  precipitationProbability: number;
  uvIndexMax: number;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  hour: string;
  temperature: number;
  weatherCode: number;
  condition: WeatherCondition;
  precipitationProbability: number;
}

export interface WeatherData {
  stationName: string;
  current: CurrentWeather;
  airQuality: AirQuality;
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  updatedAt: Date;
}
