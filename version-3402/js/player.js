function startMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var cover = document.getElementById(config.coverId);
  var hlsInstance = null;

  if (!video || !button || !cover || !config.source) {
    return;
  }

  function attach() {
    if (video.getAttribute('data-ready') === '1') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = config.source;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(config.source);
      hlsInstance.attachMedia(video);
    } else {
      video.src = config.source;
    }

    video.setAttribute('data-ready', '1');
  }

  function play() {
    attach();
    cover.hidden = true;
    video.controls = true;
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        cover.hidden = false;
      });
    }
  }

  button.addEventListener('click', play);
  cover.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) {
      play();
    }
  });
  video.addEventListener('play', function () {
    cover.hidden = true;
  });

  window.addEventListener('pagehide', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
