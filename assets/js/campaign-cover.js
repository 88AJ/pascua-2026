(function () {
  function initCampaignCover() {
    var root = document.documentElement;
    var body = document.body;
    if (!body) return;

    var reducedMotion = false;
    try {
      reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {
      reducedMotion = false;
    }

    var revealTargets = Array.prototype.slice.call(
      document.querySelectorAll('header, main > section, .surface, .asset-card, .day-card, .misal-card, .highlight-card, .kpi, .poster, .manta, .flyer')
    );

    revealTargets.forEach(function (node, idx) {
      node.setAttribute('data-campaign-reveal', '');
      node.style.setProperty('--reveal-delay', (idx * 65) + 'ms');
    });

    var overlay = document.querySelector('[data-campaign-cover]');

    function completeIntro() {
      body.classList.add('campaign-ready');
      if (overlay) overlay.classList.add('is-hidden');
    }

    if (!overlay || reducedMotion) {
      completeIntro();
      return;
    }

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      completeIntro();
    }

    var timer = window.setTimeout(finish, 2000);
    var skipButton = overlay.querySelector('[data-cover-skip]');

    if (skipButton) {
      skipButton.addEventListener('click', function () {
        window.clearTimeout(timer);
        finish();
      });
    }

    window.addEventListener('keydown', function (evt) {
      if (evt.key === 'Escape') {
        window.clearTimeout(timer);
        finish();
      }
    });

    // Safety net in case tab was backgrounded
    window.setTimeout(finish, 4500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCampaignCover);
  } else {
    initCampaignCover();
  }
})();
