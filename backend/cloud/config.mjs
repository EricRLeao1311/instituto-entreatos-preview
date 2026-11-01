import { emailPattern } from '../forms.mjs';

export function previewOrigin(value) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.origin !== value || /(^|\.)institutoentreatos\.com\.br$/i.test(url.hostname)) throw new Error('Use um endereço HTTPS exclusivo de teste, sem caminho.');
  return url.origin;
}

/** Fail closed. Configuration is server-only; never serialize this object in the build. */
export function readConfig(env) {
  if (env.APP_STAGE !== 'preview' || env.BACKEND_ENABLED !== 'true') throw new Error('Backend de teste não habilitado.');
  const origin = previewOrigin(env.APP_ORIGIN || (env.VERCEL_URL && `https://${env.VERCEL_URL}`));
  const origins = new Set([origin]);
  if (env.VERCEL_URL) origins.add(previewOrigin(`https://${env.VERCEL_URL}`));
  const databaseUrl = new URL(env.SUPABASE_URL);
  if (databaseUrl.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(databaseUrl.hostname) || databaseUrl.pathname !== '/') throw new Error('URL Supabase inválida.');
  const databaseKey = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!databaseKey || databaseKey.startsWith('sb_publishable_') || !env.FORM_HASH_SECRET || env.FORM_HASH_SECRET.length < 32) throw new Error('Faltam segredos do banco/receptor.');
  const mode = env.MAIL_MODE || 'capture';
  if (!['capture', 'send'].includes(mode)) throw new Error('Modo de e-mail inválido.');
  const allowed = (env.MAIL_ALLOWED_RECIPIENTS || '').split(',').map(x => x.trim().toLowerCase()).filter(Boolean);
  if (allowed.some(x => !emailPattern.test(x))) throw new Error('Destinatário de teste inválido.');
  if (env.CONTACT_TO && !emailPattern.test(env.CONTACT_TO)) throw new Error('Destino de contato inválido.');
  if (mode === 'send' && (!env.RESEND_API_KEY || !emailPattern.test(env.MAIL_FROM || '') || !allowed.length || !env.CONTACT_TO)) throw new Error('Envio exige provedor, remetente, destino e lista de teste.');
  return { origin, origins, databaseUrl: databaseUrl.origin, databaseKey,
    hashSecret: env.FORM_HASH_SECRET, mode, allowed: new Set(allowed), contactRecipient: env.CONTACT_TO || '',
    from: env.MAIL_FROM, resendKey: env.RESEND_API_KEY, cronSecret: env.CRON_SECRET,
    documentUrl: new URL('/assets/panorama-retorno-profissional-2025.pdf', origin).href };
}
