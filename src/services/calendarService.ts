import type { CalendarResponse } from '@/types/calendar';

export async function fetchCalendarEvents(): Promise<CalendarResponse> {
  const res = await fetch('/api/calendar');
  if (!res.ok) {
    throw new Error(`Failed to fetch calendar events: ${res.status}`);
  }
  return res.json();
}
