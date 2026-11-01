import { createHmac, createHash, timingSafeEqual } from 'node:crypto';
import { isIP } from 'node:net';
import { fail, validateSubmission, prepareMail } from '../forms.mjs';
import { readConfig } from './config.mjs';
import { cloudStore } from './store.mjs';
import { deliver } from './delivery.mjs';

const json = (status, body, headers = {}) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow', ...headers } });
const hash = (secret, value) => createHmac('sha256', secret).update(value).digest('hex');
const digest = value => createHash('sha256').update(value).digest();
async function body(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw fail(415);
  if (Number(request.headers.get('content-length')) > 16384) throw fail(413);
  const reader = request.body?.getReader();
  if (!reader) throw fail(400);
  const chunks = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.length;
      if (length > 16384) { await reader.cancel(); throw fail(413); }
      chunks.push(value);
    }
    try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw fail(400); }
  } finally { reader.releaseLock(); }
}

/** Shared Web handler; inject only dependencies for tests/local emulation. */
export function createHandler({ env = process.env, fetcher = fetch, getClientIp } = {}) {
  return async request => {
    let config, rpc;
    try { config = readConfig(env); rpc = cloudStore(config, fetcher); } catch { return json(503, { error: 'O recebimento está em configuração.' }); }
    const url = new URL(request.url);
    if (!config.origins.has(url.origin)) return json(403, { error: 'Origem inválida.' });
    if (url.pathname === '/api/retry-mail') {
      if (request.method !== 'GET') return json(405, { error: 'Método inválido.' }, { Allow: 'GET' });
      const secret = config.cronSecret;
      if (!secret || secret.length < 32 || !timingSafeEqual(digest(request.headers.get('authorization') || ''), digest(`Bearer ${secret}`))) return json(401, { error: 'Não autorizado.' });
      try { return json(200, await deliver(rpc, config, null, fetcher)); } catch { return json(503, { error: 'Fila indisponível.' }); }
    }
    const kind = { '/api/contact': 'contact', '/api/research': 'research' }[url.pathname];
    if (!kind) return json(404, { error: 'Rota inexistente.' });
    // Browser-only writes. This is additional origin protection, not authentication.
    if (!config.origins.has(request.headers.get('origin'))) return json(403, { error: 'Origem inválida.' });
    if (request.method !== 'POST') return json(405, { error: 'Método inválido.' }, { Allow: 'POST' });
    try {
      const raw = await body(request);
      const payload = validateSubmission(raw, kind);
      // On Vercel this platform-controlled header cannot be taken from arbitrary X-Forwarded-For.
      const ip = getClientIp ? getClientIp(request) : env.VERCEL === '1' ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() : null;
      if (!ip || !isIP(ip)) throw fail(503);
      const mail = prepareMail(payload, { contactRecipient: config.contactRecipient, documentUrl: config.documentUrl });
      const canSend = config.mode === 'send' && config.allowed.has(mail.to?.toLowerCase());
      const result = await rpc('submit', { p_payload: payload, p_mail: mail,
        p_fingerprint: hash(config.hashSecret, JSON.stringify(payload)), p_client: hash(config.hashSecret, `ip:${ip}`),
        p_email: hash(config.hashSecret, `email:${payload.email}`), p_mode: canSend ? 'pending' : 'captured' });
      let email = result.email;
      if (email === 'pending' || email === 'sending') {
        try { email = (await deliver(rpc, config, result.outbox_id, fetcher)).email; }
        catch { email = 'pending'; } // The database already accepted this submission.
      }
      if (email === 'sent') email = 'accepted';
      return json(202, { id: result.id, duplicate: result.duplicate, mode: 'preview', email });
    } catch (error) {
      const status = error.status || 503;
      return json(status, { error: status === 429 ? 'Muitas tentativas. Aguarde alguns minutos.' : 'Não foi possível confirmar o recebimento. Confira os dados e tente novamente.' }, status === 429 ? { 'Retry-After': '600' } : {});
    }
  };
}
