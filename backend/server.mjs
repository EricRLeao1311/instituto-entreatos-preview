import path from 'node:path';
import { createStaticServer } from '../scripts/http.mjs';
import { openStore } from './store.mjs';

import { emailPattern, fail, validateSubmission, prepareMail } from './forms.mjs';

function readJson(request) {
  return new Promise((resolve, reject) => {
    let bytes = 0, chunks = [], exceeded = false;
    request.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 16_384) {
        if (!exceeded) { exceeded = true; chunks = []; reject(fail(413)); }
      } else if (!exceeded) chunks.push(chunk);
    });
    request.on('end', () => {
      if (exceeded) return;
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(fail(400)); }
    });
    request.on('error', reject);
  });
}

/** Preview receiver: captures mail locally and NEVER connects to an email service. */
export function createPreviewServer({ directory, databasePath, site, contactRecipient = '', rateLimit = 10, windowMs = 600_000 }) {
  if (contactRecipient && (!emailPattern.test(contactRecipient) || contactRecipient.length > 254)) throw new Error('Destinatário inválido');
  const documentUrl = new URL(site.research.documentUrl);
  if (documentUrl.protocol !== 'https:') throw new Error('PDF deve usar HTTPS');
  const store = openStore(databasePath);
  const server = createStaticServer(path.resolve(directory));
  const staticHandler = server.listeners('request')[0];
  server.removeAllListeners('request');
  const requests = new Map();
  server.on('close', () => store.close());
  server.requestTimeout = 10_000;
  server.headersTimeout = 10_000;
  server.on('request', async (request, response) => {
    const json = (status, data) => {
      response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      response.end(JSON.stringify(data));
    };
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    try {
      const port = server.address().port;
      const hosts = [`127.0.0.1:${port}`, `localhost:${port}`];
      if (!hosts.includes(request.headers.host)) throw fail(403);
      const url = new URL(request.url, `http://127.0.0.1:${port}`);
      const origins = hosts.map(host => `http://${host}`);
      if (request.headers.origin && !origins.includes(request.headers.origin)) throw fail(403);
      if (url.pathname === '/scripts/config.js' && ['GET', 'HEAD'].includes(request.method)) {
        const config = { email: site.email, research: site.research, forms: { contactEndpoint: '/api/contact', researchEndpoint: '/api/research' } };
        response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
        return response.end(request.method === 'HEAD' ? undefined : `export default ${JSON.stringify(config)};\n`);
      }
      if (!url.pathname.startsWith('/api/')) return staticHandler(request, response);
      const kind = { '/api/contact': 'contact', '/api/research': 'research' }[url.pathname];
      if (!kind) return json(404, { error: 'Rota inexistente' });
      if (request.headers.origin) response.setHeader('Access-Control-Allow-Origin', request.headers.origin);
      response.setHeader('Vary', 'Origin');
      if (request.method === 'OPTIONS') {
        response.writeHead(204, { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Accept' });
        return response.end();
      }
      if (request.method !== 'POST') { response.setHeader('Allow', 'POST, OPTIONS'); throw fail(405); }
      if (request.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') throw fail(415);
      const key = request.socket.remoteAddress;
      const now = Date.now();
      const current = requests.get(key);
      const bucket = current && current.until > now ? current : { count: 0, until: now + windowMs };
      requests.set(key, bucket);
      if (++bucket.count > rateLimit) {
        response.setHeader('Retry-After', Math.max(1, Math.ceil((bucket.until - now) / 1000))); throw fail(429);
      }
      const payload = validateSubmission(await readJson(request), kind);
      const mail = prepareMail(payload, { contactRecipient, documentUrl: documentUrl.href });
      const result = store.save(payload, mail);
      json(202, { ...result, mode: 'preview', email: 'captured' });
    } catch (error) {
      json(error.status || 503, { error: error.status ? 'Dados ou requisição inválidos. Confira e tente novamente.' : 'Não foi possível salvar. Tente novamente.' });
    }
  });
  return server;
}
