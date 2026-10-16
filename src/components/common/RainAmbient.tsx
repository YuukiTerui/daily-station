import React from 'react';

interface RainAmbientProps {
  weatherCode?: number;
  precipitation?: number;
  forceRain?: boolean; // 動作確認・デモ用プロップス
}

export const RainAmbient: React.FC<RainAmbientProps> = ({
  weatherCode = 0,
  precipitation = 0,
  forceRain = false,
}) => {
  // 雨判定: WMOコード 51〜67, 80〜82, 95〜99 または 降水量 > 0.1mm または forceRain
  const isRaining =
    forceRain ||
    precipitation > 0.1 ||
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    weatherCode >= 95;

  if (!isRaining) return null;

  // 12本の控えめな雨粒ストリーク
  const drops = [
    { left: '8%', delay: '0s', duration: '1.2s', opacity: 0.25 },
    { left: '16%', delay: '0.4s', duration: '1.4s', opacity: 0.15 },
    { left: '25%', delay: '0.8s', duration: '1.1s', opacity: 0.3 },
    { left: '33%', delay: '0.2s', duration: '1.3s', opacity: 0.2 },
    { left: '42%', delay: '0.9s', duration: '1.5s', opacity: 0.18 },
    { left: '50%', delay: '0.1s', duration: '1.2s', opacity: 0.28 },
    { left: '58%', delay: '0.6s', duration: '1.3s', opacity: 0.22 },
    { left: '67%', delay: '0.3s', duration: '1.1s', opacity: 0.25 },
    { left: '75%', delay: '0.7s', duration: '1.4s', opacity: 0.18 },
    { left: '83%', delay: '0.5s', duration: '1.2s', opacity: 0.3 },
    { left: '92%', delay: '0.2s', duration: '1.5s', opacity: 0.2 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {drops.map((drop, i) => (
        <span
          key={i}
          className="rain-drop"
          style={{
            left: drop.left,
            animationDelay: drop.delay,
            animationDuration: drop.duration,
            opacity: drop.opacity,
          }}
        />
      ))}
    </div>
  );
};
