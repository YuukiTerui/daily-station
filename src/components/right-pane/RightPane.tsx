import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { WeatherIcon } from '@/components/common/WeatherIcon';
import { HourlyForecastModal } from '@/components/modals/HourlyForecastModal';
import type { DailyForecast, HourlyForecast } from '@/types/weather';
import { CalendarDays } from 'lucide-react';

interface RightPaneProps {
  dailyList?: DailyForecast[];
  hourlyList?: HourlyForecast[];
  isLoading: boolean;
}

export const RightPane: React.FC<RightPaneProps> = ({
  dailyList = [],
  hourlyList = [],
  isLoading,
}) => {
  const [selectedDay, setSelectedDay] = useState<DailyForecast | null>(null);

  // 今日から最大7日分の予報
  const daysToShow = dailyList.slice(0, 7);

  return (
    <div className="w-[240px] h-full flex flex-col p-1">
      <Card className="flex-1 flex flex-col p-2 bg-card/90 shadow-sm border-border/60 justify-between">
        <div className="flex items-center justify-between pb-1 px-1 border-b border-border/40">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <span>週間天気予報</span>
          </div>
          <span className="text-[10px] text-muted-foreground">タップで詳細</span>
        </div>

        {/* 予報リスト (SwitchBot風) */}
        <div className="flex-1 flex flex-col justify-between py-0.5 gap-0.5">
          {isLoading && daysToShow.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground animate-pulse">
              読み込み中...
            </div>
          ) : (
            daysToShow.map((day, idx) => {
              const isToday = idx === 0;
              const dayName = isToday ? '今日' : day.dayOfWeek;

              const dayColor = isToday
                ? 'text-primary font-extrabold'
                : day.dayOfWeek.startsWith('日')
                  ? 'text-rose-500 font-bold'
                  : day.dayOfWeek.startsWith('土')
                    ? 'text-sky-500 font-bold'
                    : 'text-foreground font-semibold';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`flex items-center justify-between p-1 px-2 rounded-xl text-left cursor-pointer transition select-none ${
                    isToday
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50 active:scale-[0.98]'
                  }`}
                >
                  {/* 天気アイコン & 降水確率 */}
                  <div className="flex items-center gap-1.5 shrink-01.5 w-14 shrink-0">
                    <WeatherIcon
                      name={day.condition.iconName}
                      className="w-5 h-5 text-primary shrink-0"
                    />
                    {day.precipitationProbability > 0 ? (
                      <span className="text-[10px] font-mono text-sky-500 font-medium whitespace-nowrap">
                        {day.precipitationProbability}%
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/50">--</span>
                    )}
                  </div>

                  {/* 曜日 */}
                  <div className="text-xs shrink-0 w-14 text-center">
                    <span className={dayColor}>{dayName}</span>
                  </div>

                  {/* 気温 (高/低) */}
                  <div className="flex items-center justify-end font-mono text-xs font-bold shrink-0 w-16 whitespace-nowrap">
                    <span className="text-foreground">{day.tempMax}</span>
                    <span className="text-muted-foreground/60 mx-0.5">/</span>
                    <span className="text-muted-foreground">{day.tempMin}℃</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </Card>

      {/* 時間別詳細モーダル */}
      <HourlyForecastModal
        selectedDay={selectedDay}
        hourlyList={hourlyList}
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
      />
    </div>
  );
};
