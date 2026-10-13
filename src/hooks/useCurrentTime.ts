import { useEffect, useState } from 'react';

export interface CurrentTimeInfo {
  timeString: string; // "14:05:22"
  shortTimeString: string; // "14:05"
  secondsString: string; // "22"
  dateString: string; // "2026年10月13日"
  japaneseEraString: string; // "令和8年"
  dayOfWeekString: string; // "火曜日"
  shortDayOfWeekString: string; // "火"
}

function getJapaneseEra(year: number): string {
  // 令和は 2019 年 5 月 1 日から
  if (year >= 2019) {
    const reiwaYear = year - 2018;
    return reiwaYear === 1 ? '令和元年' : `令和${reiwaYear}年`;
  }
  return `${year}年`;
}

export function useCurrentTime(): CurrentTimeInfo {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const dayOfWeek = days[now.getDay()];

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const date = now.getDate();

  return {
    timeString: `${hours}:${minutes}:${seconds}`,
    shortTimeString: `${hours}:${minutes}`,
    secondsString: seconds,
    dateString: `${year}年${month}月${date}日`,
    japaneseEraString: getJapaneseEra(year),
    dayOfWeekString: `${dayOfWeek}曜日`,
    shortDayOfWeekString: dayOfWeek,
  };
}
