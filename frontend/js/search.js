(function () {
  window.siteSearch = {
    handleSubmit: function (event) {
      event.preventDefault();
      const input = event.target.querySelector('input[name="s"]');
      const q = input ? input.value.trim() : '';
      window.location.href = '/pesquisa/?q=' + encodeURIComponent(q);
      return false;
    },
  };

  document.addEventListener('DOMContentLoaded', async function () {
    const container = document.getElementById('search-results') || document.getElementById('results');
    if (!container) return;

    const params = new URLSearchParams(window.location.search);
    const q = (params.get('q') || '').toLowerCase().trim();

    if (!q) {
      container.innerHTML = '<p>Introduza um termo de pesquisa.</p>';
      return;
    }

    try {
      const res = await fetch('/search-index.json');
      const pages = await res.json();
      const hits = pages.filter(function (p) {
        return (p.title + ' ' + p.excerpt).toLowerCase().includes(q);
      });

      if (!hits.length) {
        container.innerHTML = '<p>Nenhum resultado para <strong>' + q + '</strong>.</p>';
        return;
      }

      container.innerHTML = hits
        .map(function (p) {
          return (
            '<div class="result"><a href="' +
            p.url +
            '">' +
            p.title +
            '</a><p>' +
            (p.excerpt || '').slice(0, 180) +
            '…</p></div>'
          );
        })
        .join('');
    } catch (e) {
      container.innerHTML = '<p>Erro ao carregar resultados.</p>';
    }
  });
})();
