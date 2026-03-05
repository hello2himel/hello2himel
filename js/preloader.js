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

  // Pulsar SVG — scientific instrument visualization
  var pulsarSVG =
    '<svg class="pulsar" viewBox="0 0 200 200">' +
      '<defs>' +
        '<radialGradient id="pl-halo">' +
          '<stop offset="0%" stop-color="currentColor" stop-opacity="0.12"/>' +
          '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<radialGradient id="pl-core-glow">' +
          '<stop offset="0%" stop-color="#D4A04A" stop-opacity="0.4"/>' +
          '<stop offset="40%" stop-color="currentColor" stop-opacity="0.1"/>' +
          '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
        '</radialGradient>' +
        '<linearGradient id="pl-beam-up" x1="0" y1="1" x2="0" y2="0">' +
          '<stop offset="0%" stop-color="currentColor" stop-opacity="0.8"/>' +
          '<stop offset="50%" stop-color="currentColor" stop-opacity="0.2"/>' +
          '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
        '</linearGradient>' +
        '<linearGradient id="pl-beam-dn" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0%" stop-color="currentColor" stop-opacity="0.8"/>' +
          '<stop offset="50%" stop-color="currentColor" stop-opacity="0.2"/>' +
          '<stop offset="100%" stop-color="currentColor" stop-opacity="0"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<circle cx="100" cy="100" r="50" class="guide-ring"/>' +
      '<line x1="100" y1="50" x2="100" y2="44" class="guide-tick"/>' +
      '<line x1="150" y1="100" x2="156" y2="100" class="guide-tick"/>' +
      '<line x1="100" y1="150" x2="100" y2="156" class="guide-tick"/>' +
      '<line x1="50" y1="100" x2="44" y2="100" class="guide-tick"/>' +
      '<circle cx="100" cy="100" r="37" fill="url(#pl-halo)" class="pulsar-halo"/>' +
      '<circle cx="100" cy="100" r="26" class="pulse-ring"/>' +
      '<circle cx="100" cy="100" r="26" class="pulse-ring d2"/>' +
      '<circle cx="100" cy="100" r="26" class="pulse-ring d3"/>' +
      '<g class="pulsar-beams">' +
        '<polygon points="98,92 93,29 107,29 102,92" fill="url(#pl-beam-up)"/>' +
        '<polygon points="98,108 93,171 107,171 102,108" fill="url(#pl-beam-dn)"/>' +
      '</g>' +
      '<circle cx="100" cy="100" r="16" fill="url(#pl-core-glow)" class="pulsar-core-glow"/>' +
      '<circle cx="100" cy="100" r="5" fill="currentColor" class="pulsar-core"/>' +
    '</svg>' +
    '<span class="preloader-text">Calibrating instruments</span>';

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
