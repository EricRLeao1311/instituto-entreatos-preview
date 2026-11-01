import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { once } from 'node:events';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { createPreviewServer } from '../backend/server.mjs';
import { openStore } from '../backend/store.mjs';
import { root } from '../scripts/build.mjs';

const site = { email: 'public@example.org', research: { documentUrl: 'https://example.org/preview/assets/research.pdf' } };
const contact = { kind: 'contact', Name: 'Pessoa de Teste', Email: 'test@example.org', Subject: '21999990000', Message: 'Mensagem\nde teste', Reason: 'convidar-instituto' };
const research = { kind: 'research', Name: 'Pessoa de Teste', email: 'test@example.org', Phone: '', checkbox: 'on' };
async function start(databasePath, options = {}) {
  const server = createPreviewServer({ directory: path.join(root, 'dist'), databasePath, site, ...options });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base, close: () => new Promise(resolve => server.close(resolve)),
    post: (route, payload, extra = {}) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base, ...extra.headers }, body: JSON.stringify(payload) }) };
}
async function fixture(t, options) {
  const temp = await mkdtemp(path.join(os.tmpdir(), 'entreatos-backend-'));
  const db = path.join(temp, 'forms.sqlite');
  let app = await start(db, options);
  t.after(async () => { await app.close(); await rm(temp, { recursive: true, force: true }); });
  return { get app() { return app; }, db,
    async restart() { await app.close(); app = await start(db, options); return app; } };
}

test('backend salva contato, captura e-mail e conserva ambos após reiniciar; repetição não duplica', async t => {
  const f = await fixture(t);
  const first = await f.app.post('/api/contact', contact);
  assert.equal(first.status, 202);
  const receipt = await first.json();
  assert.equal(receipt.mode, 'preview'); assert.equal(receipt.email, 'captured');
  assert.equal(receipt.duplicate, false);
  const second = await f.app.post('/api/contact', contact);
  assert.equal((await second.json()).id, receipt.id);
  await f.restart();
  const db = openStore(f.db);
  try {
    const saved = db.recent();
    assert.equal(saved.submissions.length, 1); assert.equal(saved.outbox.length, 1);
    assert.equal(saved.submissions[0].payload.message, contact.Message);
    assert.equal(saved.outbox[0].recipient, null, 'destinatário privado não pode ser inventado');
    assert.equal(saved.outbox[0].status, 'captured');
  } finally { db.close(); }
});

test('pesquisa exige aceite e registra edição, referência dos termos, data e e-mail com PDF', async t => {
  const f = await fixture(t);
  assert.equal((await f.app.post('/api/research', { ...research, checkbox: false })).status, 422);
  assert.equal((await f.app.post('/api/research', research)).status, 202);
  const db = openStore(f.db);
  try {
    const saved = db.recent();
    assert.equal(saved.submissions.length, 1);
    const entry = saved.submissions[0];
    assert.equal(entry.payload.edition, '2025'); assert.equal(entry.payload.consent.accepted, true);
    assert.match(entry.payload.consent.termsUrl, /^https:/); assert.ok(Date.parse(entry.created_at));
    assert.equal(saved.outbox[0].recipient, research.email);
    assert.ok(saved.outbox[0].body.includes(site.research.documentUrl));
  } finally { db.close(); }
});

test('receptor recusa origem/host indevidos, dados inválidos, JSON malformado e corpo excessivo sem gravar', async t => {
  const f = await fixture(t, { rateLimit: 30 });
  assert.equal((await f.app.post('/api/contact', contact, { headers: { Origin: 'https://evil.example' } })).status, 403);
  const forgedHostStatus = await new Promise((resolve, reject) => {
    const request = http.request(f.app.base + '/api/contact', { method: 'POST', headers: { Host: 'evil.example', 'Content-Type': 'application/json' } }, response => {
      response.resume(); response.on('end', () => resolve(response.statusCode));
    });
    request.on('error', reject); request.end(JSON.stringify(contact));
  });
  assert.equal(forgedHostStatus, 403);
  for (const change of [{ Email: 'a@example.org\r\nBcc:b@example.org' }, { Name: ' ' }, { Subject: '' }, { Reason: 'inexistente' }, { Message: '' }, { kind: 'research' }]) {
    assert.equal((await f.app.post('/api/contact', { ...contact, ...change })).status, 422);
  }
  assert.equal((await f.app.post('/api/contact', { ...contact, Message: 'x'.repeat(17_000) })).status, 413);
  assert.equal((await fetch(f.app.base + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await fetch(f.app.base + '/api/contact', { method: 'POST', body: 'not json' })).status, 415);
  const db = openStore(f.db);
  try { assert.equal(db.recent().submissions.length, 0); } finally { db.close(); }
});

test('limite de requisições retorna 429 e preflight não consome a cota', async t => {
  const f = await fixture(t, { rateLimit: 1 });
  const preflight = await fetch(f.app.base + '/api/contact', { method: 'OPTIONS', headers: { Origin: f.app.base, 'Access-Control-Request-Method': 'POST' } });
  assert.equal(preflight.status, 204); assert.equal(preflight.headers.get('access-control-allow-origin'), f.app.base);
  assert.equal((await f.app.post('/api/contact', contact)).status, 202);
  const limited = await f.app.post('/api/contact', contact);
  assert.equal(limited.status, 429); assert.ok(Number(limited.headers.get('retry-after')) > 0);
});

test('configuração ativa endpoints somente no servidor de teste; não há API pública de cadastros', async t => {
  const f = await fixture(t);
  const config = await fetch(f.app.base + '/scripts/config.js');
  assert.equal(config.headers.get('cache-control'), 'no-store');
  assert.match(await config.text(), /"contactEndpoint":"\/api\/contact"/);
  const publishedConfig = await readFile(path.join(root, 'dist/scripts/config.js'), 'utf8');
  assert.doesNotMatch(publishedConfig, /\/api\/contact/);
  assert.equal((await fetch(f.app.base + '/api/contact')).status, 405);
  for (const route of ['/api/submissions', '/api/outbox', '/.local-data/forms.sqlite']) assert.equal((await fetch(f.app.base + route)).status, 404);
  assert.equal((await fetch(f.app.base + '/contato')).status, 200);
});

test('falha real de gravação não confirma sucesso nem perde a possibilidade de tentar novamente', async t => {
  const f = await fixture(t);
  const lock = new DatabaseSync(f.db);
  try {
    lock.exec('BEGIN IMMEDIATE');
    assert.equal((await f.app.post('/api/contact', contact)).status, 503);
    lock.exec('ROLLBACK');
    assert.equal((await f.app.post('/api/contact', contact)).status, 202);
    assert.equal(lock.prepare('SELECT count(*) AS n FROM submissions').get().n, 1);
    assert.equal(lock.prepare('SELECT count(*) AS n FROM outbox').get().n, 1);
  } finally { lock.close(); }
});
