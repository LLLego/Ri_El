// =============================================
// TRUTH OR DARE GAME
// =============================================
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
}

function pickTOD(type) {
    const pool = type === 'truth' ? TRUTHS : DARES;
    const text = pool[Math.floor(Math.random() * pool.length)];
    document.getElementById('todContent').innerHTML = `
        <div class="tod-card">
            <div class="tod-card-type ${type}">${type}</div>
            <div class="tod-card-text">${text}</div>
        </div>
        <button class="tod-next-btn" onclick="renderTOD(document.getElementById('gameContainer'))">Next Round</button>
    `;
}
