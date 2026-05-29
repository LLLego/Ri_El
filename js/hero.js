// =============================================
// TYPEWRITER EFFECT ON LETTERS
// =============================================
function initTypewriterLetters() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.typed) {
                entry.target.dataset.typed = '1';
                const fullText = entry.target.dataset.letter;
                const contentEl = entry.target.querySelector('.letter-content');
                const cursorEl = entry.target.querySelector('.letter-cursor');
                let i = 0;
                const speed = 25; // ms per character
                function type() {
                    if (i < fullText.length) {
                        contentEl.textContent += fullText[i];
                        i++;
                        setTimeout(type, speed + Math.random() * 15);
                    } else {
                        // Remove cursor after done
                        setTimeout(() => { if (cursorEl) cursorEl.style.display = 'none'; }, 2000);
                    }
                }
                type();
            }
        });
    }, { threshold: 0.3 });

    document.querySelectorAll('.letter-text[data-letter]').forEach(el => observer.observe(el));
}

// =============================================
// FLOATING DECORATIONS
// =============================================
function initFloatingDecorations() {
    const decoConfigs = [
        { id: 'decoTigger',     size: 140, opacity: 0.15, zone: { xMin: 1,  xMax: 30, yMin: 5, yMax: 50 }, pos: { x: 5,  y: 85 }, anchor: 'bottom-left' },
        { id: 'decoPucca',      size: 110, opacity: 0.15, zone: { xMin: 65, xMax: 95, yMin: 5, yMax: 50 }, pos: { x: 88, y: 15 }, anchor: 'top-right' },
        { id: 'decoPoco',       size: 100, opacity: 0.14, zone: { xMin: 15, xMax: 45, yMin: 20, yMax: 70 }, pos: { x: 30, y: 50 }, anchor: 'center-left' },
        { id: 'decoKuromi',     size: 90,  opacity: 0.13, zone: { xMin: 55, xMax: 85, yMin: 30, yMax: 80 }, pos: { x: 72, y: 55 }, anchor: 'center-right' },
        { id: 'decoCinnamoroll', size: 95,  opacity: 0.14, zone: { xMin: 5,  xMax: 35, yMin: 40, yMax: 85 }, pos: { x: 18, y: 70 }, anchor: 'bottom-left' },
        { id: 'decoHelloKitty', size: 85,  opacity: 0.13, zone: { xMin: 60, xMax: 90, yMin: 10, yMax: 55 }, pos: { x: 78, y: 30 }, anchor: 'top-right' },
        { id: 'decoTotoro',     size: 120, opacity: 0.12, zone: { xMin: 35, xMax: 65, yMin: 15, yMax: 65 }, pos: { x: 50, y: 40 }, anchor: 'center' },
        { id: 'decoOctopus',    size: 100, opacity: 0.14, zone: { xMin: 10, xMax: 40, yMin: 10, yMax: 55 }, pos: { x: 22, y: 25 }, anchor: 'top-left' },
        { id: 'decoStar',       size: 80,  opacity: 0.15, zone: { xMin: 50, xMax: 80, yMin: 50, yMax: 90 }, pos: { x: 65, y: 75 }, anchor: 'bottom-right' },
        { id: 'decoHeartWing',  size: 90,  opacity: 0.16, zone: { xMin: 30, xMax: 60, yMin: 5, yMax: 45 }, pos: { x: 45, y: 20 }, anchor: 'top-center' },
    ];

    const items = decoConfigs.map(cfg => {
        const el = document.getElementById(cfg.id);
        if (!el) return null;
        el.style.width = cfg.size + 'px';
        el.style.opacity = cfg.opacity;
        const { xMin, xMax, yMin, yMax } = cfg.zone;
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
            anchor: cfg.anchor,
        };
    }).filter(Boolean);

    let time = 0;
    function floatLoop() {
        time += 0.008;
        items.forEach(item => {
            item.x += item.vx + Math.sin(time * item.oscFreqX + item.phaseX) * 0.004;
            item.y += item.vy + Math.cos(time * item.oscFreqY + item.phaseY) * 0.004;
            const { xMin, xMax, yMin, yMax } = item.zone;
            if (item.x < xMin || item.x > xMax) item.vx *= -1;
            if (item.y < yMin || item.y > yMax) item.vy *= -1;
            item.x = Math.max(xMin - 2, Math.min(xMax + 2, item.x));
            item.y = Math.max(yMin - 2, Math.min(yMax + 2, item.y));
            const rot = item.rotBase + Math.sin(time * item.rotSpeed) * 12;
            if (item.anchor === 'bottom-left') {
                item.el.style.cssText = `width:${item.el.style.width};opacity:${item.el.style.opacity};position:fixed;pointer-events:none;z-index:-1;bottom:${100-item.y}%;left:${item.x}%;transform:rotate(${rot}deg);transition:opacity 0.5s ease;`;
            } else if (item.anchor === 'top-right') {
                item.el.style.cssText = `width:${item.el.style.width};opacity:${item.el.style.opacity};position:fixed;pointer-events:none;z-index:-1;top:${item.y}%;right:${100-item.x}%;transform:rotate(${rot}deg);transition:opacity 0.5s ease;`;
            } else if (item.anchor === 'center-right') {
                item.el.style.cssText = `width:${item.el.style.width};opacity:${item.el.style.opacity};position:fixed;pointer-events:none;z-index:-1;top:${item.y}%;left:${item.x}%;transform:rotate(${rot}deg);transition:opacity 0.5s ease;`;
            } else if (item.anchor === 'bottom-right') {
                item.el.style.cssText = `width:${item.el.style.width};opacity:${item.el.style.opacity};position:fixed;pointer-events:none;z-index:-1;bottom:${100-item.y}%;right:${100-item.x}%;transform:rotate(${rot}deg);transition:opacity 0.5s ease;`;
            } else {
                item.el.style.cssText = `width:${item.el.style.width};opacity:${item.el.style.opacity};position:fixed;pointer-events:none;z-index:-1;top:${item.y}%;left:${item.x}%;transform:rotate(${rot}deg);transition:opacity 0.5s ease;`;
            }
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
