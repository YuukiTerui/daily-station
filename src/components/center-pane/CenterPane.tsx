import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WeatherData } from '@/types/weather';
import type { IndoorEnvironmentData } from '@/hooks/useIndoorEnvironment';
import { Home, Sun, Droplets, Wind, Sunrise, Sunset } from 'lucide-react';

interface CenterPaneProps {
  weather?: WeatherData;
  indoor: IndoorEnvironmentData;
}

export const CenterPane: React.FC<CenterPaneProps> = ({ weather, indoor }) => {
  const current = weather?.current;
  const todayForecast = weather?.daily[0];

  // 日出・日没時刻のフォーマット (ISO "2026-10-13T05:45" -> "05:45")
  const sunriseTime = todayForecast?.sunrise
    ? todayForecast.sunrise.split('T')[1] || '--:--'
    : '--:--';
  const sunsetTime = todayForecast?.sunset
    ? todayForecast.sunset.split('T')[1] || '--:--'
    : '--:--';

  return (
    <div className="w-[290px] h-full flex flex-col gap-2 p-1">
      {/* 室内環境タイル (SwitchBot風) */}
      <Card className="p-3 bg-card/90 shadow-sm border-border/60">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Home className="w-3.5 h-3.5 text-primary" />
            <span>室内環境</span>
          </div>
          <Badge
            variant="outline"
            className={`text-[10px] font-semibold h-4 px-1.5 py-0 border ${indoor.comfortColor}`}
          >
            {indoor.comfortLabel}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* 室内温度 */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">温度</span>
            <div className="flex items-baseline mt-0.5">
              <span className="font-mono text-2xl font-bold text-foreground">
                {indoor.temperature.toFixed(1)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-0.5">
                ℃
              </span>
            </div>
          </div>
          {/* 室内湿度 */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">湿度</span>
            <div className="flex items-baseline mt-0.5">
              <span className="font-mono text-2xl font-bold text-foreground">
                {indoor.humidity}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-0.5">
                %
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 屋外環境タイル */}
      <Card className="p-3 bg-card/90 shadow-sm border-border/60">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>屋外環境</span>
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {current ? `気圧 ${current.pressure} hPa` : ''}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-1">
          {/* 屋外温度 */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">
              屋外気温
            </span>
            <div className="flex items-baseline mt-0.5">
              <span className="font-mono text-2xl font-bold text-foreground">
                {current ? current.temperature.toFixed(1) : '--'}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-0.5">
                ℃
              </span>
            </div>
          </div>
          {/* 屋外湿度 */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">
              屋外湿度
            </span>
            <div className="flex items-baseline mt-0.5">
              <span className="font-mono text-2xl font-bold text-foreground">
                {current ? current.humidity : '--'}
              </span>
              <span className="text-xs font-semibold text-muted-foreground ml-0.5">
                %
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* 環境サブ情報 (UV, 風速, 気圧, 日出入) */}
      <Card className="flex-1 p-2.5 bg-card/90 shadow-sm border-border/60 flex flex-col justify-between">
        <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
          {/* UV インデックス */}
          <div className="flex items-center justify-between p-1 px-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
              <Sun className="w-3 h-3 text-amber-500" />
              <span>UV指数</span>
            </div>
            <span className="font-semibold text-foreground text-xs">
              {todayForecast ? todayForecast.uvIndexMax : '--'}
            </span>
          </div>

          {/* 風速 */}
          <div className="flex items-center justify-between p-1 px-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
              <Wind className="w-3 h-3 text-teal-500" />
              <span>風速</span>
            </div>
            <span className="font-semibold text-foreground text-xs font-mono">
              {current ? `${current.windSpeed}m/s` : '--'}
            </span>
          </div>

          {/* 日の出 */}
          <div className="flex items-center justify-between p-1 px-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
              <Sunrise className="w-3 h-3 text-orange-400" />
              <span>日の出</span>
            </div>
            <span className="font-semibold text-foreground text-xs font-mono">
              {sunriseTime}
            </span>
          </div>

          {/* 日の入り */}
          <div className="flex items-center justify-between p-1 px-2 rounded-lg bg-muted/30">
            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
              <Sunset className="w-3 h-3 text-purple-400" />
              <span>日の入</span>
            </div>
            <span className="font-semibold text-foreground text-xs font-mono">
              {sunsetTime}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
