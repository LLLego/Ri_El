// =============================================
// STORY BUILDER GAME
// =============================================
function renderStory(container) {
    container.innerHTML = `
        <div class="game-title">Story Builder</div>
        <div class="game-subtitle">Write a story together, one line at a time</div>
        <div class="story-turn-indicator" id="storyTurn">Start the story!</div>
        <div class="story-scroll" id="storyScroll"></div>
        <div class="story-input-area">
            <input class="story-input" id="storyInput" placeholder="Continue the story..." maxlength="200"
                onkeydown="if(event.key==='Enter')sendStoryLine()">
            <button class="story-send-btn" onclick="sendStoryLine()">Send</button>
        </div>
        <button class="tod-next-btn" onclick="clearStory()" style="margin-top:12px;">Start New Story</button>
    `;
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/story`).on('value', snap => {
            const val = snap.val() || {};
            const lines = Object.entries(val).map(([id, v]) => ({ id, ...v })).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
            renderStoryLines(lines);
        });
    } else {
        renderStoryLines([]);
    }
}

function sendStoryLine() {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const input = document.getElementById('storyInput');
    const text = input.value.trim();
    if (!text) return;
    const line = { text, author: userName, timestamp: Date.now() };
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/story`).push(line);
    }
    input.value = '';
    input.focus();
}

function renderStoryLines(lines) {
    const scroll = document.getElementById('storyScroll');
    const turn = document.getElementById('storyTurn');
    if (!scroll) return;
    scroll.innerHTML = lines.map(l => `
        <div class="story-line">${escapeHtml(l.text)}<span class="story-line-author">— ${escapeHtml(l.author || '')}</span></div>
    `).join('');
    scroll.scrollTop = scroll.scrollHeight;
    if (turn) {
        const lastAuthor = lines.length > 0 ? lines[lines.length - 1].author : null;
        turn.textContent = lastAuthor === userName ? "Waiting for your partner..." : "Your turn!";
    }
}

function clearStory() {
    if (firebaseReady && roomId) {
        db.ref(`rooms/${roomId}/story`).remove();
    }
}
