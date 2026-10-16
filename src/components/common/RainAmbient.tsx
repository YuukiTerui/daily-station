import React from 'react';

interface RainAmbientProps {
  weatherCode?: number;
  precipitation?: number;
  forceRain?: boolean;
}

export const RainAmbient: React.FC<RainAmbientProps> = ({
  weatherCode = 0,
  precipitation = 0,
  forceRain = false,
}) => {
  const isRaining =
    forceRain ||
    precipitation > 0.1 ||
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    weatherCode >= 95;

  if (!isRaining) return null;

  // 画面全体(800x480)にバランスよく降る雨粒（幅2.5px、長さ46px、前面表示）
  const drops = [
    { left: '3%', delay: '0s', duration: '0.8s', opacity: 0.8 },
    { left: '7%', delay: '0.35s', duration: '0.95s', opacity: 0.65 },
    { left: '12%', delay: '0.7s', duration: '0.75s', opacity: 0.85 },
    { left: '16%', delay: '0.15s', duration: '0.9s', opacity: 0.7 },
    { left: '21%', delay: '0.5s', duration: '0.85s', opacity: 0.75 },
    { left: '26%', delay: '0.85s', duration: '1.0s', opacity: 0.65 },
    { left: '30%', delay: '0.25s', duration: '0.8s', opacity: 0.9 },
    { left: '35%', delay: '0.6s', duration: '0.95s', opacity: 0.75 },
    { left: '40%', delay: '0.05s', duration: '0.75s', opacity: 0.85 },
    { left: '44%', delay: '0.4s', duration: '0.9s', opacity: 0.7 },
    { left: '49%', delay: '0.75s', duration: '0.85s', opacity: 0.8 },
    { left: '53%', delay: '0.2s', duration: '1.0s', opacity: 0.65 },
    { left: '58%', delay: '0.55s', duration: '0.8s', opacity: 0.85 },
    { left: '62%', delay: '0.9s', duration: '0.95s', opacity: 0.7 },
    { left: '67%', delay: '0.1s', duration: '0.75s', opacity: 0.9 },
    { left: '71%', delay: '0.45s', duration: '0.9s', opacity: 0.75 },
    { left: '76%', delay: '0.8s', duration: '0.85s', opacity: 0.65 },
    { left: '81%', delay: '0.3s', duration: '1.0s', opacity: 0.85 },
    { left: '85%', delay: '0.65s', duration: '0.8s', opacity: 0.75 },
    { left: '90%', delay: '0.15s', duration: '0.9s', opacity: 0.7 },
    { left: '94%', delay: '0.5s', duration: '0.85s', opacity: 0.8 },
    { left: '98%', delay: '0.25s', duration: '0.95s', opacity: 0.75 },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-20">
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
