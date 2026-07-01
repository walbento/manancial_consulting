(function () {
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[name="contact"]').forEach(function (form) {
      form.addEventListener('submit', function () {
        const btn = form.querySelector('[type="submit"]');
        if (btn) {
          btn.disabled = true;
          btn.value = 'A enviar...';
        }
      });
    });
  });
})();
