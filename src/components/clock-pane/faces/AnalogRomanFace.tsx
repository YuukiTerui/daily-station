import React from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';

interface AnalogRomanFaceProps {
  timeInfo: CurrentTimeInfo;
}

const ROMAN_NUMERALS = [
  'XII',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
];

export const AnalogRomanFace: React.FC<AnalogRomanFaceProps> = ({ timeInfo }) => {
  const seconds = timeInfo.seconds;
  const minutes = timeInfo.minutes;
  const hours = timeInfo.hours;

  const secAngle = seconds * 6;
  const minAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  return (
    <div className="w-[800px] h-[438px] flex items-center justify-between px-10 py-4 bg-gradient-to-b from-zinc-950 via-[#181920] to-zinc-950 text-foreground relative overflow-hidden select-none">
      {/* ギョーシェ彫り風ラジアルバックグラウンド */}
      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_0.6px,transparent_0.6px)] [background-size:20px_20px] opacity-15 pointer-events-none" />

      {/* 左サイド: クラシカル銘板 */}
      <div className="flex flex-col gap-4 w-[180px] z-10 font-serif">
        <div className="flex flex-col gap-1 pb-3 border-b border-[#d4af37]/30">
          <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase">
            HORLOGERIE D'ART
          </span>
          <span className="text-xl font-bold text-amber-100 tracking-wider">
            L'ÉLÉGANCE
          </span>
          <span className="text-xs text-zinc-400 font-mono">PARIS - 1886</span>
        </div>

        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-900/80 border border-[#d4af37]/30 shadow-md">
          <span className="text-[10px] font-mono text-[#d4af37]">
            {timeInfo.japaneseEraString}
          </span>
          <span className="text-base font-bold text-amber-50">{timeInfo.dateString}</span>
          <span className="text-xs font-semibold text-amber-300/80">
            {timeInfo.dayOfWeekString}
          </span>
        </div>
      </div>

      {/* センター: アナログローマ数字時計 (直径 370px) */}
      <div className="relative w-[370px] h-[370px] z-10 flex items-center justify-center">
        {/* 外枠真鍮ゴールドベゼル */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#997d25] via-[#e5c158] to-[#997d25] p-2.5 shadow-2xl">
          {/* 文字盤本体 (ディープミッドナイト) */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#13141a] via-[#1c1d25] to-[#13141a] shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 360 360"
              style={{ overflow: 'visible' }}
            >
              <g transform="translate(180, 180)">
                {/* ギョーシェ同心円リング */}
                <circle
                  cx="0"
                  cy="0"
                  r="160"
                  stroke="#d4af37"
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.8"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="125"
                  stroke="#d4af37"
                  strokeWidth="0.8"
                  strokeDasharray="2 3"
                  fill="none"
                  opacity="0.5"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="75"
                  stroke="#d4af37"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.4"
                />

                {/* レイルロード分目盛り (外周) */}
                {Array.from({ length: 60 }).map((_, i) => {
                  const angle = i * 6;
                  const isFive = i % 5 === 0;
                  return (
                    <line
                      key={i}
                      x1="0"
                      y1="-160"
                      x2="0"
                      y2={isFive ? '-150' : '-155'}
                      stroke="#d4af37"
                      strokeWidth={isFive ? 2 : 1}
                      opacity={isFive ? 0.9 : 0.5}
                      transform={`rotate(${angle})`}
                    />
                  );
                })}

                {/* 12のローマ数字 */}
                {ROMAN_NUMERALS.map((num, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const radius = 138;
                  const x = radius * Math.sin(angle);
                  const y = -radius * Math.cos(angle);
                  return (
                    <text
                      key={num}
                      x={x}
                      y={y + 5}
                      textAnchor="middle"
                      className="font-serif text-[15px] font-bold fill-[#e5c158] select-none"
                      style={{
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))',
                      }}
                    >
                      {num}
                    </text>
                  );
                })}

                {/* クラシカルセンターロゴ */}
                <text
                  x="0"
                  y="-42"
                  textAnchor="middle"
                  className="font-serif text-[11px] font-semibold fill-[#d4af37] tracking-widest uppercase select-none"
                >
                  STATION ATELIER
                </text>
                <text
                  x="0"
                  y="46"
                  textAnchor="middle"
                  className="font-serif text-[9px] fill-zinc-400 tracking-wider select-none"
                >
                  RESERVE DE MARCHE
                </text>

                {/* ブレゲ風 時針 (Hour Hand with hollow Breguet apple ring) */}
                <g transform={`rotate(${hourAngle})`}>
                  <line
                    x1="0"
                    y1="18"
                    x2="0"
                    y2="-90"
                    stroke="#e5c158"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.7))',
                    }}
                  />
                  {/* ブレゲリング */}
                  <circle
                    cx="0"
                    cy="-68"
                    r="8.5"
                    fill="none"
                    stroke="#e5c158"
                    strokeWidth="3"
                  />
                </g>

                {/* ブレゲ風 分針 (Minute Hand) */}
                <g transform={`rotate(${minAngle})`}>
                  <line
                    x1="0"
                    y1="22"
                    x2="0"
                    y2="-136"
                    stroke="#e5c158"
                    strokeWidth="2.8"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.7))',
                    }}
                  />
                  {/* ブレゲリング */}
                  <circle
                    cx="0"
                    cy="-108"
                    r="7.5"
                    fill="none"
                    stroke="#e5c158"
                    strokeWidth="2.5"
                  />
                </g>

                {/* ゴールド極細秒針 (Sweep Second Hand with teardrop counter-balance) */}
                <g
                  transform={`rotate(${secAngle})`}
                  style={{ transition: 'transform 0.15s ease-out' }}
                >
                  <line
                    x1="0"
                    y1="34"
                    x2="0"
                    y2="-152"
                    stroke="#ffd700"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 1px 3px rgba(255,215,0,0.5))',
                    }}
                  />
                  {/* ティアドロップ後端 */}
                  <circle cx="0" cy="22" r="4" fill="#ffd700" />
                </g>

                {/* センター真鍮キャップ */}
                <circle cx="0" cy="0" r="6" fill="#997d25" />
                <circle cx="0" cy="0" r="3" fill="#ffd700" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 右サイド: デジタル時刻補助 */}
      <div className="flex flex-col gap-4 w-[180px] z-10 font-mono text-right items-end">
        <div className="flex flex-col gap-1 pb-3 border-b border-[#d4af37]/30 w-full">
          <span className="text-[10px] font-bold text-[#d4af37] uppercase tracking-widest">
            DIGITAL PENDULUM
          </span>
          <div className="text-3xl font-serif font-bold text-amber-100">
            {timeInfo.shortTimeString}
            <span className="text-base text-[#d4af37] font-mono font-bold ml-1">
              :{timeInfo.secondsString}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-900/80 border border-[#d4af37]/30 shadow-md w-full">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            REGULATEUR
          </span>
          <span className="text-xs font-serif text-amber-200">CHRONOMETRE ROYALE</span>
        </div>
      </div>
    </div>
  );
};
