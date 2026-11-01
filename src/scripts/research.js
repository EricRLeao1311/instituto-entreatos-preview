/** IX2 owns open/close appearance. This adds keyboard handling without restyling. */
export function setupResearch() {
  const modal = document.querySelector('[data-research-modal]');
  if (!modal) return;
  let opener;
  const visible = () => getComputedStyle(modal).display !== 'none';
  const focusable = () => [...modal.querySelectorAll('a[href],button,input,textarea,[tabindex="0"]')]
    .filter(element => !element.disabled && element.getClientRects().length);
  const close = () => { modal.style.display = 'none'; opener?.focus(); };
  document.querySelectorAll('[data-open-research]').forEach(trigger => trigger.addEventListener('click', event => {
    event.preventDefault(); opener = trigger;
    requestAnimationFrame(() => { if (visible()) focusable()[0]?.focus(); });
  }));
  modal.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); close(); }
    });
  });
  document.addEventListener('keydown', event => {
    if (!visible()) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (event.key !== 'Tab') return;
    const elements = focusable(), first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });
  // The Home CTA reaches this existing dialog through the library deep link.
  // Trigger the original IX2 click action instead of replacing its animation.
  if (location.pathname.replace(/\/$/, '') === '/biblioteca' && location.hash === '#pesquisa-2025') {
    window.Webflow.push(() => document.querySelector('[data-open-research]')?.click());
  }
}
