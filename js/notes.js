// --- Thinking of You ---
function sendThinking() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const today = new Date().toISOString().split('T')[0];
    if (firebaseReady) {
        const ref = db.ref(`rooms/${roomId}/thinking/${today}/${userKey}`);
        ref.transaction(current => (current || 0) + 1);
    } else {
        const data = JSON.parse(localStorage.getItem('re-thinking') || '{}');
        if (!data[today]) data[today] = {};
        data[today][userKey] = (data[today][userKey] || 0) + 1;
        saveLocal('re-thinking', data);
        renderThinking(data);
    }
    // Floating hearts
    const btn = document.getElementById('thinkingBtn');
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const heart = document.createElement('span');
            heart.className = 'thinking-floating-heart';
            heart.textContent = '\u2764';
            heart.style.left = (30 + Math.random() * 60) + '%';
            heart.style.bottom = '60%';
            btn.parentElement.appendChild(heart);
            setTimeout(() => heart.remove(), 1500);
        }, i * 100);
    }
}

function renderThinking(data) {
    const today = new Date().toISOString().split('T')[0];
    const todayData = data[today] || {};
    const youCount = todayData[userKey || 'name1'] || 0;
    const themCount = todayData[userKey === 'name1' ? 'name2' : 'name1'] || 0;
    document.getElementById('thinkingCountYou').textContent = youCount;
    document.getElementById('thinkingCountThem').textContent = themCount;
}

// --- Love Notes ---
function sendNote() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const input = document.getElementById('noteInput');
    const text = input.value.trim();
    if (!text) return;
    const note = { text, color: selectedNoteColor, author: userName, timestamp: Date.now() };
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/notes`).push(note);
    } else {
        const notes = JSON.parse(localStorage.getItem('re-notes') || '[]');
        notes.unshift(note);
        saveLocal('re-notes', notes);
        renderNotes(notes);
    }
    input.value = '';
}

function renderNotes(notes) {
    const grid = document.getElementById('notesGrid');
    grid.innerHTML = notes.slice(0, 20).map((n, i) => `
        <div class="note-sticky" style="background: ${n.color || '#fff9c4'}">
            ${escapeHtml(n.text)}
            <div class="note-author">${escapeHtml(n.author || 'Unknown')}</div>
            <div class="note-time">${formatRelativeTime(n.timestamp)}</div>
            ${n.id ? `<button class="note-delete" onclick="deleteNote('${n.id}')">&times;</button>` : ''}
        </div>
    `).join('');
}

function deleteNote(id) {
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/notes/${id}`).remove();
    } else {
        let notes = JSON.parse(localStorage.getItem('re-notes') || '[]');
        notes = notes.filter((n, i) => i.toString() !== id);
        saveLocal('re-notes', notes);
        renderNotes(notes);
    }
}

// --- Bucket List ---
function addBucketItem() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const input = document.getElementById('bucketInput');
    const text = input.value.trim();
    if (!text) return;
    const item = { text, done: false, author: userName, timestamp: Date.now() };
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/bucketlist`).push(item);
    } else {
        const items = JSON.parse(localStorage.getItem('re-bucket') || '[]');
        items.push(item);
        saveLocal('re-bucket', items);
        renderBucket(items);
    }
    input.value = '';
}

function toggleBucketItem(id, currentDone) {
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/bucketlist/${id}/done`).set(!currentDone);
    } else {
        const items = JSON.parse(localStorage.getItem('re-bucket') || '[]');
        const idx = parseInt(id);
        if (items[idx]) items[idx].done = !items[idx].done;
        saveLocal('re-bucket', items);
        renderBucket(items);
    }
}

function deleteBucketItem(id) {
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/bucketlist/${id}`).remove();
    } else {
        let items = JSON.parse(localStorage.getItem('re-bucket') || '[]');
        items.splice(parseInt(id), 1);
        saveLocal('re-bucket', items);
        renderBucket(items);
    }
}

function renderBucket(items) {
    const list = document.getElementById('bucketList');
    list.innerHTML = items.map((item, i) => {
        const id = item.id || i.toString();
        return `
        <li class="bucket-item">
            <div class="bucket-check ${item.done ? 'checked' : ''}" onclick="toggleBucketItem('${id}', ${item.done})">
                ${item.done ? '\u2713' : ''}
            </div>
            <div>
                <div class="bucket-text ${item.done ? 'done' : ''}">${escapeHtml(item.text)}</div>
                <div class="bucket-meta">${escapeHtml(item.author || '')} &middot; ${formatRelativeTime(item.timestamp)}</div>
            </div>
            <button class="bucket-delete" onclick="deleteBucketItem('${id}')">&times;</button>
        </li>`;
    }).join('');
}
