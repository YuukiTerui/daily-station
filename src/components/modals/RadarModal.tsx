import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { stationConfig } from '@/config/station';
import { CloudRain, RefreshCw, ZoomIn, ZoomOut, Play, Pause } from 'lucide-react';

interface RadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RainViewerData {
  host: string;
  radar: {
    past: Array<{ time: number; path: string }>;
    nowcast: Array<{ time: number; path: string }>;
  };
}

export const RadarModal: React.FC<RadarModalProps> = ({ isOpen, onClose }) => {
  const [zoom, setZoom] = useState(8);
  const [frames, setFrames] = useState<Array<{ time: number; path: string }>>([]);
  const [host, setHost] = useState('https://tilecache.rainviewer.com');
  const [frameIndex, setFrameIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { latitude, longitude, name } = stationConfig;

  // RainViewer API (CORS/iframe制限なし) から最新の雨雲タイルメタデータを取得
  const fetchRadarData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
      if (!res.ok) throw new Error('Failed to fetch radar frames');
      const data: RainViewerData = await res.json();
      setHost(data.host);
      const allFrames = [...data.radar.past, ...data.radar.nowcast];
      setFrames(allFrames);
      setFrameIndex(Math.max(0, allFrames.length - 1));
    } catch (err) {
      console.error('Error fetching radar data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const load = async () => {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (!res.ok) return;
        const data: RainViewerData = await res.json();
        if (isMounted) {
          setHost(data.host);
          const allFrames = [...data.radar.past, ...data.radar.nowcast];
          setFrames(allFrames);
          setFrameIndex(Math.max(0, allFrames.length - 1));
        }
      } catch (err) {
        console.error('Error in radar load:', err);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // アニメーション再生ループ (過去〜最新〜予測)
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % frames.length);
    }, 700);
    return () => clearInterval(timer);
  }, [isPlaying, frames.length]);

  const stopPropagation = (e: React.TouchEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const zoomIn = () => setZoom((prev) => Math.min(11, prev + 1));
  const zoomOut = () => setZoom((prev) => Math.max(5, prev - 1));

  // 緯度経度からタイル座標 (x, y) を計算
  const latRad = (latitude * Math.PI) / 180;
  const n = 2 ** zoom;
  const xTile = Math.floor(((longitude + 180) / 360) * n);
  const yTile = Math.floor(((1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2) * n);

  // 周囲 3x3 のグリッドタイルを生成して中央に観測地点を表示
  const tileOffsets = [-1, 0, 1];

  const currentFrame = frames[frameIndex];
  const frameTimeStr = currentFrame
    ? new Date(currentFrame.time * 1000).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--:--';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        onTouchStart={stopPropagation}
        onTouchEnd={stopPropagation}
        onMouseDown={stopPropagation}
        onMouseUp={stopPropagation}
        className="max-w-[760px] w-[95vw] h-[410px] p-3 bg-background border border-border flex flex-col justify-between select-none"
      >
        <DialogHeader className="pb-1.5 border-b border-border flex flex-row items-center justify-between">
          <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-sky-500" />
            <span>雨雲レーダー ({name} 周辺)</span>
            <span className="text-xs font-mono font-bold text-sky-500 ml-2">
              {frameTimeStr}
            </span>
          </DialogTitle>

          <div className="flex items-center gap-2">
            {/* 再生 / 一時停止 */}
            <button
              type="button"
              onClick={() => setIsPlaying((prev) => !prev)}
              className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            >
              {isPlaying ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>{isPlaying ? '停止' : '再生'}</span>
            </button>

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
              onClick={fetchRadarData}
              className={`p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer ${
                isLoading ? 'animate-spin text-primary' : ''
              }`}
              title="レーダー更新"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </DialogHeader>

        {/* レーダーマップ描画領域 (OpenStreetMap + RainViewerタイル合成) */}
        <div className="relative flex-1 w-full rounded-xl overflow-hidden border border-border/60 bg-slate-900 my-1 flex items-center justify-center">
          {/* 3x3 タイルコンテナ */}
          <div
            className="grid grid-cols-3 grid-rows-3 w-[768px] h-[768px] pointer-events-none shrink-0"
            style={{
              transform: 'scale(0.44)',
            }}
          >
            {tileOffsets.map((dy) =>
              tileOffsets.map((dx) => {
                const tx = xTile + dx;
                const ty = yTile + dy;
                const baseMapUrl = `https://a.basemaps.cartocdn.com/rastertiles/voyager/${zoom}/${tx}/${ty}.png`;
                const radarTileUrl = currentFrame
                  ? `${host}${currentFrame.path}/256/${zoom}/${tx}/${ty}/2/1_1.png`
                  : null;

                return (
                  <div key={`${dx}-${dy}`} className="relative w-[256px] h-[256px]">
                    <img
                      src={baseMapUrl}
                      alt="Base Map"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="eager"
                    />
                    {radarTileUrl && (
                      <img
                        src={radarTileUrl}
                        alt="Radar"
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        loading="eager"
                      />
                    )}
                  </div>
                );
              }),
            )}
          </div>

          {/* 観測地点（中心）マーカーピン */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white shadow-sm" />
            </span>
            <span className="text-[10px] font-bold bg-background/90 text-foreground px-1.5 py-0.5 rounded shadow-sm border border-border mt-0.5">
              {name}
            </span>
          </div>
        </div>

        {/* 下部案内バー */}
        <div className="pt-0.5 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>※ 画面外をタップして閉じます</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground/60">
              {currentFrame?.path?.includes('nowcast') ? '予報' : '実況'}
            </span>
            <span className="font-mono text-[10px]">OpenStreetMap & RainViewer</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
