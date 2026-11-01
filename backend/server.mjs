import path from 'node:path';
import { createStaticServer } from '../scripts/http.mjs';
import { openStore } from './store.mjs';

const reasons = ['', 'apresentar-contato', 'convidar-instituto', 'contar-historia'];
const emailPattern = /^[^\s<>@,;\r\n]+@[^\s<>@,;\r\n]+\.[^\s<>@,;\r\n]+$/;
const consentText = 'Ao clicar em Ver pesquisa, você concorda com os Termos de Uso e Política de Privacidade do Instituto Entre Atos.';
const termsUrl = 'https://drive.google.com/file/d/1La_6CQZNUR655Kc9jBcuzO5JppZFbxK5/view?usp=sharing';
const privacyUrl = 'https://drive.google.com/file/d/1-xXcSeB6rE3GYlmdMHLwyFqB8aI3lw_9/view?usp=sharing';

function fail(status) { return Object.assign(new Error('Requisição recusada'), { status }); }
function field(value, max, required = false) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) throw fail(422);
  const text = value.trim();
  if (required && !text) throw fail(422);
  return text;
}
function validate(raw, kind) {
  if (!raw || Array.isArray(raw) || typeof raw !== 'object' || raw.kind !== kind) throw fail(422);
  const name = field(raw.Name, 120, true);
  const email = field(kind === 'contact' ? raw.Email : raw.email, 254, true).toLowerCase();
  if (!emailPattern.test(email)) throw fail(422);
  const phone = field(kind === 'contact' ? raw.Subject : raw.Phone, 40, kind === 'contact');
  if (kind === 'research') {
    if (!['on', true, 'true'].includes(raw.checkbox)) throw fail(422);
    return { kind, name, email, phone, edition: '2025', consent: { accepted: true, text: consentText, termsUrl, privacyUrl } };
  }
  const reason = field(raw.Reason, 40);
  if (!reasons.includes(reason) || typeof raw.Message !== 'string' || !raw.Message.trim() || raw.Message.length > 5000 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw.Message)) throw fail(422);
  return { kind, name, email, phone, reason, message: raw.Message.trim() };
}
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
      const payload = validate(await readJson(request), kind);
      const mail = kind === 'contact' ? {
        to: contactRecipient,
        subject: `[TESTE] Contato — ${payload.name}`,
        text: `Nome: ${payload.name}\nE-mail: ${payload.email}\nTelefone: ${payload.phone}\nMotivo: ${payload.reason}\n\n${payload.message}`,
      } : {
        to: payload.email,
        subject: '[TESTE] Panorama da Pausa na Carreira — edição 2025',
        text: `Olá, ${payload.name}.\n\nAcesse a pesquisa de 2025:\n${documentUrl.href}\n\nInstituto Entre Atos\n\nPrévia local: esta mensagem não foi enviada.`,
      };
      const result = store.save(payload, mail);
      json(202, { ...result, mode: 'preview', email: 'captured' });
    } catch (error) {
      json(error.status || 503, { error: error.status ? 'Dados ou requisição inválidos. Confira e tente novamente.' : 'Não foi possível salvar. Tente novamente.' });
    }
  });
  return server;
}
