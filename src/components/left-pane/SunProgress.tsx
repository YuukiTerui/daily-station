import React from 'react';
import { Sunrise, Sunset } from 'lucide-react';

interface SunProgressProps {
  sunrise?: string; // ISO string or "YYYY-MM-DDTHH:mm"
  sunset?: string; // ISO string or "YYYY-MM-DDTHH:mm"
}

export const SunProgress: React.FC<SunProgressProps> = ({ sunrise, sunset }) => {
  const sunriseTimeStr = sunrise
    ? sunrise.split('T')[1]?.slice(0, 5) || '--:--'
    : '--:--';
  const sunsetTimeStr = sunset ? sunset.split('T')[1]?.slice(0, 5) || '--:--' : '--:--';

  // 進行度（0〜1）の計算
  let progress = 0; // 0 = sunrise, 1 = sunset
  let isDay = true;

  if (sunrise && sunset) {
    const now = new Date();
    const sr = new Date(sunrise);
    const ss = new Date(sunset);

    if (now < sr) {
      progress = 0;
      isDay = false;
    } else if (now > ss) {
      progress = 1;
      isDay = false;
    } else {
      const total = ss.getTime() - sr.getTime();
      const current = now.getTime() - sr.getTime();
      progress = Math.max(0, Math.min(1, current / total));
      isDay = true;
    }
  }

  // SVGパラメータ
  const t = progress;
  const p0 = { x: 20, y: 24 };
  const p1 = { x: 110, y: 4 };
  const p2 = { x: 200, y: 24 };

  const sunX = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
  const sunY = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;

  return (
    <div className="w-full flex flex-col pt-1 border-t border-border/50 select-none">
      {/* 弧のビジュアル */}
      <div className="relative w-full h-[24px] overflow-hidden flex justify-center">
        <svg viewBox="0 0 220 28" className="w-[220px] h-[28px] overflow-visible">
          {/* 地平線・ベースライン */}
          <line
            x1="12"
            y1="24"
            x2="208"
            y2="24"
            stroke="currentColor"
            strokeDasharray="2 2"
            className="text-border/80"
            strokeWidth="1"
          />

          {/* 太陽の軌道（点線の弧） */}
          <path
            d="M 20 24 Q 110 4 200 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 3"
            className="text-muted-foreground/35"
          />

          {/* 経過した軌道（昼間のみハイライト） */}
          {isDay && progress > 0 && (
            <path
              d="M 20 24 Q 110 4 200 24"
              fill="none"
              stroke="url(#sun-gradient)"
              strokeWidth="2"
              strokeDasharray="200"
              strokeDashoffset={200 * (1 - progress)}
              className="transition-all duration-1000"
            />
          )}

          <defs>
            <linearGradient id="sun-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* 太陽（昼間）または月（夜間）アイコン */}
          {isDay ? (
            <g
              transform={`translate(${sunX}, ${sunY})`}
              className="transition-all duration-700 ease-out"
            >
              <circle r="6" className="fill-amber-400/25 animate-pulse" />
              <circle
                r="3.5"
                className="fill-amber-500 stroke-white dark:stroke-amber-950 stroke-1"
              />
            </g>
          ) : (
            <g
              transform={`translate(${progress >= 1 ? 200 : 20}, 24)`}
              className="transition-all duration-700 ease-out"
            >
              <circle r="3" className="fill-indigo-400/80" />
            </g>
          )}
        </svg>
      </div>

      {/* 日の出・日の入 アイコンと時刻（縦並び配置） */}
      <div className="flex items-center justify-between px-3 text-muted-foreground mt-0.5">
        {/* 日の出 */}
        <div className="flex flex-col items-center gap-0.5">
          <Sunrise className="w-3.5 h-3.5 text-orange-400 shrink-0" />
          <span className="text-[10px] font-mono font-bold leading-none">
            {sunriseTimeStr}
          </span>
        </div>

        {/* 日の入 */}
        <div className="flex flex-col items-center gap-0.5">
          <Sunset className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="text-[10px] font-mono font-bold leading-none">
            {sunsetTimeStr}
          </span>
        </div>
      </div>
    </div>
  );
};
