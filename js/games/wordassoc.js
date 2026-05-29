// =============================================
// WORD ASSOCIATION GAME
// =============================================
// waUsedWords declared in state.js
// waTimer declared in state.js

const WA_STARTERS = ['love', 'home', 'dream', 'star', 'heart', 'baby', 'smile', 'forever', 'kiss', 'beautiful', 'paradise', 'moonlight', 'sunshine', 'together', 'magic'];

function renderWordAssoc(container) {
    const startWord = WA_STARTERS[Math.floor(Math.random() * WA_STARTERS.length)];
    waUsedWords = [startWord];
    container.innerHTML = `
        <div class="game-title">Word Association</div>
        <div class="game-subtitle">Say the first word that comes to mind!</div>
        <div class="wa-word-display" id="waCurrentWord">${startWord}</div>
        <div class="wa-history" id="waHistory"></div>
        <div class="wa-input-area">
            <input class="wa-input" id="waInput" placeholder="Your word..." maxlength="30"
                onkeydown="if(event.key==='Enter')sendWAWord()">
            <button class="story-send-btn" onclick="sendWAWord()">Go</button>
        </div>
        <div class="wa-timer" id="waTimer"></div>
    `;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/wordassoc`).on('value', snap => {
            const val = snap.val() || {};
            const words = Object.entries(val).map(([id, v]) => v).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            if (words.length > 0) {
                waUsedWords = words.map(w => w.word);
                renderWAState(words);
            }
        });
    }
}

function sendWAWord() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const input = document.getElementById('waInput');
    const word = input.value.trim().toLowerCase();
    if (!word || waUsedWords.includes(word)) return;
    const entry = { word, author: userName, timestamp: Date.now() };
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/wordassoc`).push(entry);
    }
    input.value = '';
}

function renderWAState(words) {
    const current = document.getElementById('waCurrentWord');
    const history = document.getElementById('waHistory');
    if (!current || !history) return;
    current.textContent = words[words.length - 1].word;
    history.innerHTML = words.slice(-8).map(w =>
        `<span class="wa-history-word">${escapeHtml(w.word)}</span>`
    ).join('');
}
