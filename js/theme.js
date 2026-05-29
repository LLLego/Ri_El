// =============================================
// THEME SYSTEM
// =============================================

function applyTheme(themeKey) {
    const t = DATA.themes.options[themeKey] || DATA.themes.options[DATA.themes.default];
    const root = document.documentElement;
    root.style.setProperty('--bg-primary', t.bg_primary);
    root.style.setProperty('--bg-secondary', t.bg_secondary);
    root.style.setProperty('--bg-card', t.bg_card);
    root.style.setProperty('--text-primary', t.text_primary);
    root.style.setProperty('--text-secondary', t.text_secondary);
    root.style.setProperty('--text-muted', t.text_muted);
    root.style.setProperty('--accent-warm', t.accent_warm);
    root.style.setProperty('--accent-gold', t.accent_gold);
    root.style.setProperty('--accent-pink', t.accent_pink);
    root.style.setProperty('--accent-blue', t.accent_blue);
    localStorage.setItem('re-theme', themeKey);
}

function initThemeSwitcher() {
    const container = document.getElementById('themeSwitcher');
    const saved = localStorage.getItem('re-theme') || DATA.themes.default;
    Object.entries(DATA.themes.options).forEach(([key, t]) => {
        const dot = document.createElement('div');
        dot.className = 'theme-dot' + (key === saved ? ' active' : '');
        dot.style.background = `linear-gradient(135deg, ${t.accent_warm}, ${t.accent_gold})`;
        dot.title = t.name;
        dot.dataset.theme = key;
        dot.onclick = () => {
            document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            applyTheme(key);
        };
        container.appendChild(dot);
    });
    applyTheme(saved);
}
