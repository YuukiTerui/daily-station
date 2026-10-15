import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import type { DailyTip } from '@/lib/dailyTip';
import type { CalendarEvent } from '@/hooks/useCalendarEvents';

interface StatusBarProps {
  lastUpdated?: Date | string;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onRefresh: () => void;
  isFetching: boolean;
  activePageIndex: number;
  onPageChange: (pageIndex: number) => void;
  dailyTip: DailyTip;
  nextEvent?: CalendarEvent;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  lastUpdated,
  isNightMode,
  onToggleNightMode,
  onRefresh,
  isFetching,
  activePageIndex,
  onPageChange,
  dailyTip,
  nextEvent,
}) => {
  const [showEventInTipMode, setShowEventInTipMode] = useState(false);

  // 12秒ごとに「今日の一言」と「直近予定」を穏やかにクロスフェード
  useEffect(() => {
    const timer = setInterval(() => {
      setShowEventInTipMode((prev) => !prev);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const dateObj = lastUpdated ? new Date(lastUpdated) : null;
  const updatedTimeString =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
      : '--:--';

  return (
    <footer className="w-full h-[42px] px-3 bg-card/95 border-t border-border flex items-center justify-between text-xs select-none">
      {/* 左側: 今日の一言 / カレンダー予定の切り替え表示 (最大 440px) */}
      <div
        className="flex items-center gap-2 max-w-[440px] truncate cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowEventInTipMode((prev) => !prev)}
        title="タップで一言と予定を切り替え"
      >
        {activePageIndex === 1 || showEventInTipMode ? (
          // カレンダー予定モード
          <div className="flex items-center gap-1.5 truncate animate-in fade-in duration-300">
            <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="font-bold text-foreground text-[11px] shrink-0">
              次の予定:
            </span>
            <span className="text-muted-foreground text-[11px] truncate">
              {nextEvent
                ? `${nextEvent.startTime} - ${nextEvent.title}`
                : '本日の予定はありません'}
            </span>
          </div>
        ) : (
          // 今日の一言モード
          <div className="flex items-center gap-1.5 truncate animate-in fade-in duration-300">
            <span className="text-sm shrink-0 leading-none">{dailyTip.icon}</span>
            <span className="font-bold text-foreground text-[11px] shrink-0 flex items-center gap-1">
              今日の一言:
            </span>
            <span className="text-muted-foreground text-[11px] truncate font-medium">
              {dailyTip.message}
            </span>
          </div>
        )}
      </div>

      {/* 中央: ページインジケーター（スワイプ・クリック両対応） */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(0)}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activePageIndex === 0
              ? 'w-5 bg-primary'
              : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
          }`}
          title="ウェザーステーション"
        />
        <button
          type="button"
          onClick={() => onPageChange(1)}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activePageIndex === 1
              ? 'w-5 bg-primary'
              : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
          }`}
          title="カレンダー & スケジュール"
        />
      </div>

      {/* 右側: ステータスインジケーター & ナイトモード */}
      <div className="flex items-center gap-3">
        {/* データ更新状況 */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono">{updatedTimeString} 更新</span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="p-1 hover:text-foreground transition disabled:opacity-50 cursor-pointer"
            title="手動更新"
          >
            <RefreshCw
              className={`w-3 h-3 ${isFetching ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        </div>

        {/* ナイトモードトグル */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleNightMode}
          className="h-7 px-2 flex items-center gap-1 text-[11px] hover:bg-muted"
        >
          {isNightMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>デイ</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>ナイト</span>
            </>
          )}
        </Button>
      </div>
    </footer>
  );
};
