// =============================================
// TRUTH OR DARE GAME
// =============================================
// tdType, tdText, tdMyAnswer, tdTheirAnswer declared in state.js

const TRUTHS = [
    "What's the first thing you noticed about me?",
    "When did you know you were in love with me?",
    "What's your favorite memory of us together?",
    "What's something you've never told anyone but want to tell me?",
    "What do you think about before you fall asleep?",
    "What's the nicest thing I've done for you?",
    "If you could relive one day with me, which would it be?",
    "What's a secret talent you think I have?",
    "What song reminds you of me?",
    "What's the cutest thing I do without realizing it?",
    "What's your biggest dream for us?",
    "What was your first impression of me?",
    "What's something you want us to try together?",
    "When do you feel most loved by me?",
    "What's the most attractive thing about me?",
    "If we could go anywhere in the world together, where?",
    "What's a small thing I do that makes your heart melt?",
    "What's your favorite photo of us?",
    "What's one thing you want to tell future-us?",
    "How would you describe me to a stranger?"
];

const DARES = [
    "Send a voice note saying 'I love you' in the cutest way possible",
    "Take a selfie right now and send it",
    "Type a love message using only emojis",
    "Sing a few lines of our song and send it",
    "Do your best impression of me",
    "Send a 10-second voice note of you laughing",
    "Write a haiku about us right now",
    "Send a photo of your current view",
    "Say 'I love you' in 3 different languages",
    "Send me the last photo in your gallery",
    "Text me something you've been wanting to say but haven't",
    "Record yourself doing a silly dance",
    "Send a kiss emoji chain of 20",
    "Describe your ideal date with me in detail",
    "Send a voice note of your best pickup line"
];

function renderTOD(container) {
    tdType = null; tdText = null; tdMyAnswer = null; tdTheirAnswer = null;
    container.innerHTML = `
        <div class="game-title">Truth or Dare</div>
        <div class="game-subtitle">Couple's Edition &#x2764;</div>
        <div id="todContent">
            <div class="tod-choice">
                <div class="tod-btn truth" onclick="pickTOD('truth')">
                    <div class="tod-btn-emoji">&#x1F4DC;</div>
                    <div class="tod-btn-label">Truth</div>
                </div>
                <div class="tod-btn dare" onclick="pickTOD('dare')">
                    <div class="tod-btn-emoji">&#x1F525;</div>
                    <div class="tod-btn-label">Dare</div>
                </div>
            </div>
        </div>
    `;
    // Listen for shared prompt + per-player answers
    gameOn('type', v => { tdType = v; tdRenderRound(container); });
    gameOn('text', v => { tdText = v; tdRenderRound(container); });
    gameOn(myId() + '/answer', v => { tdMyAnswer = v; tdRenderRound(container); });
    gameOn(partnerId() + '/answer', v => { tdTheirAnswer = v; tdRenderRound(container); });
}

function tdRenderRound(container) {
    if (!tdType || !tdText) {
        // No active round — show choice buttons
        const content = document.getElementById('todContent');
        if (!content) return;
        content.innerHTML = `
            <div class="tod-choice">
                <div class="tod-btn truth" onclick="pickTOD('truth')">
                    <div class="tod-btn-emoji">&#x1F4DC;</div>
                    <div class="tod-btn-label">Truth</div>
                </div>
                <div class="tod-btn dare" onclick="pickTOD('dare')">
                    <div class="tod-btn-emoji">&#x1F525;</div>
                    <div class="tod-btn-label">Dare</div>
                </div>
            </div>
        `;
        return;
    }
    const content = document.getElementById('todContent');
    if (!content) return;
    const myBox = tdMyAnswer
        ? `<div class="td-answer-text">${escapeHtml(tdMyAnswer)}</div>`
        : `<input class="td-input" id="tdInput" placeholder="Type your answer..." maxlength="300">
           <button class="td-submit-btn" onclick="tdSubmit()">Send</button>`;
    const theirBox = tdTheirAnswer
        ? `<div class="td-answer-text">${escapeHtml(tdTheirAnswer)}</div>`
        : `<div class="td-answer-text td-waiting"><em>Waiting for ${escapeHtml(partnerName())}...</em></div>`;
    const nextBtn = (tdMyAnswer && tdTheirAnswer)
        ? `<button class="tod-next-btn" onclick="tdNext()">Next Round</button>`
        : '';
    content.innerHTML = `
        <div class="tod-card">
            <div class="tod-card-type ${tdType}">${tdType}</div>
            <div class="tod-card-text">${escapeHtml(tdText)}</div>
        </div>
        <div class="td-answers">
            <div class="td-answer-box">
                <div class="td-answer-name">You</div>
                ${myBox}
            </div>
            <div class="td-answer-box">
                <div class="td-answer-name">${escapeHtml(partnerName())}</div>
                ${theirBox}
            </div>
        </div>
        ${nextBtn}
    `;
}

function pickTOD(type) {
    const pool = type === 'truth' ? TRUTHS : DARES;
    const text = pool[Math.floor(Math.random() * pool.length)];
    // Sync new round and clear both answers
    gameSync('type', type);
    gameSync('text', text);
    gameSync(myId() + '/answer', null);
    gameSync(partnerId() + '/answer', null);
    // Listeners will trigger tdRenderRound
}

function tdSubmit() {
    const inp = document.getElementById('tdInput');
    if (!inp || !inp.value.trim()) return;
    gameSync(myId() + '/answer', inp.value.trim());
    inp.disabled = true;
    const btn = document.querySelector('.td-submit-btn');
    if (btn) btn.disabled = true;
}

function tdNext() {
    gameSync('type', null);
    gameSync('text', null);
    gameSync(myId() + '/answer', null);
    gameSync(partnerId() + '/answer', null);
    // Listeners will trigger tdRenderRound and re-show choice buttons
}
