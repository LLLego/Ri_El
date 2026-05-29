// =============================================
// GAMES — Shared
// =============================================
// currentGame declared in state.js
// gameListeners declared in state.js

function openGame(gameId) {
    currentGame = gameId;
    document.getElementById('gameOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    const c = document.getElementById('gameContainer');
    switch (gameId) {
        case 'wyr': renderWYR(c); break;
        case 'knowme': renderKnowMe(c); break;
        case 'draw': renderDraw(c); break;
        case 'typing': renderTyping(c); break;
        case 'heartbeat': renderHeartbeat(c); break;
        case 'movienight': renderMovieNight(c); break;
        case 'questiondate': renderQuestionDate(c); break;
        case 'roblox': renderRobloxDateNight(c); break;
        case 'wheel': renderWheel(c); break;
        case 'tod': renderTOD(c); break;
        case 'story': renderStory(c); break;
        case 'wordassoc': renderWordAssoc(c); break;
    }
}

function closeGame() {
    document.getElementById('gameOverlay').classList.remove('active');
    document.body.style.overflow = '';
    gameListeners.forEach(fn => fn());
    gameListeners = [];
    currentGame = null;
}

function gamePath(sub) {
    const rid = getRoomId();
    return rid ? `rooms/${rid}/games/${currentGame}/${sub || ''}` : null;
}

function gameSync(sub, val) {
    const p = gamePath(sub);
    if (p && db) db.ref(p).set(val);
}

function gameOn(sub, cb) {
    const p = gamePath(sub);
    if (!p || !db) return;
    const ref = db.ref(p);
    ref.on('value', snap => cb(snap.val()));
    gameListeners.push(() => ref.off());
}
