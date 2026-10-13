import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { WeatherIcon } from '@/components/common/WeatherIcon';
import type { DailyForecast, HourlyForecast } from '@/types/weather';
import { Umbrella } from 'lucide-react';

interface HourlyForecastModalProps {
  selectedDay: DailyForecast | null;
  hourlyList: HourlyForecast[];
  isOpen: boolean;
  onClose: () => void;
}

export const HourlyForecastModal: React.FC<HourlyForecastModalProps> = ({
  selectedDay,
  hourlyList,
  isOpen,
  onClose,
}) => {
  if (!selectedDay) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[700px] w-[90vw] p-4 bg-background border border-border">
        <DialogHeader className="pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <span>
                {selectedDay.date} ({selectedDay.dayOfWeek})
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                時間帯別詳細予報
              </span>
            </DialogTitle>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-rose-500 font-semibold">
                最高 {selectedDay.tempMax}℃
              </span>
              <span className="text-blue-500 font-semibold">
                最低 {selectedDay.tempMin}℃
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* 横スクロール対応の時間別リスト */}
        <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
          {hourlyList.map((hour, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 w-16 p-2 rounded-xl bg-card border border-border/60 flex flex-col items-center justify-between gap-1.5 shadow-xs"
            >
              <span className="text-xs font-mono font-medium text-muted-foreground">
                {hour.hour}
              </span>
              <WeatherIcon
                name={hour.condition.iconName}
                className="w-6 h-6 text-primary my-0.5"
              />
              <span className="text-sm font-bold font-mono text-foreground">
                {hour.temperature}°
              </span>
              <div className="flex items-center gap-0.5 text-[10px] text-sky-500 font-medium">
                <Umbrella className="w-2.5 h-2.5" />
                <span>{hour.precipitationProbability}%</span>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
