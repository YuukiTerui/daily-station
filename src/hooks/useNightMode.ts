import { useEffect, useState } from 'react';

export function useNightMode() {
  const [isNightMode, setIsNightMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('daily-station-night-mode');
    if (saved !== null) {
      return saved === 'true';
    }
    // デフォルトで深夜（22:00〜06:00）ならナイトモード有効
    const hour = new Date().getHours();
    return hour >= 22 || hour < 6;
  });

  useEffect(() => {
    localStorage.setItem('daily-station-night-mode', String(isNightMode));
    if (isNightMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isNightMode]);

  const toggleNightMode = () => setIsNightMode((prev) => !prev);

  return { isNightMode, toggleNightMode };
}
