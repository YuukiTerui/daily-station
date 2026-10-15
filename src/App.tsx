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

  // Swipe gesture handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Trigger if horizontal movement is > 50px and larger than vertical movement
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        // Swipe left -> go to calendar
        setActiveTab('calendar');
      } else {
        // Swipe right -> go to weather
        setActiveTab('weather');
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
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
