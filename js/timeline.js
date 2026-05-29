// =============================================
// COUNTERS
// =============================================
function updateCounters() {
    const start = new Date(DATA.couple.start_date);
    const now = new Date();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    let totalPhotos = 0;
    DATA.monthsaries.forEach(m => { if (m.photos) totalPhotos += m.photos.length; });
    animateNumber('daysCount', days);
    animateNumber('monthsCount', 15);
    animateNumber('photosCount', totalPhotos);
    document.getElementById('logoDisplay').textContent = DATA.couple.initials;
}

function animateNumber(elId, target) {
    const el = document.getElementById(elId);
    const current = parseInt(el.textContent) || 0;
    if (current === target) { el.textContent = target; return; }
    const step = Math.ceil(Math.abs(target - current) / 30);
    const inc = target > current ? step : -step;
    let val = current;
    const interval = setInterval(() => {
        val += inc;
        if ((inc > 0 && val >= target) || (inc < 0 && val <= target)) { val = target; clearInterval(interval); }
        el.textContent = val;
    }, 30);
}

// =============================================
// MONTHSARY RENDERER
// =============================================
function ordinal(n) {
    const s = ['th','st','nd','rd'];
    const v = n % 100;
    return n + (s[(v-20)%10] || s[v] || s[0]);
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function buildTimeline() {
    const container = document.getElementById('timelineContainer');
    const milestones = (DATA.milestones || []).map(m => ({...m, type: 'milestone'}));
    const monthsaries = (DATA.monthsaries || []).map(m => ({...m, type: 'monthsary'}));
    const quotes = (DATA.quotes || []).map(q => ({text: q, type: 'quote', date: '2025-07-01'}));

    // Merge all entries and sort by date
    const all = [...milestones, ...monthsaries].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Interleave quotes between entries
    const merged = [];
    all.forEach((item, i) => {
        merged.push(item);
        if (quotes[i]) merged.push(quotes[i]);
    });
    // Add remaining quotes at end
    for (let i = all.length; i < quotes.length; i++) merged.push(quotes[i]);

    // Random masonry row spans for varied gallery heights
    const rowSpans = [18, 22, 16, 20, 24, 19, 21, 17, 23, 20, 18, 22, 15, 25, 19];

    merged.forEach((item, idx) => {
        const entry = document.createElement('div');
        entry.className = 'timeline-entry reveal';
        entry.style.transitionDelay = (idx * 0.08) + 's';

        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        entry.appendChild(marker);

        const card = document.createElement('div');
        card.className = 'timeline-card';

        if (item.type === 'monthsary') {
            const m = item;
            card.innerHTML = `
                <div class="monthsary-card" data-theme="${m.theme || DATA.themes.default}">
                    <div class="monthsary-header">
                        <div class="monthsary-number">${ordinal(m.number)} Monthsary</div>
                        <div class="monthsary-date">${formatDate(m.date)}</div>
                        <div class="monthsary-title">${m.title || 'Happy ' + ordinal(m.number) + ' Monthsary Baby'}</div>
                    </div>
                    <div class="monthsary-body">
                        ${m.letter ? `
                        <div class="letter-section">
                            <div class="letter-text" data-letter="${m.letter.replace(/"/g, '&quot;')}"><span class="letter-content"></span><span class="letter-cursor"></span></div>
                            <div class="letter-signoff">— ${DATA.couple.name1}</div>
                        </div>` : ''}
                        ${m.photos && m.photos.length > 0 ? `
                        <div class="card-gallery">
                            ${m.photos.map((p, pi) => `
                            <div class="card-gallery-item" style="--row-span: ${rowSpans[pi % rowSpans.length]}" onclick="openLightbox('${p.file.replace(/'/g, "\\'")}', '${p.caption.replace(/'/g, "\\'")}')">
                                <img src="${p.file}" alt="${p.caption}" loading="eager">
                                <div class="card-gallery-caption">${p.caption}</div>
                            </div>`).join('')}
                        </div>` : ''}
                        ${m.dreams_life && m.dreams_life.length > 0 ? `
                        <div class="dreams-mini">
                            <div class="dreams-mini-col">
                                <h4>Life Dreams</h4>
                                <ul>${m.dreams_life.map(d => `<li>${d}</li>`).join('')}</ul>
                            </div>
                            <div class="dreams-mini-col">
                                <h4>This Month</h4>
                                <ul>${(m.dreams_month || []).map(d => `<li>${d}</li>`).join('')}</ul>
                            </div>
                        </div>` : ''}
                        ${m.songs && m.songs.length > 0 ? `
                        <div class="song-list-mini">
                            ${m.songs.map(s => `<span class="song-chip">${s.title} — ${s.artist}</span>`).join('')}
                        </div>` : ''}
                    </div>
                </div>
            `;
        } else if (item.type === 'milestone') {
            const icons = {heart: '&#9829;', star: '&#9733;', music: '&#9835;', sparkle: '&#10022;', gift: '&#127873;', cake: '&#127856;', compass: '&#10024;'};
            card.innerHTML = `
                <div class="milestone-card">
                    <div class="milestone-icon">${icons[item.icon] || '&#10022;'}</div>
                    <div class="milestone-title">${item.title}</div>
                    <div class="milestone-text">${item.text}</div>
                </div>
            `;
        } else if (item.type === 'quote') {
            card.innerHTML = `
                <div class="timeline-quote">
                    <div class="timeline-quote-mark">&ldquo;</div>
                    <div class="timeline-quote-text">${item.text}</div>
                    <div class="timeline-quote-heart">&#9829;</div>
                </div>
            `;
        }

        entry.appendChild(card);
        container.appendChild(entry);
    });

    // Closing note
    const closing = document.createElement('div');
    closing.className = 'timeline-closing reveal';
    closing.innerHTML = `
        <div class="timeline-closing-text">
            made with love for my baby ♡<br>
            <span class="timeline-closing-sub">every day with you is a story worth telling</span>
        </div>
    `;
    container.appendChild(closing);
}

// =============================================
// SONG WALL
// =============================================
function buildSongWall() {
    const container = document.getElementById('songWallContainer');
    const seen = new Set();
    DATA.monthsaries.forEach(m => {
        if (!m.songs) return;
        m.songs.forEach(s => {
            const key = s.title + s.artist;
            if (seen.has(key)) return;
            seen.add(key);
            const card = document.createElement('div');
            card.className = 'song-wall-card reveal-scale';
            card.innerHTML = `
                <div class="song-wall-title">${s.title}</div>
                <div class="song-wall-meta">${s.artist}</div>
                <div class="song-wall-monthsary">&#9835; Monthsary ${m.number}</div>
            `;
            container.appendChild(card);
        });
    });
    if (seen.size === 0) {
        container.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px;">Add songs to your monthsaries and they\'ll appear here</p>';
    }
}

// =============================================
// LIGHTBOX
// =============================================
function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    document.getElementById('lightboxImg').src = src;
    document.getElementById('lightboxCaption').textContent = caption || '';
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeLightbox(event) {
    const lb = document.getElementById('lightbox');
    if (!event || event.target === lb || event.target.classList.contains('lightbox-close')) {
        lb.classList.remove('active');
        document.body.style.overflow = '';
    }
}
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox({target: document.getElementById('lightbox')});
});

// Force-load all gallery images (fixes lazy loading not triggering for off-screen images)
(function forceLoadGalleryImages() {
    // Use IntersectionObserver with generous margin to preload images before they're visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                img.dataset.galleryProcessed = '1'; // never blank this image again
            }
            observer.unobserve(img);
        });
    }, { rootMargin: '500px' });

    // Process gallery images: move src to data-src and observe
    const setupImages = () => {
        document.querySelectorAll('.card-gallery-item img').forEach(img => {
            // Skip if already processed or already restored
            if (img.dataset.galleryProcessed) return;
            if (img.src && !img.dataset.src) {
                img.dataset.src = img.src;
                img.src = '';
                observer.observe(img);
            }
        });
    };

    // Run after timeline renders
    if (document.readyState === 'complete') {
        setTimeout(setupImages, 100);
    } else {
        window.addEventListener('load', () => setTimeout(setupImages, 100));
    }

    // MutationObserver REMOVED — it created an infinite loop:
    // typewriter span → mutation → setupImages blanks src → img reloads → mutation → repeat
    // If timeline re-renders, call setupImages() explicitly instead.
})();
