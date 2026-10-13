import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

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

const server = http.createServer((req, res) => {
  if (req.url === '/healthz') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('OK');
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
      // SPA Fallback for client-side routing
      fallbackToIndex(res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Cache static assets aggressively, HTML with no-cache
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
