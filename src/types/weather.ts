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
  pressure: number;
  precipitation: number;
  isDay: boolean;
  time: string;
}

export interface DailyForecast {
  date: string;
  dayOfWeek: string;
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
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  updatedAt: Date;
}
