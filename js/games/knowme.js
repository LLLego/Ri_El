// =============================================
// GAME 2: Know Me Quiz
// =============================================
const KM_QUESTIONS = [
    { q: "What's my favorite color?", cat: "Preferences" },
    { q: "What food could I eat every day?", cat: "Food" },
    { q: "What's my biggest dream?", cat: "Dreams" },
    { q: "What's my love language?", cat: "Love" },
    { q: "What song reminds me of us?", cat: "Music" },
    { q: "What's my biggest fear?", cat: "Deep" },
    { q: "What movie do I always rewatch?", cat: "Entertainment" },
    { q: "What's my go-to comfort food?", cat: "Food" },
    { q: "If I could go anywhere, where?", cat: "Dreams" },
    { q: "What's a habit I have that I think nobody notices?", cat: "Deep" },
    { q: "What makes me feel most loved?", cat: "Love" },
    { q: "What's my favorite time of day?", cat: "Preferences" },
    { q: "What would I do with a million dollars?", cat: "Dreams" },
    { q: "What's my most used emoji?", cat: "Fun" },
    { q: "What's something I've always wanted to try?", cat: "Dreams" },
    { q: "What's my ideal date night?", cat: "Love" },
    { q: "What am I most proud of?", cat: "Deep" },
    { q: "What's my guilty pleasure?", cat: "Fun" },
    { q: "How do I act when I'm stressed?", cat: "Deep" },
    { q: "What's one thing I'd change about the world?", cat: "Deep" },
];

// kmIdx declared in state.js
// kmMyAnswer declared in state.js

function renderKnowMe(container) {
    kmIdx = 0; kmPhase = 'answer'; kmMyAnswer = null; kmTheirAnswer = null;
    gameOn('idx', v => { if (v !== null) { kmIdx = v; renderKMRound(container); } });
    gameOn('phase', v => { if (v) { kmPhase = v; renderKMRound(container); } });
    renderKMRound(container);
}

function renderKMRound(container) {
    if (kmIdx >= KM_QUESTIONS.length) kmIdx = 0;
    const q = KM_QUESTIONS[kmIdx];
    container.innerHTML = `
        <div class="game-title">How Well Do You Know Me?</div>
        <div class="qd-progress">${kmIdx + 1} / ${KM_QUESTIONS.length}</div>
        <div class="qd-category">${q.cat}</div>
        <div class="qd-question">${q.q}</div>
        <div id="kmContent"></div>
    `;
    const content = document.getElementById('kmContent');
    if (kmPhase === 'answer') {
        content.innerHTML = `
            <div class="km-phase">Phase 1: <strong>Answer for yourself</strong></div>
            <input class="km-input" id="kmInput" placeholder="Your answer..." maxlength="200">
            <button class="km-submit-btn" onclick="kmSubmitAnswer()">Lock In</button>
            <div id="kmWaiting" style="text-align:center;font-size:0.8rem;color:var(--text-muted);margin-top:12px;"></div>
        `;
        gameOn(myId() + '/answer', v => {
            kmMyAnswer = v;
            if (v) { document.getElementById('kmInput').value = v; document.getElementById('kmWaiting').innerHTML = 'Answer locked! Waiting for ' + partnerName() + '...'; }
        });
        gameOn(partnerId() + '/answer', v => {
            kmTheirAnswer = v;
            if (v && kmMyAnswer) { kmPhase = 'guess'; gameSync('phase', 'guess'); renderKMRound(container); }
        });
    } else if (kmPhase === 'guess') {
        content.innerHTML = `
            <div class="km-phase">Phase 2: <strong>Guess ${partnerName()}'s answer</strong></div>
            <input class="km-input" id="kmInput" placeholder="What did they say?" maxlength="200">
            <button class="km-submit-btn" onclick="kmSubmitGuess()">Lock In Guess</button>
        `;
        gameOn(myId() + '/guess', v => {
            kmMyGuess = v;
            if (v) { document.getElementById('kmInput').value = v; document.getElementById('kmWaiting').innerHTML = 'Guess locked! Waiting for ' + partnerName() + '...'; }
        });
    }
}

// kmMyGuess declared in state.js
function kmSubmitAnswer() {
    const val = document.getElementById('kmInput').value.trim();
    if (!val) return;
    gameSync(myId() + '/answer', val);
}

function kmSubmitGuess() {
    const val = document.getElementById('kmInput').value.trim();
    if (!val) return;
    gameSync(myId() + '/guess', val);
    // Auto-reveal after short delay
    setTimeout(() => {
        gameSync('phase', 'reveal');
        renderKMReveal();
    }, 1500);
}

function renderKMReveal() {
    const q = KM_QUESTIONS[kmIdx];
    gameOn(myId() + '/answer', v => kmMyAnswer = v);
    gameOn(partnerId() + '/answer', v => kmTheirAnswer = v);
    gameOn(myId() + '/guess', v => kmMyGuess = v);
    gameOn(partnerId() + '/guess', v => {
        const theirGuess = v;
        const content = document.getElementById('kmContent');
        if (!content) return;
        content.innerHTML = `
            <div class="km-answers">
                <div class="km-answer-box">
                    <div class="km-answer-label">Your answer</div>
                    <div class="km-answer-text">${kmMyAnswer || '...'}</div>
                </div>
                <div class="km-answer-box">
                    <div class="km-answer-label">${partnerName()}'s answer</div>
                    <div class="km-answer-text">${kmTheirAnswer || '...'}</div>
                </div>
                <div class="km-answer-box">
                    <div class="km-answer-label">Your guess of them</div>
                    <div class="km-answer-text ${kmMyGuess?.toLowerCase() === kmTheirAnswer?.toLowerCase() ? 'km-answer-match' : ''}">${kmMyGuess || '...'}</div>
                </div>
                <div class="km-answer-box">
                    <div class="km-answer-label">Their guess of you</div>
                    <div class="km-answer-text ${theirGuess?.toLowerCase() === kmMyAnswer?.toLowerCase() ? 'km-answer-match' : ''}">${theirGuess || '...'}</div>
                </div>
            </div>
            <button class="qd-next-btn" onclick="kmNext()">Next Question</button>
        `;
    });
}

function kmNext() {
    kmIdx = (kmIdx + 1) % KM_QUESTIONS.length;
    kmPhase = 'answer'; kmMyAnswer = null; kmTheirAnswer = null; kmMyGuess = null;
    gameSync('idx', kmIdx);
    gameSync('phase', 'answer');
    gameSync(myId() + '/answer', null);
    gameSync(myId() + '/guess', null);
    gameSync(partnerId() + '/answer', null);
    gameSync(partnerId() + '/guess', null);
    renderKMRound(document.getElementById('gameContainer'));
}
