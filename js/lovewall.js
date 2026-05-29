// =============================================
// WHY I LOVE YOU WALL
// =============================================
// loveWallData declared in state.js

function initLoveWall() {
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/lovewall`).on('value', snap => {
            const val = snap.val() || {};
            loveWallData = Object.entries(val).map(([id, v]) => ({ id, ...v }));
            renderLoveWall();
        });
    } else {
        loveWallData = JSON.parse(localStorage.getItem('re-lovewall') || '[]');
        renderLoveWall();
    }
}

function addLoveWallReason() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const input = document.getElementById('loveWallInput');
    const text = input.value.trim();
    if (!text) return;
    const reason = { text, author: userName, timestamp: Date.now() };
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/lovewall`).push(reason);
    } else {
        loveWallData.push(reason);
        localStorage.setItem('re-lovewall', JSON.stringify(loveWallData));
        renderLoveWall();
    }
    input.value = '';
}

function renderLoveWall() {
    const grid = document.getElementById('loveWallGrid');
    if (!grid) return;
    const shuffled = [...loveWallData].sort(() => Math.random() - 0.5);
    grid.innerHTML = shuffled.slice(0, 12).map(r => `
        <div class="love-wall-card">
            ${escapeHtml(r.text)}
            <div class="love-wall-card-author">${escapeHtml(r.author || '')}</div>
        </div>
    `).join('');
}

function shuffleLoveWall() { renderLoveWall(); }
