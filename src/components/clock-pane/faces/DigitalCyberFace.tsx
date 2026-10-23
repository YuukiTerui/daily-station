import React from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';

interface DigitalCyberFaceProps {
  timeInfo: CurrentTimeInfo;
}

export const DigitalCyberFace: React.FC<DigitalCyberFaceProps> = ({ timeInfo }) => {
  const seconds = timeInfo.seconds;
  const now = timeInfo.rawDate;

  // Day of year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diffTime = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

  // 6-bit binary representation of seconds (0-59)
  const binarySeconds = seconds.toString(2).padStart(6, '0').split('');

  // Circular gauge percentage
  const secPercent = (seconds / 60) * 100;

  return (
    <div className="w-[800px] h-[438px] flex flex-col justify-between p-6 bg-zinc-950 text-cyan-400 font-mono relative overflow-hidden select-none">
      {/* 背景のグリッド & スキャンライン */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#00f5ff_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,245,255,0.02)_51%)] [background-size:100%_4px]" />

      {/* HUD コーナー装飾フレーム */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-500" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-500" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-500" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-500" />

      {/* トップHUDテレメトリバー */}
      <div className="flex items-center justify-between w-full border-b border-cyan-900/60 pb-2 z-10 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800/60 text-[11px] font-bold text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            SYS_ONLINE
          </span>
          <span className="text-zinc-500 tracking-wider">GRID: 35.6895°N 139.6917°E</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold text-cyan-500/80">
          <span>DOY_{dayOfYear.toString().padStart(3, '0')}</span>
          <span>TZ: JST (UTC+09)</span>
          <span className="text-amber-400/90 font-black">STATION_CHRONO_V3</span>
        </div>
      </div>

      {/* メイン: 特大サイバークロック & レーダー円形ゲージ */}
      <div className="flex items-center justify-around w-full my-auto z-10 px-4">
        {/* 左側: 特大フォント時刻 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline text-[110px] font-black tracking-tighter leading-none text-white drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]">
            <span className="text-cyan-200">
              {timeInfo.shortTimeString.split(':')[0]}
            </span>
            <span className="text-cyan-400 mx-2 animate-pulse">:</span>
            <span className="text-cyan-200">
              {timeInfo.shortTimeString.split(':')[1]}
            </span>
          </div>

          {/* サブ情報: 日付 & 曜日 */}
          <div className="flex items-center gap-3 text-sm text-cyan-300/80 font-bold tracking-wider pt-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-xs text-amber-400">
              {timeInfo.japaneseEraString}
            </span>
            <span>{timeInfo.dateString}</span>
            <span className="text-white font-black bg-cyan-900/50 px-2 py-0.5 rounded border border-cyan-700">
              {timeInfo.dayOfWeekString}
            </span>
          </div>
        </div>

        {/* 右側: 円形レーダー秒針ゲージ & バイナリカウンター */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* 円形レーダーゲージ (SVG) */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              {/* 外周リング */}
              <circle
                cx="60"
                cy="60"
                r="52"
                className="stroke-cyan-950"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="stroke-cyan-400 transition-all duration-300"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={326}
                strokeDashoffset={326 - (326 * secPercent) / 100}
                strokeLinecap="round"
                style={{ filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.8))' }}
              />

              {/* 内周の装飾目盛り */}
              <circle
                cx="60"
                cy="60"
                r="40"
                className="stroke-cyan-800/40"
                strokeWidth="1.5"
                strokeDasharray="4 6"
                fill="transparent"
              />
            </svg>

            {/* センター秒数表示 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]">
                {timeInfo.secondsString}
              </span>
              <span className="text-[10px] font-bold text-cyan-400 tracking-widest uppercase">
                SECONDS
              </span>
            </div>
          </div>

          {/* バイナリ秒数インジケーター (6-bit LED) */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-zinc-500 font-bold tracking-widest uppercase">
              BINARY SECONDS
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-black/60 border border-cyan-900/60">
              {binarySeconds.map((bit, idx) => (
                <div
                  key={idx}
                  className={`w-2.5 h-2.5 rounded-xs transition-colors duration-200 ${
                    bit === '1'
                      ? 'bg-cyan-400 shadow-[0_0_6px_rgba(0,245,255,0.9)]'
                      : 'bg-cyan-950/60 border border-cyan-900/40'
                  }`}
                  title={`Bit 2^${5 - idx}: ${bit}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ボトムバー: システムステータスフッター */}
      <div className="flex items-center justify-between w-full border-t border-cyan-900/60 pt-2 z-10 text-[11px] text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="text-cyan-500 font-bold">TELEMETRY:</span>
          <span>NOMINAL / SYNC_OK</span>
        </div>
        <div className="flex items-center gap-4 text-cyan-400/70">
          <span>CORE_CLOCK: 1.000 Hz</span>
          <span>LATENCY: 0.1ms</span>
        </div>
      </div>
    </div>
  );
};
