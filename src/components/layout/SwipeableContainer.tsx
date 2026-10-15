import React, { useRef, useState, useEffect } from 'react';

interface SwipeableContainerProps {
  activeIndex: number;
  onIndexChange: (newIndex: number) => void;
  children: React.ReactNode[];
}

export const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  activeIndex,
  onIndexChange,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const totalPages = children.length;
  const SWIPE_THRESHOLD = 50; // px

  // --- タッチ操作ハンドラ ---
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    // 縦スクロールと区別（横移動が勝っている場合のみ追従）
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // 最初のページで右ドラッグ、または最後のページで左ドラッグの場合は抵抗感を付与
      if (
        (activeIndex === 0 && diffX > 0) ||
        (activeIndex === totalPages - 1 && diffX < 0)
      ) {
        setDragOffset(diffX * 0.25);
      } else {
        setDragOffset(diffX);
      }
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      if (dragOffset < -SWIPE_THRESHOLD && activeIndex < totalPages - 1) {
        onIndexChange(activeIndex + 1);
      } else if (dragOffset > SWIPE_THRESHOLD && activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  // --- マウス操作（PCでのテスト・プレビュー用） ---
  const [mouseStartX, setMouseStartX] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // ボタンやインタラクティブ要素のクリック邪魔を最小化
    if ((e.target as HTMLElement).closest('button, [role="button"]')) return;
    setMouseStartX(e.clientX);
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mouseStartX === null || !isDragging) return;
    const diffX = e.clientX - mouseStartX;
    if (
      (activeIndex === 0 && diffX > 0) ||
      (activeIndex === totalPages - 1 && diffX < 0)
    ) {
      setDragOffset(diffX * 0.25);
    } else {
      setDragOffset(diffX);
    }
  };

  const handleMouseUp = () => {
    if (isDragging && mouseStartX !== null) {
      if (dragOffset < -SWIPE_THRESHOLD && activeIndex < totalPages - 1) {
        onIndexChange(activeIndex + 1);
      } else if (dragOffset > SWIPE_THRESHOLD && activeIndex > 0) {
        onIndexChange(activeIndex - 1);
      }
    }
    setMouseStartX(null);
    setDragOffset(0);
    setIsDragging(false);
  };

  // ウィンドウ外でのマウスアップも検知
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  });

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      className="w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing relative"
    >
      <div
        className="w-full h-full flex"
        style={{
          transform: isDragging
            ? `translate3d(calc(-${activeIndex * 100}% + ${dragOffset}px), 0, 0)`
            : `translate3d(-${activeIndex * 100}%, 0, 0)`,
          transition: isDragging
            ? 'none'
            : 'transform 300ms cubic-bezier(0.2, 0, 0.2, 1)',
        }}
      >
        {children.map((child, index) => (
          <div
            key={index}
            className="w-full h-full shrink-0 flex px-2.5 pt-2 pb-1.5"
            style={{ width: '800px' }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};
