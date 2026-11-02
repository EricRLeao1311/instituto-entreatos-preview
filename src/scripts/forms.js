import config from './config.js';
import contact from './contact-data.js';

/** Endpoints receive POST JSON and must return a 2xx response. See docs/INTEGRACOES.md. */
export function setupForms() {
  document.querySelectorAll('form[data-form-kind]').forEach(form => {
    const kind = form.dataset.formKind;
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('[type="submit"]');
    const endpoint = form.dataset.endpoint || config.forms?.[`${kind}Endpoint`];
    if (kind === 'publications' && !endpoint) submit.disabled = true;
    // Keep the original caption and empty initial layout. Explain fallback only after submission.
    form.querySelectorAll('input[type="checkbox"]').forEach(input => {
      const custom = input.parentElement.querySelector('div.w-checkbox-input');
      if (!custom) return;
      const sync = () => custom.classList.toggle('w--redirected-checked', input.checked);
      input.addEventListener('change', sync);
      input.addEventListener('focus', () => custom.classList.add('w--redirected-focus'));
      input.addEventListener('blur', () => custom.classList.remove('w--redirected-focus'));
      form.addEventListener('reset', () => queueMicrotask(sync));
      sync();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      status.replaceChildren();
      const payload = Object.fromEntries(new FormData(form).entries());
      if (kind === 'unsubscribe') payload.token = new URLSearchParams(location.hash.slice(1)).get('token') || '';
      if (!endpoint) {
        if (kind === 'contact') {
          const reason = form.querySelector('[name="Reason"]')?.selectedOptions[0]?.textContent || '';
          const text = `Nome: ${payload.Name}\nE-mail: ${payload.Email}\nOrganização: ${payload.Organization || 'Não informada'}\nMotivo: ${reason}\n\n${payload.Message}`;
          const link = document.createElement('a');
          link.href = `mailto:${config.email}?subject=${encodeURIComponent('Contato pelo site — ' + payload.Name)}&body=${encodeURIComponent(text)}`;
          link.textContent = 'Abrir e-mail com esta mensagem';
          status.append('Mensagem preparada. O envio acontece no seu aplicativo de e-mail. ', link);
        } else if (kind === 'publications' || kind === 'unsubscribe') {
          status.textContent = kind === 'publications' ? 'A inscrição por e-mail ainda está em configuração nesta prévia. Seus dados não foram enviados.' : 'O descadastramento online está em configuração. Escreva para ' + config.email + '.';
        } else if (config.research.documentUrl) {
          const link = document.createElement('a'); link.href = config.research.documentUrl;
          link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Abrir pesquisa';
          status.append('Seus dados não foram enviados. ', link);
        } else {
          status.textContent = 'Para acessar a pesquisa, entre em contato com o Instituto. O acesso online está em configuração.';
          const link = document.createElement('a'); link.href = `mailto:${config.email}?subject=Solicitar%20pesquisa`;
          link.textContent = 'Solicitar por e-mail'; status.append(' ', link);
        }
        status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
        return;
      }
      submit.disabled = true; status.textContent = 'Enviando…';
      try {
        const response = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...payload, kind }), signal: AbortSignal.timeout(15000),
        });
        if (!response.ok) throw new Error('Falha no envio');
        const receipt = await response.json().catch(() => null);
        status.textContent = kind === 'unsubscribe' ? 'Sua inscrição foi cancelada.'
          : receipt?.mode !== 'preview' ? (kind === 'contact' ? contact.success : kind === 'publications' ? 'Inscrição recebida. Você receberá as próximas publicações do Instituto por e-mail.' : 'Obrigado! Seus dados foram recebidos.')
          : receipt.email === 'accepted' ? 'Dados recebidos no teste. O envio do e-mail foi solicitado.'
          : receipt.email === 'pending' ? 'Dados recebidos no teste. O e-mail aguarda uma nova tentativa de envio.'
          : receipt.email === 'captured' ? 'Recebido no ambiente de teste. Nenhum e-mail foi enviado.'
          : 'Dados recebidos no teste. Não foi possível confirmar o envio do e-mail.';
        if (kind === 'research' && config.research.documentUrl) {
          const link = document.createElement('a'); link.href = config.research.documentUrl;
          link.target = '_blank'; link.rel = 'noopener noreferrer'; link.textContent = 'Abrir pesquisa';
          status.append(' ', link);
        }
        form.reset();
      } catch {
        status.textContent = kind === 'contact' ? contact.error : kind === 'publications' ? 'Não foi possível concluir sua inscrição. Tente novamente ou escreva para ' + config.email + '.' : 'Não foi possível confirmar o envio. Tente novamente ou entre em contato por e-mail.';
      } finally { submit.disabled = false; }
      status.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    });
  });
}
