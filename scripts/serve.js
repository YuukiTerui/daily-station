import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseIcalData } from './calendarParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

// Optional .env / .env.local loader
function loadEnvFile(envPath) {
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnvFile(path.resolve(__dirname, '../.env'));
loadEnvFile(path.resolve(__dirname, '../.env.local'));

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
};

// In-memory cache for calendar
let cachedEvents = null;
let lastCalendarFetchTime = 0;
const CALENDAR_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

async function getCalendarEvents() {
  const icalUrl =
    process.env.GOOGLE_CALENDAR_ICAL_URL || process.env.VITE_GOOGLE_CALENDAR_ICAL_URL;

  if (!icalUrl) {
    return {
      source: 'mock',
      updatedAt: new Date().toISOString(),
      events: getMockEvents(),
    };
  }

  const now = Date.now();
  if (cachedEvents && now - lastCalendarFetchTime < CALENDAR_CACHE_TTL_MS) {
    return cachedEvents;
  }

  try {
    const res = await fetch(icalUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch iCal: ${res.status} ${res.statusText}`);
    }
    const icalText = await res.text();
    const events = parseIcalData(icalText);

    cachedEvents = {
      source: 'google-ical',
      updatedAt: new Date().toISOString(),
      events,
    };
    lastCalendarFetchTime = now;
    return cachedEvents;
  } catch (err) {
    console.error('[daily-station] Error fetching Google iCal:', err);
    if (cachedEvents) return cachedEvents;
    return {
      source: 'mock',
      updatedAt: new Date().toISOString(),
      events: getMockEvents(),
    };
  }
}

function getMockEvents() {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');

  const start1 = new Date(`${y}-${m}-${d}T19:00:00+09:00`).toISOString();
  const end1 = new Date(`${y}-${m}-${d}T20:00:00+09:00`).toISOString();

  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const ty = tomorrow.getFullYear();
  const tm = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const td = String(tomorrow.getDate()).padStart(2, '0');
  const start2 = new Date(`${ty}-${tm}-${td}T10:00:00+09:00`).toISOString();
  const end2 = new Date(`${ty}-${tm}-${td}T11:30:00+09:00`).toISOString();

  return [
    {
      id: 'mock-1',
      summary: '夕食 & 家族ミーティング',
      description: '夕食を取りながら週末の予定を相談',
      location: '自宅ダイニング',
      start: start1,
      end: end1,
      isAllDay: false,
    },
    {
      id: 'mock-2',
      summary: '週次定例ミーティング',
      description: '進捗確認とタスク整理',
      location: 'オンライン',
      start: start2,
      end: end2,
      isAllDay: false,
    },
  ];
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
    return;
  }

  // API endpoint for Google Calendar
  if (req.url === '/api/calendar') {
    try {
      const data = await getCalendarEvents();
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
      });
      res.end(JSON.stringify(data));
    } catch {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    return;
  }

  // Sanitize path to prevent directory traversal
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Normalize path
  let safePath = path.normalize(path.join(DIST_DIR, pathname));

  if (!safePath.startsWith(DIST_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // Check if target exists and is a file
  fs.stat(safePath, (err, stats) => {
    if (!err && stats.isDirectory()) {
      safePath = path.join(safePath, 'index.html');
      fs.stat(safePath, (indexErr, indexStats) => {
        if (!indexErr && indexStats.isFile()) {
          serveFile(safePath, res);
        } else {
          fallbackToIndex(res);
        }
      });
    } else if (!err && stats.isFile()) {
      serveFile(safePath, res);
    } else {
      fallbackToIndex(res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  const isHtml = ext === '.html';
  const headers = {
    'Content-Type': contentType,
    'Cache-Control': isHtml
      ? 'no-cache, must-revalidate'
      : 'public, max-age=31536000, immutable',
  };

  const stream = fs.createReadStream(filePath);
  stream.on('error', () => {
    res.writeHead(500);
    res.end('Internal Server Error');
  });

  res.writeHead(200, headers);
  stream.pipe(res);
}

function fallbackToIndex(res) {
  const indexPath = path.join(DIST_DIR, 'index.html');
  fs.readFile(indexPath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found - dist/index.html is missing. Please run build first.');
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, must-revalidate',
    });
    res.end(data);
  });
}

server.listen(PORT, HOST, () => {
  console.log(`[daily-station] Static server running at http://${HOST}:${PORT}`);
  console.log(`[daily-station] Serving directory: ${DIST_DIR}`);
});
