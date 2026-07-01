/**
 * Carrega partials HTML reutilizáveis (preparação para templates dinâmicos).
 */
(function () {
  async function loadPartial(selector, url) {
    const el = document.querySelector(selector);
    if (!el) return;
    el.setAttribute('data-loading', 'true');
    try {
      const res = await fetch(url);
      if (res.ok) {
        el.innerHTML = await res.text();
      }
    } catch (e) {
      console.warn('Partial not loaded:', url, e.message);
    } finally {
      el.removeAttribute('data-loading');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    loadPartial('#site-header', '/partials/header.html');
    loadPartial('#site-footer', '/partials/footer.html');
    loadPartial('#contact-form-partial', '/partials/contact-form.html');
  });
})();
