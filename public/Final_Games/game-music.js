/**
 * Background music from Final_Games/music — fade in, loop, fade out on stop.
 */
(function (global) {
  'use strict';

  const TRACKS = {
    edWelch: 'music/Ed Welch BlockBusters Full Theme - George Fiddler.mp3',
    nickArcade: 'music/Nick Arcade Full Theme (Clean) - jomar500.mp3',
    gameShow: 'music/Funny Game Show Music Opener  For producing your Game Challange - Waderman - Human Music for Content Creator.mp3',
  };

  let audioEl = null;
  let currentSrc = null;
  let fadeTimer = null;
  let playing = false;
  let targetVolume = 0.28;
  let currentVolume = 0;

  function resolveSrc(opts) {
    if (opts && opts.src) return opts.src;
    if (opts && opts.track && TRACKS[opts.track]) return TRACKS[opts.track];
    return TRACKS.edWelch;
  }

  function fadeTo(volume, ms, onDone) {
    if (fadeTimer) clearInterval(fadeTimer);
    if (!audioEl) {
      currentVolume = volume;
      if (onDone) onDone();
      return;
    }

    const steps = Math.max(1, Math.floor(ms / 50));
    const startVol = currentVolume;
    const delta = (volume - startVol) / steps;
    let step = 0;

    fadeTimer = setInterval(function () {
      step += 1;
      currentVolume = step >= steps ? volume : startVol + delta * step;
      audioEl.volume = Math.max(0, Math.min(1, currentVolume));
      if (step >= steps) {
        clearInterval(fadeTimer);
        fadeTimer = null;
        if (onDone) onDone();
      }
    }, ms / steps);
  }

  function getOrCreateAudio(src) {
    if (!audioEl || currentSrc !== src) {
      if (audioEl) {
        audioEl.pause();
        audioEl = null;
      }
      audioEl = new Audio(src);
      audioEl.loop = true;
      audioEl.preload = 'auto';
      currentSrc = src;
    }
    return audioEl;
  }

  function start(opts) {
    opts = opts || {};
    const src = resolveSrc(opts);
    targetVolume = typeof opts.volume === 'number' ? opts.volume : 0.28;
    const fadeInMs = typeof opts.fadeInMs === 'number' ? opts.fadeInMs : 2000;

    const el = getOrCreateAudio(src);

    if (playing && currentSrc === src) {
      return el.play().then(function () {
        fadeTo(targetVolume, 400);
      }).catch(function () {});
    }

    playing = true;
    currentVolume = 0;
    el.volume = 0;

    return el.play().then(function () {
      fadeTo(targetVolume, fadeInMs);
    }).catch(function (err) {
      console.warn('GameMusic: playback blocked or failed', err);
      playing = false;
    });
  }

  function stop(opts) {
    opts = opts || {};
    const fadeOutMs = typeof opts.fadeOutMs === 'number' ? opts.fadeOutMs : 800;
    const immediate = !!opts.immediate;

    return new Promise(function (resolve) {
      if (!playing || !audioEl) {
        resolve();
        return;
      }

      function finish() {
        playing = false;
        audioEl.pause();
        audioEl.currentTime = 0;
        currentVolume = 0;
        audioEl.volume = 0;
        resolve();
      }

      if (immediate || fadeOutMs <= 0) {
        finish();
      } else {
        fadeTo(0, fadeOutMs, finish);
      }
    });
  }

  global.GameMusic = {
    TRACKS: TRACKS,
    start: start,
    stop: stop,
    isPlaying: function () { return playing; },
  };
})(typeof window !== 'undefined' ? window : globalThis);
