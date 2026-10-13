import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LeftPane } from '@/components/left-pane/LeftPane';
import { CenterPane } from '@/components/center-pane/CenterPane';
import { RightPane } from '@/components/right-pane/RightPane';
import { StatusBar } from '@/components/status-bar/StatusBar';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import { useWeatherData } from '@/hooks/useWeatherData';
import { useIndoorEnvironment } from '@/hooks/useIndoorEnvironment';
import { useNightMode } from '@/hooks/useNightMode';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const DashboardContent: React.FC = () => {
  const timeInfo = useCurrentTime();
  const { data: weather, isLoading, isFetching, refetch } = useWeatherData();
  const indoor = useIndoorEnvironment();
  const { isNightMode, toggleNightMode } = useNightMode();

  return (
    <DashboardLayout
      statusBar={
        <StatusBar
          lastUpdated={weather?.updatedAt}
          isNightMode={isNightMode}
          onToggleNightMode={toggleNightMode}
          onRefresh={() => refetch()}
          isFetching={isFetching}
        />
      }
    >
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
