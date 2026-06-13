(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var nav = document.getElementById('siteNav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var previousButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function nextSlide() {
      showSlide(current + 1);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(nextSlide, 5200);
    }

    if (slides.length > 1) {
      if (previousButton) {
        previousButton.addEventListener('click', function () {
          showSlide(current - 1);
          restart();
        });
      }
      if (nextButton) {
        nextButton.addEventListener('click', function () {
          showSlide(current + 1);
          restart();
        });
      }
      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });
      restart();
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var filterGrid = document.querySelector('[data-filter-grid]');

  if (filterInput && filterGrid) {
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-filter-empty]');

    function applyFilter() {
      var keyword = filterInput.value.trim().toLowerCase();
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region')
        ].join(' ').toLowerCase();
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (emptyState) {
        emptyState.hidden = visibleCount !== 0;
      }
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  var searchPage = document.querySelector('[data-search-page]');

  if (searchPage && window.SearchIndex) {
    var form = searchPage.querySelector('[data-search-form]');
    var input = searchPage.querySelector('[data-search-query]');
    var results = searchPage.querySelector('[data-search-results]');
    var status = searchPage.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);

    function escapeText(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function cardTemplate(item) {
      return [
        '<article class="movie-card">',
        '  <a class="poster-link" href="' + escapeText(item.url) + '" aria-label="观看' + escapeText(item.title) + '">',
        '    <img src="' + escapeText(item.cover) + '" alt="' + escapeText(item.title) + '" loading="lazy" decoding="async">',
        '    <span class="play-badge">播放</span>',
        '  </a>',
        '  <div class="card-body">',
        '    <div class="card-tags"><span>' + escapeText(item.type) + '</span><span>' + escapeText(item.region) + '</span></div>',
        '    <h3><a href="' + escapeText(item.url) + '">' + escapeText(item.title) + '</a></h3>',
        '    <p>' + escapeText(item.oneLine) + '</p>',
        '    <div class="card-meta"><span>' + escapeText(item.year) + '年</span><span>' + escapeText(item.category) + '</span></div>',
        '  </div>',
        '</article>'
      ].join('');
    }

    function renderSearch(keyword) {
      var query = String(keyword || '').trim().toLowerCase();

      if (input) {
        input.value = keyword || '';
      }

      if (!query) {
        var hotItems = window.SearchIndex.slice(0, 24);
        results.innerHTML = hotItems.map(cardTemplate).join('');
        status.textContent = '输入关键词可搜索片名、类型、地区、年份与标签';
        return;
      }

      var matches = window.SearchIndex.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 120);

      results.innerHTML = matches.map(cardTemplate).join('');
      status.textContent = matches.length ? '已找到相关影片' : '未找到相关影片';
    }

    if (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : '';
        var url = new URL(window.location.href);
        if (query) {
          url.searchParams.set('q', query);
        } else {
          url.searchParams.delete('q');
        }
        window.history.replaceState({}, '', url.toString());
        renderSearch(query);
      });
    }

    renderSearch(params.get('q') || '');
  }
})();
