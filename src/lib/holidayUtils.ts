/**
 * 日本の国民の祝日判定ユーティリティ
 */

// 春分の日計算 (2000〜2099年)
function getVernalEquinoxDay(year: number): number {
  return Math.floor(20.8431 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

// 秋分の日計算 (2000〜2099年)
function getAutumnalEquinoxDay(year: number): number {
  return Math.floor(23.2488 + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
}

// 第N月曜日の日付を取得
function getNthMonday(year: number, month: number, n: number): number {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const offset = (8 - firstDay) % 7;
  return 1 + offset + (n - 1) * 7;
}

export interface JapaneseHoliday {
  name: string;
  isHoliday: boolean;
}

export function getJapaneseHoliday(date: Date): JapaneseHoliday | null {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  const holidays: Record<string, string> = {};

  // 固定祝日
  if (month === 1 && day === 1) holidays['1-1'] = '元日';
  if (month === 2 && day === 11) holidays['2-11'] = '建国記念の日';
  if (month === 2 && day === 23) holidays['2-23'] = '天皇誕生日';
  if (month === 4 && day === 29) holidays['4-29'] = '昭和の日';
  if (month === 5 && day === 3) holidays['5-3'] = '憲法記念日';
  if (month === 5 && day === 4) holidays['5-4'] = 'みどりの日';
  if (month === 5 && day === 5) holidays['5-5'] = 'こどもの日';
  if (month === 8 && day === 11) holidays['8-11'] = '山の日';
  if (month === 11 && day === 3) holidays['11-3'] = '文化の日';
  if (month === 11 && day === 23) holidays['11-23'] = '勤労感謝の日';

  // ハッピーマンデー
  if (month === 1 && day === getNthMonday(year, 1, 2))
    return { name: '成人の日', isHoliday: true };
  if (month === 7 && day === getNthMonday(year, 7, 3))
    return { name: '海の日', isHoliday: true };
  if (month === 9 && day === getNthMonday(year, 9, 3))
    return { name: '敬老の日', isHoliday: true };
  if (month === 10 && day === getNthMonday(year, 10, 2))
    return { name: 'スポーツの日', isHoliday: true };

  // 天文学的祝日
  if (month === 3 && day === getVernalEquinoxDay(year))
    return { name: '春分の日', isHoliday: true };
  if (month === 9 && day === getAutumnalEquinoxDay(year))
    return { name: '秋分の日', isHoliday: true };

  const key = `${month}-${day}`;
  if (holidays[key]) {
    return { name: holidays[key], isHoliday: true };
  }

  // 振替休日判定（日曜日に祝日がある場合、翌平日）
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 1) {
    const yesterday = new Date(year, month - 1, day - 1);
    const yesterdayHoliday = getJapaneseHoliday(yesterday);
    if (yesterdayHoliday && yesterday.getDay() === 0) {
      return { name: '振替休日', isHoliday: true };
    }
  }

  return null;
}
