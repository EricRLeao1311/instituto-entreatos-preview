import contact from '../src/content/contact.json' with { type: 'json' };
import { createHash, createHmac } from 'node:crypto';
const reasons = contact.reasons.map(item => item.value);
export const emailPattern = /^[^\s<>@,;\r\n]+@[^\s<>@,;\r\n]+\.[^\s<>@,;\r\n]+$/;
const consentText = 'Ao clicar em Ver pesquisa, você concorda com os Termos de Uso e Política de Privacidade do Instituto Entre Atos.';
const termsUrl = 'https://drive.google.com/file/d/1La_6CQZNUR655Kc9jBcuzO5JppZFbxK5/view?usp=sharing';
const privacyUrl = 'https://drive.google.com/file/d/1-xXcSeB6rE3GYlmdMHLwyFqB8aI3lw_9/view?usp=sharing';
const publicationsConsent = 'Quero receber as publicações do Instituto Entre Atos por e-mail. Li e aceito os Termos de uso e a Política de privacidade. Posso cancelar minha inscrição a qualquer momento.';
const researchUpdatesConsent = 'Quero também receber as publicações do Instituto por e-mail. Posso cancelar a qualquer momento.';
export function subscriptionToken(secret, email) { return createHmac('sha256', secret).update('unsubscribe:' + email).digest('hex'); }
export function tokenHash(token) { return createHash('sha256').update(token).digest('hex'); }

export function fail(status) { return Object.assign(new Error('Requisição recusada'), { status }); }
function field(value, max, required = false) {
  if (value === undefined && !required) return '';
  if (typeof value !== 'string' || value.length > max || /[\u0000-\u001f\u007f]/.test(value)) throw fail(422);
  const text = value.trim();
  if (required && !text) throw fail(422);
  return text;
}
export function validateSubmission(raw, kind) {
  if (!raw || Array.isArray(raw) || typeof raw !== 'object' || raw.kind !== kind) throw fail(422);
  const name = field(raw.Name, 120, true);
  const email = field(kind === 'contact' ? raw.Email : raw.email, 254, true).toLowerCase();
  if (!emailPattern.test(email)) throw fail(422);
  const phone = field(kind === 'contact' ? raw.Subject : raw.Phone, 40);
  if (kind === 'research' || kind === 'publications') {
    if (!['on', true, 'true'].includes(raw.checkbox)) throw fail(422);
    const updatesOptIn = kind === 'publications' || ['on', true, 'true'].includes(raw.Updates);
    return { kind, name, email, ...(kind === 'research' ? { phone, edition: '2025' } : {}), source: kind === 'research' ? 'pesquisa' : 'biblioteca',
      updatesOptIn, updatesConsent: updatesOptIn ? { accepted: true, text: kind === 'research' ? researchUpdatesConsent : publicationsConsent, termsUrl, privacyUrl } : null,
      consent: { accepted: true, text: kind === 'research' ? consentText : publicationsConsent, termsUrl, privacyUrl } };
  }
  const reason = field(raw.Reason, 40, true);
  const organization = field(raw.Organization, 180);
  if (!reasons.includes(reason) || typeof raw.Message !== 'string' || !raw.Message.trim() || raw.Message.length > 5000 ||
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(raw.Message)) throw fail(422);
  return { kind, name, email, organization, reason, message: raw.Message.trim() };
}

export function prepareMail(payload, { contactRecipient = 'contato@institutoentreatos.com.br', documentUrl, unsubscribeUrl = '' }) {
  // Link explicitly supplied for the welcome email in Biblioteca_31 out 26.docx.
  const analysisUrl = 'https://www.linkedin.com/pulse/experi%C3%AAncia-recente-e-compet%C3%AAncia-atual-s%C3%A3o-mesma-baggio-tet%C3%AA--pmwsf';
  if (payload.kind === 'publications') return {
    to: payload.email, category: 'publications', reply_to: 'contato@institutoentreatos.com.br',
    subject: 'Boas-vindas ao Instituto Entre Atos',
    text: `Olá, ${payload.name}.\n\nObrigada por se inscrever. Você receberá as análises, pesquisas e novidades do Instituto Entre Atos sobre trajetórias profissionais não lineares.\n\nPara começar, leia "A lacuna que a empresa aceita por dentro e recusa por fora".\n${analysisUrl}\n\nSe quiser contar sua história, trazer um exemplo da sua organização, fazer uma pergunta ou propor uma conversa, é só responder a este e-mail.\n\nInstituto Entre Atos\n\nCancelar inscrição: ${unsubscribeUrl}`,
  };
  const reason = contact.reasons.find(item => item.value === payload.reason)?.label;
  return payload.kind === 'contact' ? {
    to: contactRecipient || null, reply_to: payload.email,
    subject: `[Site · ${reason}] Nova mensagem`,
    text: `Nome: ${payload.name}\nE-mail: ${payload.email}\nOrganização: ${payload.organization || 'Não informada'}\nMotivo: ${reason}\n\n${payload.message}`,
  } : {
    to: payload.email,
    subject: '[TESTE] Panorama da Pausa na Carreira — edição 2025',
    text: `Olá, ${payload.name}.\n\nAcesse a pesquisa de 2025:\n${documentUrl}\n\nInstituto Entre Atos${payload.updatesOptIn ? '\n\nCancelar recebimento de publicações: ' + unsubscribeUrl : ''}`,
  };
}
