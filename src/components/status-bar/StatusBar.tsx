import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sun, RefreshCw, MessageSquareHeart } from 'lucide-react';
import type { CalendarEvent } from '@/types/calendar';
import type { WeatherData } from '@/types/weather';
import { getDailyAdvice } from '@/lib/dailyAdvice';

interface StatusBarProps {
  lastUpdated?: Date | string;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onRefresh: () => void;
  isFetching: boolean;
  nextEvent?: CalendarEvent | null;
  weather?: WeatherData;
  activeTab: 'weather' | 'calendar';
  onSelectTab: (tab: 'weather' | 'calendar') => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  lastUpdated,
  isNightMode,
  onToggleNightMode,
  onRefresh,
  isFetching,
  nextEvent,
  weather,
  activeTab,
  onSelectTab,
}) => {
  const [isEventMode, setIsEventMode] = useState(false);
  const [fade, setFade] = useState(true);

  // 8秒ごとに「今日の一言」と「次の予定」をフェードイン・アウトで滑らかにローテーション
  useEffect(() => {
    if (!nextEvent) return;
    const interval = setInterval(() => {
      setFade(false); // フェードアウト
      setTimeout(() => {
        setIsEventMode((prev) => !prev);
        setFade(true); // フェードイン
      }, 300); // 300ms transition
    }, 8000);
    return () => clearInterval(interval);
  }, [nextEvent]);

  const dateObj = lastUpdated ? new Date(lastUpdated) : null;
  const updatedTimeString =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
      : '--:--';

  const advice = getDailyAdvice(weather);

  const formatEventTime = (event: CalendarEvent) => {
    if (event.isAllDay) return '終日';
    const s = new Date(event.start);
    return `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')}`;
  };

  const showEvent = Boolean(nextEvent && isEventMode);

  const handleManualToggle = () => {
    if (!nextEvent) return;
    setFade(false);
    setTimeout(() => {
      setIsEventMode((prev) => !prev);
      setFade(true);
    }, 200);
  };

  return (
    <footer className="w-full h-[42px] px-3 bg-card/95 border-t border-border flex items-center justify-between text-xs select-none">
      {/* 左側: 今日の一言 / カレンダー予定 (滑らかなフェード切替) */}
      <div
        className="flex items-center gap-2 max-w-[420px] truncate cursor-pointer"
        onClick={handleManualToggle}
        title="クリックで今日の一言／予定を手動切り替え"
      >
        <div
          className={`flex items-center gap-2 truncate transition-all duration-300 ease-in-out ${
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
          }`}
        >
          {!showEvent ? (
            <>
              <span className="text-sm select-none shrink-0">{advice.emoji}</span>
              <span className="text-muted-foreground text-[11px] truncate font-medium">
                {advice.text}
              </span>
            </>
          ) : nextEvent ? (
            <>
              <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="font-semibold text-foreground text-[11px] shrink-0">
                次の予定:
              </span>
              <span className="text-muted-foreground text-[11px] truncate">
                {formatEventTime(nextEvent)} - {nextEvent.summary}
              </span>
            </>
          ) : (
            <>
              <MessageSquareHeart className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="text-muted-foreground text-[11px] truncate">
                直近の予定はありません
              </span>
            </>
          )}
        </div>
      </div>

      {/* 中央: 画面切り替えインジケーター (ドット) */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/40">
        <button
          type="button"
          onClick={() => onSelectTab('weather')}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activeTab === 'weather' ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/40'
          }`}
          title="ウェザー画面"
        />
        <button
          type="button"
          onClick={() => onSelectTab('calendar')}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activeTab === 'calendar' ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/40'
          }`}
          title="カレンダー画面"
        />
      </div>

      {/* 右側: ステータスインジケーター & ナイトモード */}
      <div className="flex items-center gap-2">
        {/* データ更新状況 */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono">{updatedTimeString}</span>
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

        {/* ナイトモードトグル (アイコンのみ) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleNightMode}
          className="h-7 w-7 rounded-full hover:bg-muted cursor-pointer"
          title={isNightMode ? 'デイモードへ切替' : 'ナイトモードへ切替'}
        >
          {isNightMode ? (
            <Sun className="w-4 h-4 text-amber-500" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-400" />
          )}
        </Button>
      </div>
    </footer>
  );
};
