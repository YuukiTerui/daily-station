import React, { useEffect, useState } from 'react';

export interface FlipCardProps {
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const FlipCard: React.FC<FlipCardProps> = ({
  value,
  label,
  size = 'lg',
  className = '',
}) => {
  const strVal = String(value);
  const [current, setCurrent] = useState(strVal);
  const [prev, setPrev] = useState(strVal);
  const [isFlipping, setIsFlipping] = useState(false);

  // Prop変更時の状態同期 (React公式推奨パターン: レンダリング中のインラインState調整)
  if (strVal !== current) {
    setPrev(current);
    setCurrent(strVal);
    setIsFlipping(true);
  }

  // フリップアニメーション終了後にフリップ状態を解除
  useEffect(() => {
    if (!isFlipping) return;
    const timer = setTimeout(() => {
      setIsFlipping(false);
      setPrev(current);
    }, 420);
    return () => clearTimeout(timer);
  }, [isFlipping, current]);

  // Dimensions based on size
  const dimensions =
    size === 'lg'
      ? {
          w: 'w-[92px]',
          h: 'h-[142px]',
          halfH: 'h-[71px]',
          text: 'text-[88px] leading-[142px]',
          hinge: 'w-2 h-4',
          labelSize: 'text-xs',
        }
      : size === 'md'
        ? {
            w: 'w-[64px]',
            h: 'h-[96px]',
            halfH: 'h-[48px]',
            text: 'text-[56px] leading-[96px]',
            hinge: 'w-1.5 h-3',
            labelSize: 'text-[10px]',
          }
        : {
            w: 'w-[42px]',
            h: 'h-[62px]',
            halfH: 'h-[31px]',
            text: 'text-[36px] leading-[62px]',
            hinge: 'w-1 h-2',
            labelSize: 'text-[9px]',
          };

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {/* 3D Flip Card Container */}
      <div
        className={`relative ${dimensions.w} ${dimensions.h} rounded-xl bg-zinc-950 p-[3px] shadow-2xl border border-zinc-700/50 [perspective:800px] select-none`}
      >
        {/* カード外枠グロー / 質感 */}
        <div className="relative w-full h-full rounded-lg overflow-hidden flex flex-col bg-zinc-900 shadow-inner">
          {/* 1. 上段静止カード（背景: 新しい値の上半分） */}
          <div
            className={`w-full ${dimensions.halfH} bg-gradient-to-b from-zinc-800 to-zinc-850 overflow-hidden relative flex justify-center border-b border-black/70 shadow-sm`}
          >
            <span
              className={`font-mono font-black text-zinc-100 tracking-tight ${dimensions.text} select-none absolute top-0`}
            >
              {current}
            </span>
            {/* 上部カードの光沢ハイライト */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
          </div>

          {/* 2. 下段静止カード（背景: 古い値の下半分 または 反映完了後の新しい値） */}
          <div
            className={`w-full ${dimensions.halfH} bg-gradient-to-b from-zinc-850 to-zinc-900 overflow-hidden relative flex justify-center border-t border-white/5 shadow-inner`}
          >
            <span
              className={`font-mono font-black text-zinc-100 tracking-tight ${dimensions.text} select-none absolute -top-[50%]`}
            >
              {isFlipping ? prev : current}
            </span>
            {/* 下部カードの底面シャドウ */}
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>

          {/* 3. アニメーション中の上段フリップ葉（古い値の上半分が手前に倒れ込む） */}
          {isFlipping && (
            <div
              className={`absolute top-0 inset-x-0 ${dimensions.halfH} bg-gradient-to-b from-zinc-800 to-zinc-850 overflow-hidden flex justify-center border-b border-black/70 shadow-lg origin-bottom [transform-style:preserve-3d] [backface-visibility:hidden] animate-flap-top z-20`}
            >
              <span
                className={`font-mono font-black text-zinc-100 tracking-tight ${dimensions.text} select-none absolute top-0`}
              >
                {prev}
              </span>
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            </div>
          )}

          {/* 4. アニメーション中の下段フリップ葉（新しい値の下半分が奥から倒れて着地する） */}
          {isFlipping && (
            <div
              className={`absolute bottom-0 inset-x-0 ${dimensions.halfH} bg-gradient-to-b from-zinc-850 to-zinc-900 overflow-hidden flex justify-center border-t border-white/5 shadow-2xl origin-top [transform-style:preserve-3d] [backface-visibility:hidden] animate-flap-bottom z-30`}
            >
              <span
                className={`font-mono font-black text-zinc-100 tracking-tight ${dimensions.text} select-none absolute -top-[50%]`}
              >
                {current}
              </span>
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            </div>
          )}

          {/* 中央の水平スリット / 分割ライン */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/90 shadow-sm z-40 pointer-events-none" />

          {/* 左右のヒンジ / ピン切り欠き */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 ${dimensions.hinge} bg-zinc-950 rounded-r-xs border border-l-0 border-zinc-700/80 shadow-md z-50`}
          />
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 ${dimensions.hinge} bg-zinc-950 rounded-l-xs border border-r-0 border-zinc-700/80 shadow-md z-50`}
          />
        </div>
      </div>

      {/* ラベル（HOURS / MINUTES / SECONDS 等） */}
      {label && (
        <span
          className={`font-mono font-bold tracking-wider text-muted-foreground uppercase ${dimensions.labelSize}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
