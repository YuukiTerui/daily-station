import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { WeatherIcon } from '@/components/common/WeatherIcon';
import { HourlyForecastModal } from '@/components/modals/HourlyForecastModal';
import type { DailyForecast, HourlyForecast } from '@/types/weather';
import { CalendarDays, Umbrella } from 'lucide-react';

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

  // 今日を除いた明日以降の予報（最大6日分）
  const upcomingDays = dailyList.slice(1, 7);

  return (
    <div className="w-[240px] h-full flex flex-col p-1">
      <Card className="flex-1 flex flex-col p-2.5 bg-card/90 shadow-sm border-border/60 justify-between">
        <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <CalendarDays className="w-3.5 h-3.5 text-primary" />
            <span>週間天気予報</span>
          </div>
          <span className="text-[10px] text-muted-foreground">タップで詳細</span>
        </div>

        {/* 予報リスト */}
        <div className="flex-1 flex flex-col justify-between py-1 gap-1">
          {isLoading && upcomingDays.length === 0 ? (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground animate-pulse">
              読み込み中...
            </div>
          ) : (
            upcomingDays.map((day, idx) => {
              const dayColor =
                day.dayOfWeek === '日'
                  ? 'text-rose-500'
                  : day.dayOfWeek === '土'
                    ? 'text-sky-500'
                    : 'text-foreground';

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className="flex items-center justify-between p-1.5 px-2 rounded-xl bg-muted/30 hover:bg-muted/60 active:scale-[0.98] transition text-left cursor-pointer"
                >
                  {/* 日付 & 曜日 */}
                  <div className="flex items-center gap-1.5 w-14">
                    <span className="text-xs font-mono font-medium text-muted-foreground">
                      {day.date.slice(5).replace('-', '/')}
                    </span>
                    <span className={`text-xs font-bold ${dayColor}`}>
                      {day.dayOfWeek}
                    </span>
                  </div>

                  {/* 天気アイコン & 降水確率 */}
                  <div className="flex items-center gap-2">
                    <WeatherIcon
                      name={day.condition.iconName}
                      className="w-5 h-5 text-primary"
                    />
                    <div className="flex items-center gap-0.5 text-[10px] text-sky-500 w-8 justify-end font-medium">
                      <Umbrella className="w-2.5 h-2.5" />
                      <span>{day.precipitationProbability}%</span>
                    </div>
                  </div>

                  {/* 気温 (高 / 低) */}
                  <div className="flex items-center gap-1 text-xs font-mono w-16 justify-end">
                    <span className="font-bold text-rose-500">{day.tempMax}°</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="font-bold text-blue-500">{day.tempMin}°</span>
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
