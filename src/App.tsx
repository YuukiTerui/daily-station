import React, { useState, useRef } from 'react';
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
import { StatusBar } from '@/components/status-bar/StatusBar';

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

  const [activeTab, setActiveTab] = useState<'weather' | 'calendar'>('weather');

  // Swipe / Drag gesture handling (Touch + Mouse drag)
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  // Helper to check if event originates from within a modal or interactive element
  const shouldIgnoreSwipe = (target: EventTarget | null) => {
    if (!target || !(target instanceof HTMLElement)) return false;
    // Radix UI modal dialog or overlay
    return Boolean(
      target.closest(
        '[data-slot="dialog-content"], [data-slot="dialog-overlay"], [role="dialog"], button, input, [role="button"], a',
      ),
    );
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

  const triggerSwipe = (deltaX: number, deltaY: number) => {
    // Trigger if horizontal movement is > 40px and larger than vertical movement
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Drag left -> show calendar
        setActiveTab('calendar');
      } else {
        // Drag right -> show weather
        setActiveTab('weather');
      }
    }
  };

  const handleRefresh = () => {
    refetchWeather();
    refetchCalendar();
  };

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
      className="w-full h-full select-none"
    >
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
          />
        }
      >
        <div className="relative w-[800px] h-[438px] overflow-hidden">
          <div
            className="flex w-[1600px] h-[438px] transition-transform duration-300 ease-in-out"
            style={{
              transform:
                activeTab === 'weather' ? 'translateX(0px)' : 'translateX(-800px)',
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
          </div>
        </div>
      </DashboardLayout>
    </div>
  );
};

export default App;
