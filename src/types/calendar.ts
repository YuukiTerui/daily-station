export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: string; // ISO 8601 string
  end: string; // ISO 8601 string
  isAllDay: boolean;
}

export interface CalendarResponse {
  events: CalendarEvent[];
  updatedAt: string;
  source: 'google-ical' | 'mock';
}
