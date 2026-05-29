function getNextMonthsary() {
    const now = new Date();
    // Monthsary is on the 14th of each month
    let next = new Date(now.getFullYear(), now.getMonth(), 14, 0, 0, 0);
    if (next <= now) {
        next = new Date(now.getFullYear(), now.getMonth() + 1, 14, 0, 0, 0);
    }
    return next;
}

function updateCountdown() {
    const target = getNextMonthsary();
    const now = new Date();
    const diff = target - now;
    if (diff <= 0) return;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('cdDays').textContent = days;
    document.getElementById('cdHours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('cdMinutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('cdSeconds').textContent = seconds.toString().padStart(2, '0');
    const localDateStr = target.getFullYear() + '-' + String(target.getMonth()+1).padStart(2,'0') + '-' + String(target.getDate()).padStart(2,'0');
    document.getElementById('countdownDateLabel').textContent = formatDate(localDateStr);
}

// =============================================
// TOGETHER — LOCAL (no Firebase)
// =============================================
function initTogetherLocal() {
    // Load from localStorage
    loadNotesLocal();
    loadBucketLocal();
    loadMoodLocal();
    loadThinkingLocal();
    loadLettersLocal();
    initMoodPicker();
    initNoteColors();
    updateCountdown();
    setInterval(updateCountdown, 1000);
    initJournal();
    initLoveWall();
    initLoveStats();
    initOpenWhen();
}

function loadNotesLocal() {
    const notes = JSON.parse(localStorage.getItem('re-notes') || '[]');
    renderNotes(notes);
}
function loadBucketLocal() {
    const items = JSON.parse(localStorage.getItem('re-bucket') || '[]');
    renderBucket(items);
}
function loadMoodLocal() {
    const moods = JSON.parse(localStorage.getItem('re-moods') || '{}');
    renderMoods(moods);
}
function loadThinkingLocal() {
    const data = JSON.parse(localStorage.getItem('re-thinking') || '{}');
    renderThinking(data);
}
function loadLettersLocal() {
    const letters = JSON.parse(localStorage.getItem('re-letters') || '[]');
    renderLetters(letters);
}

function saveLocal(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// =============================================
// TOGETHER — FIREBASE SYNC
// =============================================
function initTogetherSync() {
    if (!firebaseReady || !roomId) { initTogetherLocal(); return; }
    initMoodPicker();
    initNoteColors();
    updateCountdown();
    setInterval(updateCountdown, 1000);

    const roomRef = db.ref('rooms/' + roomId);

    // Notes
    roomRef.child('notes').on('value', snap => {
        const val = snap.val() || {};
        const notes = Object.entries(val).map(([id, v]) => ({ id, ...v })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        renderNotes(notes);
    });

    // Bucket list
    roomRef.child('bucketlist').on('value', snap => {
        const val = snap.val() || {};
        const items = Object.entries(val).map(([id, v]) => ({ id, ...v })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        renderBucket(items);
    });

    // Moods
    roomRef.child('moods').on('value', snap => {
        renderMoods(snap.val() || {});
    });

    // Thinking of you
    roomRef.child('thinking').on('value', snap => {
        renderThinking(snap.val() || {});
    });

    // Letters
    roomRef.child('letters').on('value', snap => {
        const val = snap.val() || {};
        const letters = Object.entries(val).map(([id, v]) => ({ id, ...v })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        renderLetters(letters);
    });

    // Presence, Pokes, Journal, Love Wall, Stats, Open When
    initPresence();
    initPokeListener();
    initJournal();
    initLoveWall();
    initLoveStats();
    initOpenWhen();
}
