// Remove HTML splash once React mounts
window.addEventListener('DOMContentLoaded', function () {
  setTimeout(function () {
    var splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
      setTimeout(function () { splash.remove(); }, 300);
    }
  }, 800);
});
