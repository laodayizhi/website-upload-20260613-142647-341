(function () {
    var nav = document.getElementById('mainNav');
    var toggle = document.querySelector('[data-menu-toggle]');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupSearch() {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var empty = document.querySelector('[data-empty-state]');

        function applyFilter(query) {
            var value = (query || '').trim().toLowerCase();
            var shown = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var match = !value || text.indexOf(value) !== -1;
                card.hidden = !match;
                if (match) {
                    shown += 1;
                }
            });

            if (empty) {
                empty.hidden = shown !== 0;
            }
        }

        searchInputs.forEach(function (input) {
            input.value = initialQuery;
            input.addEventListener('input', function () {
                applyFilter(input.value);
            });
        });

        document.querySelectorAll('[data-filter-chip]').forEach(function (button) {
            button.addEventListener('click', function () {
                var value = button.getAttribute('data-filter-chip') || '';
                searchInputs.forEach(function (input) {
                    input.value = value;
                });
                applyFilter(value);
            });
        });

        if (initialQuery) {
            applyFilter(initialQuery);
        }
    }

    function setupPlayer() {
        var video = document.querySelector('[data-video-url]');
        var button = document.querySelector('[data-play-button]');
        var shell = document.querySelector('[data-video-shell]');
        var hlsInstance = null;
        var loaded = false;

        if (!video) {
            return;
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function loadAndPlay() {
            var streamUrl = video.getAttribute('data-video-url');
            if (!streamUrl) {
                return;
            }

            if (!loaded) {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = streamUrl;
                } else {
                    video.src = streamUrl;
                }

                loaded = true;
            }

            hideButton();
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    if (button) {
                        button.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', loadAndPlay);
        }

        if (shell) {
            shell.addEventListener('click', function (event) {
                if (event.target === video && !loaded) {
                    loadAndPlay();
                }
            });
        }

        video.addEventListener('play', hideButton);
        video.addEventListener('ended', function () {
            if (button) {
                button.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    setupHero();
    setupSearch();
    setupPlayer();
})();
