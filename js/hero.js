// =============================================
// TYPEWRITER EFFECT ON LETTERS
// Reflow-free: pre-renders all chars as <span> with
// visibility:hidden, then reveals them one by one.
// visibility is paint-only → zero layout reflow.
// =============================================
function initTypewriterLetters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.typed) {
                entry.target.dataset.typed = '1';
                const fullText = entry.target.dataset.letter;
                const section = entry.target;
                const contentEl = section.querySelector('.letter-content');
                const cursorEl = section.querySelector('.letter-cursor');

                // Set full text temporarily to measure final height
                contentEl.textContent = fullText;
                const finalHeight = section.offsetHeight;
                section.style.minHeight = finalHeight + 'px';
                contentEl.textContent = '';

                // Build all character spans at once (single reflow)
                const fragment = document.createDocumentFragment();
                const spans = [];
                for (let i = 0; i < fullText.length; i++) {
                    const span = document.createElement('span');
                    span.textContent = fullText[i];
                    span.style.visibility = 'hidden';
                    fragment.appendChild(span);
                    spans.push(span);
                }
                contentEl.appendChild(fragment);

                // Reveal characters one by one (visibility change = paint only)
                let i = 0;
                const speed = 25;
                function reveal() {
                    if (i < spans.length) {
                        spans[i].style.visibility = 'visible';
                        i++;
                        setTimeout(reveal, speed + Math.random() * 15);
                    } else {
                        setTimeout(() => { if (cursorEl) cursorEl.style.display = 'none'; }, 2000);
                    }
                }
                reveal();
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.letter-text[data-letter]').forEach(el => observer.observe(el));
}

// =============================================
// FLOATING DECORATIONS
// =============================================
function initFloatingDecorations() {
    // front: true = rendered IN FRONT of the hero (z-index 10).
    // Bumped opacity 0.13-0.16 → 0.20-0.30 so characters pop on
    // the dark background. New chibi characters added at the end.
    const decoConfigs = [
        { id: 'decoTigger',       size: 150, opacity: 0.28, zone: { xMin: 2,  xMax: 32, yMin: 3,  yMax: 48 }, pos: { x: 7,  y: 16 }, front: true },
        { id: 'decoPucca',        size: 120, opacity: 0.28, zone: { xMin: 60, xMax: 96, yMin: 3,  yMax: 45 }, pos: { x: 88, y: 12 }, front: true },
        { id: 'decoPoco',         size: 105, opacity: 0.22, zone: { xMin: 15, xMax: 45, yMin: 18, yMax: 55 }, pos: { x: 30, y: 42 } },
        { id: 'decoKuromi',       size: 95,  opacity: 0.20, zone: { xMin: 55, xMax: 85, yMin: 25, yMax: 58 }, pos: { x: 72, y: 48 } },
        { id: 'decoCinnamoroll',  size: 100, opacity: 0.22, zone: { xMin: 5,  xMax: 35, yMin: 35, yMax: 62 }, pos: { x: 18, y: 58 } },
        { id: 'decoHelloKitty',   size: 90,  opacity: 0.20, zone: { xMin: 60, xMax: 90, yMin: 8,  yMax: 50 }, pos: { x: 78, y: 26 } },
        { id: 'decoTotoro',       size: 130, opacity: 0.20, zone: { xMin: 35, xMax: 65, yMin: 12, yMax: 52 }, pos: { x: 50, y: 35 } },
        { id: 'decoOctopus',      size: 105, opacity: 0.22, zone: { xMin: 10, xMax: 40, yMin: 8,  yMax: 50 }, pos: { x: 22, y: 22 } },
        { id: 'decoStar',         size: 85,  opacity: 0.24, zone: { xMin: 50, xMax: 80, yMin: 40, yMax: 65 }, pos: { x: 65, y: 55 } },
        { id: 'decoHeartWing',    size: 95,  opacity: 0.24, zone: { xMin: 30, xMax: 60, yMin: 3,  yMax: 42 }, pos: { x: 45, y: 18 } },
        { id: 'decoChibiBatman',  size: 110, opacity: 0.25, zone: { xMin: 35, xMax: 75, yMin: 40, yMax: 70 }, pos: { x: 55, y: 55 } },
        { id: 'decoChibiGhost',   size: 90,  opacity: 0.24, zone: { xMin: 8,  xMax: 38, yMin: 45, yMax: 70 }, pos: { x: 18, y: 62 } },
        { id: 'decoChibiMoon',    size: 100, opacity: 0.25, zone: { xMin: 60, xMax: 92, yMin: 42, yMax: 68 }, pos: { x: 82, y: 58 }, front: true },
    ];

    const vpW = () => window.innerWidth;
    const vpH = () => window.innerHeight;

    const items = decoConfigs.map(cfg => {
        const el = document.getElementById(cfg.id);
        if (!el) return null;
        // Set static styles once — position via CSS top:0 left:0, movement via transform only
        el.style.width = cfg.size + 'px';
        el.style.opacity = cfg.opacity;
        el.style.position = 'fixed';
        el.style.top = '0';
        el.style.left = '0';
        el.style.pointerEvents = 'none';
        el.style.zIndex = cfg.front ? '10' : '-1';
        el.style.willChange = 'transform';
        if (cfg.front) el.classList.add('front');
        const speedMult = 0.7 + Math.random() * 0.6;
        return {
            el,
            x: cfg.pos.x, y: cfg.pos.y,
            vx: (Math.random() - 0.5) * 0.03 * speedMult,
            vy: (Math.random() - 0.5) * 0.025 * speedMult,
            zone: cfg.zone,
            rotBase: Math.random() * 360,
            rotSpeed: 0.3 + Math.random() * 0.4,
            phaseX: Math.random() * Math.PI * 2,
            phaseY: Math.random() * Math.PI * 2,
            oscFreqX: 0.5 + Math.random() * 0.8,
            oscFreqY: 0.4 + Math.random() * 0.7,
            size: cfg.size,
        };
    }).filter(Boolean);

    // Fade the floating chars out once the hero scrolls out of view,
    // so they stop painting on top of the timeline / Memory Vault.
    // Together tab is handled separately by body.together-active (see polish.css).
    const hero = document.getElementById('heroSection') || document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) {
        const io = new IntersectionObserver(([entry]) => {
            document.body.classList.toggle('hero-out', !entry.isIntersecting);
        }, { threshold: 0.15 });
        io.observe(hero);
    }

    let time = 0;
    function floatLoop() {
        time += 0.008;
        const vw = vpW(), vh = vpH();
        items.forEach(item => {
            item.x += item.vx + Math.sin(time * item.oscFreqX + item.phaseX) * 0.004;
            item.y += item.vy + Math.cos(time * item.oscFreqY + item.phaseY) * 0.004;
            const { xMin, xMax, yMin, yMax } = item.zone;
            if (item.x < xMin || item.x > xMax) item.vx *= -1;
            if (item.y < yMin || item.y > yMax) item.vy *= -1;
            item.x = Math.max(xMin - 2, Math.min(xMax + 2, item.x));
            item.y = Math.max(yMin - 2, Math.min(yMax + 2, item.y));
            // Convert viewport % to px offsets from top-left origin
            const tx = (item.x / 100) * vw;
            const ty = (item.y / 100) * vh;
            const rot = item.rotBase + Math.sin(time * item.rotSpeed) * 12;
            // Only transform changes — GPU composited, no layout reflow
            item.el.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
        });
        requestAnimationFrame(floatLoop);
    }
    floatLoop();
}

// =============================================
// SPARKLE TRAIL
// =============================================
function initSparkleTrail() {
    const symbols = ['\u2728', '\u2B50', '\u2764', '\u1F4AB', '\u2726', '\u1F496', '\u1F31F'];
    let timeout;
    document.addEventListener('mousemove', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const spark = document.createElement('div');
            spark.className = 'sparkle';
            spark.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            spark.style.left = (e.clientX - 6) + 'px';
            spark.style.top = (e.clientY - 6) + 'px';
            const angle = Math.random() * Math.PI * 2;
            const dist = 30 + Math.random() * 50;
            spark.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            spark.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 1200);
        }, 80);
    });
}

// =============================================
// PARTICLE CANVAS (Hero)
// =============================================
function initParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = canvas.parentElement.offsetWidth;
        h = canvas.height = canvas.parentElement.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 2 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.pulse = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.02 + 0.005;
            // Occasionally make heart-shaped
            this.isHeart = Math.random() < 0.15;
            if (this.isHeart) { this.size = Math.random() * 3 + 2; this.opacity *= 0.4; }
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.pulse += this.pulseSpeed;
            if (this.x < -10 || this.x > w + 10 || this.y < -10 || this.y > h + 10) this.reset();
        }
        draw() {
            const o = this.opacity * (0.6 + 0.4 * Math.sin(this.pulse));
            ctx.globalAlpha = o;
            if (this.isHeart) {
                ctx.fillStyle = '#e06080';
                ctx.font = `${this.size * 4}px serif`;
                ctx.fillText('\u2665', this.x, this.y);
            } else {
                ctx.fillStyle = '#e8b84a';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => { p.update(); p.draw(); });
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }
    animate();
}

// =============================================
// HERO UPDATE
// =============================================
function updateHero() {
    const latest = DATA.monthsaries[DATA.monthsaries.length - 1];
    document.getElementById('heroTitle').textContent = latest.title || 'Happy ' + ordinal(latest.number) + ' Monthsary Baby';
    document.getElementById('heroSubtitle').textContent = latest.subtitle || '';
    document.getElementById('heroInitials').textContent = DATA.couple.initials;
    if (latest.theme) {
        applyTheme(latest.theme);
        document.querySelectorAll('.theme-dot').forEach(d => {
            d.classList.toggle('active', d.dataset.theme === latest.theme);
        });
    }
}
