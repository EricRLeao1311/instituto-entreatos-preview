const reasons = ['', 'apresentar-contato', 'convidar-instituto', 'contar-historia'];
export const emailPattern = /^[^\s<>@,;\r\n]+@[^\s<>@,;\r\n]+\.[^\s<>@,;\r\n]+$/;
const consentText = 'Ao clicar em Ver pesquisa, você concorda com os Termos de Uso e Política de Privacidade do Instituto Entre Atos.';
const termsUrl = 'https://drive.google.com/file/d/1La_6CQZNUR655Kc9jBcuzO5JppZFbxK5/view?usp=sharing';
const privacyUrl = 'https://drive.google.com/file/d/1-xXcSeB6rE3GYlmdMHLwyFqB8aI3lw_9/view?usp=sharing';

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

export function prepareMail(payload, { contactRecipient = '', documentUrl }) {
  return payload.kind === 'contact' ? {
    to: contactRecipient || null, reply_to: payload.email,
    subject: `[TESTE] Contato — ${payload.name}`,
    text: `Nome: ${payload.name}\nE-mail: ${payload.email}\nTelefone: ${payload.phone}\nMotivo: ${payload.reason}\n\n${payload.message}`,
  } : {
    to: payload.email,
    subject: '[TESTE] Panorama da Pausa na Carreira — edição 2025',
    text: `Olá, ${payload.name}.\n\nAcesse a pesquisa de 2025:\n${documentUrl}\n\nInstituto Entre Atos`,
  };
}
