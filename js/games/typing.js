// =============================================
// GAME 4: Typing Race
// =============================================
const TR_SENTENCES = [
    "The quick brown fox jumps over the lazy dog",
    "Love is composed of a single soul inhabiting two bodies",
    "In all the world there is no heart for me like yours",
    "I have loved the stars too fondly to be fearful of the night",
    "Every love story is beautiful but ours is my favorite",
    "You are my sun my moon and all my stars",
    "I knew the second I met you that there was something about you I needed",
    "I would rather share one lifetime with you than face all the ages of this world alone",
    "If I had a flower for every time I thought of you I could walk through my garden forever",
    "You make me want to be a better person",
    "I am who I am because of you you are every reason every hope and every dream",
    "The best thing to hold onto in life is each other",
    "I love you not only for what you are but for what I am when I am with you",
    "My heart is and always will be yours",
    "Whatever our souls are made of his and mine are the same",
];

// trSentence declared in state.js

function renderTyping(container) {
    trSentence = ''; trStartTime = null; trDone = false; trMyTime = null;
    container.innerHTML = `
        <div class="game-title">Typing Race</div>
        <div class="game-subtitle">Type the sentence as fast as you can!</div>
        <div class="tr-sentence" id="trSentence">Loading sentence...</div>
        <input class="tr-input" id="trInput" placeholder="Wait for the sentence..." autocomplete="off" disabled>
        <div class="tr-status" id="trStatus">Syncing with ${partnerName()}...</div>
        <div id="trResults"></div>
    `;
    // Listen for synced sentence
    let sentenceSet = false;
    gameOn('sentence', v => {
        if (v) {
            trSentence = v;
            sentenceSet = true;
            const el = document.getElementById('trSentence');
            if (el) el.textContent = trSentence;
            const input = document.getElementById('trInput');
            if (input) { input.disabled = false; input.placeholder = 'Start typing to begin...'; input.addEventListener('input', trOnInput); }
            const status = document.getElementById('trStatus');
            if (status) status.textContent = 'Type the sentence above to start the timer';
        }
    });
    // If no sentence synced after 1.5s, pick one and sync
    setTimeout(() => {
        if (!sentenceSet) {
            trSentence = TR_SENTENCES[Math.floor(Math.random() * TR_SENTENCES.length)];
            gameSync('sentence', trSentence);
        }
    }, 1500);
    // Listen for partner's result
    gameOn(partnerId() + '/time', v => {
        if (v !== null) renderTRResults();
    });
}

function trOnInput() {
    const input = document.getElementById('trInput');
    const status = document.getElementById('trStatus');
    if (!input || trDone) return;
    if (!trStartTime && input.value.length > 0) {
        trStartTime = Date.now();
        status.textContent = 'Typing...';
    }
    // Highlight progress
    const typed = input.value;
    const sentence = trSentence;
    let html = '';
    for (let i = 0; i < sentence.length; i++) {
        if (i < typed.length) {
            html += typed[i] === sentence[i] ?
                `<span class="correct-char">${sentence[i]}</span>` :
                `<span class="wrong-char">${sentence[i]}</span>`;
        } else {
            html += sentence[i];
        }
    }
    document.getElementById('trSentence').innerHTML = html;
    // Check completion
    if (typed === trSentence) {
        trDone = true;
        trMyTime = ((Date.now() - trStartTime) / 1000).toFixed(2);
        input.disabled = true;
        gameSync(myId() + '/time', parseFloat(trMyTime));
        status.textContent = 'Done!';
        renderTRResults();
    }
}

function renderTRResults() {
    const myTime = trMyTime;
    let theirTime = null;
    gameOn(partnerId() + '/time', v => { theirTime = v; });
    const res = document.getElementById('trResults');
    if (!res) return;
    // Fetch both times
    const rid = getRoomId();
    if (!rid || !db) { res.innerHTML = '<div class="tr-results"><div class="tr-result-box"><div class="tr-result-name">You</div><div class="tr-result-time">' + (myTime || '?') + 's</div></div></div>'; return; }
    db.ref(`rooms/${rid}/games/typing/${partnerId()}/time`).once('value', snap => {
        const pt = snap.val();
        res.innerHTML = `
            <div class="tr-results">
                <div class="tr-result-box">
                    <div class="tr-result-name">You</div>
                    <div class="tr-result-time">${myTime ? myTime + 's' : '...'}</div>
                    ${myTime ? `<div class="tr-result-wpm">${Math.round(trSentence.split(' ').length / (myTime / 60))} WPM</div>` : ''}
                </div>
                <div class="tr-result-box">
                    <div class="tr-result-name">${partnerName()}</div>
                    <div class="tr-result-time">${pt ? pt + 's' : '...'}</div>
                    ${pt ? `<div class="tr-result-wpm">${Math.round(trSentence.split(' ').length / (pt / 60))} WPM</div>` : ''}
                </div>
            </div>
            ${myTime && pt ? `<div class="tr-winner">${parseFloat(myTime) < parseFloat(pt) ? 'You win! &#127942;' : parseFloat(myTime) > parseFloat(pt) ? partnerName() + ' wins! &#127942;' : 'Tie! &#10024;'}</div>` : ''}
            <button class="qd-next-btn" onclick="trNewRace()">Race Again</button>
        `;
    });
}

function trNewRace() {
    const newSentence = TR_SENTENCES[Math.floor(Math.random() * TR_SENTENCES.length)];
    gameSync('sentence', newSentence);
    gameSync(myId() + '/time', null);
    gameSync(partnerId() + '/time', null);
    renderTyping(document.getElementById('gameContainer'));
}
