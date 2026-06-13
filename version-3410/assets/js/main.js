(function () {
  var navToggle = document.querySelector(".nav-toggle");
  var mainNav = document.querySelector(".main-nav");

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      mainNav.classList.toggle("is-open");
    });
  }

  var slider = document.querySelector("[data-hero-slider]");
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var searchInput = document.querySelector(".movie-search-input");
  var typeSelect = document.querySelector(".movie-filter-type");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-grid .movie-card"));

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var term = searchInput ? searchInput.value.trim().toLowerCase() : "";
    var type = typeSelect ? typeSelect.value.trim().toLowerCase() : "";

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-year"),
        card.getAttribute("data-type"),
        card.textContent
      ].join(" ").toLowerCase();
      var cardType = (card.getAttribute("data-type") || "").toLowerCase();
      var matchesTerm = !term || haystack.indexOf(term) !== -1;
      var matchesType = !type || cardType.indexOf(type) !== -1 || haystack.indexOf(type) !== -1;
      card.style.display = matchesTerm && matchesType ? "" : "none";
    });
  }

  if (searchInput) {
    if (query) {
      searchInput.value = query;
    }
    searchInput.addEventListener("input", filterCards);
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", filterCards);
  }

  filterCards();
})();
