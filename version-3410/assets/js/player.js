(function () {
  window.initMoviePlayer = function (sourceUrl) {
    var box = document.querySelector(".player-box");
    var video = document.querySelector(".movie-video");
    var cover = document.querySelector(".player-cover");
    var started = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || !sourceUrl || started) {
        return;
      }

      started = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }
    }

    function startPlayback() {
      prepare();

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video) {
        video.controls = true;
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            if (cover) {
              cover.classList.remove("is-hidden");
            }
          });
        }
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
    }

    if (box) {
      box.addEventListener("click", function (event) {
        if (event.target === video && !started) {
          startPlayback();
        }
      });
    }

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
