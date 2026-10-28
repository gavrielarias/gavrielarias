/* Direct language navigation keeps the current section and records explicit choices.
   A shared link always opens its specified language; no automatic redirection. */
'use strict';
document.querySelectorAll('[data-language-switch]').forEach(link => {
  const target = new URL(link.getAttribute('href'), location.origin);
  function syncDestination() {
    target.hash = location.hash;
    link.href = target.pathname + target.hash;
  }
  syncDestination();
  window.addEventListener('hashchange', syncDestination);
  link.addEventListener('click', () => {
    try { localStorage.setItem('gavriel-language', link.hreflang); } catch {}
  });
});
