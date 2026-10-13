import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Moon, Sun, RefreshCw } from 'lucide-react';

interface StatusBarProps {
  lastUpdated?: Date | string;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onRefresh: () => void;
  isFetching: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  lastUpdated,
  isNightMode,
  onToggleNightMode,
  onRefresh,
  isFetching,
}) => {
  const dateObj = lastUpdated ? new Date(lastUpdated) : null;
  const updatedTimeString =
    dateObj && !Number.isNaN(dateObj.getTime())
      ? `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`
      : '--:--';

  return (
    <footer className="w-full h-[42px] px-3 bg-card/95 border-t border-border flex items-center justify-between text-xs select-none">
      {/* カレンダー直近予定 */}
      <div className="flex items-center gap-2 max-w-[420px] truncate">
        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground text-[11px] truncate">
          次の予定:
        </span>
        <span className="text-muted-foreground text-[11px] truncate">
          19:00 - 夕食 & 家族ミーティング
        </span>
      </div>

      {/* ステータスインジケーター & ナイトモード */}
      <div className="flex items-center gap-3">
        {/* データ更新状況 */}
        <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] whitespace-nowrap">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="font-mono">{updatedTimeString} 更新</span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={isFetching}
            className="p-1 hover:text-foreground transition disabled:opacity-50 cursor-pointer"
            title="手動更新"
          >
            <RefreshCw
              className={`w-3 h-3 ${isFetching ? 'animate-spin text-primary' : ''}`}
            />
          </button>
        </div>

        {/* ナイトモードトグル */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleNightMode}
          className="h-7 px-2 flex items-center gap-1 text-[11px] hover:bg-muted"
        >
          {isNightMode ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>デイ</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>ナイト</span>
            </>
          )}
        </Button>
      </div>
    </footer>
  );
};
