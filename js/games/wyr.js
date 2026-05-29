// =============================================
// GAME 1: Would You Rather
// =============================================
const WYR_QUESTIONS = [
    { a: "Travel the world together", b: "Build a dream home together" },
    { a: "Have unlimited date nights", b: "Have unlimited lazy days together" },
    { a: "Relive your first date", b: "Fast-forward to your wedding day" },
    { a: "Always know what they're thinking", b: "Always surprise each other" },
    { a: "Dance in the rain together", b: "Stargaze on a rooftop together" },
    { a: "Have a private island getaway", b: "Have a cozy mountain cabin" },
    { a: "Write each other love letters daily", b: "Sing to each other every night" },
    { a: "Be best friends in every lifetime", b: "Be soulmates who find each other every time" },
    { a: "Watch sunrises together every day", b: "Watch sunsets together every day" },
    { a: "Have a movie marathon date", b: "Have a cooking challenge date" },
    { a: "Slow dance in the kitchen", b: "Belt out songs on a road trip" },
    { a: "Have matching tattoos", b: "Have matching playlists" },
    { a: "Go on a surprise trip they planned", b: "Plan a surprise trip together" },
    { a: "Have a pet together", b: "Have a garden together" },
    { a: "Relive your favorite memory together", b: "Create a new one right now" },
    { a: "Get lost in a foreign city together", b: "Get snowed in at a cabin together" },
    { a: "Have a picnic under the stars", b: "Have dinner at a rooftop restaurant" },
    { a: "Know the exact date of your proposal", b: "Be completely surprised" },
    { a: "Have a photoshoot together", b: "Make a time capsule together" },
    { a: "Always hold hands in public", b: "Always have secret signals only you two know" },
    { a: "Never fight again", b: "Fight but always make up beautifully" },
    { a: "Have breakfast in bed every day", b: "Have a candlelit dinner every night" },
    { a: "Be able to pause time together", b: "Be able to replay any moment together" },
    { a: "Have an adventure every weekend", b: "Have a cozy night in every weekend" },
    { a: "Read each other's minds for a day", b: "See each other's dreams for a night" },
    { a: "Have a treehouse hideaway", b: "Have a beachside bungalow" },
    { a: "Star in a romantic movie together", b: "Write a book about your love story" },
    { a: "Have a surprise party planned by them", b: "Have a surprise getaway planned by them" },
    { a: "Live in the past together", b: "Live in the future together" },
    { a: "Have a private concert for two", b: "Have a private cinema for two" },
];

// wyrIdx declared in state.js

function renderWYR(container) {
    wyrIdx = 0; wyrChoice = null; wyrPartnerChoice = null; wyrScore = 0; wyrPartnerScore = 0;
    // Load saved index
    gameOn('idx', v => { if (v !== null && v !== undefined) { wyrIdx = v; renderWYRRound(container); } });
    gameOn(myId() + '/choice', v => { wyrChoice = v; });
    gameOn(partnerId() + '/choice', v => { wyrPartnerChoice = v; });
    renderWYRRound(container);
}

function renderWYRRound(container) {
    if (wyrIdx >= WYR_QUESTIONS.length) wyrIdx = 0;
    const q = WYR_QUESTIONS[wyrIdx];
    wyrChoice = null; wyrPartnerChoice = null;
    container.innerHTML = `
        <div class="game-title">Would You Rather</div>
        <div class="game-subtitle">Pick at the same time, then reveal!</div>
        <div class="qd-progress">${wyrIdx + 1} / ${WYR_QUESTIONS.length}</div>
        <div class="wyr-question">Would you rather...</div>
        <div class="wyr-options">
            <div class="wyr-option" onclick="wyrPick('a')">${q.a}</div>
            <div class="wyr-option" onclick="wyrPick('b')">${q.b}</div>
        </div>
        <div id="wyrResult"></div>
        <div class="wyr-score">
            <div><span class="wyr-score-num" id="wyrMyScore">0</span>You</div>
            <div><span class="wyr-score-num" id="wyrTheirScore">0</span>${partnerName()}</div>
        </div>
    `;
    // Listen for both choices
    const myRef = gamePath(myId() + '/choice');
    const theirRef = gamePath(partnerId() + '/choice');
    if (db && myRef) {
        const r1 = db.ref(myRef); r1.on('value', s => { wyrChoice = s.val(); wyrCheckReveal(container); });
        const r2 = db.ref(theirRef); r2.on('value', s => { wyrPartnerChoice = s.val(); wyrCheckReveal(container); });
        gameListeners.push(() => { r1.off(); r2.off(); });
    }
}

function wyrPick(side) {
    wyrChoice = side;
    gameSync(myId() + '/choice', side);
    const opts = document.querySelectorAll('.wyr-option');
    opts.forEach(o => o.classList.remove('selected'));
    opts[side === 'a' ? 0 : 1].classList.add('selected');
    const res = document.getElementById('wyrResult');
    if (res) res.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:0.8rem;margin-top:12px;">Waiting for ' + partnerName() + '...</div>';
}

function wyrCheckReveal(container) {
    if (!wyrChoice || !wyrPartnerChoice) return;
    const match = wyrChoice === wyrPartnerChoice;
    if (match) wyrScore++;
    else wyrPartnerScore++; // both get a point for participating
    const opts = document.querySelectorAll('.wyr-option');
    if (match) {
        opts.forEach(o => o.classList.add('reveal-match'));
    }
    const q = WYR_QUESTIONS[wyrIdx];
    const res = document.getElementById('wyrResult');
    if (res) {
        res.innerHTML = `
            <div class="wyr-result ${match ? 'match' : 'no-match'}">
                ${match ? '&#10024; You matched! Both picked: ' + (wyrChoice === 'a' ? q.a : q.b) :
                          partnerName() + ' picked: ' + (wyrPartnerChoice === 'a' ? q.a : q.b) + ' — different from yours!'}
            </div>
            <button class="wyr-next-btn" onclick="wyrNext()">Next Question</button>
        `;
    }
    document.getElementById('wyrMyScore').textContent = wyrScore;
    document.getElementById('wyrTheirScore').textContent = wyrPartnerScore;
}

function wyrNext() {
    wyrIdx = (wyrIdx + 1) % WYR_QUESTIONS.length;
    gameSync('idx', wyrIdx);
    gameSync(myId() + '/choice', null);
    gameSync(partnerId() + '/choice', null);
    renderWYRRound(document.getElementById('gameContainer'));
}
