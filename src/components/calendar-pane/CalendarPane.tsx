import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CalendarEvent } from '@/types/calendar';
import type { CurrentTimeInfo } from '@/hooks/useCurrentTime';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface CalendarPaneProps {
  events: CalendarEvent[];
  timeInfo: CurrentTimeInfo;
  isLoading: boolean;
}

export const CalendarPane: React.FC<CalendarPaneProps> = ({
  events,
  timeInfo,
  isLoading,
}) => {
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0);

  const baseDate = new Date();
  baseDate.setMonth(baseDate.getMonth() + currentMonthOffset);

  const year = baseDate.getFullYear();
  const month = baseDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => setCurrentMonthOffset((prev) => prev - 1);
  const nextMonth = () => setCurrentMonthOffset((prev) => prev + 1);
  const resetToToday = () => setCurrentMonthOffset(0);

  // Calendar matrix calculation
  const firstDay = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    days.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({
      day: d,
      isCurrentMonth: true,
      dateStr: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  // Next month padding to fill 35 or 42 cells
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 11 ? 1 : month + 2;
    const y = month === 11 ? year + 1 : year;
    days.push({
      day: d,
      isCurrentMonth: false,
      dateStr: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
    });
  }

  const todayStr = new Date().toISOString().slice(0, 10);

  // Group events by date string (YYYY-MM-DD)
  const eventDateSet = new Set(
    events.map((e) => {
      const d = new Date(e.start);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }),
  );

  // Filter events from today onward (up to 7 items for right pane)
  const nowTime = new Date().getTime() - 2 * 60 * 60 * 1000;
  const upcomingEvents = events
    .filter((e) => new Date(e.end).getTime() >= nowTime)
    .slice(0, 6);

  const formatEventDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const m = d.getMonth() + 1;
    const date = d.getDate();
    const daysArr = ['日', '月', '火', '水', '木', '金', '土'];
    const day = daysArr[d.getDay()];
    return `${m}/${date} (${day})`;
  };

  const formatEventTime = (e: CalendarEvent) => {
    if (e.isAllDay) return '終日';
    const s = new Date(e.start);
    const end = new Date(e.end);
    const sStr = `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')}`;
    const eStr = `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`;
    return `${sStr} - ${eStr}`;
  };

  const dayHeaders = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="w-[800px] h-[438px] p-2.5 flex gap-2 select-none">
      {/* 左ペイン: 月間カレンダー (350px) */}
      <Card className="w-[350px] h-full p-3 flex flex-col justify-between bg-card/95 border-border/60 shadow-sm">
        {/* カレンダーヘッダー */}
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            <span className="font-extrabold text-base text-foreground font-mono">
              {year}年 {month + 1}月
            </span>
          </div>
          <div className="flex items-center gap-1">
            {currentMonthOffset !== 0 && (
              <button
                type="button"
                onClick={resetToToday}
                className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground mr-1"
              >
                今月
              </button>
            )}
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 text-center text-xs font-bold pt-1.5 pb-1 text-muted-foreground">
          {dayHeaders.map((dh, idx) => (
            <span
              key={dh}
              className={idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-sky-500' : ''}
            >
              {dh}
            </span>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs flex-1 items-center">
          {days.map((item) => {
            const isToday = item.dateStr === todayStr;
            const hasEvent = eventDateSet.has(item.dateStr);

            return (
              <div
                key={item.dateStr}
                className={`relative flex flex-col items-center justify-center h-8 rounded-lg transition-colors ${
                  isToday
                    ? 'bg-primary text-primary-foreground font-black shadow-sm'
                    : item.isCurrentMonth
                      ? 'text-foreground hover:bg-muted/50'
                      : 'text-muted-foreground/40'
                }`}
              >
                <span>{item.day}</span>
                {hasEvent && (
                  <span
                    className={`absolute bottom-1 w-1 h-1 rounded-full ${
                      isToday ? 'bg-primary-foreground' : 'bg-primary'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 現在時刻ミニバー */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>{timeInfo.dateString}</span>
          <span className="font-mono font-bold text-foreground">
            {timeInfo.shortTimeString}
          </span>
        </div>
      </Card>

      {/* 右ペイン: 予定一覧タイムライン (420px) */}
      <Card className="flex-1 h-full p-3 flex flex-col bg-card/95 border-border/60 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
            <Clock className="w-4 h-4 text-primary" />
            <span>今後の予定</span>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono">
            {isLoading ? '取得中...' : `${upcomingEvents.length} 件`}
          </Badge>
        </div>

        {/* 予定リスト */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pt-2 pr-1">
          {upcomingEvents.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground text-xs gap-1">
              <CalendarIcon className="w-8 h-8 opacity-30" />
              <span>予定はありません</span>
            </div>
          ) : (
            upcomingEvents.map((e) => {
              const isToday = e.start.slice(0, 10) === todayStr;
              return (
                <div
                  key={e.id}
                  className={`p-2.5 rounded-xl border flex flex-col gap-1 transition-all ${
                    isToday
                      ? 'bg-primary/5 border-primary/30 shadow-xs'
                      : 'bg-muted/30 border-border/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground truncate max-w-[280px]">
                      {e.summary}
                    </span>
                    <Badge
                      variant={isToday ? 'default' : 'secondary'}
                      className="text-[10px] shrink-0 font-semibold"
                    >
                      {formatEventDate(e.start)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary/70 shrink-0" />
                      <span>{formatEventTime(e)}</span>
                    </div>
                    {e.location && (
                      <div className="flex items-center gap-1 truncate max-w-[160px]">
                        <MapPin className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{e.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
