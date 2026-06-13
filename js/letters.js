// --- Love Letters ---
// letterRecipient declared in state.js

function toggleLetterRecipient() {
    letterRecipient = letterRecipient === 'name1' ? 'name2' : 'name1';
    document.getElementById('letterRecipientName').textContent = letterRecipient === 'name1' ? DATA.couple.name1 : DATA.couple.name2;
}

function sendLetter() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const textarea = document.getElementById('letterTextarea');
    const text = textarea.value.trim();
    if (!text) return;
    // Seal animation
    const compose = document.getElementById('letterCompose');
    compose.classList.add('letter-sealing');
    setTimeout(() => {
        const letter = { text, from: userName, to: letterRecipient, timestamp: Date.now(), read: false };
        if (firebaseReady) {
            db.ref(`rooms/${roomId}/letters`).push(letter);
        } else {
            const letters = JSON.parse(localStorage.getItem('re-letters') || '[]');
            letters.unshift(letter);
            saveLocal('re-letters', letters);
            renderLetters(letters);
        }
        textarea.value = '';
        compose.classList.remove('letter-sealing');
    }, 600);
}

function markLetterRead(id) {
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/letters/${id}/read`).set(true);
    } else {
        const letters = JSON.parse(localStorage.getItem('re-letters') || '[]');
        const idx = parseInt(id);
        if (letters[idx]) letters[idx].read = true;
        saveLocal('re-letters', letters);
        renderLetters(letters);
    }
}

// openedLetter declared in state.js

function renderLetters(letters) {
    const inbox = document.getElementById('lettersInbox');
    if (openedLetter !== null) {
        const letter = letters.find((l, i) => (l.id || i.toString()) === openedLetter);
        if (letter) {
            inbox.innerHTML = `
                <button class="letter-back-btn" onclick="openedLetter=null;renderLetters(getCurrentLetters())">&larr; Back to inbox</button>
                <div class="letter-opened">
                    <div class="letter-opened-text">${escapeHtml(letter.text)}</div>
                    <div class="letter-opened-from">With love, ${escapeHtml(letter.from)}</div>
                </div>
            `;
            return;
        }
    }

    const youKey = userKey || 'name1';
    // Show letters addressed to you
    const myLetters = letters.filter(l => l.to === youKey);
    if (myLetters.length === 0) {
        inbox.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;font-size:0.85rem;">No letters yet. Write one!</p>';
        return;
    }
    inbox.innerHTML = myLetters.map((l, i) => {
        const id = l.id || i.toString();
        const isUnread = !l.read;
        return `
        <div class="letter-envelope ${isUnread ? 'unread' : ''}" onclick="openLetter('${id}')">
            <span class="letter-envelope-icon">${isUnread ? '\u2709' : '\u2709'}</span>
            <span class="letter-envelope-from">From ${escapeHtml(l.from)}</span>
            <span class="letter-envelope-time">${formatRelativeTime(l.timestamp)}</span>
            ${isUnread ? '<span class="new-badge">NEW</span>' : ''}
        </div>`;
    }).join('');
}

function getCurrentLetters() {
    return JSON.parse(localStorage.getItem('re-letters') || '[]');
}

function openLetter(id) {
    markLetterRead(id);
    openedLetter = id;
    if (firebaseReady) {
        // Re-render will happen via listener
    } else {
        renderLetters(getCurrentLetters());
    }
}

// =============================================
// OPEN WHEN LETTERS
// =============================================
// OPEN_WHEN_PROMPTS declared in state.js
// =============================================
// OPEN WHEN LETTERS
// =============================================
// OPEN_WHEN_PROMPTS declared in state.js
// owViewingLetter declared in state.js

function initOpenWhen() {
    const container = document.getElementById('openWhenContent');
    if (!container) return;
    if (owViewingLetter) {
        renderOwLetter(owViewingLetter);
        return;
    }
    container.innerHTML = `
        <div class="ow-grid" id="owGrid"></div>
        <div class="ow-compose-area">
            <div style="font-family:'Caveat',cursive;font-size:1rem;color:var(--accent-gold);margin-bottom:8px;">Write a letter</div>
            <select class="ow-compose-select" id="owPromptSelect">
                ${OPEN_WHEN_PROMPTS.map(p => `<option value="${p.id}">${p.label}</option>`).join('')}
            </select>
            <textarea class="journal-textarea" id="owLetterTextarea" placeholder="Dear [name]..." style="min-height:60px;"></textarea>
            <button class="journal-save-btn" onclick="saveOwLetter()">Seal Letter</button>
        </div>
    `;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/openwhen`).on('value', snap => {
            renderOwGrid(snap.val() || {});
        });
    } else {
        renderOwGrid({});
    }
}

function renderOwGrid(data) {
    const grid = document.getElementById('owGrid');
    if (!grid) return;
    const partnerKey = userKey === 'name1' ? 'name2' : 'name1';
    grid.innerHTML = OPEN_WHEN_PROMPTS.map(p => {
        const letterData = data[p.key];
        const hasLetter = letterData && letterData.to === userKey;
        const hasSent = letterData && letterData.from === userName;
        return `
            <div class="ow-envelope ${!hasLetter ? 'locked' : ''}" onclick="${hasLetter ? `openOwLetter('${p.id}')` : ''}">
                <div class="ow-envelope-lock">${hasLetter ? '&#x1F513;' : '&#x1F512;'}</div>
                <div class="ow-envelope-icon">${p.icon}</div>
                <div class="ow-envelope-label">${p.label}</div>
                ${hasSent ? '<div style="font-size:0.6rem;color:var(--accent-gold);margin-top:4px;">You wrote this</div>' : ''}
            </div>
        `;
    }).join('');
}

function openOwLetter(id) {
    const prompt = OPEN_WHEN_PROMPTS.find(p => p.id === id);
    if (!prompt) return;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/openwhen/${prompt.key}`).once('value', snap => {
            const data = snap.val();
            if (data) {
                owViewingLetter = { id, ...data };
                renderOwLetter(owViewingLetter);
            }
        });
    }
}

function renderOwLetter(letter) {
    const container = document.getElementById('openWhenContent');
    if (!container) return;
    const prompt = OPEN_WHEN_PROMPTS.find(p => p.id === letter.id);
    container.innerHTML = `
        <button class="ow-back-btn" onclick="owViewingLetter=null;initOpenWhen();">&larr; Back to envelopes</button>
        <div class="ow-letter-content">
            <div style="text-align:center;font-size:2rem;margin-bottom:12px;">${prompt ? prompt.icon : ''}</div>
            <div class="ow-letter-text">${escapeHtml(letter.text)}</div>
            <div class="ow-letter-from">With love, ${escapeHtml(letter.from || '')}</div>
        </div>
    `;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/openwhen/${prompt.key}/read`).set(true);
    }
}

function saveOwLetter() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const select = document.getElementById('owPromptSelect');
    const textarea = document.getElementById('owLetterTextarea');
    const text = textarea.value.trim();
    if (!text || !select) return;
    const partnerKey = userKey === 'name1' ? 'name2' : 'name1';
    const letter = { text, from: userName, to: partnerKey, timestamp: Date.now(), read: false };
    const prompt = OPEN_WHEN_PROMPTS.find(p => p.id === select.value);
    if (!prompt) return;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/openwhen/${prompt.key}`).set(letter);
    }
    textarea.value = '';
}

// =============================================
// INIT — wires the Firebase listener for letters.
// Without this, sendLetter() pushes to Firebase but
// nothing re-renders, and openLetter() sets state but
// nothing paints the opened view. Both are silent
// failures. Called from app.js boot().
// =============================================
let _lettersListenerAttached = false;
function initLetters() {
    if (_lettersListenerAttached) return;
    _lettersListenerAttached = true;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/letters`).on('value', snap => {
            const data = snap.val() || {};
            const letters = Object.entries(data).map(([id, l]) => ({ id, ...l }));
            renderLetters(letters);
        });
    } else {
        // No Firebase — render whatever's in localStorage so the inbox isn't empty on first load
        renderLetters(getCurrentLetters());
    }
}
window.initLetters = initLetters;
