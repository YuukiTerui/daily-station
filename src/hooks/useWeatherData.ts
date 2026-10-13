import { useQuery } from '@tanstack/react-query';
import { fetchWeatherData } from '@/services/weatherService';

export const WEATHER_QUERY_KEY = ['weather-data'] as const;

export function useWeatherData() {
  return useQuery({
    queryKey: WEATHER_QUERY_KEY,
    queryFn: fetchWeatherData,
    refetchInterval: 15 * 60 * 1000, // 15分ごとに自動再取得
    refetchIntervalInBackground: true,
    staleTime: 5 * 60 * 1000, // 5分間はキャッシュを新鮮とみなす
    retry: 3,
  });
}
