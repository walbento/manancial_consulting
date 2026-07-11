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
    var selectors = [
      '.stm-menu li.menu-item-has-children > a',
      '.stm-navigation > ul > li.menu-item-has-children > a',
      '.stm-header li.menu-item-has-children > a',
    ];

    document.querySelectorAll(selectors.join(', ')).forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth > 991) return;
        e.preventDefault();
        var parent = link.parentElement;
        parent.classList.toggle('open');
        parent.parentElement.querySelectorAll(':scope > li.open').forEach(function (li) {
          if (li !== parent) li.classList.remove('open');
        });
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initDropdowns();
  });
})();
