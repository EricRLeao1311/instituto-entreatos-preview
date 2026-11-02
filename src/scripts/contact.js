import contact from './contact-data.js';

export function setupContactReason() {
  const field = document.querySelector('#contact-reason');
  if (!field) return;
  const reason = new URLSearchParams(location.search).get('motivo');
  if (contact.reasons.some(item => item.value === reason)) field.value = reason;
  const message = document.querySelector('#Message');
  const guidance = document.querySelector('[data-contact-guidance]');
  const sync = () => {
    const selected = contact.reasons.find(item => item.value === field.value);
    message.placeholder = selected?.placeholder || contact.genericPlaceholder;
    if (guidance) { guidance.textContent = selected?.guidance || ''; guidance.hidden = !selected?.guidance; }
  };
  field.addEventListener('change', sync);
  field.form.addEventListener('reset', () => queueMicrotask(sync));
  sync();
}
