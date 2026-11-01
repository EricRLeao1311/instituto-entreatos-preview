// Same early feature flags as the published document, using only local code.
(function (window, document) {
  const root = document.documentElement;
  root.className += ' w-mod-js';
  if ('ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch)) root.className += ' w-mod-touch';
})(window, document);
