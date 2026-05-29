// =============================================
// SHARED JOURNAL (OUR DAY)
// =============================================
function getTodayKey() {
    return new Date().toISOString().split('T')[0];
}

function initJournal() {
    // Set date label
    const today = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('journalDateLabel').textContent = today.toLocaleDateString('en-US', options);

    // Set names
    const myName = userName || 'You';
    const theirName = userKey === 'name1' ? DATA.couple.name2 : DATA.couple.name1;
    document.getElementById('journalMyName').textContent = myName;
    document.getElementById('journalTheirName').textContent = theirName;

    if (firebaseReady && roomId) {
        const todayRef = db.ref(`rooms/${roomId}/journal/${getTodayKey()}`);
        todayRef.on('value', snap => {
            renderJournal(snap.val() || {});
        });
    } else {
        const data = JSON.parse(localStorage.getItem('re-journal-' + getTodayKey()) || '{}');
        renderJournal(data);
    }
}

function renderJournal(data) {
    const myData = data[userKey || 'name1'];
    const theirKey = userKey === 'name1' ? 'name2' : 'name1';
    const theirData = data[theirKey];

    // My side
    const myContent = document.getElementById('journalMyContent');
    if (myData && myData.text) {
        document.getElementById('journalMySide').classList.add('has-entry');
        myContent.innerHTML = `
            <div class="journal-entry-text">${escapeHtml(myData.text)}</div>
            <div class="journal-entry-time">${formatRelativeTime(myData.timestamp)}</div>
        `;
    } else {
        document.getElementById('journalMySide').classList.remove('has-entry');
        myContent.innerHTML = `
            <textarea class="journal-textarea" id="journalMyTextarea" placeholder="How was your day today?"></textarea>
            <button class="journal-save-btn" onclick="saveJournalEntry()">Save Entry</button>
        `;
    }

    // Their side
    const theirContent = document.getElementById('journalTheirContent');
    if (theirData && theirData.text) {
        document.getElementById('journalTheirSide').classList.add('has-entry');
        theirContent.innerHTML = `
            <div class="journal-entry-text">${escapeHtml(theirData.text)}</div>
            <div class="journal-entry-time">${formatRelativeTime(theirData.timestamp)}</div>
        `;
    } else {
        document.getElementById('journalTheirSide').classList.remove('has-entry');
        theirContent.innerHTML = '<div class="journal-empty">Waiting for their entry...</div>';
    }
}

function saveJournalEntry() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const textarea = document.getElementById('journalMyTextarea');
    const text = textarea ? textarea.value.trim() : '';
    if (!text) return;

    const entry = { text, author: userName, timestamp: Date.now() };
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/journal/${getTodayKey()}/${userKey}`).set(entry);
    } else {
        const data = JSON.parse(localStorage.getItem('re-journal-' + getTodayKey()) || '{}');
        data[userKey || 'name1'] = entry;
        localStorage.setItem('re-journal-' + getTodayKey(), JSON.stringify(data));
        renderJournal(data);
    }
}
