// Preloader — Theme detection, SVG injection, and deferred stylesheet activation.
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

  // Pulsar SVG — simple 2D rotating neutron star
  var pulsarSVG =
    '<svg class="pulsar" viewBox="0 0 100 100" width="60" height="60">' +
      '<defs>' +
        '<radialGradient id="pl-glow">' +
          '<stop offset="0%" stop-color="currentColor" stop-opacity="0.35"/>' +
          '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
        '</radialGradient>' +
      '</defs>' +
      '<circle cx="50" cy="50" r="20" class="pulse-ring"/>' +
      '<circle cx="50" cy="50" r="20" class="pulse-ring d2"/>' +
      '<circle cx="50" cy="50" r="20" class="pulse-ring d3"/>' +
      '<g class="pulsar-beams">' +
        '<line x1="50" y1="6" x2="50" y2="40" stroke-width="2.5" stroke-linecap="round"/>' +
        '<line x1="50" y1="60" x2="50" y2="94" stroke-width="2.5" stroke-linecap="round"/>' +
      '</g>' +
      '<circle cx="50" cy="50" r="12" fill="url(#pl-glow)"/>' +
      '<circle cx="50" cy="50" r="4" fill="currentColor" class="pulsar-core"/>' +
    '</svg>';

  document.addEventListener('DOMContentLoaded', function () {
    // Inject pulsar SVG into preloader container
    var preloader = document.getElementById('preloader');
    if (preloader && !preloader.children.length) {
      preloader.innerHTML = pulsarSVG;
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
