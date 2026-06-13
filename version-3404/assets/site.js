(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function initNav() {
    var button = qs('[data-nav-toggle]');
    var panel = qs('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panel = qs('[data-filter-panel]');
    var grid = qs('[data-filter-grid]');
    if (!panel || !grid) {
      return;
    }
    var keyword = qs('[data-filter-keyword]', panel);
    var year = qs('[data-filter-year]', panel);
    var reset = qs('[data-filter-reset]', panel);
    var cards = qsa('[data-card]', grid);

    function apply() {
      var term = text(keyword && keyword.value);
      var selectedYear = year && year.value;
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute('data-title'),
          card.getAttribute('data-category'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-year')
        ].join(' '));
        var matchTerm = !term || haystack.indexOf(term) !== -1;
        var matchYear = !selectedYear || card.getAttribute('data-year') === selectedYear;
        card.classList.toggle('is-hidden', !(matchTerm && matchYear));
      });
    }

    if (keyword) {
      keyword.addEventListener('input', apply);
    }
    if (year) {
      year.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (year) {
          year.value = '';
        }
        apply();
      });
    }
  }

  function initSearch() {
    var results = qs('[data-search-results]');
    var input = qs('[data-search-input]');
    if (!results || !input || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;

    function escapeHtml(value) {
      return String(value || '').replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function card(movie) {
      var tags = [movie.category, movie.region, movie.type].filter(Boolean).slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('');
      return [
        '<article class="movie-card">',
        '<a href="' + movie.url + '" class="card-link">',
        '<div class="poster-wrap">',
        '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
        '<span class="poster-type">' + escapeHtml(movie.type) + '</span>',
        '<span class="poster-play">▶</span>',
        '</div>',
        '<div class="card-body">',
        '<h3>' + escapeHtml(movie.title) + '</h3>',
        '<p>' + escapeHtml(movie.oneLine) + '</p>',
        '<div class="card-tags">' + tags + '</div>',
        '<div class="card-meta"><span>' + escapeHtml(movie.region) + '</span><span>' + movie.year + '年</span><span>' + Number(movie.heat).toLocaleString() + '热度</span></div>',
        '</div>',
        '</a>',
        '</article>'
      ].join('');
    }

    function render() {
      var term = text(input.value).trim();
      var list = window.SEARCH_MOVIES;
      if (term) {
        list = list.filter(function (movie) {
          return text([
            movie.title,
            movie.category,
            movie.year,
            movie.region,
            movie.type,
            movie.genre,
            (movie.tags || []).join(' '),
            movie.oneLine
          ].join(' ')).indexOf(term) !== -1;
        });
      }
      list = list.slice(0, 120);
      results.innerHTML = list.length ? list.map(card).join('') : '<div class="search-empty">没有找到匹配的影视内容</div>';
    }

    input.addEventListener('input', render);
    render();
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (box) {
      var video = qs('video', box);
      var button = qs('.player-start', box);
      var source = qs('source', video);
      if (!video || !button || !source) {
        return;
      }
      var src = source.getAttribute('src');
      var attached = false;
      var hls = null;

      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else {
          video.src = src;
        }
      }

      function play() {
        attach();
        button.classList.add('is-hidden');
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {
            button.classList.remove('is-hidden');
          });
        }
      }

      button.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (!video.ended) {
          button.classList.remove('is-hidden');
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initNav();
    initHero();
    initFilters();
    initSearch();
    initPlayers();
  });
})();
