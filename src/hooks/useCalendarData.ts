import { useQuery } from '@tanstack/react-query';
import { fetchCalendarEvents } from '@/services/calendarService';

export const CALENDAR_QUERY_KEY = ['calendar-events'] as const;

export function useCalendarData() {
  return useQuery({
    queryKey: CALENDAR_QUERY_KEY,
    queryFn: fetchCalendarEvents,
    refetchInterval: 10 * 60 * 1000, // 10分ごとに自動再取得
    refetchIntervalInBackground: true,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}
