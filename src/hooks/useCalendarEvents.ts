export interface CalendarEvent {
  id: string;
  title: string;
  startTime: string; // "10:00"
  endTime?: string; // "11:30"
  date: string; // "YYYY-MM-DD"
  category: 'work' | 'personal' | 'family' | 'health';
  location?: string;
}

export function useCalendarEvents() {
  // 今日、明日、直近の日付を動的に生成
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];

  const events: CalendarEvent[] = [
    {
      id: '1',
      title: 'チームデイリースタンドアップ',
      startTime: '10:00',
      endTime: '10:30',
      date: todayStr,
      category: 'work',
      location: 'オンライン',
    },
    {
      id: '2',
      title: 'プロジェクト定例ミーティング',
      startTime: '14:00',
      endTime: '15:00',
      date: todayStr,
      category: 'work',
    },
    {
      id: '3',
      title: '夕食 & 家族ミーティング',
      startTime: '19:00',
      endTime: '20:30',
      date: todayStr,
      category: 'family',
    },
    {
      id: '4',
      title: '日用品・食料品の買い出し',
      startTime: '11:00',
      endTime: '12:00',
      date: tomorrowStr,
      category: 'personal',
    },
    {
      id: '5',
      title: 'ストレッチ & ジョギング',
      startTime: '07:30',
      endTime: '08:15',
      date: dayAfterTomorrowStr,
      category: 'health',
    },
  ];

  // 今日の直近の次の予定を取得
  const currentHour = today.getHours();
  const currentMinute = today.getMinutes();
  const currentTimeVal = currentHour * 60 + currentMinute;

  const todayEvents = events.filter((e) => e.date === todayStr);
  const upcomingToday = todayEvents.find((e) => {
    const [h, m] = e.startTime.split(':').map(Number);
    return h * 60 + m >= currentTimeVal;
  });

  const nextEvent = upcomingToday || todayEvents[todayEvents.length - 1] || events[0];

  return {
    events,
    todayEvents,
    nextEvent,
  };
}
