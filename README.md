# daily-station

Raspberry Pi 4 ＋ 800×480 タッチディスプレイに最適化された卓上ウェザーステーション＆スマートクロック。

## 特徴

- **800×480 固定レイアウト**: 7インチ液晶向けに極限まで調整された高密度・美麗UI。
- **高精度時計**: OSスリープや画面復帰時にもズレず瞬時に吸着する自律時計機構。
- **Open-Meteo 連携**: APIキー不要でリアルタイムの気象データ・UV指数・空気質（AQI/PM2.5/花粉）を取得。
- **キオスク運用対応**: Chromium キオスクモード起動スクリプト、常設用 systemd / autostart 設定同梱。

## 開発・ローカル実行

```bash
# 依存関係インストール
pnpm install

# 環境変数の準備 (観測地点の設定)
cp .env.example .env.local

# 開発サーバー起動
pnpm dev

# 本番ビルド
pnpm build

# 本番静的サーバー起動 (ポート 3000)
pnpm serve
```

## Raspberry Pi (Ubuntu) への導入

セットアップの全手順（自動ログイン、systemd 常時起動、Chromium 全画面キオスク設定）は、以下のガイドを参照してください：

👉 **[Raspberry Pi (Ubuntu) キオスクセットアップガイド](docs/raspberry-pi-setup.md)**

## ドキュメント

- [要件定義書](docs/requirements.md)
- [デザイン仕様書](DESIGN.md)
- [Raspberry Pi セットアップ手順](docs/raspberry-pi-setup.md)
