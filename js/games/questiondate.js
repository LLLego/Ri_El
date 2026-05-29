// =============================================
// GAME 7: Question Date
// =============================================
const QD_QUESTIONS = [
    { q: "What's a memory of us that you replay in your head?", cat: "Memories" },
    { q: "When did you first realize you loved me?", cat: "Love" },
    { q: "What's something small I do that makes you feel safe?", cat: "Comfort" },
    { q: "If we could relive one day together, which would it be?", cat: "Memories" },
    { q: "What's a dream you have for us that you haven't told me?", cat: "Dreams" },
    { q: "What song lyric describes how you feel about me?", cat: "Music" },
    { q: "What's the most attractive thing about me that isn't physical?", cat: "Love" },
    { q: "If you wrote me a letter right now, what would the first line be?", cat: "Love" },
    { q: "What's a place you want to take me to someday?", cat: "Dreams" },
    { q: "What moment with me felt the most like a movie scene?", cat: "Memories" },
    { q: "What's something you want us to learn together?", cat: "Growth" },
    { q: "How have I changed you for the better?", cat: "Growth" },
    { q: "What's your favorite photo of us and why?", cat: "Memories" },
    { q: "What do you think about right before you fall asleep?", cat: "Deep" },
    { q: "What's a silly inside joke of ours that still makes you laugh?", cat: "Fun" },
    { q: "If our love was a season, what would it be and why?", cat: "Poetic" },
    { q: "What's something you admire about how I love you?", cat: "Love" },
    { q: "What's a tradition you want us to start?", cat: "Dreams" },
    { q: "What did you think when you first saw me?", cat: "Memories" },
    { q: "What's one thing you want me to know but find hard to say?", cat: "Deep" },
    { q: "If you could give me one gift with no limits, what would it be?", cat: "Dreams" },
    { q: "What's the happiest you've ever felt with me?", cat: "Happiness" },
    { q: "What do you want our future to look like in 5 years?", cat: "Dreams" },
    { q: "What's a song that always reminds you of me?", cat: "Music" },
    { q: "What's the bravest thing our love has helped you do?", cat: "Growth" },
];

// qdIdx declared in state.js

function renderQuestionDate(container) {
    qdIdx = 0; qdMyAnswer = null; qdTheirAnswer = null;
    gameOn('idx', v => { if (v !== null) { qdIdx = v; renderQDRound(container); } });
    renderQDRound(container);
}

function renderQDRound(container) {
    if (qdIdx >= QD_QUESTIONS.length) qdIdx = 0;
    const q = QD_QUESTIONS[qdIdx];
    qdMyAnswer = null; qdTheirAnswer = null;
    container.innerHTML = `
        <div class="game-title">Question Date</div>
        <div class="game-subtitle">Answer honestly, then see each other's hearts</div>
        <div class="qd-progress">${qdIdx + 1} / ${QD_QUESTIONS.length}</div>
        <div class="qd-category">${q.cat}</div>
        <div class="qd-question">${q.q}</div>
        <textarea class="qd-input" id="qdInput" placeholder="Take your time..." maxlength="500"></textarea>
        <button class="qd-submit-btn" onclick="qdSubmit()">Share</button>
        <div id="qdAnswers"></div>
    `;
    // Listen for both answers
    const myRef = gamePath(myId() + '/answer');
    const theirRef = gamePath(partnerId() + '/answer');
    if (db && myRef) {
        const r1 = db.ref(myRef); r1.on('value', s => { qdMyAnswer = s.val(); qdCheckReveal(); });
        const r2 = db.ref(theirRef); r2.on('value', s => { qdTheirAnswer = s.val(); qdCheckReveal(); });
        gameListeners.push(() => { r1.off(); r2.off(); });
    }
}

function qdSubmit() {
    const input = document.getElementById('qdInput');
    if (!input || !input.value.trim()) return;
    gameSync(myId() + '/answer', input.value.trim());
    input.disabled = true;
    document.querySelector('.qd-submit-btn').disabled = true;
    const ans = document.getElementById('qdAnswers');
    if (ans) ans.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:12px;">Waiting for ' + partnerName() + '...</div>';
}

function qdCheckReveal() {
    if (!qdMyAnswer || !qdTheirAnswer) return;
    const ans = document.getElementById('qdAnswers');
    if (!ans) return;
    ans.innerHTML = `
        <div class="qd-answers">
            <div class="qd-answer-box">
                <div class="qd-answer-name">You</div>
                <div class="qd-answer-text">${qdMyAnswer}</div>
            </div>
            <div class="qd-answer-box">
                <div class="qd-answer-name">${partnerName()}</div>
                <div class="qd-answer-text">${qdTheirAnswer}</div>
            </div>
        </div>
        <button class="qd-next-btn" onclick="qdNext()">Next Question</button>
    `;
}

function qdNext() {
    qdIdx = (qdIdx + 1) % QD_QUESTIONS.length;
    gameSync('idx', qdIdx);
    gameSync(myId() + '/answer', null);
    gameSync(partnerId() + '/answer', null);
    renderQDRound(document.getElementById('gameContainer'));
}
