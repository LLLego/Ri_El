// =============================================
// TABS
// =============================================

function initTabs() {
    document.querySelectorAll('.tab-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            pill.classList.add('active');
            const tab = document.getElementById('tab-' + pill.dataset.tab);
            if (tab) {
                tab.classList.add('active');
                // Re-init scroll reveal for newly visible elements
                setTimeout(() => initScrollReveal(), 100);
            }
            // Show/hide theme switcher based on tab
            document.getElementById('themeSwitcher').style.display = pill.dataset.tab === 'story' ? '' : 'none';
        });
    });
}

// =============================================
// SCROLL TO TOP
// =============================================

function initScrollTop() {
    const btn = document.getElementById('scrollTop');
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
}

// =============================================
// SCROLL REVEAL
// =============================================

function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => observer.observe(el));
}
