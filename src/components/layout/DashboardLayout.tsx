import React from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  statusBar: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  statusBar,
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-zinc-950 overflow-hidden select-none">
      {/* 800 x 480 固定キャンバス */}
      <div className="w-[800px] h-[480px] bg-background text-foreground flex flex-col overflow-hidden relative shadow-2xl">
        {/* メイン表示領域: 800px x 438px (外側パディングとカラムギャップの最適化) */}
        <main className="w-full h-[438px] flex overflow-hidden px-2.5 pt-2 pb-1.5 gap-2">
          {children}
        </main>

        {/* 下部ステータスバー: 800px x 42px */}
        {statusBar}
      </div>
    </div>
  );
};
