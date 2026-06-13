(function () {
  const all = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slides = all('[data-hero-slide]');
  if (slides.length) {
    const dots = all('[data-hero-dot]');
    const next = document.querySelector('[data-hero-next]');
    const prev = document.querySelector('[data-hero-prev]');
    let index = 0;
    let timer = null;

    const show = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    restart();
  }

  all('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const sort = scope.querySelector('[data-sort-select]');
    const chips = all('[data-filter-value]', scope);
    const grid = scope.querySelector('[data-card-grid]');
    const empty = scope.querySelector('[data-empty-state]');
    let chipValue = 'all';

    const getCards = function () {
      return all('[data-card]', scope);
    };

    const apply = function () {
      const term = input ? input.value.trim().toLowerCase() : '';
      let visible = 0;
      getCards().forEach(function (card) {
        const text = (card.getAttribute('data-filter-text') || '').toLowerCase();
        const matchTerm = !term || text.indexOf(term) !== -1;
        const matchChip = chipValue === 'all' || text.indexOf(chipValue.toLowerCase()) !== -1;
        const showCard = matchTerm && matchChip;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    };

    const sortCards = function () {
      if (!grid || !sort) {
        return;
      }
      const cards = getCards();
      const mode = sort.value;
      cards.sort(function (a, b) {
        const ay = Number(a.getAttribute('data-year-num') || 0);
        const by = Number(b.getAttribute('data-year-num') || 0);
        const at = a.getAttribute('data-title') || '';
        const bt = b.getAttribute('data-title') || '';
        if (mode === 'year-asc') {
          return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
        }
        if (mode === 'title') {
          return at.localeCompare(bt, 'zh-Hans-CN');
        }
        return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    };

    if (input) {
      input.addEventListener('input', apply);
    }

    if (sort) {
      sort.addEventListener('change', sortCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chipValue = chip.getAttribute('data-filter-value') || 'all';
        chips.forEach(function (item) {
          item.classList.toggle('is-active', item === chip);
        });
        apply();
      });
    });
  });
})();
