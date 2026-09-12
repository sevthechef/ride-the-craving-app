// Reliable poster hit-testing: one click surface, two non-overlapping artwork regions.
// This avoids stacking/overlay drift on mobile Safari.
document.addEventListener('click', (event) => {
  const screen = event.target.closest('.screen');
  const hero = screen?.querySelector('.hero-card');
  if (!hero) return;

  // Only handle taps on the poster/home controls.
  if (!event.target.closest('.hero-card, .hero-actions, .home-meta')) return;

  const rect = hero.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;

  // Coordinates match poster_prod.jpg (740 × 1600).
  const inStart = x >= 0.075 && x <= 0.665 && y >= 0.252 && y <= 0.306;
  const inHistory = x >= 0.075 && x <= 0.555 && y >= 0.315 && y <= 0.365;

  if (inStart) {
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelector('[data-action="start"]')?.click();
  } else if (inHistory) {
    event.preventDefault();
    event.stopImmediatePropagation();
    document.querySelector('[data-action="history"]')?.click();
  }
}, true);
