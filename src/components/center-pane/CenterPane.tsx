import React from 'react';
import { Card } from '@/components/ui/card';
import type { WeatherData } from '@/types/weather';
import { Wind, Compass, Sun, Umbrella, Eye, Gauge, Activity } from 'lucide-react';

interface CenterPaneProps {
  weather?: WeatherData;
}

export const CenterPane: React.FC<CenterPaneProps> = ({ weather }) => {
  const current = weather?.current;
  const todayForecast = weather?.daily[0];
  const airQuality = weather?.airQuality;

  return (
    <div className="w-[288px] h-full flex flex-col gap-2">
      {/* 1. 空気質タイル (SwitchBot風 3カラム) */}
      <Card className="p-2.5 bg-card/95 shadow-sm border-border/60">
        <div className="flex items-center justify-between mb-1 px-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>空気質</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-semibold">
            {airQuality?.aqiLabel || '良好'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-1">
          {/* AQI */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">AQI</span>
            <span className="font-mono text-lg font-extrabold text-foreground mt-0.5">
              {airQuality?.aqi ?? 30}
            </span>
          </div>
          {/* PM2.5 */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">PM2.5</span>
            <div className="flex items-baseline mt-0.5">
              <span className="font-mono text-lg font-extrabold text-foreground">
                {airQuality?.pm25 ?? 12}
              </span>
              <span className="text-[9px] text-muted-foreground ml-0.5">µg/m³</span>
            </div>
          </div>
          {/* 花粉 */}
          <div className="bg-muted/40 rounded-xl p-2 flex flex-col items-center justify-center">
            <span className="text-[10px] text-muted-foreground font-medium">花粉</span>
            <span className="text-sm font-bold text-foreground mt-0.5">
              {airQuality?.pollenLabel || '少ない'}
            </span>
          </div>
        </div>
      </Card>

      {/* 2. 気象詳細リスト (行パディングとフォントスケール最適化) */}
      <Card className="flex-1 p-2.5 bg-card/95 shadow-sm border-border/60 flex flex-col justify-between">
        <div className="flex flex-col justify-between h-full py-0.5 gap-1.5">
          {/* 風速 */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Wind className="w-4 h-4 text-teal-500" />
              <span>風速</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {current ? `${current.windSpeed} m/s` : '--'}
            </span>
          </div>

          {/* 風向 */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>風向</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {current ? `${current.windDirectionText} ${current.windDirection}°` : '--'}
            </span>
          </div>

          {/* UV指数 */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>UV指数</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {todayForecast ? todayForecast.uvIndexMax : '--'}
            </span>
          </div>

          {/* 降水確率 */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Umbrella className="w-4 h-4 text-sky-500" />
              <span>降水確率</span>
            </div>
            <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">
              {todayForecast ? `${todayForecast.precipitationProbability}%` : '--%'}
            </span>
          </div>

          {/* 視程 */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Eye className="w-4 h-4 text-blue-400" />
              <span>視程</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {current?.visibilityText || '>10km'}
            </span>
          </div>

          {/* 気圧 */}
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <Gauge className="w-4 h-4 text-violet-500" />
              <span>気圧</span>
            </div>
            <span className="font-mono text-sm font-bold text-foreground">
              {current ? `${current.pressure} hPa` : '--'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
