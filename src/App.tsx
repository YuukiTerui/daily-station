import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useIndoorEnvironment } from '@/hooks/useIndoorEnvironment';
import { useNightMode } from '@/hooks/useNightMode';
import { useCalendarData } from '@/hooks/useCalendarData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeftPane } from '@/components/left-pane/LeftPane';
import { CenterPane } from '@/components/center-pane/CenterPane';
import { RightPane } from '@/components/right-pane/RightPane';
import { CalendarPane } from '@/components/calendar-pane/CalendarPane';
import { ClockPane, type ClockNavHandler } from '@/components/clock-pane/ClockPane';
import { StatusBar, type DashboardTab } from '@/components/status-bar/StatusBar';
import { RainAmbient } from '@/components/common/RainAmbient';
import { RadarModal } from '@/components/modals/RadarModal';

export const App: React.FC = () => {
  const {
    data: weather,
    isLoading: isWeatherLoading,
    refetch: refetchWeather,
    isFetching: isWeatherFetching,
  } = useWeatherData();
  const {
    data: calendarData,
    isLoading: isCalendarLoading,
    refetch: refetchCalendar,
  } = useCalendarData();
  const timeInfo = useCurrentTime();
  const indoor = useIndoorEnvironment();
  const { isNightMode, toggleNightMode } = useNightMode();

  const [activeTab, setActiveTab] = useState<DashboardTab>('weather');
  const [isRadarOpen, setIsRadarOpen] = useState(false);

  // 時計ペインの縦スライド操作用Ref
  const clockNavRef = useRef<ClockNavHandler | null>(null);

  // URLパラメータ ?rain=1 で初期値を設定
  const [forceRain, setForceRain] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('rain') === '1';
  });

  // キーボード 'r' キーで雨エフェクトを動的トグル可能
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        setForceRain((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Swipe / Drag gesture handling (Touch + Mouse drag)
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Helper to check if event originates from within a modal or interactive element
  const shouldIgnoreSwipe = (target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return Boolean(
      target.closest(
        '[data-slot="dialog-content"], [data-slot="dialog-overlay"], [role="dialog"], button, input, [role="button"], a',
      ),
    );
  };

  const triggerSwipe = (deltaX: number, deltaY: number) => {
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // 1. 横スワイプ判定: 画面切り替え (天気 ⇄ カレンダー ⇄ 大時計)
    if (absX > 40 && absX > absY) {
      if (deltaX < 0) {
        // 次の画面へスライド
        if (activeTab === 'weather') setActiveTab('calendar');
        else if (activeTab === 'calendar') setActiveTab('clock');
      } else {
        // 前の画面へスライド
        if (activeTab === 'clock') setActiveTab('calendar');
        else if (activeTab === 'calendar') setActiveTab('weather');
      }
      return;
    }

    // 2. 縦スワイプ判定: 時計画面にいる場合、時計デザインを上下に切り替え
    if (absY > 40 && absY > absX) {
      if (activeTab === 'clock' && clockNavRef.current) {
        if (deltaY < 0) {
          clockNavRef.current.next();
        } else {
          clockNavRef.current.prev();
        }
      }
    }
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    if (shouldIgnoreSwipe(e.target)) return;
    dragStartX.current = e.touches[0].clientX;
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (dragStartX.current === null || dragStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - dragStartX.current;
    const deltaY = e.changedTouches[0].clientY - dragStartY.current;

    triggerSwipe(deltaX, deltaY);
    dragStartX.current = null;
    dragStartY.current = null;
  };

  // Mouse drag events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (shouldIgnoreSwipe(e.target)) return;

    dragStartX.current = e.clientX;
    dragStartY.current = e.clientY;
    isDragging.current = true;
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging.current || dragStartX.current === null || dragStartY.current === null)
      return;
    const deltaX = e.clientX - dragStartX.current;
    const deltaY = e.clientY - dragStartY.current;

    triggerSwipe(deltaX, deltaY);
    dragStartX.current = null;
    dragStartY.current = null;
    isDragging.current = false;
  };

  const handleRefresh = () => {
    refetchWeather();
    refetchCalendar();
  };

  const handleRegisterClockNav = useCallback((nav: ClockNavHandler | null) => {
    clockNavRef.current = nav;
  }, []);

  const nextEvent =
    calendarData?.events && calendarData.events.length > 0
      ? calendarData.events[0]
      : null;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full select-none"
    >
      {/* 雨の日アンビエントエフェクト（背景・カード手前で雨粒が落ちる） */}
      <RainAmbient
        weatherCode={weather?.current.weatherCode}
        precipitation={weather?.current.precipitation}
        forceRain={forceRain}
      />

      <DashboardLayout
        statusBar={
          <StatusBar
            lastUpdated={weather?.updatedAt}
            isNightMode={isNightMode}
            onToggleNightMode={toggleNightMode}
            onRefresh={handleRefresh}
            isFetching={isWeatherFetching || isCalendarLoading}
            nextEvent={nextEvent}
            weather={weather}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenRadar={() => setIsRadarOpen(true)}
            forceRain={forceRain}
            onToggleRain={() => setForceRain((prev) => !prev)}
          />
        }
      >
        <div className="relative w-[800px] h-[438px] overflow-hidden">
          <div
            className="flex w-[2400px] h-[438px] transition-transform duration-300 ease-in-out"
            style={{
              transform:
                activeTab === 'weather'
                  ? 'translateX(0px)'
                  : activeTab === 'calendar'
                    ? 'translateX(-800px)'
                    : 'translateX(-1600px)',
            }}
          >
            {/* 画面1: 天気ダッシュボード */}
            <div className="w-[800px] h-[438px] flex gap-2 px-2.5 pt-2 pb-1.5 shrink-0">
              <LeftPane
                timeInfo={timeInfo}
                weather={weather}
                indoor={indoor}
                isLoading={isWeatherLoading}
              />
              <CenterPane weather={weather} />
              <RightPane
                dailyList={weather?.daily}
                hourlyList={weather?.hourly}
                isLoading={isWeatherLoading}
              />
            </div>

            {/* 画面2: カレンダーダッシュボード */}
            <div className="w-[800px] h-[438px] shrink-0">
              <CalendarPane
                events={calendarData?.events || []}
                timeInfo={timeInfo}
                isLoading={isCalendarLoading}
              />
            </div>

            {/* 画面3: 大時計ダッシュボード (1画面全体を使った大時計・縦スライドで7種切替) */}
            <div className="w-[800px] h-[438px] shrink-0">
              <ClockPane
                timeInfo={timeInfo}
                isActive={activeTab === 'clock'}
                onRegisterNav={handleRegisterClockNav}
              />
            </div>
          </div>
        </div>
      </DashboardLayout>

      {/* 雨雲レーダーモーダル */}
      <RadarModal isOpen={isRadarOpen} onClose={() => setIsRadarOpen(false)} />
    </div>
  );
};

export default App;
