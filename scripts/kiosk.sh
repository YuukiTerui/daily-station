#!/usr/bin/env bash
# ==============================================================================
# daily-station: Raspberry Pi Chromium Kiosk Launch Script (Ubuntu / X11 / Wayland)
# ==============================================================================

set -e

# Target URL (Default: local static server at port 3000)
URL="${URL:-http://localhost:3000}"

echo "[daily-station-kiosk] Initializing kiosk display environment..."

# 1. Disable screen saver and DPMS (Power saving blank screen) if running under X11
if command -v xset >/dev/null 2>&1; then
  xset s noblank || true
  xset s off || true
  xset -dpms || true
  echo "[daily-station-kiosk] DPMS and screen saver disabled."
fi

# 2. Hide mouse cursor on inactivity (if unclutter is installed)
if command -v unclutter >/dev/null 2>&1; then
  unclutter -idle 0.5 -root &
  echo "[daily-station-kiosk] unclutter started."
fi

# 3. Wait for the local server to be ready
echo "[daily-station-kiosk] Waiting for ${URL} to become accessible..."
MAX_RETRIES=30
RETRY_COUNT=0
until curl -s -f -o /dev/null "${URL}/healthz" || curl -s -f -o /dev/null "${URL}"; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "${RETRY_COUNT}" -ge "${MAX_RETRIES}" ]; then
    echo "[daily-station-kiosk] Warning: Server not responding after ${MAX_RETRIES} attempts, launching anyway."
    break
  fi
  sleep 1
done

echo "[daily-station-kiosk] Server is ready."

# 4. Resolve Chromium executable (Ubuntu may have 'chromium' or 'chromium-browser')
CHROMIUM_BIN=""
for cmd in chromium chromium-browser google-chrome; do
  if command -v "${cmd}" >/dev/null 2>&1; then
    CHROMIUM_BIN="$(command -v "${cmd}")"
    break
  fi
done

if [ -z "${CHROMIUM_BIN}" ]; then
  echo "[daily-station-kiosk] ERROR: Chromium browser not found! Please run: sudo apt install -y chromium-browser (or snap install chromium)" >&2
  exit 1
fi

echo "[daily-station-kiosk] Launching ${CHROMIUM_BIN} in kiosk mode..."

# Dedicated isolated profile directory to prevent crash bubble recovery prompts
KIOSK_PROFILE_DIR="/tmp/daily-station-chromium-profile"
mkdir -p "${KIOSK_PROFILE_DIR}"

# Reset Preferences crash flag if exists
PREFS_FILE="${KIOSK_PROFILE_DIR}/Default/Preferences"
if [ -f "${PREFS_FILE}" ]; then
  sed -i 's/"exit_type":"Crashed"/"exit_type":"Normal"/' "${PREFS_FILE}" || true
fi

# 5. Continuous Kiosk Loop (auto-restarts Chromium if terminated or crashed)
while true; do
  "${CHROMIUM_BIN}" \
    --user-data-dir="${KIOSK_PROFILE_DIR}" \
    --kiosk \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-features=Translate \
    --check-for-update-interval=31536000 \
    --simulate-outdated-no-au='Tue, 31 Dec 2099 23:59:59 GMT' \
    --touch-events=enabled \
    --overscroll-history-navigation=0 \
    --disable-pinch \
    --no-first-run \
    --fast \
    --fast-start \
    --window-size=800,480 \
    --window-position=0,0 \
    "${URL}"

  echo "[daily-station-kiosk] Chromium exited. Restarting in 2 seconds..."
  sleep 2
done
