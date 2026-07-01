(function () {
  document.addEventListener('DOMContentLoaded', async function () {
    document.body.classList.add('front-ready');

    if (window.SiteAPI) {
      try {
        const settings = await window.SiteAPI.getSettings();
        document.querySelectorAll('[data-setting="email"]').forEach(function (el) {
          el.textContent = settings.email;
          if (el.tagName === 'A') el.href = 'mailto:' + settings.email;
        });
        document.querySelectorAll('[data-setting="phone"]').forEach(function (el) {
          el.textContent = settings.phone_primary;
          if (el.tagName === 'A') el.href = 'tel:' + settings.phone_primary.replace(/\D/g, '');
        });
      } catch (e) {
        console.warn('Settings not loaded:', e.message);
      }
    }

    document.querySelectorAll('img.lazyload[data-src]').forEach(function (img) {
      if (!img.getAttribute('src') || img.getAttribute('src').startsWith('data:')) {
        img.setAttribute('src', img.getAttribute('data-src'));
      }
    });

    const arrowTop = document.querySelector('.pearl_arrow_top');
    if (arrowTop) {
      arrowTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });
})();
