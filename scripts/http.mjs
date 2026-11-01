import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.ttf': 'font/ttf',
  '.otf': 'font/otf', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain' };

function acceptedEncodings(header = '') {
  const qualities = new Map(header.toLowerCase().split(',').filter(Boolean).map(part => {
    const [name, ...params] = part.trim().split(';');
    const q = params.map(value => value.trim()).find(value => value.startsWith('q='));
    const value = q ? Number(q.slice(2)) : 1;
    return [name.trim(), Number.isFinite(value) && value >= 0 && value <= 1 ? value : 0];
  }));
  return ['br', 'gzip', 'identity'].map(name => ({ name, quality: qualities.get(name) ??
    (name === 'identity' ? (qualities.get('*') === 0 ? 0 : 1) : qualities.get('*') ?? 0) }))
    .filter(item => item.quality > 0).sort((a, b) => b.quality - a.quality);
}

export function createStaticServer(directory) {
  const dist = path.resolve(directory);
  return http.createServer(async (request, response) => {
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        response.writeHead(405, { Allow: 'GET, HEAD' }); return response.end();
      }
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let filename = path.resolve(dist, '.' + pathname);
      const relative = path.relative(dist, filename);
      if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); return response.end(); }
      try { if ((await stat(filename)).isDirectory()) filename = path.join(filename, 'index.html'); }
      catch { filename = path.join(dist, '404.html'); response.statusCode = 404; }
      let original;
      try { original = await readFile(filename); }
      catch { response.statusCode = 404; filename = path.join(dist, '404.html'); original = await readFile(filename); }
      let bytes, encoding;
      for (const accepted of acceptedEncodings(request.headers['accept-encoding'])) {
        if (accepted.name === 'identity') { bytes = original; break; }
        try {
          bytes = await readFile(filename + (accepted.name === 'br' ? '.br' : '.gz'));
          encoding = accepted.name; break;
        } catch { /* Hosting may not have an encoded variant; try the next choice. */ }
      }
      response.setHeader('Vary', 'Accept-Encoding');
      if (!bytes) { response.writeHead(406); return response.end(); }
      response.setHeader('Content-Type', types[path.extname(filename)] || 'application/octet-stream');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      // URLs are editable: always revalidate instead of keeping stale assets for a year.
      response.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      const etag = '"' + createHash('sha256').update(bytes).digest('hex') + '"';
      response.setHeader('ETag', etag);
      if (encoding) response.setHeader('Content-Encoding', encoding);
      const conditions = (request.headers['if-none-match'] || '').split(',').map(value => value.trim().replace(/^W\//, ''));
      if (response.statusCode === 200 && (conditions.includes(etag) || conditions.includes('*'))) {
        response.writeHead(304); return response.end();
      }
      response.setHeader('Content-Length', bytes.length);
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch { response.writeHead(400); response.end('Requisição inválida'); }
  });
}
