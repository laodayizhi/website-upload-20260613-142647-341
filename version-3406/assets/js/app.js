function qs(selector, root) {
    return (root || document).querySelector(selector);
}

function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
}

function normText(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function initMobileNav() {
    var toggle = qs("[data-mobile-toggle]");
    var panel = qs("[data-mobile-panel]");
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
    });
}

function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
        return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    var active = 0;
    var paused = false;

    function show(index) {
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === active);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === active);
        });
    }

    if (!slides.length) {
        return;
    }

    dots.forEach(function (dot, i) {
        dot.addEventListener("click", function () {
            show(i);
        });
    });

    if (prev) {
        prev.addEventListener("click", function () {
            show(active - 1);
        });
    }

    if (next) {
        next.addEventListener("click", function () {
            show(active + 1);
        });
    }

    hero.addEventListener("mouseenter", function () {
        paused = true;
    });

    hero.addEventListener("mouseleave", function () {
        paused = false;
    });

    window.setInterval(function () {
        if (!paused) {
            show(active + 1);
        }
    }, 5000);

    show(0);
}

function filterItems(input) {
    var scope = input.closest("[data-filter-scope]") || document;
    var items = qsa("[data-filter-item]", scope);
    var query = normText(input.value);
    items.forEach(function (item) {
        var haystack = normText(item.getAttribute("data-keywords"));
        item.classList.toggle("hidden-by-filter", query && haystack.indexOf(query) === -1);
    });
}

function initFilters() {
    qsa("[data-filter-input]").forEach(function (input) {
        var params = new URLSearchParams(window.location.search);
        var urlQuery = params.get("q");
        if (urlQuery && !input.value) {
            input.value = urlQuery;
        }
        filterItems(input);
        input.addEventListener("input", function () {
            filterItems(input);
        });
    });

    qsa("[data-filter-chip]").forEach(function (chip) {
        chip.addEventListener("click", function () {
            var scope = chip.closest("[data-filter-scope]") || document;
            var input = qs("[data-filter-input]", scope);
            if (input) {
                input.value = chip.getAttribute("data-filter-chip") || "";
                filterItems(input);
                input.focus();
            }
        });
    });
}

function attachHls(video, source) {
    if (window.Hls && Hls.isSupported()) {
        var hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        return hls;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return null;
    }

    video.src = source;
    return null;
}

function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var prepared = false;
    var hlsInstance = null;

    if (!video || !button || !source) {
        return;
    }

    function prepare() {
        if (prepared) {
            return;
        }
        hlsInstance = attachHls(video, source);
        prepared = true;
    }

    function start() {
        prepare();
        button.classList.add("is-hidden");
        var action = video.play();
        if (action && typeof action.catch === "function") {
            action.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

window.initMoviePlayer = initMoviePlayer;

document.addEventListener("DOMContentLoaded", function () {
    initMobileNav();
    initHero();
    initFilters();
});
