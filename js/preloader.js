// Preloader — Theme detection, Big Bang injection, and deferred stylesheet activation.
// This script runs first in <head> to ensure the preloader is immediately
// visible with the correct theme colors, before any other styles load.

(function () {
  // Detect and apply theme immediately to prevent flash of wrong theme
  var theme;
  try { theme = localStorage.getItem('theme'); } catch (e) { /* ignore */ }
  if (!theme) {
    theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);

  // Big Bang — singularity point with expanding wavefronts
  var bangHTML =
    '<div class="singularity">' +
      '<div class="bang-wave"></div>' +
      '<div class="bang-wave"></div>' +
    '</div>';

  document.addEventListener('DOMContentLoaded', function () {
    // Inject Big Bang into preloader container
    var preloader = document.getElementById('preloader');
    if (preloader && !preloader.children.length) {
      preloader.innerHTML = bangHTML;
    }

    // Activate deferred stylesheets
    var deferred = document.querySelectorAll('link[data-deferred]');
    for (var i = 0; i < deferred.length; i++) {
      deferred[i].removeAttribute('media');
    }
  });
})();

// Hide preloader (called by page scripts when content is ready)
function hidePreloader() {
  var preloader = document.getElementById('preloader');
  if (preloader && !preloader.classList.contains('hidden')) {
    preloader.classList.add('hidden');
    setTimeout(function () { preloader.remove(); }, 300);
  }
}

// Fallback: hide preloader on window load
window.addEventListener('load', hidePreloader);
