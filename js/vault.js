// =============================================
// MEMORY VAULT — Museum of Us
// Lives inside #tab-story. Firebase-backed.
// =============================================

let vaultData = {};
let vaultViewingId = null;
let vaultPoller = null;
let vaultLastUnlockedSeen = new Set();
let vaultSealing = 'none';

const VAULT_CATEGORIES = [
    { value: 'milestone', icon: '🏆', label: 'Milestone' },
    { value: 'monthsary', icon: '💕', label: 'Monthsary' },
    { value: 'quote',     icon: '💬', label: 'Quote' },
    { value: 'dream',     icon: '✨', label: 'Dream' },
    { value: 'song',      icon: '🎵', label: 'Song' },
    { value: 'moment',    icon: '📸', label: 'Moment' },
    { value: 'custom',    icon: '💎', label: 'Custom' }
];

function categoryIcon(cat) {
    const c = VAULT_CATEGORIES.find(x => x.value === cat);
    return c ? c.icon : '💎';
}

function authorNameFor(key) {
    if (!key) return '';
    if (!DATA || !DATA.couple) return key;
    return key === 'name1' ? DATA.couple.name1 : DATA.couple.name2;
}

function isUnlocked(m) {
    if (!m) return false;
    if (m.sealed === 'none' || !m.sealed) return true;
    if (m.sealed === 'time-locked') {
        return !m.unlockDate || Date.now() >= m.unlockDate;
    }
    if (m.sealed === 'mutual-unlock') {
        const mc = m.mutualContributions || {};
        return !!(mc.name1 && mc.name2);
    }
    return true;
}

function unlockCountdown(m) {
    if (m.sealed !== 'time-locked' || !m.unlockDate) return '';
    const diff = m.unlockDate - Date.now();
    if (diff <= 0) return 'Unlocked';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins  = Math.floor((diff % 3600000) / 60000);
    if (days > 0)  return `Unlocks in ${days} day${days > 1 ? 's' : ''} ${hours}h`;
    if (hours > 0) return `Unlocks in ${hours}h ${mins}m`;
    return `Unlocks in ${mins}m`;
}

function showVaultToast(msg) {
    const t = document.createElement('div');
    t.className = 'vault-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 400);
    }, 2400);
}

function vaultParseDate(s) {
    if (!s) return null;
    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    return d;
}

function persistVaultLocal() {
    saveLocal('re-vault', vaultData);
}

function initVault() {
    const fab = document.getElementById('vaultAddFab');
    if (fab) fab.addEventListener('click', openAddMemory);

    if (firebaseReady && roomId) {
        db.ref('rooms/' + roomId + '/vault').on('value', snap => {
            vaultData = snap.val() || {};
            renderVault();
        });
    } else {
        vaultData = JSON.parse(localStorage.getItem('re-vault') || '{}');
        renderVault();
    }

    // Poll every 30s for time-lock countdowns
    if (vaultPoller) clearInterval(vaultPoller);
    vaultPoller = setInterval(renderVault, 30000);

    // Re-render when tab regains focus (catches time-locks that elapsed)
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) renderVault();
    });

    renderVault();
}

function getOnThisDayMemory() {
    const today = new Date();
    const candidates = Object.entries(vaultData).filter(([id, m]) => {
        const d = vaultParseDate(m.date);
        if (!d) return false;
        return d.getMonth() === today.getMonth()
            && d.getDate() === today.getDate()
            && d.getFullYear() < today.getFullYear()
            && isUnlocked(m);
    });
    if (candidates.length === 0) return null;
    // Pick the closest past year (most recent)
    candidates.sort((a, b) => {
        const da = vaultParseDate(a[1].date);
        const db = vaultParseDate(b[1].date);
        return db.getFullYear() - da.getFullYear();
    });
    return candidates[0];
}

function renderOnThisDay() {
    const wrap = document.getElementById('onThisDayCard');
    if (!wrap) return;
    const found = getOnThisDayMemory();
    if (!found) {
        wrap.innerHTML = '';
        wrap.style.display = 'none';
        return;
    }
    const [id, m] = found;
    const d = vaultParseDate(m.date);
    const yearsAgo = new Date().getFullYear() - d.getFullYear();
    wrap.style.display = '';
    wrap.innerHTML = `
        <div class="on-this-day-plaque">
            <div class="on-this-day-eyebrow">On This Day</div>
            <div class="on-this-day-when">${yearsAgo} year${yearsAgo > 1 ? 's' : ''} ago</div>
            <h3 class="on-this-day-title">${escapeHtml(m.title)}</h3>
            <div class="on-this-day-date">${formatDate(m.date)}</div>
            <p class="on-this-day-note">— by ${escapeHtml(authorNameFor(m.author))}</p>
            <button class="on-this-day-btn" onclick="viewMemory('${id}')">Open Exhibit</button>
        </div>
    `;
}

function renderVault() {
    renderOnThisDay();
    const grid = document.getElementById('vaultGrid');
    if (!grid) return;

    const items = Object.entries(vaultData)
        .map(([id, m]) => ({ id, ...m }))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="vault-empty">
                <div class="vault-empty-icon">🏛️</div>
                <div class="vault-empty-text">The vault is empty.<br/>Place your first memory inside.</div>
            </div>
        `;
        return;
    }

    const newlyUnlocked = [];
    grid.innerHTML = items.map(m => {
        const unlocked = isUnlocked(m);
        const seenBefore = vaultLastUnlockedSeen.has(m.id);
        if (unlocked && !seenBefore && m.sealed && m.sealed !== 'none') {
            newlyUnlocked.push(m.id);
        }
        return renderVaultCard(m, unlocked);
    }).join('');

    // Track which ones are currently unlocked for next pass
    vaultLastUnlockedSeen = new Set(items.filter(m => isUnlocked(m)).map(m => m.id));

    // Trigger reveal animation + toast for newly unlocked
    if (newlyUnlocked.length > 0) {
        requestAnimationFrame(() => {
            newlyUnlocked.forEach(id => {
                const el = document.querySelector(`[data-vault-id="${id}"]`);
                if (el) el.classList.add('vault-reveal');
            });
        });
        showVaultToast('🔓 A capsule has unlocked!');
    }
}

function renderVaultCard(m, unlocked) {
    const cat = categoryIcon(m.category);
    const authorLabel = authorNameFor(m.author);
    const dateStr = m.date ? formatDate(m.date) : '';

    let sealedBadge = '';
    if (m.sealed === 'time-locked') {
        sealedBadge = `<div class="vault-seal-badge vault-seal-time">🔒 Time-Locked</div>`;
    } else if (m.sealed === 'mutual-unlock') {
        sealedBadge = `<div class="vault-seal-badge vault-seal-mutual">🤝 Mutual Unlock</div>`;
    }

    let previewBody = '';
    if (!unlocked && m.sealed === 'time-locked') {
        previewBody = `<div class="vault-card-locked">${unlockCountdown(m)}</div>`;
    } else if (!unlocked && m.sealed === 'mutual-unlock') {
        const mc = m.mutualContributions || {};
        const partnerKey = mc.name1 ? 'name2' : (mc.name2 ? 'name1' : (m.author === 'name1' ? 'name2' : 'name1'));
        const whoWaiting = authorNameFor(partnerKey);
        previewBody = `<div class="vault-card-locked">Waiting for ${escapeHtml(whoWaiting)}…</div>`;
    } else {
        const body = m.body || '';
        const trimmed = body.length > 110 ? body.slice(0, 107) + '…' : body;
        previewBody = trimmed ? `<div class="vault-card-body">${escapeHtml(trimmed)}</div>` : '';
    }

    let media = '';
    if (!unlocked && (m.sealed === 'time-locked' || m.sealed === 'mutual-unlock')) {
        media = `<div class="vault-card-seal-wrap">${waxSealSVG()}</div>`;
    } else if (m.photoPath) {
        media = `<div class="vault-card-photo"><img src="${escapeHtml(m.photoPath)}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"/></div>`;
    } else {
        media = `<div class="vault-card-icon">${cat}</div>`;
    }

    return `
        <div class="vault-card ${unlocked ? '' : 'vault-card-sealed'}" data-vault-id="${m.id}" onclick="viewMemory('${m.id}')">
            ${media}
            <div class="vault-card-content">
                <div class="vault-card-top">
                    <div class="vault-card-cat">${cat} ${escapeHtml(m.category || '')}</div>
                    ${sealedBadge}
                </div>
                <h3 class="vault-card-title">${escapeHtml(m.title)}</h3>
                ${dateStr ? `<div class="vault-card-date">${dateStr}</div>` : ''}
                ${previewBody}
                <div class="vault-card-foot">
                    <span class="vault-card-author">— ${escapeHtml(authorLabel)}</span>
                </div>
            </div>
        </div>
    `;
}

function waxSealSVG() {
    return `<svg class="vault-wax-seal" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
            <radialGradient id="waxGrad-${Date.now()}" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stop-color="#fde6a0"/>
                <stop offset="50%" stop-color="#e8b84a"/>
                <stop offset="100%" stop-color="#a8782a"/>
            </radialGradient>
        </defs>
        <circle cx="40" cy="40" r="34" fill="url(#waxGrad-${Date.now()})" stroke="#8a5a18" stroke-width="1.5"/>
        <circle cx="40" cy="40" r="26" fill="none" stroke="#8a5a18" stroke-width="0.8" stroke-dasharray="2 2" opacity="0.5"/>
        <text x="40" y="44" text-anchor="middle" font-family="Playfair Display, serif" font-size="11" font-weight="700" fill="#5a3a10" letter-spacing="2">SEALED</text>
    </svg>`;
}

function openAddMemory() {
    if (!userName) {
        const modal = document.getElementById('nameModal');
        if (modal) modal.classList.remove('hidden');
        return;
    }
    const m = document.getElementById('addMemoryModal');
    if (!m) return;
    document.getElementById('amTitle').value = '';
    document.getElementById('amDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('amBody').value = '';
    document.getElementById('amPhoto').value = '';
    document.getElementById('amCategory').value = 'moment';
    setVaultSeal('none');
    document.getElementById('amUnlockDate').value = '';
    document.getElementById('amError').style.display = 'none';
    m.classList.remove('hidden');
    requestAnimationFrame(() => m.classList.add('open'));
    setTimeout(() => document.getElementById('amTitle').focus(), 120);
}

function closeMemoryModal() {
    const a = document.getElementById('addMemoryModal');
    if (a && !a.classList.contains('hidden')) {
        a.classList.remove('open');
        setTimeout(() => a.classList.add('hidden'), 250);
    }
    const v = document.getElementById('viewMemoryModal');
    if (v && !v.classList.contains('hidden')) {
        v.classList.remove('open');
        setTimeout(() => v.classList.add('hidden'), 250);
    }
}

function setVaultSeal(s) {
    vaultSealing = s;
    document.querySelectorAll('input[name="amSeal"]').forEach(r => { r.checked = (r.value === s); });
    const ud = document.getElementById('amUnlockDateField');
    if (ud) ud.style.display = s === 'time-locked' ? '' : 'none';
}

function submitAddMemory() {
    const titleEl  = document.getElementById('amTitle');
    const dateEl   = document.getElementById('amDate');
    const bodyEl   = document.getElementById('amBody');
    const photoEl  = document.getElementById('amPhoto');
    const catEl    = document.getElementById('amCategory');
    const unlockEl = document.getElementById('amUnlockDate');
    const err      = document.getElementById('amError');

    const title = titleEl.value.trim();
    const date  = dateEl.value;
    const body  = bodyEl.value.trim();
    const photoPath = photoEl.value.trim();
    const category  = catEl.value;
    const seal      = vaultSealing;
    const unlockDateStr = unlockEl.value;

    if (!title)              { err.textContent = 'Please give your memory a title.'; err.style.display = ''; return; }
    if (title.length > 100)  { err.textContent = 'Title is too long (max 100).';    err.style.display = ''; return; }
    if (!date)               { err.textContent = 'Please pick a date.';              err.style.display = ''; return; }
    if (body.length > 2000)  { err.textContent = 'Body is too long (max 2000).';     err.style.display = ''; return; }
    if (seal === 'time-locked' && !unlockDateStr) { err.textContent = 'Pick an unlock date.'; err.style.display = ''; return; }
    if (seal === 'time-locked') {
        const ud = new Date(unlockDateStr + 'T12:00:00').getTime();
        if (ud <= Date.now()) { err.textContent = 'Unlock date must be in the future.'; err.style.display = ''; return; }
    }

    const myKey = userKey || 'name1';
    const mem = {
        type: seal === 'none' ? 'memory' : 'capsule',
        title: title.slice(0, 100),
        date: date,
        body: body,
        photoPath: photoPath || null,
        category: category,
        author: myKey,
        createdAt: Date.now(),
        sealed: seal,
        unlockDate: seal === 'time-locked' ? new Date(unlockDateStr + 'T12:00:00').getTime() : null,
        mutualContributions: seal === 'mutual-unlock' ? { [myKey]: body } : null
    };

    if (firebaseReady && roomId) {
        db.ref('rooms/' + roomId + '/vault').push(mem);
    } else {
        const id = 'm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
        vaultData[id] = mem;
        persistVaultLocal();
        renderVault();
    }

    closeMemoryModal();
    showVaultToast('Memory placed in the vault ✨');
}

function viewMemory(id) {
    vaultViewingId = id;
    const m = vaultData[id];
    if (!m) return;
    const mEl = document.getElementById('viewMemoryModal');
    if (!mEl) return;
    const unlocked = isUnlocked(m);
    const body = document.getElementById('vmContent');
    const authorLabel = authorNameFor(m.author);
    const dateStr = m.date ? formatDate(m.date) : '';
    const cat = categoryIcon(m.category);

    if (!unlocked && m.sealed === 'time-locked') {
        body.innerHTML = `
            <button class="vm-close" onclick="closeMemoryModal()" aria-label="Close">&times;</button>
            <div class="vm-locked">
                <div class="vm-locked-seal">${waxSealSVG()}</div>
                <h3 class="vm-locked-title">Sealed Capsule</h3>
                <p class="vm-locked-msg">${unlockCountdown(m)}</p>
                <p class="vm-locked-sub">This memory unlocks on <strong>${formatDate(new Date(m.unlockDate).toISOString().split('T')[0])}</strong></p>
            </div>
        `;
    } else if (!unlocked && m.sealed === 'mutual-unlock') {
        const mc = m.mutualContributions || {};
        const myKey = userKey || 'name1';
        const myPart = mc[myKey];
        const partnerKey = myKey === 'name1' ? 'name2' : 'name1';
        const partnerLabel = authorNameFor(partnerKey);
        const partnerDisplay = partnerLabel;
        let html = `
            <button class="vm-close" onclick="closeMemoryModal()" aria-label="Close">&times;</button>
            <div class="vm-locked">
                <div class="vm-locked-seal">${waxSealSVG()}</div>
                <h3 class="vm-locked-title">Mutual Capsule</h3>
                <p class="vm-locked-msg">Waiting for ${escapeHtml(partnerDisplay)} to write their part</p>
        `;
        if (myPart) {
            html += `
                <div class="vm-contrib-block">
                    <div class="vm-contrib-label">Your part · ${escapeHtml(authorNameFor(myKey))}</div>
                    <div class="vm-contrib-text">${escapeHtml(myPart)}</div>
                </div>
            `;
        } else {
            html += `
                <div class="vm-contrib-block">
                    <div class="vm-contrib-label">Write your part to ${escapeHtml(partnerDisplay)}</div>
                    <textarea class="vm-contrib-textarea" id="vmMyPart" placeholder="Dear ${escapeHtml(partnerDisplay)}…"></textarea>
                    <button class="vm-contrib-btn" onclick="saveMutualPart('${id}')">Seal my part</button>
                </div>
            `;
        }
        html += `</div>`;
        body.innerHTML = html;
    } else {
        let media = '';
        if (m.photoPath) {
            media = `<div class="vm-photo"><img src="${escapeHtml(m.photoPath)}" alt="" onerror="this.parentElement.style.display='none'"/></div>`;
        }
        let mutualHtml = '';
        if (m.sealed === 'mutual-unlock' && m.mutualContributions) {
            const mc = m.mutualContributions;
            mutualHtml = `
                <div class="vm-mutual">
                    ${mc.name1 ? `<div class="vm-contrib-block"><div class="vm-contrib-label">${escapeHtml(DATA.couple.name1)}</div><div class="vm-contrib-text">${escapeHtml(mc.name1)}</div></div>` : ''}
                    ${mc.name2 ? `<div class="vm-contrib-block"><div class="vm-contrib-label">${escapeHtml(DATA.couple.name2)}</div><div class="vm-contrib-text">${escapeHtml(mc.name2)}</div></div>` : ''}
                </div>
            `;
        }
        const showBody = m.body && m.sealed !== 'mutual-unlock';
        body.innerHTML = `
            <button class="vm-close" onclick="closeMemoryModal()" aria-label="Close">&times;</button>
            ${media}
            <div class="vm-meta">
                <span class="vm-cat">${cat} ${escapeHtml(m.category || '')}</span>
                ${dateStr ? `<span class="vm-date">${dateStr}</span>` : ''}
                <span class="vm-author">by ${escapeHtml(authorLabel)}</span>
            </div>
            <h2 class="vm-title">${escapeHtml(m.title)}</h2>
            ${showBody ? `<div class="vm-body">${escapeHtml(m.body)}</div>` : ''}
            ${mutualHtml}
            <button class="vm-delete" onclick="deleteMemory('${id}')">Remove from vault</button>
        `;
    }
    mEl.classList.remove('hidden');
    requestAnimationFrame(() => mEl.classList.add('open'));
}

function saveMutualPart(id) {
    const ta = document.getElementById('vmMyPart');
    if (!ta) return;
    const text = ta.value.trim();
    if (!text) return;
    const m = vaultData[id];
    if (!m) return;
    const myKey = userKey || 'name1';
    const mc = m.mutualContributions || {};
    mc[myKey] = text;
    if (firebaseReady && roomId) {
        db.ref('rooms/' + roomId + '/vault/' + id + '/mutualContributions').set(mc);
    } else {
        m.mutualContributions = mc;
        vaultData[id] = m;
        persistVaultLocal();
        renderVault();
    }
    showVaultToast('Your part is sealed 🤝');
    setTimeout(() => viewMemory(id), 200);
}

function deleteMemory(id) {
    if (!confirm("Remove this memory from the vault? This can't be undone.")) return;
    if (firebaseReady && roomId) {
        db.ref('rooms/' + roomId + '/vault/' + id).remove();
    } else {
        delete vaultData[id];
        persistVaultLocal();
        renderVault();
    }
    closeMemoryModal();
    showVaultToast('Memory removed from the vault');
}

// Wire window exports
window.initVault = initVault;
window.openAddMemory = openAddMemory;
window.closeMemoryModal = closeMemoryModal;
window.deleteMemory = deleteMemory;
window.viewMemory = viewMemory;
window.setVaultSeal = setVaultSeal;
window.submitAddMemory = submitAddMemory;
window.saveMutualPart = saveMutualPart;
