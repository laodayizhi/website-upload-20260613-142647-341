(function () {
  var mobileToggle = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileToggle && mobilePanel) {
    mobileToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === currentSlide);
    });
  }

  function startHeroTimer() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5000);
  }

  function restartHeroTimer() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHeroTimer();
  }

  var previousButton = document.querySelector('.hero-control.prev');
  var nextButton = document.querySelector('.hero-control.next');

  if (previousButton) {
    previousButton.addEventListener('click', function () {
      showSlide(currentSlide - 1);
      restartHeroTimer();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', function () {
      showSlide(currentSlide + 1);
      restartHeroTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
      restartHeroTimer();
    });
  });

  startHeroTimer();

  var filterPanel = document.querySelector('.filter-panel');
  var filterList = document.querySelector('.filter-list');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!filterPanel || !filterList) {
      return;
    }

    var keywordInput = filterPanel.querySelector('[data-filter="keyword"]');
    var regionInput = filterPanel.querySelector('[data-filter="region"]');
    var typeInput = filterPanel.querySelector('[data-filter="type"]');
    var yearInput = filterPanel.querySelector('[data-filter="year"]');
    var categoryInput = filterPanel.querySelector('[data-filter="category"]');
    var keyword = normalize(keywordInput && keywordInput.value);
    var region = normalize(regionInput && regionInput.value);
    var type = normalize(typeInput && typeInput.value);
    var year = normalize(yearInput && yearInput.value);
    var category = normalize(categoryInput && categoryInput.value);
    var cards = Array.prototype.slice.call(filterList.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute('data-search'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var cardYear = normalize(card.getAttribute('data-year'));
      var cardCategory = normalize(card.querySelector('.card-meta a') && card.querySelector('.card-meta a').textContent);
      var matched = true;

      if (keyword && haystack.indexOf(keyword) === -1) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      if (type && cardType !== type) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (category && cardCategory !== category) {
        matched = false;
      }

      card.classList.toggle('is-hidden', !matched);
    });
  }

  if (filterPanel && filterList) {
    var query = new URLSearchParams(window.location.search).get('q');
    var keywordInput = filterPanel.querySelector('[data-filter="keyword"]');

    if (query && keywordInput) {
      keywordInput.value = query;
    }

    filterPanel.addEventListener('input', applyFilters);
    filterPanel.addEventListener('change', applyFilters);
    applyFilters();
  }

  function initializePlayer(video, trigger) {
    if (!video) {
      return;
    }

    var card = video.closest('.player-card');
    var source = video.getAttribute('data-stream');
    var loaded = false;
    var hlsInstance = null;

    function playVideo() {
      if (!source) {
        return;
      }

      if (!loaded) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          loaded = true;
          video.play().catch(function () {});
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            video.play().catch(function () {});
          });
        } else {
          video.src = source;
          loaded = true;
          video.play().catch(function () {});
        }
      } else {
        video.play().catch(function () {});
      }

      if (card) {
        card.classList.add('playing');
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    var pageButton = document.querySelector('.player-trigger');

    if (pageButton) {
      pageButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (card) {
        card.classList.add('playing');
      }
    });

    video.addEventListener('pause', function () {
      if (card && video.currentTime === 0) {
        card.classList.remove('playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  initializePlayer(document.querySelector('.video-player'), document.querySelector('.player-start'));
})();
