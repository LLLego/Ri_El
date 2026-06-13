// =============================================
// OPENING.JS — Login transition animation
// Heart-burst confetti from the submit button,
// optional native View Transition API cross-fade.
// Respects prefers-reduced-motion.
// =============================================

function burstHearts(originEl) {
    if (!originEl) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.body.dataset.openingBurstFired === '1') return;
    document.body.dataset.openingBurstFired = '1';

    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const glyphs = ['💕', '♥', '💖', '✨', '🌸', '💗', '🦆', '🐯'];
    const count = 16;

    for (let i = 0; i < count; i++) {
        const h = document.createElement('div');
        h.className = 'heart-burst';
        h.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
        // Spread roughly evenly with a touch of randomness
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const dist = 90 + Math.random() * 100;
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist;
        const rot = (Math.random() - 0.5) * 240;
        h.style.setProperty('--dx', dx + 'px');
        h.style.setProperty('--dy', dy + 'px');
        h.style.setProperty('--rot', rot + 'deg');
        h.style.left = cx + 'px';
        h.style.top = cy + 'px';
        h.style.fontSize = (1.1 + Math.random() * 0.9) + 'rem';
        h.style.animationDelay = (i * 14) + 'ms';
        document.body.appendChild(h);
        setTimeout(() => h.remove(), 1300);
    }
    // Reset the one-shot guard after the burst fully clears so a manual
    // logout/login cycle gets a fresh burst next time.
    setTimeout(() => { delete document.body.dataset.openingBurstFired; }, 1500);
}

function startViewTransition(callback) {
    if (typeof document.startViewTransition !== 'function') {
        callback();
        return;
    }
    try {
        document.startViewTransition(() => {
            callback();
            return Promise.resolve();
        });
    } catch (e) {
        callback();
    }
}

window.burstHearts = burstHearts;
window.startViewTransition = startViewTransition;
