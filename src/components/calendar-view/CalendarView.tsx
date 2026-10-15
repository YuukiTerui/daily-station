import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
} from 'lucide-react';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';
import type { WeatherData } from '@/types/weather';
import { getJapaneseHoliday } from '@/lib/holidayUtils';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { WeatherIcon } from '@/components/common/WeatherIcon';

interface CalendarViewProps {
  timeInfo: CurrentTimeInfo;
  weather?: WeatherData;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ timeInfo, weather }) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed

  const { events, todayEvents } = useCalendarEvents();

  // 月切り替えハンドラ
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // カレンダーマトリクスの生成 (日曜日始まり, 6週間 = 42日)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays = [];

  // 前月パディング
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = prevMonthLastDate - i;
    const dateObj = new Date(currentYear, currentMonth - 1, d);
    calendarDays.push({
      date: d,
      dateObj,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // 当月の日付
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(currentYear, currentMonth, d);
    const isToday =
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate();

    calendarDays.push({
      date: d,
      dateObj,
      isCurrentMonth: true,
      isToday,
    });
  }

  // 翌月パディング (6週 = 42枠まで埋める)
  const remainingDays = 42 - calendarDays.length;
  for (let d = 1; d <= remainingDays; d++) {
    const dateObj = new Date(currentYear, currentMonth + 1, d);
    calendarDays.push({
      date: d,
      dateObj,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

  // イベントがある日付のハッシュ
  const eventDateSet = new Set(events.map((e) => e.date));

  return (
    <div className="w-full h-full flex gap-2">
      {/* 左ペイン: 月間カレンダー (456px) */}
      <Card className="w-[456px] h-full flex flex-col p-3 bg-card/95 shadow-sm border-border/60">
        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="font-mono text-base font-extrabold text-foreground">
              {currentYear}年 {currentMonth + 1}月
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-6 px-2 text-[11px] font-semibold"
            >
              今日
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevMonth}
              className="h-6 w-6"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextMonth}
              className="h-6 w-6"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 text-center font-bold text-xs mb-1">
          {weekdays.map((w, idx) => (
            <div
              key={w}
              className={`py-0.5 ${
                idx === 0
                  ? 'text-rose-500'
                  : idx === 6
                    ? 'text-sky-500'
                    : 'text-muted-foreground'
              }`}
            >
              {w}
            </div>
          ))}
        </div>

        {/* 日付グリッド (6行 x 7列) */}
        <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-0.5">
          {calendarDays.map((item, idx) => {
            const dayOfWeek = item.dateObj.getDay();
            const holiday = getJapaneseHoliday(item.dateObj);
            const isSunday = dayOfWeek === 0;
            const isSaturday = dayOfWeek === 6;
            const isHoliday = Boolean(holiday);

            const dateStr = item.dateObj.toISOString().split('T')[0];
            const hasEvent = eventDateSet.has(dateStr);

            let textColor = 'text-foreground';
            if (!item.isCurrentMonth) {
              textColor = 'text-muted-foreground/35';
            } else if (isHoliday || isSunday) {
              textColor = 'text-rose-500';
            } else if (isSaturday) {
              textColor = 'text-sky-500';
            }

            return (
              <div
                key={idx}
                className={`relative flex flex-col items-center justify-start p-0.5 rounded-md transition-colors ${
                  item.isToday
                    ? 'bg-primary/10 border border-primary/30 font-bold'
                    : 'hover:bg-muted/40'
                }`}
              >
                <span
                  className={`text-xs font-mono leading-none ${textColor} ${
                    item.isToday
                      ? 'bg-primary text-primary-foreground w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px]'
                      : ''
                  }`}
                >
                  {item.date}
                </span>

                {/* 祝日名または予定インジケーター */}
                {item.isCurrentMonth && holiday ? (
                  <span className="text-[9px] text-rose-500 truncate max-w-full px-0.5 leading-none mt-0.5 scale-90">
                    {holiday.name}
                  </span>
                ) : item.isCurrentMonth && hasEvent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                ) : null}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 右ペイン: 今日のサマリー & 直近スケジュール (316px) */}
      <div className="w-[316px] h-full flex flex-col gap-2">
        {/* 上部: 時計＆今日の日付ミニカード */}
        <Card className="p-2.5 bg-card/95 shadow-sm border-border/60 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground">
              {timeInfo.dateString} ({timeInfo.shortDayOfWeekString})
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground">
                {timeInfo.shortTimeString}
              </span>
              <span className="font-mono text-base font-bold text-muted-foreground">
                :{timeInfo.secondsString}
              </span>
            </div>
          </div>

          {weather?.current && (
            <div className="flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-1.5">
                <WeatherIcon
                  name={weather.current.condition.iconName}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-xs font-bold text-foreground">
                  {weather.current.temperature.toFixed(1)}℃
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-medium">
                {weather.current.condition.label}
              </span>
            </div>
          )}
        </Card>

        {/* 下部: 今日の予定リストカード */}
        <Card className="flex-1 flex flex-col p-3 bg-card/95 shadow-sm border-border/60 overflow-hidden">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-border/50">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-foreground">
                本日の予定 ({todayEvents.length}件)
              </span>
            </div>
            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
              Google Calendar
            </Badge>
          </div>

          <div className="flex-1 overflow-y-auto pr-0.5 flex flex-col gap-1.5">
            {todayEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                本日の予定はありません
              </div>
            ) : (
              todayEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-2 rounded-lg bg-muted/40 border border-border/40 flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-xs font-bold text-primary whitespace-nowrap">
                      {evt.startTime} {evt.endTime ? `- ${evt.endTime}` : ''}
                    </span>
                    <Badge
                      variant="secondary"
                      className="text-[9px] px-1 py-0 h-4 font-normal"
                    >
                      {evt.category === 'work'
                        ? '仕事'
                        : evt.category === 'family'
                          ? '家庭'
                          : evt.category === 'health'
                            ? '健康'
                            : '個人'}
                    </Badge>
                  </div>
                  <span className="text-xs font-bold text-foreground truncate">
                    {evt.title}
                  </span>
                  {evt.location && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
