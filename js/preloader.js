// Preloader — Theme detection, scene injection, and deferred stylesheet activation.
// This script runs first in <head> to ensure the preloader is immediately
// visible with the correct theme colors, before any other styles load.

var _animDone = false;
var _hideRequested = false;

(function () {
  // Detect and apply theme immediately to prevent flash of wrong theme
  var theme;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
  if (!theme) {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);

  // Spaceship cruising through the void
  var sceneHTML =
    '<div class="void">' +
      '<div class="ship"></div>' +
      '<div class="streak s1"></div>' +
      '<div class="streak s2"></div>' +
      '<div class="streak s3"></div>' +
    '</div>';

  document.addEventListener('DOMContentLoaded', function () {
    // Inject scene into preloader container
    var preloader = document.getElementById('preloader');
    if (preloader && !preloader.children.length) {
      preloader.innerHTML = sceneHTML;
    }

    // Activate deferred stylesheets
    var deferred = document.querySelectorAll('link[data-deferred]');
    for (var i = 0; i < deferred.length; i++) {
      deferred[i].removeAttribute('media');
    }

    // Minimum display time — let the ship arrive and streaks play
    setTimeout(function () {
      _animDone = true;
      if (_hideRequested) hidePreloader();
    }, 1200);
  });
})();

// Hide preloader (called by page scripts when content is ready)
function hidePreloader() {
  _hideRequested = true;
  if (!_animDone) return;
  var preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('hidden')) {
    preloader.classList.add('hidden');
    setTimeout(function () { preloader.remove(); }, 300);
  }
}

// Fallback: hide preloader on window load
window.addEventListener('load', hidePreloader);
