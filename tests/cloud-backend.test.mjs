import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createHandler } from '../backend/cloud/handler.mjs';
import { cloudStore } from '../backend/cloud/store.mjs';
import { readConfig } from '../backend/cloud/config.mjs';
import { deliver } from '../backend/cloud/delivery.mjs';

const origin = 'https://entreatos-preview.example';
const baseEnv = { APP_STAGE: 'preview', APP_ORIGIN: origin, BACKEND_ENABLED: 'true', SUPABASE_URL: 'https://project.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-server-key', FORM_HASH_SECRET: 'test-secret-with-at-least-32-characters', CRON_SECRET: 'test-cron-secret-with-32-characters', MAIL_MODE: 'capture' };
const sendEnv = { ...baseEnv, MAIL_MODE: 'send', MAIL_FROM: 'sender@example.org', CONTACT_TO: 'operator@example.org',
  MAIL_ALLOWED_RECIPIENTS: 'operator@example.org,test@example.org', RESEND_API_KEY: 'test-provider-key' };
const payload = { kind: 'research', Name: 'Pessoa de teste', email: 'test@example.org', Phone: '', checkbox: 'on' };
let db, providerCalls, providerReply, rpcDown, queryCounts;
before(async () => {
  db = new PGlite();
  await db.exec('CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;');
  await db.exec(await readFile(new URL('../supabase/migrations/202611010001_forms.sql', import.meta.url), 'utf8'));
  await db.exec(await readFile(new URL('../supabase/migrations/202611020001_publications.sql', import.meta.url), 'utf8'));
});
after(async () => db?.close());
beforeEach(async () => {
  await db.exec('TRUNCATE public.ea_outbox, public.ea_submissions, public.ea_rate_limits, public.ea_audience, public.ea_audience_events;');
  providerCalls = []; queryCounts = {}; providerReply = () => Response.json({ id: 'provider-test-id' }); rpcDown = false;
});
const signatures = { submit: ['p_payload','p_mail','p_fingerprint','p_client','p_email','p_mode'], claim: ['p_id','p_limit'],
  finish: ['p_id','p_token','p_status','p_provider_id','p_error'], unsubscribe: ['p_token_hash','p_client'] };
async function fetcher(url, options) {
  if (url === 'https://api.resend.com/emails') {
    providerCalls.push({ ...JSON.parse(options.body), key: options.headers['Idempotency-Key'] });
    return providerReply();
  }
  assert.match(url, /^https:\/\/project\.supabase\.co\/rest\/v1\/rpc\/ea_/);
  assert.equal(options.headers.apikey, baseEnv.SUPABASE_SERVICE_ROLE_KEY);
  if (rpcDown) throw new Error('network unavailable');
  const name = url.split('/ea_')[1]; assert.ok(signatures[name]);
  queryCounts[name] = (queryCounts[name] || 0) + 1;
  const args = JSON.parse(options.body);
  try {
    const values = signatures[name].map(key => args[key]);
    await db.exec('SET ROLE service_role');
    const result = await db.query(`SELECT public.ea_${name}(${values.map((_, i) => '$' + (i + 1)).join(',')}) AS value`, values);
    return Response.json(result.rows[0].value);
  } catch (error) { return Response.json({ message: error.message }, { status: 400 }); }
  finally { await db.exec('RESET ROLE'); }
}
function handler(env = baseEnv) { return createHandler({ env, fetcher, getClientIp: () => '127.0.0.1' }); }
function request(data = payload, path = '/api/research', overrides = {}) {
  return new Request(origin + path, { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...overrides.headers }, body: JSON.stringify(data), ...overrides });
}
const count = async table => Number((await db.query(`SELECT count(*) AS n FROM public.${table}`)).rows[0].n);

test('chave secreta moderna usa apikey sem Bearer; chave publishable é recusada', async () => {
  const config = readConfig({ ...baseEnv, SUPABASE_SECRET_KEY: 'sb_secret_test-only' });
  const rpc = cloudStore(config, async (_url, options) => {
    assert.equal(options.headers.apikey, 'sb_secret_test-only');
    assert.equal(options.headers.Authorization, undefined);
    return Response.json([]);
  });
  assert.deepEqual(await rpc('claim', { p_id: null, p_limit: 1 }), []);
  assert.throws(() => readConfig({ ...baseEnv, SUPABASE_SECRET_KEY: 'sb_publishable_test-only' }));
});

test('API cloud executa migração real: cadastro/aceite e captura atômicos; retry não duplica', async () => {
  const first = await handler()(request()); assert.equal(first.status, 202);
  const receipt = await first.json(); assert.equal(receipt.email, 'captured'); assert.equal(receipt.duplicate, false);
  const retry = await handler()(request()); assert.equal((await retry.json()).id, receipt.id);
  assert.equal(await count('ea_submissions'), 1); assert.equal(await count('ea_outbox'), 1); assert.equal(providerCalls.length, 0);
  const stored = (await db.query('SELECT payload FROM public.ea_submissions')).rows[0].payload;
  assert.equal(stored.edition, '2025'); assert.equal(stored.consent.accepted, true);
  assert.equal((await db.query('SELECT mail FROM public.ea_outbox')).rows[0].mail.text.includes(origin + '/assets/'), true);
});

test('anon/authenticated não leem dados nem executam RPC; serviço autorizado pode gravar', async () => {
  for (const role of ['anon','authenticated']) {
    await db.exec(`SET ROLE ${role}`);
    try {
      await assert.rejects(db.query('SELECT * FROM public.ea_submissions'), /permission denied/);
      await assert.rejects(db.query('SELECT * FROM public.ea_outbox'), /permission denied/);
      await assert.rejects(db.query('SELECT * FROM public.ea_audience'), /permission denied/);
      await assert.rejects(db.query('SELECT * FROM public.ea_audience_events'), /permission denied/);
      await assert.rejects(db.query("SELECT public.ea_unsubscribe($1,$2)",['a'.repeat(64),'b'.repeat(64)]), /permission denied/);
      await assert.rejects(db.query('SELECT public.ea_claim(null,1)'), /permission denied/);
    } finally { await db.exec('RESET ROLE'); }
  }
  assert.equal((await handler()(request())).status, 202);
  await db.exec('GRANT SELECT ON public.ea_submissions TO anon; SET ROLE anon;');
  try { assert.equal((await db.query('SELECT * FROM public.ea_submissions')).rows.length, 0, 'RLS também protege se SELECT for concedido por engano'); }
  finally { await db.exec('RESET ROLE; REVOKE SELECT ON public.ea_submissions FROM anon;'); }
});

test('cota de IP continua válida quando o remetente varia o endereço de e-mail', async () => {
  for (let i = 0; i < 10; i++) assert.equal((await handler()(request({ ...payload, email: `test${i}@example.org` }))).status, 202);
  assert.equal((await handler()(request({ ...payload, email: 'test11@example.org' }))).status, 429);
  assert.equal(await count('ea_submissions'), 10);
});

test('falha de inserção da caixa de saída desfaz o cadastro inteiro', async () => {
  await assert.rejects(db.query("SELECT public.ea_submit($1,null,$2,$3,$4,'captured')", [
    { kind: 'research' }, 'a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64),
  ]));
  assert.equal(await count('ea_submissions'), 0); assert.equal(await count('ea_outbox'), 0);
});

test('limite persistente por e-mail funciona entre novas instâncias e não grava a tentativa excedente', async () => {
  for (let i = 0; i < 5; i++) assert.equal((await handler()(request({ ...payload, Name: `Pessoa ${i}` }))).status, 202);
  const response = await handler()(request({ ...payload, Name: 'Tentativa 6' }));
  assert.equal(response.status, 429); assert.equal(response.headers.get('retry-after'), '600');
  assert.equal(await count('ea_submissions'), 5);
});

test('envio autorizado usa PDF da prévia, chave estável e registra aceite do provedor', async () => {
  const response = await handler(sendEnv)(request()); assert.equal(response.status, 202);
  assert.equal((await response.json()).email, 'accepted'); assert.equal(providerCalls.length, 1);
  assert.match(providerCalls[0].key, /^ea-preview\//);
  assert.ok(providerCalls[0].text.includes(origin + '/assets/panorama-retorno-profissional-2025.pdf'));
  const row = (await db.query('SELECT status,provider_id FROM public.ea_outbox')).rows[0];
  assert.equal(row.status, 'sent'); assert.equal(row.provider_id, 'provider-test-id');
  await handler(sendEnv)(request()); assert.equal(providerCalls.length, 1);
});

test('destinatário fora da lista de teste fica capturado e não recebe e-mail', async () => {
  const response = await handler(sendEnv)(request({ ...payload, email: 'not-allowed@example.org' }));
  assert.equal((await response.json()).email, 'captured'); assert.equal(providerCalls.length, 0);
});

test('falha/timeout do provedor preserva dados; retry tem lease, chave estável e limite de segurança', async () => {
  providerReply = () => { throw new Error('timeout'); };
  const result = await handler(sendEnv)(request()); assert.equal(result.status, 202);
  assert.equal((await result.json()).email, 'pending'); assert.equal(await count('ea_submissions'), 1);
  const firstKey = providerCalls[0].key;
  await db.exec("UPDATE public.ea_outbox SET available_at=now()-interval '1 minute'");
  const rpc = cloudStore(readConfig(sendEnv), fetcher);
  const claim = await rpc('claim', { p_id: null, p_limit: 1 }); assert.equal(claim.length, 1);
  assert.equal((await rpc('claim', { p_id: null, p_limit: 1 })).length, 0, 'worker concorrente não possui lease');
  assert.equal(await rpc('finish', { p_id: claim[0].id, p_token: '00000000-0000-0000-0000-000000000000', p_status: 'sent', p_provider_id: null, p_error: null }), false);
  await db.exec("UPDATE public.ea_outbox SET lease_until=now()-interval '1 minute', available_at=now()-interval '1 minute'");
  providerReply = () => Response.json({ id: 'recovered' });
  assert.equal((await deliver(rpc, readConfig(sendEnv), null, fetcher)).email, 'accepted');
  assert.equal(providerCalls[1].key, firstKey);
});

test('entrega ambígua com mais de 23h vai para revisão em vez de duplicar um e-mail', async () => {
  providerReply = () => { throw new Error('timeout'); };
  await handler(sendEnv)(request());
  await db.exec("UPDATE public.ea_outbox SET first_attempt_at=now()-interval '24 hours', available_at=now()-interval '1 minute'");
  const rpc = cloudStore(readConfig(sendEnv), fetcher);
  await deliver(rpc, readConfig(sendEnv), null, fetcher);
  assert.equal(providerCalls.length, 1);
  assert.equal((await db.query('SELECT status FROM public.ea_outbox')).rows[0].status, 'review');
});

test('rejeita origem, corpo e campos inválidos; banco indisponível não produz sucesso', async () => {
  assert.equal((await handler()(request(payload, '/api/research', { headers: { Origin: 'https://evil.example', 'Content-Type': 'application/json' } }))).status, 403);
  assert.equal((await handler()(request({ ...payload, checkbox: false }))).status, 422);
  assert.equal((await handler()(request({ ...payload, Name: 'x'.repeat(17000) }))).status, 413);
  assert.equal((await handler()(new Request(origin + '/api/research', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: '{' }))).status, 400);
  rpcDown = true; assert.equal((await handler()(request())).status, 503);
  assert.equal(await count('ea_submissions'), 0);
});

test('reenvio exige segredo forte e modo de teste bloqueia domínio oficial/configuração incompleta', async () => {
  const cron = new Request(origin + '/api/retry-mail');
  assert.equal((await handler(sendEnv)(cron)).status, 401);
  const authenticated = new Request(origin + '/api/retry-mail', { headers: { Authorization: `Bearer ${sendEnv.CRON_SECRET}` } });
  assert.equal((await handler(sendEnv)(authenticated)).status, 200);
  for (const changes of [{ APP_STAGE: 'production' }, { BACKEND_ENABLED: 'false' }, { APP_ORIGIN: 'https://institutoentreatos.com.br' }, { APP_ORIGIN: 'https://www.institutoentreatos.com.br' }, { FORM_HASH_SECRET: 'short' }]) {
    assert.equal((await handler({ ...sendEnv, ...changes })(request())).status, 503);
  }
});

test('inscrição registra escolha separada, origem única e descadastramento sem revelar dados', async () => {
  const signup = {kind:'publications',Name:'Pessoa de teste',email:'test@example.org',checkbox:'on'};
  assert.equal((await handler()(request({...signup,checkbox:false},'/api/publications'))).status,422);
  await handler()(request()); // Pesquisa sem optar por novidades.
  let audience=(await db.query('SELECT * FROM public.ea_audience')).rows[0];
  assert.equal(audience.subscribed,false);
  await handler()(request(signup,'/api/publications'));
  audience=(await db.query('SELECT * FROM public.ea_audience')).rows[0];
  assert.equal(audience.subscribed,true); assert.deepEqual(audience.sources.sort(),['biblioteca','pesquisa']);
  assert.equal(await count('ea_audience'),1);
  const mail=(await db.query("SELECT mail FROM public.ea_outbox WHERE mail->>'category'='publications'")).rows[0].mail;
  assert.equal(mail.subject,'Boas-vindas ao Instituto Entre Atos');
  assert.equal(mail.reply_to,'contato@institutoentreatos.com.br');
  assert.ok(mail.text.includes('https://www.linkedin.com/pulse/lacuna-que-empresa-aceita-por-dentro-e-recusa-fora-baggio-tet%C3%AA--eyoef'));
  assert.doesNotMatch(mail.text,/newsletter/i);
  const token=mail.text.match(/#token=([a-f0-9]{64})/)[1];
  assert.equal((await handler()(request({token},'/api/unsubscribe'))).status,200);
  assert.equal((await db.query('SELECT subscribed FROM public.ea_audience')).rows[0].subscribed,false);
  await handler()(request({...payload,Name:'Pesquisa após cancelamento'}));
  assert.equal((await db.query('SELECT subscribed FROM public.ea_audience')).rows[0].subscribed,false,'Pesquisa sem opt-in não reinscreve');
  await handler()(request(signup,'/api/publications'));
  assert.equal((await db.query('SELECT subscribed FROM public.ea_audience')).rows[0].subscribed,true,'nova escolha explícita pode reinscrever');
});

test('seis motivos do Contato aceitam organização opcional, sem telefone obrigatório ou inscrição', async () => {
  const reasons=['convidar-instituto','apresentar-contato','estudo-parceria-apoio','imprensa','contar-historia','outro-assunto'];
  for(const [i,Reason] of reasons.entries()) {
    const response=await handler()(request({kind:'contact',Name:'Contato teste',Email:`contato${i}@example.org`,Organization:i?'Instituição':'',Reason,Message:'Mensagem de teste'},'/api/contact'));
    assert.equal(response.status,202);
  }
  assert.equal(await count('ea_audience'),0);
  const mail=(await db.query("SELECT mail FROM public.ea_outbox WHERE mail->>'subject' LIKE '%Imprensa%'")).rows[0].mail;
  assert.equal(mail.to,'contato@institutoentreatos.com.br'); assert.match(mail.subject,/Site · Imprensa/);
});

test('pesquisa da Biblioteca registra seu aceite atual sem inscrição implícita, mesmo com Updates injetado', async () => {
  const inline={kind:'research',Name:'Pesquisa inline',email:'inline@example.org',checkbox:'on',ConsentVersion:'biblioteca-2026-11-01',Updates:'on'};
  assert.equal((await handler()(request({...inline,checkbox:false}))).status,422);
  assert.equal((await handler()(request({...inline,ConsentVersion:'unknown'}))).status,422);
  assert.equal((await handler()(request(inline))).status,202);
  const stored=(await db.query('SELECT payload FROM public.ea_submissions')).rows[0].payload;
  assert.equal(stored.updatesOptIn,false);assert.equal(stored.updatesConsent,null);
  assert.equal(stored.consent.version,'biblioteca-2026-11-01');
  assert.equal(stored.consent.text,'Li e aceito os Termos de uso e a Política de privacidade.');
  assert.equal(stored.source,'pesquisa');
  assert.equal((await db.query('SELECT subscribed FROM public.ea_audience')).rows[0].subscribed,false);
  const mail=(await db.query('SELECT mail FROM public.ea_outbox')).rows[0].mail;
  assert.ok(mail.text.includes('/assets/panorama-retorno-profissional-2025.pdf'));
  assert.doesNotMatch(mail.subject,/Boas-vindas/);
});
