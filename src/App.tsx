import React, { useState, useMemo } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SwipeableContainer } from '@/components/layout/SwipeableContainer';
import { LeftPane } from '@/components/left-pane/LeftPane';
import { CenterPane } from '@/components/center-pane/CenterPane';
import { RightPane } from '@/components/right-pane/RightPane';
import { CalendarView } from '@/components/calendar-view/CalendarView';
import { StatusBar } from '@/components/status-bar/StatusBar';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useIndoorEnvironment } from '@/hooks/useIndoorEnvironment';
import { useNightMode } from '@/hooks/useNightMode';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { getDailyTip } from '@/lib/dailyTip';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const DashboardContent: React.FC = () => {
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const timeInfo = useCurrentTime();
  const { data: weather, isLoading, isFetching, refetch } = useWeatherData();
  const indoor = useIndoorEnvironment();
  const { isNightMode, toggleNightMode } = useNightMode();
  const { nextEvent } = useCalendarEvents();

  // 今日の一言を算出（1分ごとの shortTimeString 更新に合わせて再計算）
  const dailyTip = useMemo(() => {
    return getDailyTip(weather, indoor, new Date());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weather, indoor, timeInfo.shortTimeString]);

  return (
    <DashboardLayout
      statusBar={
        <StatusBar
          lastUpdated={weather?.updatedAt}
          isNightMode={isNightMode}
          onToggleNightMode={toggleNightMode}
          onRefresh={() => refetch()}
          isFetching={isFetching}
          activePageIndex={activePageIndex}
          onPageChange={setActivePageIndex}
          dailyTip={dailyTip}
          nextEvent={nextEvent}
        />
      }
    >
      <SwipeableContainer
        activeIndex={activePageIndex}
        onIndexChange={setActivePageIndex}
      >
        {/* Page 0: ウェザーステーション & スマートクロック */}
        <div className="w-full h-full flex gap-2">
          <LeftPane
            timeInfo={timeInfo}
            weather={weather}
            indoor={indoor}
            isLoading={isLoading}
          />
          <CenterPane weather={weather} />
          <RightPane
            dailyList={weather?.daily}
            hourlyList={weather?.hourly}
            isLoading={isLoading}
          />
        </div>

        {/* Page 1: カレンダー & スケジュール */}
        <CalendarView timeInfo={timeInfo} weather={weather} />
      </SwipeableContainer>
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
