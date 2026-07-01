(function () {
  document.querySelectorAll('img.lazyload[data-src]').forEach(function (img) {
    if (!img.getAttribute('src') || img.getAttribute('src').startsWith('data:')) {
      img.setAttribute('src', img.getAttribute('data-src'));
    }
  });

  window.siteSearch = {
    handleSubmit: function (event) {
      event.preventDefault();
      var input = event.target.querySelector('input[name="s"]');
      var q = input ? input.value.trim() : '';
      window.location.href = '/pesquisa/?q=' + encodeURIComponent(q);
      return false;
    },
  };
})();
