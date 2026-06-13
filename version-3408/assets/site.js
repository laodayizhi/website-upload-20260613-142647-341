(function() {
  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function() {
      panel.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;
    var show = function(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    };
    var restart = function() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        show(index + 1);
      }, 5200);
    };
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        show(i);
        restart();
      });
    });
    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }
    restart();
  }

  var filterInput = document.querySelector('[data-filter-input]');
  if (filterInput) {
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('.movie-card-item'));
    filterInput.addEventListener('input', function() {
      var key = filterInput.value.trim().toLowerCase();
      filterItems.forEach(function(item) {
        var text = ((item.getAttribute('data-title') || '') + ' ' + (item.getAttribute('data-meta') || '') + ' ' + item.textContent).toLowerCase();
        item.style.display = text.indexOf(key) === -1 ? 'none' : '';
      });
    });
  }

  if (document.querySelector('[data-search-page]') && window.SEARCH_ITEMS) {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var searchInput = document.querySelector('[data-search-input]');
    var titleNode = document.querySelector('[data-search-title]');
    var results = document.getElementById('search-results');
    if (searchInput) {
      searchInput.value = query;
    }
    var renderCard = function(item) {
      return '<article class="movie-card movie-card-item" data-title="' + escapeHtml(item.title) + '" data-meta="' + escapeHtml(item.meta) + '">' +
        '<a href="' + item.url + '" class="movie-poster">' +
          '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
          '<span class="poster-badge">' + escapeHtml(item.year) + '</span>' +
          '<span class="play-float">▶</span>' +
        '</a>' +
        '<div class="movie-info">' +
          '<a class="movie-title" href="' + item.url + '">' + escapeHtml(item.title) + '</a>' +
          '<div class="movie-meta">' + escapeHtml(item.meta) + '</div>' +
          '<p>' + escapeHtml(item.oneLine) + '</p>' +
        '</div>' +
      '</article>';
    };
    var applySearch = function(key) {
      var normalized = key.trim().toLowerCase();
      var items = window.SEARCH_ITEMS;
      if (normalized) {
        items = items.filter(function(item) {
          return item.searchText.indexOf(normalized) !== -1;
        });
      } else {
        items = items.slice(0, 24);
      }
      if (titleNode) {
        titleNode.textContent = normalized ? '搜索：' + key : '热门推荐';
      }
      if (results) {
        results.innerHTML = items.slice(0, 120).map(renderCard).join('');
      }
    };
    applySearch(query);
  }
})();

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function(char) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char];
  });
}

function createMoviePlayer(sourceUrl) {
  var video = document.getElementById('movie-player');
  var overlay = document.querySelector('.player-overlay');
  var hlsInstance = null;
  var attached = false;
  if (!video) {
    return;
  }
  var attach = function() {
    if (attached) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
    attached = true;
  };
  var start = function() {
    attach();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function() {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  };
  if (overlay) {
    overlay.addEventListener('click', start);
  }
  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
  video.addEventListener('ended', function() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('pagehide', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
