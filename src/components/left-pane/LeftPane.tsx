import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherIcon } from '@/components/common/WeatherIcon';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';
import type { WeatherData } from '@/types/weather';
import { MapPin, Umbrella, ArrowUp, ArrowDown } from 'lucide-react';

interface LeftPaneProps {
  timeInfo: CurrentTimeInfo;
  weather?: WeatherData;
  isLoading: boolean;
}

export const LeftPane: React.FC<LeftPaneProps> = ({ timeInfo, weather, isLoading }) => {
  const current = weather?.current;
  const todayForecast = weather?.daily[0];

  return (
    <div className="w-[270px] h-full flex flex-col gap-2 p-1">
      {/* デジタル時計カード */}
      <Card className="flex flex-col items-center justify-center p-3 bg-card/90 shadow-sm border-border/60">
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="font-mono text-5xl font-bold tracking-tight text-foreground">
            {timeInfo.shortTimeString}
          </span>
          <span className="font-mono text-2xl font-semibold text-muted-foreground">
            :{timeInfo.secondsString}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground whitespace-nowrap">
          <span className="font-medium text-foreground">{timeInfo.dateString}</span>
          <span>({timeInfo.shortDayOfWeekString})</span>
          <Badge variant="secondary" className="text-[10px] h-4 px-1 py-0">
            {timeInfo.japaneseEraString}
          </Badge>
        </div>
      </Card>

      {/* 現在の天気・今日概要カード */}
      <Card className="flex-1 flex flex-col justify-between p-3.5 bg-card/90 shadow-sm border-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{weather?.stationName || '東京'}</span>
          </div>
          {current ? (
            <Badge variant="outline" className="text-[11px] font-medium h-5">
              {current.condition.label}
            </Badge>
          ) : isLoading ? (
            <Badge variant="outline" className="text-[11px] animate-pulse">
              更新中...
            </Badge>
          ) : null}
        </div>

        {/* メイン天気 & 気温 */}
        <div className="flex items-center justify-between my-auto py-1">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
            {current ? (
              <WeatherIcon name={current.condition.iconName} className="w-10 h-10" />
            ) : (
              <div className="w-10 h-10 animate-pulse bg-muted rounded-full" />
            )}
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-start">
              <span className="font-mono text-4xl font-extrabold tracking-tight text-foreground">
                {current ? Math.round(current.temperature) : '--'}
              </span>
              <span className="text-xl font-bold text-muted-foreground ml-0.5 mt-0.5">
                ℃
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground whitespace-nowrap">
              体感{' '}
              {current?.apparentTemperature != null
                ? Math.round(current.apparentTemperature)
                : '--'}
              ℃
            </span>
          </div>
        </div>

        {/* 最高/最低気温 & 降水確率 */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-border/50 text-xs">
          <div className="flex items-center justify-start gap-1 whitespace-nowrap">
            <div className="flex items-center text-rose-500 font-semibold">
              <ArrowUp className="w-3.5 h-3.5" />
              <span>{todayForecast ? todayForecast.tempMax : '--'}°</span>
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center text-blue-500 font-semibold">
              <ArrowDown className="w-3.5 h-3.5" />
              <span>{todayForecast ? todayForecast.tempMin : '--'}°</span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-1 text-sky-600 dark:text-sky-400 font-medium whitespace-nowrap">
            <Umbrella className="w-3.5 h-3.5" />
            <span>{todayForecast ? todayForecast.precipitationProbability : '--'}%</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
