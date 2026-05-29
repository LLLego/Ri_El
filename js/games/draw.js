// =============================================
// GAME 3: Draw & Guess
// =============================================
const DG_WORDS = [
    "heart", "star", "house", "cat", "dog", "flower", "sun", "moon", "tree", "fish",
    "butterfly", "rainbow", "cloud", "mountain", "cake", "guitar", "rocket", "crown",
    "pizza", "umbrella", "diamond", "ghost", "penguin", "lighthouse", "volcano",
    "ice cream", "camera", "bicycle", "castle", "dragon", "whale", "tornado",
    "snowman", "robot", "alien", "treasure", "unicorn", "mermaid", "phoenix",
];

// dgIsDrawer declared in state.js
// dgRole declared in state.js

function renderDraw(container) {
    dgStrokes = [];
    // Determine roles: first person is drawer
    gameOn('drawer', v => {
        if (!v) { dgIsDrawer = true; gameSync('drawer', myId()); dgRole = 'drawer';
            dgCurrentWord = DG_WORDS[Math.floor(Math.random() * DG_WORDS.length)];
            gameSync('word', dgCurrentWord);
        }
        else { dgIsDrawer = v === myId(); dgRole = dgIsDrawer ? 'drawer' : 'guesser'; }
        renderDrawUI(container);
    });
    // Guesser listens for the word from drawer
    gameOn('word', v => { if (v) dgCurrentWord = v; });
}

function renderDrawUI(container) {
    container.innerHTML = `
        <div class="game-title">Draw & Guess</div>
        <div class="game-subtitle">${dgIsDrawer ? 'Draw the word — your partner guesses!' : 'Guess what they\'re drawing!'}</div>
        <div class="dg-role-badge ${dgRole}">${dgRole === 'drawer' ? 'You\'re Drawing' : 'You\'re Guessing'}</div>
        ${dgIsDrawer ? `<div class="dg-word">${dgCurrentWord}</div>` : ''}
        <div class="dg-canvas-wrap"><canvas id="dgCanvas" class="dg-canvas" width="500" height="350"></canvas></div>
        ${dgIsDrawer ? `
        <div class="dg-tools">
            <div class="dg-color active" style="background:#000" onclick="dgSetColor(this,'#000')"></div>
            <div class="dg-color" style="background:#e74c3c" onclick="dgSetColor(this,'#e74c3c')"></div>
            <div class="dg-color" style="background:#3498db" onclick="dgSetColor(this,'#3498db')"></div>
            <div class="dg-color" style="background:#2ecc71" onclick="dgSetColor(this,'#2ecc71')"></div>
            <div class="dg-color" style="background:#f39c12" onclick="dgSetColor(this,'#f39c12')"></div>
            <div class="dg-color" style="background:#9b59b6" onclick="dgSetColor(this,'#9b59b6')"></div>
            <button class="dg-size-btn active" onclick="dgSetSize(this,3)">S</button>
            <button class="dg-size-btn" onclick="dgSetSize(this,6)">M</button>
            <button class="dg-size-btn" onclick="dgSetSize(this,12)">L</button>
            <button class="dg-clear-btn" onclick="dgClear()">Clear</button>
        </div>` : ''}
        ${!dgIsDrawer ? `
        <div class="dg-guess-area">
            <input class="dg-guess-input" id="dgGuessInput" placeholder="Type your guess..." maxlength="50">
            <button class="dg-guess-btn" onclick="dgGuess()">Guess</button>
        </div>
        <div class="dg-guess-log" id="dgGuessLog"></div>
        ` : ''}
        <div id="dgResult" style="text-align:center;margin-top:16px;"></div>
    `;
    initDrawCanvas();
    // Listen for strokes from drawer
    if (!dgIsDrawer) {
        gameOn('strokes', v => {
            dgStrokes = v || [];
            redrawCanvas();
        });
    }
    // Listen for guesses
    gameOn('guesses', v => {
        const log = document.getElementById('dgGuessLog');
        if (log && v) {
            const guesses = Array.isArray(v) ? v : Object.values(v);
            log.innerHTML = guesses.map(g =>
                `<div class="${g.correct ? 'correct' : ''}">${g.name}: ${g.text} ${g.correct ? '&#10004;' : ''}</div>`
            ).join('');
        }
    });
    // Listen for correct answer
    gameOn('solved', v => {
        if (v) {
            const res = document.getElementById('dgResult');
            if (res) res.innerHTML = `<div class="wyr-result match">&#10024; Solved! The word was: <strong>${dgCurrentWord}</strong></div>
                <button class="qd-next-btn" onclick="dgNewRound()">New Round</button>`;
        }
    });
}

// dgColor, dgSize declared in state.js
function dgSetColor(el, c) { dgColor = c; document.querySelectorAll('.dg-color').forEach(e => e.classList.remove('active')); el.classList.add('active'); }
function dgSetSize(el, s) { dgSize = s; document.querySelectorAll('.dg-size-btn').forEach(e => e.classList.remove('active')); el.classList.add('active'); }

function initDrawCanvas() {
    const canvas = document.getElementById('dgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!dgIsDrawer) return;
    let drawing = false, lastX, lastY;
    const getPos = e => {
        const r = canvas.getBoundingClientRect();
        const sx = canvas.width / r.width, sy = canvas.height / r.height;
        return [(e.clientX - r.left) * sx, (e.clientY - r.top) * sy];
    };
    const startDraw = e => { drawing = true; [lastX, lastY] = getPos(e); };
    const draw = e => {
        if (!drawing) return;
        const [x, y] = getPos(e);
        const stroke = { x1: lastX, y1: lastY, x2: x, y2: y, c: dgColor, s: dgSize };
        dgStrokes.push(stroke);
        gameSync('strokes', dgStrokes);
        ctx.strokeStyle = dgColor; ctx.lineWidth = dgSize; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); ctx.stroke();
        lastX = x; lastY = y;
    };
    const endDraw = () => { drawing = false; };
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDraw);
    canvas.addEventListener('mouseleave', endDraw);
    canvas.addEventListener('touchstart', e => { e.preventDefault(); startDraw(e.touches[0]); });
    canvas.addEventListener('touchmove', e => { e.preventDefault(); draw(e.touches[0]); });
    canvas.addEventListener('touchend', endDraw);
}

function redrawCanvas() {
    const canvas = document.getElementById('dgCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    dgStrokes.forEach(s => {
        ctx.strokeStyle = s.c || '#000'; ctx.lineWidth = s.s || 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    });
}

function dgClear() {
    dgStrokes = [];
    gameSync('strokes', []);
    redrawCanvas();
}

function dgGuess() {
    const input = document.getElementById('dgGuessInput');
    if (!input) return;
    const guess = input.value.trim();
    if (!guess) return;
    input.value = '';
    const correct = guess.toLowerCase() === dgCurrentWord.toLowerCase();
    const guessesRef = gamePath('guesses');
    if (db && guessesRef) {
        db.ref(guessesRef).once('value', snap => {
            const arr = snap.val() || [];
            arr.push({ name: myName(), text: guess, correct });
            db.ref(guessesRef).set(arr);
        });
    }
    if (correct) gameSync('solved', true);
}

function dgNewRound() {
    dgCurrentWord = DG_WORDS[Math.floor(Math.random() * DG_WORDS.length)];
    dgStrokes = [];
    gameSync('strokes', []);
    gameSync('guesses', []);
    gameSync('solved', false);
    gameSync('word', null);
    gameSync('drawer', null); // reassign roles
    renderDrawUI(document.getElementById('gameContainer'));
}
