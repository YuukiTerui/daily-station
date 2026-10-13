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

/**
 * スマートクロック・常設端末専用の自己補正型高精度時計フック
 * - 単純な setInterval ではなく、次の秒の変わり目（ミリ秒単位）に合わせて正確に補正発火
 * - タブ復帰、画面スリープ復帰（visibilitychange / focus / pageshow）時に即座に実時刻へ再同期
 * - バックグラウンド間引きによる遅延や停止を完全に自己回復
 */
export function useCurrentTime(): CurrentTimeInfo {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let isDisposed = false;

    // 次の正秒（ミリ秒が 000 になる瞬間）を計算して発火する自己補正スケジューラ
    const tick = () => {
      if (isDisposed) return;
      setNow(new Date());

      const nowMs = Date.now();
      const delayToNextSecond = 1000 - (nowMs % 1000);
      timeoutId = setTimeout(tick, delayToNextSecond);
    };

    // 初回スケジューリング
    const initialDelay = 1000 - (Date.now() % 1000);
    timeoutId = setTimeout(tick, initialDelay);

    // スリープ復帰・タブ復帰・ウィンドウ再フォーカス時の即時強制同期
    const handleSync = () => {
      setNow(new Date());
      if (timeoutId) clearTimeout(timeoutId);
      const delay = 1000 - (Date.now() % 1000);
      timeoutId = setTimeout(tick, delay);
    };

    document.addEventListener('visibilitychange', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('pageshow', handleSync);

    return () => {
      isDisposed = true;
      if (timeoutId) clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('pageshow', handleSync);
    };
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
