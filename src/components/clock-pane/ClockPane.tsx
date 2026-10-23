import React, { useState, useEffect, useRef, useCallback, useTransition } from 'react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';
import { FlipClockFace } from './faces/FlipClockFace';
import { DigitalMinimalFace } from './faces/DigitalMinimalFace';
import { Digital7SegmentFace } from './faces/Digital7SegmentFace';
import { DigitalCyberFace } from './faces/DigitalCyberFace';
import { AnalogStationFace } from './faces/AnalogStationFace';
import { AnalogChronographFace } from './faces/AnalogChronographFace';
import { AnalogRomanFace } from './faces/AnalogRomanFace';
import { ChevronUp, ChevronDown, Layers } from 'lucide-react';

export interface ClockNavHandler {
  next: () => void;
  prev: () => void;
}

export interface ClockPaneProps {
  timeInfo: CurrentTimeInfo;
  isActive: boolean;
  onRegisterNav?: (handler: ClockNavHandler | null) => void;
}

interface ClockFaceItem {
  id: string;
  name: string;
  category: 'フリップ' | 'デジタル' | 'アナログ';
  badgeColor: string;
}

const CLOCK_FACES: ClockFaceItem[] = [
  {
    id: 'flip',
    name: 'パタパタ時計 (スプリットフラップ)',
    category: 'フリップ',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  {
    id: 'digital-minimal',
    name: 'モダン・ミニマル',
    category: 'デジタル',
    badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
  },
  {
    id: 'digital-7segment',
    name: '7セグメント LED / VFD',
    category: 'デジタル',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  {
    id: 'digital-cyber',
    name: 'サイバーパンク HUD',
    category: 'デジタル',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
  },
  {
    id: 'analog-station',
    name: 'ステーション・バウハウス',
    category: 'アナログ',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  },
  {
    id: 'analog-chronograph',
    name: 'アビエーション・クロノグラフ',
    category: 'アナログ',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  {
    id: 'analog-roman',
    name: 'クラシック・ローマン',
    category: 'アナログ',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
];

const LOCAL_STORAGE_KEY = 'daily_station_clock_face_index';

export const ClockPane: React.FC<ClockPaneProps> = ({
  timeInfo,
  isActive,
  onRegisterNav,
}) => {
  const [, startTransition] = useTransition();

  // 選択中の時計デザイン (0〜6)
  const [activeIndex, setActiveIndex] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < CLOCK_FACES.length) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // デザイン名バッジの表示タイマー（切り替え時に数秒間フワッと強調表示）
  const [showBadge, setShowBadge] = useState(true);
  const badgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const changeIndex = useCallback((newIndex: number) => {
    startTransition(() => {
      setActiveIndex(newIndex);
    });
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, newIndex.toString());
    } catch {
      // ignore
    }

    setShowBadge(true);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => {
      setShowBadge(false);
    }, 2800);
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => {
      const nextIdx = (prev + 1) % CLOCK_FACES.length;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, nextIdx.toString());
      } catch {
        // ignore
      }
      return nextIdx;
    });
    setShowBadge(true);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => {
      setShowBadge(false);
    }, 2800);
  }, []);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => {
      const prevIdx = (prev - 1 + CLOCK_FACES.length) % CLOCK_FACES.length;
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, prevIdx.toString());
      } catch {
        // ignore
      }
      return prevIdx;
    });
    setShowBadge(true);
    if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current);
    badgeTimerRef.current = setTimeout(() => {
      setShowBadge(false);
    }, 2800);
  }, []);

  // 親コンポーネント (App.tsx) へのナビゲーション関数登録
  useEffect(() => {
    if (onRegisterNav) {
      onRegisterNav({ next: handleNext, prev: handlePrev });
      return () => onRegisterNav(null);
    }
  }, [onRegisterNav, handleNext, handlePrev]);

  // マウスホイールでの縦スライド切り替え (350ms デバウンス)
  const lastWheelTime = useRef<number>(0);
  const handleWheel = (e: React.WheelEvent) => {
    if (!isActive) return;
    const now = Date.now();
    if (now - lastWheelTime.current < 350) return;

    if (Math.abs(e.deltaY) > 25) {
      lastWheelTime.current = now;
      if (e.deltaY > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  // キーボードの上下キーでの切り替え
  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, handlePrev, handleNext]);

  const currentFace = CLOCK_FACES[activeIndex];

  return (
    <div
      onWheel={handleWheel}
      className="relative w-[800px] h-[438px] overflow-hidden select-none bg-zinc-950"
    >
      {/* 縦スライドコンテナ (高さ: 7面 × 438px = 3066px) */}
      <div
        className="w-[800px] transition-transform duration-500 ease-out will-change-transform"
        style={{
          transform: `translateY(-${activeIndex * 438}px)`,
          height: `${CLOCK_FACES.length * 438}px`,
        }}
      >
        {/* 1. パタパタ時計 (上下2枚のカードがパタパタ倒れる) */}
        <div className="w-[800px] h-[438px] shrink-0">
          <FlipClockFace timeInfo={timeInfo} />
        </div>

        {/* 2. デジタル①: モダンミニマル */}
        <div className="w-[800px] h-[438px] shrink-0">
          <DigitalMinimalFace timeInfo={timeInfo} />
        </div>

        {/* 3. デジタル②: 7セグメント LED / VFD */}
        <div className="w-[800px] h-[438px] shrink-0">
          <Digital7SegmentFace timeInfo={timeInfo} />
        </div>

        {/* 4. デジタル③: サイバーパンク HUD */}
        <div className="w-[800px] h-[438px] shrink-0">
          <DigitalCyberFace timeInfo={timeInfo} />
        </div>

        {/* 5. アナログ①: ステーション・バウハウス */}
        <div className="w-[800px] h-[438px] shrink-0">
          <AnalogStationFace timeInfo={timeInfo} />
        </div>

        {/* 6. アナログ②: アビエーション・クロノグラフ */}
        <div className="w-[800px] h-[438px] shrink-0">
          <AnalogChronographFace timeInfo={timeInfo} />
        </div>

        {/* 7. アナログ③: クラシック・ローマン */}
        <div className="w-[800px] h-[438px] shrink-0">
          <AnalogRomanFace timeInfo={timeInfo} />
        </div>
      </div>

      {/* フローティング: 時計デザイン名バッジ (切り替え時に表示) */}
      <div
        className={`absolute top-3.5 left-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/70 backdrop-blur-md shadow-xl transition-all duration-300 pointer-events-none ${
          showBadge ? 'opacity-100 translate-y-0' : 'opacity-30 hover:opacity-100'
        }`}
      >
        <Layers className="w-3.5 h-3.5 text-zinc-400" />
        <span
          className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${currentFace.badgeColor}`}
        >
          {currentFace.category}
        </span>
        <span className="font-bold text-xs text-white tracking-wide">
          {currentFace.name}
        </span>
        <span className="text-[10px] font-mono font-bold text-zinc-400 ml-1">
          {activeIndex + 1}/{CLOCK_FACES.length}
        </span>
      </div>

      {/* フローティング: 右端の縦スライドナビゲーター (タッチ＆クリックで即時移動可能) */}
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 p-1.5 rounded-full bg-zinc-900/85 border border-zinc-800 backdrop-blur-md shadow-2xl">
        {/* 上へボタン */}
        <button
          type="button"
          onClick={handlePrev}
          className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="前の時計へスライド (または ↑ キー / 上スワイプ)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        {/* 7個の縦ドットインジケーター */}
        <div className="flex flex-col gap-1.5 py-1">
          {CLOCK_FACES.map((face, idx) => {
            const isCurrent = idx === activeIndex;
            return (
              <button
                key={face.id}
                type="button"
                onClick={() => changeIndex(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isCurrent
                    ? 'w-2 h-5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                    : 'w-2 h-2 bg-zinc-600 hover:bg-zinc-400'
                }`}
                title={`${face.category}: ${face.name}`}
              />
            );
          })}
        </div>

        {/* 下へボタン */}
        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="次の時計へスライド (または ↓ キー / 下スワイプ)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
