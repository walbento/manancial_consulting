(function () {
  function initMobileMenu() {
    document.querySelectorAll('.stm_mobile__switcher').forEach(function (toggle) {
      toggle.addEventListener('click', function () {
        const target = toggle.getAttribute('data-element');
        if (!target) return;
        document.querySelectorAll(target).forEach(function (el) {
          el.classList.toggle('active');
        });
        toggle.classList.toggle('active');
      });
    });
  }

  function initDropdowns() {
    document.querySelectorAll('.stm-menu li.menu-item-has-children > a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth > 991) return;
        e.preventDefault();
        link.parentElement.classList.toggle('open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initDropdowns();
  });
})();
