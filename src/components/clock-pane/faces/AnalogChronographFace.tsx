import React from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';

interface AnalogChronographFaceProps {
  timeInfo: CurrentTimeInfo;
}

export const AnalogChronographFace: React.FC<AnalogChronographFaceProps> = ({
  timeInfo,
}) => {
  const seconds = timeInfo.seconds;
  const minutes = timeInfo.minutes;
  const hours = timeInfo.hours;
  const now = timeInfo.rawDate;

  // Main hands
  const secAngle = seconds * 6;
  const minAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;

  // Sub-dial 1 (Top: 24-hour indicator)
  const sub24hAngle = (hours + minutes / 60) * 15; // 360 / 24 = 15 deg per hour

  // Sub-dial 2 (Bottom: 60-second chrono counter)
  const subSecAngle = seconds * 6;

  // Sub-dial 3 (Left: Day of week 0-6)
  const dayOfWeekIndex = now.getDay(); // 0 is Sun, 6 is Sat
  const subDayAngle = (dayOfWeekIndex / 7) * 360;

  return (
    <div className="w-[800px] h-[438px] flex items-center justify-between px-10 py-4 bg-zinc-950 text-foreground relative overflow-hidden select-none">
      {/* 背景のカーボンファイバー調グリッド */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

      {/* 左サイド: クロノグラフスペック & テレメトリ */}
      <div className="flex flex-col gap-3 w-[180px] z-10 font-mono">
        <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-800">
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
            AEROSPACE CHRONO
          </span>
          <span className="text-xl font-black text-white tracking-wider">
            TITANIUM X-1
          </span>
          <span className="text-[11px] text-zinc-400">AUTOMATIC 28,800 VPH</span>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1 shadow-lg">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            CALENDAR MATRIX
          </span>
          <span className="text-sm font-bold text-zinc-200">{timeInfo.dateString}</span>
          <div className="flex items-center justify-between text-xs font-black text-emerald-400 pt-1">
            <span>{timeInfo.dayOfWeekString}</span>
            <span className="text-zinc-500 font-mono text-[10px]">
              DAY {now.getDay() + 1}/7
            </span>
          </div>
        </div>
      </div>

      {/* センター: クロノグラフ時計 (直径 370px) */}
      <div className="relative w-[370px] h-[370px] z-10 flex items-center justify-center">
        {/* 外周タキメーターベゼル */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-zinc-800 via-zinc-900 to-zinc-800 p-2 shadow-2xl border border-zinc-700/60">
          {/* メイン文字盤 */}
          <div className="w-full h-full rounded-full bg-gradient-to-b from-zinc-900 via-black to-zinc-900 shadow-[inset_0_2px_15px_rgba(0,0,0,0.9)] relative overflow-hidden">
            <svg
              className="w-full h-full"
              viewBox="0 0 360 360"
              style={{ overflow: 'visible' }}
            >
              <g transform="translate(180, 180)">
                {/* 外周タキメータースケール */}
                <circle
                  cx="0"
                  cy="0"
                  r="165"
                  stroke="#3f3f46"
                  strokeWidth="1"
                  fill="none"
                />
                <circle
                  cx="0"
                  cy="0"
                  r="145"
                  stroke="#27272a"
                  strokeWidth="1"
                  fill="none"
                />

                {/* 12分割アワーインデックス (発光ルミナスバー) */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = i * 30;
                  const isMain = i % 3 === 0;
                  return (
                    <g key={i} transform={`rotate(${angle})`}>
                      <rect
                        x={isMain ? -4.5 : -2.5}
                        y="-162"
                        width={isMain ? 9 : 5}
                        height={isMain ? 18 : 12}
                        rx="2"
                        fill="#10b981"
                        style={{
                          filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.8))',
                        }}
                      />
                    </g>
                  );
                })}

                {/* 1. 上段サブダイヤル (24時間計) */}
                <g transform="translate(0, -60)">
                  <circle
                    cx="0"
                    cy="0"
                    r="40"
                    fill="#18181b"
                    stroke="#3f3f46"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-26"
                    textAnchor="middle"
                    className="font-mono text-[8px] font-bold fill-zinc-400"
                  >
                    24
                  </text>
                  <text
                    x="26"
                    y="3"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-zinc-500"
                  >
                    6
                  </text>
                  <text
                    x="0"
                    y="32"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-zinc-500"
                  >
                    12
                  </text>
                  <text
                    x="-26"
                    y="3"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-zinc-500"
                  >
                    18
                  </text>
                  {/* 24h 針 */}
                  <g transform={`rotate(${sub24hAngle})`}>
                    <line
                      x1="0"
                      y1="6"
                      x2="0"
                      y2="-28"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="0" cy="0" r="2.5" fill="#f59e0b" />
                  </g>
                </g>

                {/* 2. 下段サブダイヤル (スモールセコンド 60秒計) */}
                <g transform="translate(0, 60)">
                  <circle
                    cx="0"
                    cy="0"
                    r="40"
                    fill="#18181b"
                    stroke="#3f3f46"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-26"
                    textAnchor="middle"
                    className="font-mono text-[8px] font-bold fill-zinc-400"
                  >
                    60
                  </text>
                  <text
                    x="26"
                    y="3"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-zinc-500"
                  >
                    15
                  </text>
                  <text
                    x="0"
                    y="32"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-zinc-500"
                  >
                    30
                  </text>
                  <text
                    x="-26"
                    y="3"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-zinc-500"
                  >
                    45
                  </text>
                  {/* スモールセコンド針 */}
                  <g transform={`rotate(${subSecAngle})`}>
                    <line
                      x1="0"
                      y1="6"
                      x2="0"
                      y2="-28"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="0" cy="0" r="2.5" fill="#ef4444" />
                  </g>
                </g>

                {/* 3. 左段サブダイヤル (曜日計) */}
                <g transform="translate(-65, 0)">
                  <circle
                    cx="0"
                    cy="0"
                    r="34"
                    fill="#18181b"
                    stroke="#3f3f46"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="-20"
                    textAnchor="middle"
                    className="font-mono text-[7px] font-bold fill-amber-400"
                  >
                    SUN
                  </text>
                  <text
                    x="20"
                    y="14"
                    textAnchor="middle"
                    className="font-mono text-[6px] font-bold fill-zinc-500"
                  >
                    WED
                  </text>
                  <text
                    x="-20"
                    y="14"
                    textAnchor="middle"
                    className="font-mono text-[6px] font-bold fill-zinc-500"
                  >
                    FRI
                  </text>
                  {/* 曜日針 */}
                  <g transform={`rotate(${subDayAngle})`}>
                    <line
                      x1="0"
                      y1="5"
                      x2="0"
                      y2="-22"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <circle cx="0" cy="0" r="2.5" fill="#10b981" />
                  </g>
                </g>

                {/* 4. 日付窓 (Date Window @ 3時位置) */}
                <g transform="translate(68, 0)">
                  <rect
                    x="-18"
                    y="-12"
                    width="36"
                    height="24"
                    rx="3"
                    fill="#000000"
                    stroke="#52525b"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="5"
                    textAnchor="middle"
                    className="font-mono text-sm font-black fill-white"
                  >
                    {now.getDate().toString().padStart(2, '0')}
                  </text>
                </g>

                {/* メイン時針 (スケルトン ソードハンド + ルミナス) */}
                <g transform={`rotate(${hourAngle})`}>
                  <polygon
                    points="-6,15 0,-90 6,15"
                    fill="#e4e4e7"
                    stroke="#18181b"
                    strokeWidth="1.5"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))',
                    }}
                  />
                  {/* ルミナス芯 */}
                  <line
                    x1="0"
                    y1="5"
                    x2="0"
                    y2="-78"
                    stroke="#10b981"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </g>

                {/* メイン分針 (スケルトン ソードハンド + ルミナス) */}
                <g transform={`rotate(${minAngle})`}>
                  <polygon
                    points="-5,20 0,-138 5,20"
                    fill="#e4e4e7"
                    stroke="#18181b"
                    strokeWidth="1.5"
                    style={{
                      filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                    }}
                  />
                  {/* ルミナス芯 */}
                  <line
                    x1="0"
                    y1="8"
                    x2="0"
                    y2="-125"
                    stroke="#10b981"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </g>

                {/* メイン秒針 (極細ニードル針 + 蛍光イエロー先端) */}
                <g
                  transform={`rotate(${secAngle})`}
                  style={{ transition: 'transform 0.12s ease-out' }}
                >
                  <line
                    x1="0"
                    y1="32"
                    x2="0"
                    y2="-152"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(245,158,11,0.5))',
                    }}
                  />
                  <circle cx="0" cy="20" r="4.5" fill="#f59e0b" />
                </g>

                {/* センターキャップ */}
                <circle cx="0" cy="0" r="7" fill="#27272a" />
                <circle cx="0" cy="0" r="3" fill="#f59e0b" />
              </g>
            </svg>
          </div>
        </div>
      </div>

      {/* 右サイド: デジタル補助表示 */}
      <div className="flex flex-col gap-3 w-[180px] z-10 font-mono text-right items-end">
        <div className="flex flex-col gap-0.5 pb-2 border-b border-zinc-800 w-full">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
            DIGITAL SYNC
          </span>
          <div className="text-2xl font-black text-white">
            {timeInfo.shortTimeString}
            <span className="text-sm text-amber-400 font-bold ml-1">
              :{timeInfo.secondsString}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-1 w-full text-right shadow-lg">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            CALIBRE 800
          </span>
          <span className="text-xs font-mono font-bold text-zinc-300">
            CHRONOMETER CERTIFIED
          </span>
          <span className="text-[11px] font-bold text-amber-400">±0.5 SEC/DAY</span>
        </div>
      </div>
    </div>
  );
};
