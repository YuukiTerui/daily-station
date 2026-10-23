import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Moon,
  Sun,
  RefreshCw,
  MessageSquareHeart,
  CloudRain,
  Droplets,
} from 'lucide-react';
import type { CalendarEvent } from '@/types/calendar';
import type { WeatherData } from '@/types/weather';
import { getDailyAdvice } from '@/lib/dailyAdvice';

export type DashboardTab = 'weather' | 'calendar' | 'clock';

interface StatusBarProps {
  lastUpdated?: Date | string;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onRefresh: () => void;
  isFetching: boolean;
  nextEvent?: CalendarEvent | null;
  weather?: WeatherData;
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onOpenRadar?: () => void;
  forceRain?: boolean;
  onToggleRain?: () => void;
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
  onOpenRadar,
  forceRain = false,
  onToggleRain,
}) => {
  const [isEventMode, setIsEventMode] = useState(false);
  const [animState, setAnimState] = useState<'visible' | 'flipping-out' | 'flipping-in'>(
    'visible',
  );

  // 8秒ごとに「今日の一言」と「次の予定」を3Dフリップ回転アニメーションで滑らかに切り替え
  useEffect(() => {
    if (!nextEvent) return;
    const interval = setInterval(() => {
      setAnimState('flipping-out');
      setTimeout(() => {
        setIsEventMode((prev) => !prev);
        setAnimState('flipping-in');
        setTimeout(() => {
          setAnimState('visible');
        }, 250);
      }, 250);
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
    setAnimState('flipping-out');
    setTimeout(() => {
      setIsEventMode((prev) => !prev);
      setAnimState('flipping-in');
      setTimeout(() => {
        setAnimState('visible');
      }, 250);
    }, 250);
  };

  const rotationClass =
    animState === 'flipping-out'
      ? 'rotate-x-90 opacity-0'
      : animState === 'flipping-in'
        ? '-rotate-x-90 opacity-0'
        : 'rotate-x-0 opacity-100';

  return (
    <footer className="relative w-full h-[42px] px-3 bg-card/95 border-t border-border flex items-center justify-between text-xs select-none">
      {/* 左側: 今日の一言 / カレンダー予定 (3D回転フリップアニメーション) */}
      <div
        className="flex items-center gap-2 max-w-[380px] truncate cursor-pointer [perspective:1000px]"
        onClick={handleManualToggle}
        title="クリックで今日の一言／予定を手動切り替え"
      >
        <div
          className={`flex items-center gap-2 truncate transition-all duration-250 ease-out origin-center transform-gpu ${rotationClass}`}
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

      {/* 中央: 画面切り替えインジケーター (absolute固定配置で絶対にブレない) */}
      <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/40">
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
        <button
          type="button"
          onClick={() => onSelectTab('clock')}
          className={`h-2 rounded-full transition-all cursor-pointer ${
            activeTab === 'clock' ? 'w-5 bg-primary' : 'w-2 bg-muted-foreground/40'
          }`}
          title="大時計画面"
        />
      </div>

      {/* 右側: 雨演出 / 雨雲レーダー / 更新 / ナイトモード */}
      <div className="flex items-center gap-1.5">
        {/* 雨演出プレビュー（タッチで簡単にオン/オフを試せる） */}
        {onToggleRain && (
          <button
            type="button"
            onClick={onToggleRain}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold text-[11px] transition cursor-pointer ${
              forceRain
                ? 'bg-sky-500 text-white shadow-sm'
                : 'bg-muted/60 text-muted-foreground hover:text-foreground'
            }`}
            title="雨エフェクト演出の表示切替"
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>{forceRain ? '雨演出 ON' : '雨演出'}</span>
          </button>
        )}

        {/* 雨雲レーダーボタン */}
        {onOpenRadar && (
          <button
            type="button"
            onClick={onOpenRadar}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 font-semibold text-[11px] transition cursor-pointer"
            title="雨雲レーダーを表示"
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>雨雲</span>
          </button>
        )}

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
