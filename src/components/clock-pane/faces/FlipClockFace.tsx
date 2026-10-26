import React from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';
import { FlipCard } from '../components/FlipCard';

interface FlipClockFaceProps {
  timeInfo: CurrentTimeInfo;
}

export const FlipClockFace: React.FC<FlipClockFaceProps> = ({ timeInfo }) => {
  const hStr = timeInfo.shortTimeString.split(':')[0] || '00';
  const mStr = timeInfo.shortTimeString.split(':')[1] || '00';
  const sStr = timeInfo.secondsString || '00';

  const h1 = hStr[0] || '0';
  const h2 = hStr[1] || '0';
  const m1 = mStr[0] || '0';
  const m2 = mStr[1] || '0';
  const s1 = sStr[0] || '0';
  const s2 = sStr[1] || '0';

  const now = timeInfo.rawDate;
  const isPM = now.getHours() >= 12;

  return (
    <div className="w-[800px] h-[438px] flex flex-col items-center justify-between p-6 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 relative overflow-hidden select-none">
      {/* 背景の微細なテクスチャ */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* トップヘッダー: 日付 & 曜日 & 和暦のフリップタグ */}
      <div className="flex items-center justify-between w-full max-w-[680px] pt-1 z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-mono text-xs font-bold tracking-widest text-zinc-400 uppercase">
            SOLARI SYSTEM
          </span>
        </div>

        {/* 日付バッジプレート */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-zinc-900/90 border border-zinc-700/60 shadow-lg">
          <span className="text-xs font-mono font-bold text-amber-400/90 tracking-wide">
            {timeInfo.japaneseEraString}
          </span>
          <span className="text-xs font-bold text-zinc-200">{timeInfo.dateString}</span>
          <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-xs font-black text-primary font-mono tracking-wider">
            {timeInfo.dayOfWeekString}
          </span>
        </div>

        {/* 24H / 12H ステータス */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono text-xs font-bold text-zinc-400">
          <span className={isPM ? 'text-amber-400 font-black' : 'text-zinc-600'}>PM</span>
          <span className="text-zinc-600">/</span>
          <span className={!isPM ? 'text-amber-400 font-black' : 'text-zinc-600'}>
            AM
          </span>
        </div>
      </div>

      {/* メイン: パタパタ時計 (時・分・秒) */}
      <div className="flex items-center justify-center gap-4 my-auto z-10">
        {/* 時 (2枚) */}
        <div className="flex items-center gap-2">
          <FlipCard value={h1} size="lg" />
          <FlipCard value={h2} size="lg" />
        </div>

        {/* コロン (メカニカルLEDドット) */}
        <div className="flex flex-col gap-6 py-4 px-1">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse" />
          <span className="w-3.5 h-3.5 rounded-full bg-amber-400/90 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse" />
        </div>

        {/* 分 (2枚) */}
        <div className="flex items-center gap-2">
          <FlipCard value={m1} size="lg" />
          <FlipCard value={m2} size="lg" />
        </div>

        {/* 秒 (2枚: 中サイズでペアで統一) */}
        <div className="flex flex-col items-center gap-1.5 ml-3 pl-4 border-l border-zinc-800/80">
          <div className="flex items-center gap-1.5">
            <FlipCard value={s1} size="md" />
            <FlipCard value={s2} size="md" />
          </div>
          <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
            SECONDS
          </span>
        </div>
      </div>

      {/* ボトムフッター: 金属プレート風ネームタグ */}
      <div className="flex items-center justify-between w-full max-w-[680px] pb-1 border-t border-zinc-800/80 pt-2 z-10 text-[11px] font-mono text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold tracking-wider text-zinc-400">
            SPLIT-FLAP MECHANICAL CHRONOMETER
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>PRECISION QUARTZ ENGINE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-amber-400/80">MODEL FS-800</span>
        </div>
      </div>
    </div>
  );
};
