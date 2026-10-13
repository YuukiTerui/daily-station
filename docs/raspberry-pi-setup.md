# Raspberry Pi (Ubuntu) キオスクセットアップガイド

本ドキュメントでは、Raspberry Pi 4 上の **Ubuntu (Desktop / 64-bit)** 環境において、`daily-station` を常設キオスク端末として自動起動・運用するためのセットアップ手順を解説します。

---

## 1. 事前準備 (Raspberry Pi 側)

### 1.1 必要なパッケージのインストール

Chromium ブラウザ、カーソル自動非表示ツール (`unclutter`)、および X11 制御コマンド (`x11-xserver-utils`) をインストールします。

```bash
sudo apt update
sudo apt install -y curl chromium-browser unclutter x11-xserver-utils
```

> **Note**: Ubuntu 環境によっては Chromium が Snap 版 (`snap install chromium`) の場合があります。いずれの場合も `scripts/kiosk.sh` が自動検出します。

### 1.2 Node.js (v20+) / pnpm のインストール

```bash
# Node.js LTS (v20 or v22)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# pnpm のインストール
sudo corepack enable
corepack prepare pnpm@latest --activate
```

---

## 2. アプリケーションのデプロイ

### 2.1 リポジトリのクローン & ビルド

ホームディレクトリ（`/home/<USER>/daily-station`）にクローンして依存関係をインストール・ビルドします。

```bash
cd ~
git clone https://github.com/<YOUR_USER>/daily-station.git
cd daily-station

# 依存関係インストール
pnpm install

# 環境変数の設定 (観測地点の座標など)
cp .env.example .env.local
nano .env.local

# 本番ビルドの実行
pnpm build
```

---

## 3. 自動起動の設定

### 3.1 OS 自動ログインの有効化 (Ubuntu Desktop)

ディスプレイ接続時にパスワード入力なしでデスクトップが立ち上がるよう設定します。

1. Ubuntu の「設定 (Settings)」を開きます。
2. 「ユーザー (Users)」を選択します。
3. ロックを解除し、「自動ログイン (Automatic Login)」を **ON** にします。

---

### 3.2 Web サーバーの常時起動 (systemd)

ローカル静的配信サーバーを systemd サービスとして常時稼働させます。

```bash
# ユーザー名を置換して systemd ディレクトリにコピー
# (例: ユーザー名が ubuntu の場合)
sudo cp systemd/daily-station-web.service /etc/systemd/system/daily-station-web@.service

# サービスのリロードと有効化 (現在のユーザー名で登録)
sudo systemctl daemon-reload
sudo systemctl enable --now daily-station-web@$USER.service

# 稼働ステータスの確認
systemctl status daily-station-web@$USER.service
```

正常に起動していれば、`curl http://localhost:3000/healthz` で `OK` が返ります。

---

### 3.3 キオスク画面の自動起動 (Autostart)

デスクトップログイン時に全画面 Chromium が立ち上がるよう、XDG Autostart に登録します。

```bash
mkdir -p ~/.config/autostart
cp systemd/daily-station-kiosk.desktop ~/.config/autostart/
chmod +x scripts/kiosk.sh
```

---

## 4. 画面・タッチスクリーンの最適化

### 4.1 画面の向き・解像度調整 (800×480)

ディスプレイが縦向きに認識されたり解像度が合わない場合は、以下を確認してください。

- **Wayland / GNOME Desktop の場合**:
  「設定」→「ディスプレイ」から解像度を `800x480`、向きを「横 (Landscape)」に設定。
- **`/boot/firmware/cmdline.txt` または `/boot/firmware/config.txt`**:
  液晶モジュール付属のマニュアルに従い、指定の解像度 (`video=HDMI-A-1:800x480M@60`) やタッチドライバ設定を適用します。

### 4.2 ディスプレイのスリープ・スクリーンセーバー無効化

`scripts/kiosk.sh` 内で自動的に `xset -dpms` / `xset s off` を実行しますが、GNOME の省電力設定も「画面オフ: しない」に設定しておくことを推奨します。

---

## 5. 運用コマンド

| 操作                     | コマンド                                                 |
| :----------------------- | :------------------------------------------------------- |
| **Web サーバー手動起動** | `pnpm serve`                                             |
| **キオスク手動起動**     | `pnpm kiosk`                                             |
| **Web サービス再起動**   | `sudo systemctl restart daily-station-web@$USER.service` |
| **Web サービスログ確認** | `journalctl -u daily-station-web@$USER.service -f`       |
| **キオスク停止**         | キーボードで `Alt + F4` または `Ctrl + W`                |
