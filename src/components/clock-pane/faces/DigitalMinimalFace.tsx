import React from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';

interface DigitalMinimalFaceProps {
  timeInfo: CurrentTimeInfo;
}

export const DigitalMinimalFace: React.FC<DigitalMinimalFaceProps> = ({ timeInfo }) => {
  const seconds = timeInfo.seconds;
  const progressPercent = ((seconds + 1) / 60) * 100;

  return (
    <div className="w-[800px] h-[438px] flex flex-col items-center justify-between p-8 bg-background relative overflow-hidden select-none">
      {/* 繊細なアンビエントグラデーション背景 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* トップヘッダー: 和暦 & 年月日 & 曜日 */}
      <div className="flex items-center justify-between w-full max-w-[700px] z-10 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold font-mono">
            {timeInfo.japaneseEraString}
          </span>
          <span className="text-base font-bold text-foreground tracking-wide">
            {timeInfo.dateString}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-primary px-3 py-0.5 rounded-lg bg-card border border-border shadow-xs">
            {timeInfo.dayOfWeekString}
          </span>
        </div>
      </div>

      {/* センター: 超特大デジタル時計 + 秒数インジケーター */}
      <div className="flex items-center justify-center gap-4 my-auto z-10">
        {/* メイン時:分表示 */}
        <div className="flex items-baseline font-mono text-[136px] font-black tracking-tighter leading-none text-foreground drop-shadow-sm">
          <span>{timeInfo.shortTimeString.split(':')[0]}</span>
          <span className="text-primary/70 animate-pulse mx-1">:</span>
          <span>{timeInfo.shortTimeString.split(':')[1]}</span>
        </div>

        {/* 秒数 & 円形プログレスメーター */}
        <div className="flex flex-col items-center justify-center pl-4 border-l border-border/60">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* 円形プログレスバー (SVG) */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-muted"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-primary transition-all duration-300"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={264}
                strokeDashoffset={264 - (264 * progressPercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center font-mono">
              <span className="text-2xl font-black text-foreground">
                {timeInfo.secondsString}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground uppercase">
                SEC
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ボトムフッター: 秒の進行バー (0〜60秒のリニアバー) */}
      <div className="w-full max-w-[700px] flex flex-col gap-1.5 z-10 pt-2 border-t border-border/50">
        <div className="flex justify-between text-[11px] font-mono text-muted-foreground font-semibold">
          <span>MINIMAL DIGITAL CLOCK</span>
          <span>{seconds} / 60 SECONDS</span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
};
