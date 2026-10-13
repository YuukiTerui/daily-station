import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeatherIcon } from '@/components/common/WeatherIcon';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';
import type { WeatherData } from '@/types/weather';
import type { IndoorEnvironmentData } from '@/hooks/useIndoorEnvironment';
import { MapPin, Thermometer, Droplets, Sunrise, Sunset } from 'lucide-react';

interface LeftPaneProps {
  timeInfo: CurrentTimeInfo;
  weather?: WeatherData;
  indoor: IndoorEnvironmentData;
  isLoading: boolean;
}

export const LeftPane: React.FC<LeftPaneProps> = ({
  timeInfo,
  weather,
  indoor,
  isLoading,
}) => {
  const current = weather?.current;
  const todayForecast = weather?.daily[0];

  const sunriseTime = todayForecast?.sunrise
    ? todayForecast.sunrise.split('T')[1] || '--:--'
    : '--:--';
  const sunsetTime = todayForecast?.sunset
    ? todayForecast.sunset.split('T')[1] || '--:--'
    : '--:--';

  return (
    <div className="w-[268px] h-full flex flex-col gap-2">
      {/* 1. 時計 & 日付カード */}
      <Card className="flex flex-col items-center justify-center p-2.5 bg-card/95 shadow-sm border-border/60">
        <div className="text-sm font-semibold text-muted-foreground mb-0.5 whitespace-nowrap">
          {timeInfo.dateString} {timeInfo.shortDayOfWeekString}曜日
        </div>
        <div className="flex items-baseline gap-1 whitespace-nowrap">
          <span className="font-mono text-5xl font-extrabold tracking-tight text-foreground">
            {timeInfo.shortTimeString}
          </span>
          <span className="font-mono text-2xl font-bold text-muted-foreground">
            :{timeInfo.secondsString}
          </span>
        </div>
      </Card>

      {/* 2. 今日の天気 & 屋内外温湿度 (統合カード) */}
      <Card className="flex-1 flex flex-col justify-between p-3 bg-card/95 shadow-sm border-border/60">
        {/* ヘッダー: 地点 & 天気概要 */}
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{weather?.stationName || '東京'}</span>
          </div>
          {current ? (
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <WeatherIcon
                name={current.condition.iconName}
                className="w-4 h-4 text-primary"
              />
              <span className="text-xs font-semibold text-foreground">
                {current.condition.label}
              </span>
              <span className="text-xs font-mono font-bold text-muted-foreground ml-1">
                {todayForecast
                  ? `${todayForecast.tempMax}/${todayForecast.tempMin}℃`
                  : '--/--℃'}
              </span>
            </div>
          ) : isLoading ? (
            <Badge variant="outline" className="text-[10px] animate-pulse">
              更新中...
            </Badge>
          ) : null}
        </div>

        {/* 屋外・屋内温湿度ブロック (フォントサイズとパディングを拡大して密度を最適化) */}
        <div className="flex flex-col gap-2.5 my-auto py-1">
          {/* 屋外 */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/40">
            <span className="text-xs font-bold text-muted-foreground w-10">屋外</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-foreground">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>{current ? current.temperature.toFixed(1) : '--'}℃</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-foreground">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>{current ? current.humidity : '--'}%</span>
              </div>
            </div>
          </div>

          {/* 室内 */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/50 border border-primary/20">
            <span className="text-xs font-bold text-foreground w-10">室内</span>
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-foreground">
                <Thermometer className="w-4 h-4 text-emerald-500" />
                <span>{indoor.temperature.toFixed(1)}℃</span>
              </div>
              <div className="flex items-center gap-1 text-sm font-mono font-bold text-foreground">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>{indoor.humidity}%</span>
              </div>
              <span className="text-base select-none" title={indoor.comfortLabel}>
                {indoor.comfortEmoji}
              </span>
            </div>
          </div>
        </div>

        {/* 日の出・日の入 */}
        <div className="flex items-center justify-around pt-2 border-t border-border/50 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 font-mono font-semibold">
            <Sunrise className="w-4 h-4 text-orange-400" />
            <span>{sunriseTime}</span>
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-1.5 font-mono font-semibold">
            <Sunset className="w-4 h-4 text-purple-400" />
            <span>{sunsetTime}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
