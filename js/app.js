// =============================================
// APP.JS — Init Orchestrator
// Replaces the DOMContentLoaded handler from monolith
// Loaded LAST via <script defer>, so DOM is ready
// =============================================

// Wire up global onclick handlers
window.selectTrack = selectTrack;
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.submitPassword = submitPassword;
window.sendPoke = sendPoke;
window.sendNote = sendNote;
window.sendThinking = sendThinking;
window.addBucketItem = addBucketItem;
window.toggleBucketItem = toggleBucketItem;
window.deleteBucketItem = deleteBucketItem;
window.sendLetter = sendLetter;
window.toggleLetterRecipient = toggleLetterRecipient;
window.openLetter = openLetter;
window.openGame = openGame;
window.closeGame = closeGame;
window.wyrPick = wyrPick;
window.wyrNext = wyrNext;
window.kmSubmitAnswer = kmSubmitAnswer;
window.kmSubmitGuess = kmSubmitGuess;
window.kmNext = kmNext;
window.dgSetColor = dgSetColor;
window.dgSetSize = dgSetSize;
window.dgClear = dgClear;
window.dgGuess = dgGuess;
window.dgNewRound = dgNewRound;
window.trNewRace = trNewRace;
window.hbReady = hbReady;
window.hbTap = hbTap;
window.hbRematch = hbRematch;
window.mnStart = mnStart;
window.mnPause = mnPause;
window.mnReset = mnReset;
window.mnReact = mnReact;
window.mnChat = mnChat;
window.mnLoadStream = mnLoadStream;
window.mnToggleFullscreen = mnToggleFullscreen;
window.qdSubmit = qdSubmit;
window.qdNext = qdNext;
window.toggleVoiceNotes = toggleVoiceNotes;
window.vnToggleRecord = vnToggleRecord;
window.vnPlayNote = vnPlayNote;
window.robloxFilter = robloxFilter;
window.robloxVote = robloxVote;
window.robloxSuggestRandom = robloxSuggestRandom;
window.wlAddItem = wlAddItem;
window.wlToggleWatched = wlToggleWatched;
window.wlDeleteItem = wlDeleteItem;
window.wlPickRandom = wlPickRandom;
window.selectName = selectName;
window.backToNameStep = backToNameStep;
window.logout = logout;
window.addWheelItem = addWheelItem;
window.removeWheelItem = removeWheelItem;
window.spinWheel = spinWheel;
window.pickTOD = pickTOD;
window.sendStoryLine = sendStoryLine;
window.clearStory = clearStory;
window.sendWAWord = sendWAWord;
window.openOwLetter = openOwLetter;
window.saveOwLetter = saveOwLetter;
window.shuffleLoveWall = shuffleLoveWall;
window.addLoveWallReason = addLoveWallReason;
window.mnLoadStream = mnLoadStream;

// Init everything — wrapped in try/catch so one failure doesn't kill others
function boot() {
    console.log('Ri_El booting...');
    try { initThemeSwitcher(); } catch(e) { console.warn('initThemeSwitcher:', e); }
    try { updateCounters(); } catch(e) { console.warn('updateCounters:', e); }
    try { updateHero(); } catch(e) { console.warn('updateHero:', e); }
    try { buildTimeline(); } catch(e) { console.warn('buildTimeline:', e); }
    try { buildSongWall(); } catch(e) { console.warn('buildSongWall:', e); }
    try { initPlayer(); } catch(e) { console.warn('initPlayer:', e); }
    try { initScrollReveal(); } catch(e) { console.warn('initScrollReveal:', e); }
    try { initFloatingDecorations(); } catch(e) { console.warn('initFloatingDecorations:', e); }
    try { initSparkleTrail(); } catch(e) { console.warn('initSparkleTrail:', e); }
    try { initParticles(); } catch(e) { console.warn('initParticles:', e); }
    try { initTypewriterLetters(); } catch(e) { console.warn('initTypewriterLetters:', e); }
    try { initTabs(); } catch(e) { console.warn('initTabs:', e); }
    try { initScrollTop(); } catch(e) { console.warn('initScrollTop:', e); }
    // initNameSystem is called after Firebase auth resolves (see initFirebase)
    try { initFirebase(); } catch(e) { console.warn('initFirebase:', e); }

    // Thinking of You button
    try { document.getElementById('thinkingBtn').addEventListener('click', sendThinking); } catch(e) { console.warn('thinkingBtn:', e); }

    // Enter key for inputs (guarded — elements may not exist in all layouts)
    try {
        const noteInput = document.getElementById('noteInput');
        if (noteInput) noteInput.addEventListener('keydown', e => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendNote(); }
        });
        const bucketInput = document.getElementById('bucketInput');
        if (bucketInput) bucketInput.addEventListener('keydown', e => {
            if (e.key === 'Enter') addBucketItem();
        });
    } catch(e) { console.warn('input listeners:', e); }

    console.log('Ri_El booted ✓');
}

// Since this script is loaded with defer, DOM is ready
// But wrap in requestAnimationFrame to be safe
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}
