import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
// @ts-expect-error - JS helper file without d.ts
import { parseIcalData } from './scripts/calendarParser.js';

function calendarApiPlugin(): Plugin {
  let env: Record<string, string> = {};
  let cachedEvents: unknown = null;
  let lastFetchTime = 0;

  return {
    name: 'calendar-api-plugin',
    configResolved(config) {
      env = loadEnv(config.mode, process.cwd(), '');
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/calendar') {
          const icalUrl =
            env.GOOGLE_CALENDAR_ICAL_URL || env.VITE_GOOGLE_CALENDAR_ICAL_URL;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');

          if (!icalUrl) {
            const today = new Date();
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
            const ty = tomorrow.getFullYear();
            const tm = String(tomorrow.getMonth() + 1).padStart(2, '0');
            const td = String(tomorrow.getDate()).padStart(2, '0');

            res.end(
              JSON.stringify({
                source: 'mock',
                updatedAt: new Date().toISOString(),
                events: [
                  {
                    id: 'mock-1',
                    summary: '夕食 & 家族ミーティング',
                    description: '夕食を取りながら週末の予定を相談',
                    location: '自宅ダイニング',
                    start: new Date(`${y}-${m}-${d}T19:00:00+09:00`).toISOString(),
                    end: new Date(`${y}-${m}-${d}T20:00:00+09:00`).toISOString(),
                    isAllDay: false,
                  },
                  {
                    id: 'mock-2',
                    summary: '週次定例ミーティング',
                    description: '進捗確認とタスク整理',
                    location: 'オンライン',
                    start: new Date(`${ty}-${tm}-${td}T10:00:00+09:00`).toISOString(),
                    end: new Date(`${ty}-${tm}-${td}T11:30:00+09:00`).toISOString(),
                    isAllDay: false,
                  },
                ],
              }),
            );
            return;
          }

          const now = Date.now();
          if (cachedEvents && now - lastFetchTime < 5 * 60 * 1000) {
            res.end(JSON.stringify(cachedEvents));
            return;
          }

          try {
            const fetchRes = await fetch(icalUrl);
            const text = await fetchRes.text();
            const events = parseIcalData(text);
            cachedEvents = {
              source: 'google-ical',
              updatedAt: new Date().toISOString(),
              events,
            };
            lastFetchTime = now;
            res.end(JSON.stringify(cachedEvents));
          } catch (err) {
            console.error('Error fetching iCal in dev server:', err);
            res.end(
              JSON.stringify(
                cachedEvents || {
                  source: 'mock',
                  updatedAt: new Date().toISOString(),
                  events: [],
                },
              ),
            );
          }
          return;
        }
        next();
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), calendarApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
});
