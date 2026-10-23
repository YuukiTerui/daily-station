import React, { useState } from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';

interface Digital7SegmentFaceProps {
  timeInfo: CurrentTimeInfo;
}

// 7セグメントの点灯パターン定義 (a, b, c, d, e, f, g)
const SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

interface SevenSegmentDigitProps {
  char: string;
  color: string;
  glowColor: string;
  dimColor: string;
  width?: number;
  height?: number;
}

const SevenSegmentDigit: React.FC<SevenSegmentDigitProps> = ({
  char,
  color,
  glowColor,
  dimColor,
  width = 54,
  height = 96,
}) => {
  const active = SEGMENTS[char] || [false, false, false, false, false, false, false];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 60 100"
      className="overflow-visible transform -skew-x-6"
    >
      <defs>
        <filter id={`glow-${char}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* a (top) */}
      <polygon
        points="12,8 48,8 42,16 18,16"
        fill={active[0] ? color : dimColor}
        style={active[0] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
      {/* b (top-right) */}
      <polygon
        points="50,11 50,47 43,42 43,18"
        fill={active[1] ? color : dimColor}
        style={active[1] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
      {/* c (bottom-right) */}
      <polygon
        points="50,53 50,89 43,82 43,58"
        fill={active[2] ? color : dimColor}
        style={active[2] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
      {/* d (bottom) */}
      <polygon
        points="18,84 42,84 48,92 12,92"
        fill={active[3] ? color : dimColor}
        style={active[3] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
      {/* e (bottom-left) */}
      <polygon
        points="10,53 17,58 17,82 10,89"
        fill={active[4] ? color : dimColor}
        style={active[4] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
      {/* f (top-left) */}
      <polygon
        points="10,11 17,18 17,42 10,47"
        fill={active[5] ? color : dimColor}
        style={active[5] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
      {/* g (middle) */}
      <polygon
        points="14,50 18,46 42,46 46,50 42,54 18,54"
        fill={active[6] ? color : dimColor}
        style={active[6] ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
      />
    </svg>
  );
};

export const Digital7SegmentFace: React.FC<Digital7SegmentFaceProps> = ({ timeInfo }) => {
  // カラーテーマ: 'emerald' (VFD) | 'red' (LED) | 'amber' (Vintage)
  const [theme, setTheme] = useState<'emerald' | 'red' | 'amber'>('emerald');

  const themeConfig = {
    emerald: {
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.85)',
      dimColor: 'rgba(16, 185, 129, 0.08)',
      name: 'VFD CYAN/EMERALD',
      bgGlow: 'rgba(16, 185, 129, 0.06)',
    },
    red: {
      color: '#ef4444',
      glowColor: 'rgba(239, 68, 68, 0.85)',
      dimColor: 'rgba(239, 68, 68, 0.08)',
      name: 'RED LED',
      bgGlow: 'rgba(239, 68, 68, 0.06)',
    },
    amber: {
      color: '#f59e0b',
      glowColor: 'rgba(245, 158, 11, 0.85)',
      dimColor: 'rgba(245, 158, 11, 0.08)',
      name: 'AMBER TUBE',
      bgGlow: 'rgba(245, 158, 11, 0.06)',
    },
  }[theme];

  const hStr = timeInfo.shortTimeString.split(':')[0] || '00';
  const mStr = timeInfo.shortTimeString.split(':')[1] || '00';
  const sStr = timeInfo.secondsString || '00';

  const toggleTheme = () => {
    if (theme === 'emerald') setTheme('red');
    else if (theme === 'red') setTheme('amber');
    else setTheme('emerald');
  };

  return (
    <div className="w-[800px] h-[438px] flex flex-col items-center justify-between p-6 bg-zinc-950 text-foreground relative overflow-hidden select-none">
      {/* ガラス管 / アクリルパネルの光沢・グリッド効果 */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-500"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${themeConfig.bgGlow} 0%, transparent 75%)`,
        }}
      />
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.8)_51%)] [background-size:100%_4px]" />

      {/* トップバー: レトロ機種銘板 & テーマ切替 */}
      <div className="flex items-center justify-between w-full max-w-[700px] z-10 border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-bold tracking-widest text-zinc-400">
            SEVENSEG PRECISION CHRONO 1984
          </span>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 font-mono text-[11px] text-zinc-300 transition cursor-pointer"
          title="クリックでLEDカラーを変更"
        >
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: themeConfig.color,
              boxShadow: `0 0 6px ${themeConfig.glowColor}`,
            }}
          />
          <span>{themeConfig.name}</span>
        </button>
      </div>

      {/* センター: 7セグメントデジタル大画面 */}
      <div className="flex items-center justify-center gap-3 my-auto z-10 p-5 rounded-2xl bg-black/70 border border-zinc-800/80 shadow-[inset_0_2px_12px_rgba(0,0,0,0.9)]">
        {/* 時 (HH) */}
        <div className="flex items-center gap-2">
          <SevenSegmentDigit
            char={hStr[0]}
            color={themeConfig.color}
            glowColor={themeConfig.glowColor}
            dimColor={themeConfig.dimColor}
          />
          <SevenSegmentDigit
            char={hStr[1]}
            color={themeConfig.color}
            glowColor={themeConfig.glowColor}
            dimColor={themeConfig.dimColor}
          />
        </div>

        {/* コロン (点滅) */}
        <div className="flex flex-col gap-6 px-2 py-4">
          <div
            className="w-3.5 h-3.5 rounded-sm animate-pulse"
            style={{
              backgroundColor: themeConfig.color,
              boxShadow: `0 0 8px ${themeConfig.glowColor}`,
            }}
          />
          <div
            className="w-3.5 h-3.5 rounded-sm animate-pulse"
            style={{
              backgroundColor: themeConfig.color,
              boxShadow: `0 0 8px ${themeConfig.glowColor}`,
            }}
          />
        </div>

        {/* 分 (MM) */}
        <div className="flex items-center gap-2">
          <SevenSegmentDigit
            char={mStr[0]}
            color={themeConfig.color}
            glowColor={themeConfig.glowColor}
            dimColor={themeConfig.dimColor}
          />
          <SevenSegmentDigit
            char={mStr[1]}
            color={themeConfig.color}
            glowColor={themeConfig.glowColor}
            dimColor={themeConfig.dimColor}
          />
        </div>

        {/* コロン (区切り) */}
        <div className="flex flex-col gap-6 px-1 py-4">
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: themeConfig.color,
              boxShadow: `0 0 6px ${themeConfig.glowColor}`,
            }}
          />
          <div
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: themeConfig.color,
              boxShadow: `0 0 6px ${themeConfig.glowColor}`,
            }}
          />
        </div>

        {/* 秒 (SS - 少し小さめ) */}
        <div className="flex items-center gap-1.5 ml-1">
          <SevenSegmentDigit
            char={sStr[0]}
            color={themeConfig.color}
            glowColor={themeConfig.glowColor}
            dimColor={themeConfig.dimColor}
            width={40}
            height={74}
          />
          <SevenSegmentDigit
            char={sStr[1]}
            color={themeConfig.color}
            glowColor={themeConfig.glowColor}
            dimColor={themeConfig.dimColor}
            width={40}
            height={74}
          />
        </div>
      </div>

      {/* ボトムバー: ドットマトリクス風 日付 */}
      <div className="flex items-center justify-between w-full max-w-[700px] z-10 border-t border-zinc-800/80 pt-2 font-mono text-xs text-zinc-400">
        <div className="flex items-center gap-3">
          <span className="text-zinc-500 font-bold">DATE:</span>
          <span className="text-zinc-200 font-bold tracking-widest">
            {timeInfo.dateString}
          </span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold">
            {timeInfo.dayOfWeekString}
          </span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500">
          <span>HIGH-PRECISION OSCILLATOR</span>
        </div>
      </div>
    </div>
  );
};
