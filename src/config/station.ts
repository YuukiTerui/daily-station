export interface StationConfig {
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export const stationConfig: StationConfig = {
  name: import.meta.env.VITE_STATION_NAME || '東京',
  latitude: Number.parseFloat(import.meta.env.VITE_LATITUDE || '35.6895'),
  longitude: Number.parseFloat(import.meta.env.VITE_LONGITUDE || '139.6917'),
  timezone: import.meta.env.VITE_TIMEZONE || 'Asia/Tokyo',
};
