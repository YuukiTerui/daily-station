import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { stationConfig } from '@/config/station';
import { CloudRain, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface RadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RadarModal: React.FC<RadarModalProps> = ({ isOpen, onClose }) => {
  const [zoom, setZoom] = useState(10);
  const [key, setKey] = useState(0); // リフレッシュ用
  const { latitude, longitude, name } = stationConfig;

  // 雨雲レーダー埋め込みURL（Yahoo!天気・雨雲レーダー または OpenStreetMap / RainViewer / JMA）
  // Yahoo天気雨雲ズームレーダーマップ埋め込み
  const radarUrl = `https://weather.yahoo.co.jp/weather/zoomradar/?lat=${latitude}&lon=${longitude}&z=${zoom}`;

  const stopPropagation = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleRefresh = () => {
    setKey((prev) => prev + 1);
  };

  const zoomIn = () => setZoom((prev) => Math.min(13, prev + 1));
  const zoomOut = () => setZoom((prev) => Math.max(7, prev - 1));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        onTouchStart={stopPropagation}
        onTouchEnd={stopPropagation}
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
        className="max-w-[760px] w-[95vw] h-[410px] p-3 bg-background border border-border flex flex-col justify-between"
      >
        <DialogHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-sky-500" />
            <span>雨雲レーダー ({name} 周辺)</span>
          </DialogTitle>

          <div className="flex items-center gap-2">
            {/* ズーム操作 */}
            <div className="flex items-center rounded-lg bg-muted/60 p-0.5">
              <button
                type="button"
                onClick={zoomOut}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="広域"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono font-bold px-1.5 text-muted-foreground">
                Z{zoom}
              </span>
              <button
                type="button"
                onClick={zoomIn}
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                title="詳細"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 更新ボタン */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="レーダー更新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </DialogHeader>

        {/* レーダーマップ描画領域 */}
        <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-border/60 bg-muted/20 my-1">
          <iframe
            key={key}
            src={radarUrl}
            title="雨雲レーダー"
            className="w-full h-full border-0 select-none"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
          />
        </div>

        {/* 下部案内バー */}
        <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>※ 画面外をタップして閉じます</span>
          <span className="font-mono text-[10px]">Yahoo! JAPAN 雨雲レーダー</span>
        </div>
      </DialogContent>
    </Dialog>
  );
};
