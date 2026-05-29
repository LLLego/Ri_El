function initMoodPicker() {
    const picker = document.getElementById('moodPicker');
    MOODS.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'mood-option';
        btn.innerHTML = `<span>${m.emoji}</span> ${m.label}`;
        btn.onclick = () => setMood(m);
        picker.appendChild(btn);
    });
}

function initNoteColors() {
    const container = document.getElementById('noteColors');
    NOTE_COLORS.forEach(c => {
        const dot = document.createElement('div');
        dot.className = 'notes-color-pick' + (c.bg === selectedNoteColor ? ' active' : '');
        dot.style.background = c.bg;
        dot.onclick = () => {
            document.querySelectorAll('.notes-color-pick').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
            selectedNoteColor = c.bg;
        };
        container.appendChild(dot);
    });
}

// --- Mood Sync ---
function setMood(mood) {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const moodData = { emoji: mood.emoji, label: mood.label, timestamp: Date.now() };
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/moods/${userKey}`).set(moodData);
    } else {
        const moods = JSON.parse(localStorage.getItem('re-moods') || '{}');
        moods[userKey] = moodData;
        saveLocal('re-moods', moods);
        renderMoods(moods);
    }
    // Record mood history (local, last 30 entries)
    const youKey = userKey || 'name1';
    const history = JSON.parse(localStorage.getItem('re-mood-history-' + youKey) || '[]');
    history.push({ emoji: mood.emoji, label: mood.label, date: new Date().toISOString().slice(0, 10) });
    if (history.length > 30) history.splice(0, history.length - 30);
    localStorage.setItem('re-mood-history-' + youKey, JSON.stringify(history));
    // Highlight active
    document.querySelectorAll('.mood-option').forEach(opt => {
        opt.classList.toggle('active', opt.textContent.includes(mood.label));
    });
}

function renderMoods(data) {
    const youKey = userKey || 'name1';
    const themKey = youKey === 'name1' ? 'name2' : 'name1';
    const you = data[youKey];
    const them = data[themKey];
    document.getElementById('moodYouEmoji').textContent = you ? you.emoji : '?';
    document.getElementById('moodYouLabel').textContent = you ? you.label : 'Not set yet';
    document.getElementById('moodYouTime').textContent = you ? formatRelativeTime(you.timestamp) : '';
    document.getElementById('moodThemEmoji').textContent = them ? them.emoji : '?';
    document.getElementById('moodThemLabel').textContent = them ? them.label : 'Waiting...';
    document.getElementById('moodThemTime').textContent = them ? formatRelativeTime(them.timestamp) : '';
    // Mood history strip — show last 7 moods
    renderMoodHistory(data);
}

// moodHistoryData declared in state.js
function renderMoodHistory(data) {
    moodHistoryData = data;
    const strip = document.getElementById('moodHistoryStrip');
    if (!strip) return;
    const youKey = userKey || 'name1';
    const history = JSON.parse(localStorage.getItem('re-mood-history-' + youKey) || '[]');
    const today = new Date().toISOString().slice(0, 10);
    strip.innerHTML = history.slice(-7).map(h =>
        '<div class="mood-history-dot' + (h.date === today ? ' today' : '') + '" title="' + h.label + ' ' + h.date + '">' + h.emoji + '</div>'
    ).join('');
}
