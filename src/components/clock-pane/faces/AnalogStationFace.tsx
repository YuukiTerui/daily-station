import React from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';

interface AnalogStationFaceProps {
  timeInfo: CurrentTimeInfo;
}

export const AnalogStationFace: React.FC<AnalogStationFaceProps> = ({ timeInfo }) => {
  const seconds = timeInfo.seconds;
  const minutes = timeInfo.minutes;
  const hours = timeInfo.hours;

  const secAngle = seconds * 6;
  const minAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  // 60目盛り (12個の太い時間バー + 48個の細い分目盛り)
  const ticks = Array.from({ length: 60 }).map((_, i) => {
    const isHour = i % 5 === 0;
    const angle = i * 6;
    return {
      index: i,
      isHour,
      angle,
    };
  });

  return (
    <div className="w-[800px] h-[438px] flex items-center justify-between px-10 py-4 bg-zinc-900 text-foreground relative overflow-hidden select-none">
      {/* 背景の微細なアンビエント */}
      <div className="absolute inset-0 bg-radial from-zinc-800/40 via-zinc-900 to-zinc-950 pointer-events-none" />

      {/* 左サイド: ステーション情報プレート */}
      <div className="flex flex-col gap-4 w-[180px] z-10 font-mono">
        <div className="flex flex-col gap-1 pb-3 border-b border-zinc-700/60">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            STATION CHRONOMETER
          </span>
          <span className="text-xl font-black text-zinc-100 tracking-wide">CENTRAL</span>
          <span className="text-xs text-amber-400 font-bold">BAUHAUS EDITION</span>
        </div>

        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 shadow-md">
          <span className="text-[10px] font-bold text-zinc-400">
            {timeInfo.japaneseEraString}
          </span>
          <span className="text-base font-black text-white">{timeInfo.dateString}</span>
          <span className="text-xs font-black text-rose-400">
            {timeInfo.dayOfWeekString}
          </span>
        </div>
      </div>

      {/* センター: アナログ時計本体 (直径 370px) */}
      <div className="relative w-[370px] h-[370px] z-10 flex items-center justify-center">
        {/* 外枠ベゼル (高級なステンレスヘアライン風) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-500 to-zinc-800 p-2 shadow-2xl">
          {/* ダイヤル内面 (アイボリーホワイトまたはクリーンホワイト) */}
          <div className="w-full h-full rounded-full bg-zinc-100 shadow-[inset_0_2px_10px_rgba(0,0,0,0.3)] relative overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 360 360"
              style={{ overflow: 'visible' }}
            >
              {/* 目盛り (Ticks) */}
              <g transform="translate(180, 180)">
                {ticks.map((t) => (
                  <line
                    key={t.index}
                    x1="0"
                    y1={t.isHour ? -165 : -165}
                    x2="0"
                    y2={t.isHour ? -140 : -152}
                    stroke="#18181b"
                    strokeWidth={t.isHour ? 7 : 2.5}
                    strokeLinecap="round"
                    transform={`rotate(${t.angle})`}
                  />
                ))}

                {/* ダイヤルロゴ */}
                <text
                  x="0"
                  y="-70"
                  textAnchor="middle"
                  className="font-mono text-[11px] font-extrabold fill-zinc-600 tracking-widest uppercase select-none"
                >
                  STATION
                </text>
                <text
                  x="0"
                  y="-56"
                  textAnchor="middle"
                  className="font-mono text-[8px] font-bold fill-zinc-400 tracking-wider uppercase select-none"
                >
                  SWISS AUTOMATIC
                </text>

                {/* 時針 (Hour Hand) */}
                <g transform={`rotate(${hourAngle})`}>
                  <line
                    x1="0"
                    y1="22"
                    x2="0"
                    y2="-95"
                    stroke="#09090b"
                    strokeWidth="11"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.35))',
                    }}
                  />
                </g>

                {/* 分針 (Minute Hand) */}
                <g transform={`rotate(${minAngle})`}>
                  <line
                    x1="0"
                    y1="28"
                    x2="0"
                    y2="-142"
                    stroke="#09090b"
                    strokeWidth="7"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.35))',
                    }}
                  />
                </g>

                {/* 秒針 (Bauhaus Iconic Red Hand with Lollipop) */}
                <g
                  transform={`rotate(${secAngle})`}
                  style={{
                    transition: 'transform 0.15s cubic-bezier(0.4, 2.08, 0.55, 0.44)',
                  }}
                >
                  {/* 秒針ロッド */}
                  <line
                    x1="0"
                    y1="36"
                    x2="0"
                    y2="-138"
                    stroke="#dc2626"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(220,38,38,0.4))',
                    }}
                  />
                  {/* ロリポップ先端の赤丸 */}
                  <circle
                    cx="0"
                    cy="-108"
                    r="11"
                    fill="#dc2626"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(220,38,38,0.4))',
                    }}
                  />
                  {/* 秒針カウンターウェイト (後端の丸) */}
                  <circle cx="0" cy="24" r="5" fill="#dc2626" />
                </g>

                {/* センターピン */}
                <circle cx="0" cy="0" r="7" fill="#09090b" />
                <circle cx="0" cy="0" r="3" fill="#dc2626" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 右サイド: デジタル時刻補助 & 秒数 */}
      <div className="flex flex-col gap-4 w-[180px] z-10 font-mono text-right items-end">
        <div className="flex flex-col gap-1 pb-3 border-b border-zinc-700/60 w-full">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            DIGITAL READOUT
          </span>
          <div className="text-3xl font-black text-white tracking-tighter">
            {timeInfo.shortTimeString}
            <span className="text-base text-rose-500 font-bold ml-1">
              :{timeInfo.secondsString}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 p-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 shadow-md w-full">
          <span className="text-[10px] font-bold text-zinc-400">STATUS</span>
          <div className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TIME LOCKED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
