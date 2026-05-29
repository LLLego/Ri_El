// =============================================
// GAME 6: Movie Night
// =============================================
// mnStartTime declared in state.js

function renderMovieNight(container) {
    mnStartTime = null; mnRunning = false; mnElapsed = 0;
    container.innerHTML = `
        <div class="game-title">Movie Night</div>
        <div class="game-subtitle">Watch together, react in real-time</div>
        <input class="mn-movie-input" id="mnMovieInput" placeholder="What are we watching?" maxlength="100">
        <div class="mn-stream-section">
            <div class="mn-stream-header">
                <input class="mn-stream-url" id="mnStreamUrl" placeholder="Paste streaming URL here..." maxlength="500">
                <button class="mn-stream-go" onclick="mnLoadStream()">Load</button>
                <button class="mn-stream-fs" onclick="mnToggleFullscreen()" title="Fullscreen">&#x26F6;</button>
            </div>
            <div class="mn-stream-wrap" id="mnStreamWrap" style="display:none;">
                <iframe id="mnStreamFrame" class="mn-stream-frame" allowfullscreen allow="autoplay; encrypted-media; picture-in-picture" sandbox="allow-scripts allow-same-origin allow-popups allow-forms"></iframe>
            </div>
        </div>
        <div class="mn-timer-label">Elapsed</div>
        <div class="mn-timer" id="mnTimer">00:00:00</div>
        <div class="mn-controls">
            <button class="mn-btn mn-btn-start" id="mnStartBtn" onclick="mnStart()">Play</button>
            <button class="mn-btn mn-btn-pause" id="mnPauseBtn" onclick="mnPause()" style="display:none;">Pause</button>
            <button class="mn-btn mn-btn-reset" onclick="mnReset()">Reset</button>
        </div>
        <div class="mn-reactions">
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">😍</button>
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">🤣</button>
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">😭</button>
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">🔥</button>
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">😱</button>
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">👏</button>
            <button class="mn-emoji-btn" onclick="mnReact(this.textContent)">💥</button>
        </div>
        <div class="mn-feed" id="mnFeed"></div>
        <div class="mn-chat-input">
            <input id="mnChatInput" placeholder="Say something..." maxlength="200">
            <button onclick="mnChat()">Send</button>
        </div>
        <div class="wl-section" id="wlSection">
            <div class="wl-title">&#9733; Watch List &#9733;</div>
            <div class="wl-input-row">
                <input class="wl-input" id="wlInput" placeholder="Add a movie or show..." maxlength="100">
                <button class="wl-add-btn" onclick="wlAddItem()">Add</button>
            </div>
            <div class="wl-list" id="wlList">
                <div class="wl-empty">No items in your watch list yet</div>
            </div>
            <button class="wl-pick-btn" onclick="wlPickRandom()">&#x2727; What to Watch? &#x2727;</button>
            <div class="wl-pick-result" id="wlPickResult"></div>
        </div>
    `;
    // Listen for reactions
    gameOn('reactions', v => {
        const feed = document.getElementById('mnFeed');
        if (!feed || !v) return;
        const msgs = Array.isArray(v) ? v : Object.values(v);
        feed.innerHTML = msgs.slice(-30).map(m =>
            `<div class="mn-feed-msg"><span class="mn-name">${m.name}</span> ${m.text} <span class="mn-time">${m.time || ''}</span></div>`
        ).join('');
        feed.scrollTop = feed.scrollHeight;
    });
    // Listen for timer sync
    gameOn('timerState', v => {
        if (v && v.running) {
            mnStartTime = v.startedAt;
            mnRunning = true;
            mnStartTimer();
        }
    });
    // Listen for watchlist
    gameOn('watchlist', v => {
        wlRenderList(v || {});
    });
    // Listen for synced stream URL
    gameOn('streamUrl', v => {
        if (v) {
            const wrap = document.getElementById('mnStreamWrap');
            const frame = document.getElementById('mnStreamFrame');
            const input = document.getElementById('mnStreamUrl');
            if (wrap) wrap.style.display = 'block';
            if (frame && frame.src !== v) frame.src = v;
            if (input) input.value = v;
        }
    });
    // Enter key for watchlist input
    document.addEventListener('keydown', wlKeyHandler);
    gameListeners.push(() => document.removeEventListener('keydown', wlKeyHandler));
}

function mnStart() {
    mnRunning = true;
    gameSync('timerState', { running: true, startedAt: Date.now() });
    mnStartTimer();
    document.getElementById('mnStartBtn').style.display = 'none';
    document.getElementById('mnPauseBtn').style.display = '';
}

function mnStartTimer() {
    if (mnTimer) clearInterval(mnTimer);
    mnTimer = setInterval(() => {
        if (!mnStartTime) return;
        mnElapsed = Date.now() - mnStartTime;
        const s = Math.floor(mnElapsed / 1000);
        const h = String(Math.floor(s / 3600)).padStart(2, '0');
        const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const sec = String(s % 60).padStart(2, '0');
        const el = document.getElementById('mnTimer');
        if (el) el.textContent = `${h}:${m}:${sec}`;
    }, 200);
}

function mnPause() {
    mnRunning = false;
    if (mnTimer) clearInterval(mnTimer);
    gameSync('timerState', { running: false });
    document.getElementById('mnStartBtn').style.display = '';
    document.getElementById('mnPauseBtn').style.display = 'none';
}

function mnReset() {
    mnPause();
    mnElapsed = 0; mnStartTime = null;
    document.getElementById('mnTimer').textContent = '00:00:00';
    gameSync('timerState', { running: false });
}

function mnReact(emoji) {
    pushReaction(myName(), emoji);
}

function mnChat() {
    const input = document.getElementById('mnChatInput');
    if (!input || !input.value.trim()) return;
    pushReaction(myName(), input.value.trim());
    input.value = '';
}

function mnLoadStream() {
    const input = document.getElementById('mnStreamUrl');
    if (!input || !input.value.trim()) return;
    let url = input.value.trim();
    if (!url.startsWith('http')) url = 'https://' + url;
    const wrap = document.getElementById('mnStreamWrap');
    const frame = document.getElementById('mnStreamFrame');
    if (wrap) wrap.style.display = 'block';
    if (frame) frame.src = url;
    // Sync URL to Firebase
    gameSync('streamUrl', url);
}

function mnToggleFullscreen() {
    const wrap = document.getElementById('mnStreamWrap');
    if (!wrap) return;
    if (document.fullscreenElement) {
        document.exitFullscreen();
    } else {
        wrap.requestFullscreen().catch(() => {});
    }
}

function pushReaction(name, text) {
    const rid = getRoomId();
    if (!rid || !db) return;
    const ref = db.ref(`rooms/${rid}/games/movienight/reactions`);
    ref.once('value', snap => {
        const arr = snap.val() || [];
        arr.push({ name, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
        // Keep last 50
        ref.set(arr.slice(-50));
    });
}

// Enter key for chat
document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && document.activeElement?.id === 'mnChatInput') mnChat();
});
