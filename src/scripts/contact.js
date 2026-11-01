export function setupContactReason() {
  const field = document.querySelector('#contact-reason');
  const reason = new URLSearchParams(location.search).get('motivo');
  if (field && ['apresentar-contato', 'convidar-instituto', 'contar-historia'].includes(reason)) field.value = reason;
}
