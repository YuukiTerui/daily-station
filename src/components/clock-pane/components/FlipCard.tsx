import React, { useEffect, useState } from 'react';

export interface FlipCardProps {
  value: string | number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface HalfCardProps {
  val: string;
  isTop: boolean;
  width: number;
  height: number;
  fontSize: number;
}

// 完全に幾何学的に上下50%ずつスライスするカードハーフコンポーネント (100% 完全不透明遮光)
const HalfCard: React.FC<HalfCardProps> = ({ val, isTop, width, height, fontSize }) => {
  const halfHeight = height / 2;

  return (
    <div
      className={`w-full overflow-hidden relative select-none ${
        isTop
          ? 'rounded-t-xl border-b border-black/90'
          : 'rounded-b-xl border-t border-white/5'
      }`}
      style={{
        height: `${halfHeight}px`,
        width: `${width}px`,
        backgroundColor: isTop ? '#262830' : '#1c1d22',
        backgroundImage: isTop
          ? 'linear-gradient(to bottom, #2b2d36, #222329)'
          : 'linear-gradient(to bottom, #202126, #17181c)',
      }}
    >
      {/* 完全不透明な下地ベース（背後の数字が1ピクセルも透けないように完全遮光） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundColor: isTop ? '#262830' : '#1c1d22' }}
      />

      {/* 常に高さ height の親枠中央に数字を置き、上半分は top:0、下半分は top:-halfHeight で厳密に切り分ける */}
      <div
        className="w-full flex items-center justify-center font-mono font-black text-zinc-100 select-none leading-none tracking-tight absolute left-0 z-10"
        style={{
          height: `${height}px`,
          top: isTop ? 0 : `-${halfHeight}px`,
          fontSize: `${fontSize}px`,
        }}
      >
        {val}
      </div>

      {/* 上下カードそれぞれの質感・光沢 */}
      {isTop ? (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-20" />
      ) : (
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-20" />
      )}
    </div>
  );
};

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
    }, 400);
    return () => clearTimeout(timer);
  }, [isFlipping, current]);

  // Dimensions based on size
  const config =
    size === 'lg'
      ? {
          width: 90,
          height: 140,
          fontSize: 90,
          hinge: 'w-2 h-4',
          labelSize: 'text-xs',
        }
      : size === 'md'
        ? {
            width: 64,
            height: 98,
            fontSize: 62,
            hinge: 'w-1.5 h-3',
            labelSize: 'text-[10px]',
          }
        : {
            width: 44,
            height: 66,
            fontSize: 42,
            hinge: 'w-1 h-2',
            labelSize: 'text-[9px]',
          };

  const halfHeight = config.height / 2;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      {/* 3D Flip Card Container */}
      <div
        className="relative rounded-xl bg-zinc-950 p-[3px] shadow-2xl border border-zinc-700/50 [perspective:800px] select-none"
        style={{
          width: `${config.width + 6}px`,
          height: `${config.height + 6}px`,
        }}
      >
        {/* カード外枠グロー / 質感 */}
        <div className="relative w-full h-full rounded-lg overflow-hidden flex flex-col bg-zinc-900 shadow-inner">
          {/* 1. 上段静止カード（背景: 新しい値の上半分） */}
          <HalfCard
            val={current}
            isTop={true}
            width={config.width}
            height={config.height}
            fontSize={config.fontSize}
          />

          {/* 2. 下段静止カード（背景: 古い値の下半分 または 反映完了後の新しい値） */}
          <HalfCard
            val={isFlipping ? prev : current}
            isTop={false}
            width={config.width}
            height={config.height}
            fontSize={config.fontSize}
          />

          {/* 3. アニメーション中の上段フリップ葉（古い値の上半分が手前に倒れ込む） */}
          {isFlipping && (
            <div
              className="absolute top-0 left-0 w-full z-20 origin-bottom [transform-style:preserve-3d] [backface-visibility:hidden] animate-flap-top shadow-lg"
              style={{
                height: `${halfHeight}px`,
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
            >
              <HalfCard
                val={prev}
                isTop={true}
                width={config.width}
                height={config.height}
                fontSize={config.fontSize}
              />
              <div className="absolute inset-0 bg-black/30 pointer-events-none z-30" />
            </div>
          )}

          {/* 4. アニメーション中の下段フリップ葉（新しい値の下半分が奥から倒れて着地する） */}
          {isFlipping && (
            <div
              className="absolute bottom-0 left-0 w-full z-30 origin-top [transform-style:preserve-3d] [backface-visibility:hidden] animate-flap-bottom shadow-2xl"
              style={{
                height: `${halfHeight}px`,
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
            >
              <HalfCard
                val={current}
                isTop={false}
                width={config.width}
                height={config.height}
                fontSize={config.fontSize}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-30" />
            </div>
          )}

          {/* 中央の水平スリット / 分割ライン */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-black/90 shadow-sm z-40 pointer-events-none" />

          {/* 左右のヒンジ / ピン切り欠き */}
          <div
            className={`absolute left-0 top-1/2 -translate-y-1/2 ${config.hinge} bg-zinc-950 rounded-r-xs border border-l-0 border-zinc-700/80 shadow-md z-50`}
          />
          <div
            className={`absolute right-0 top-1/2 -translate-y-1/2 ${config.hinge} bg-zinc-950 rounded-l-xs border border-r-0 border-zinc-700/80 shadow-md z-50`}
          />
        </div>
      </div>

      {/* ラベル（HOURS / MINUTES / SECONDS 等） */}
      {label && (
        <span
          className={`font-mono font-bold tracking-wider text-muted-foreground uppercase ${config.labelSize}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
