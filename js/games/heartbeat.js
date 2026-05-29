// =============================================
// GAME 5: Heartbeat Race
// =============================================
// hbTaps declared in state.js
let hbMyReady = false, hbTheirReady = false;

function renderHeartbeat(container) {
    hbTaps = 0; hbTimeLeft = 10; hbRunning = false; hbMyReady = false; hbTheirReady = false;
    container.innerHTML = `
        <div class="game-title">Heartbeat Race</div>
        <div class="game-subtitle">Both ready? Tap as fast as you can for 10 seconds!</div>
        <div class="hb-timer" id="hbTimer">10.0</div>
        <div class="hb-instruction" id="hbInstruction">Both press Ready to start together!</div>
        <button class="hb-start-btn" id="hbStartBtn" onclick="hbReady()">Ready</button>
        <div class="hb-circle" id="hbCircle" style="pointer-events:none;opacity:0.5;" onclick="hbTap()">
            <div class="hb-count" id="hbCount">0</div>
            <div class="hb-label">taps</div>
        </div>
        <div id="hbReadyStatus" style="text-align:center;font-size:0.85rem;color:var(--text-muted);margin-top:10px;"></div>
        <div id="hbResults"></div>
    `;
    // Listen for partner's ready state
    gameOn(partnerId() + '/ready', v => {
        hbTheirReady = !!v;
        const status = document.getElementById('hbReadyStatus');
        if (status) status.textContent = hbTheirReady ? partnerName() + ' is ready!' : '';
        if (hbMyReady && hbTheirReady && !hbRunning) hbCountdown(container);
    });
    // Listen for countdown sync
    gameOn('countdown', v => {
        if (v && v > 0) {
            const inst = document.getElementById('hbInstruction');
            if (inst) inst.textContent = v + '...';
        } else if (v === 0) {
            hbActualStart();
        }
    });
    // Listen for live partner taps
    gameOn(partnerId() + '/taps', v => {
        if (v !== null && hbRunning) {
            // Could show live count if desired
        }
    });
}

function hbReady() {
    hbMyReady = true;
    gameSync(myId() + '/ready', true);
    const btn = document.getElementById('hbStartBtn');
    if (btn) { btn.textContent = 'Waiting...'; btn.disabled = true; btn.style.opacity = '0.6'; }
    const status = document.getElementById('hbReadyStatus');
    if (status) status.innerHTML = 'You are ready! ' + (hbTheirReady ? '' : 'Waiting for ' + partnerName() + '...');
    if (hbMyReady && hbTheirReady && !hbRunning) hbCountdown(document.getElementById('gameContainer'));
}

function hbCountdown(container) {
    let count = 3;
    gameSync('countdown', count);
    const inst = document.getElementById('hbInstruction');
    if (inst) inst.textContent = '3...';
    const cd = setInterval(() => {
        count--;
        gameSync('countdown', count);
        if (count > 0) {
            if (inst) inst.textContent = count + '...';
        } else {
            clearInterval(cd);
            if (inst) inst.textContent = 'GO!';
        }
    }, 800);
}

function hbActualStart() {
    hbTaps = 0; hbTimeLeft = 10; hbRunning = true;
    gameSync(myId() + '/taps', 0);
    document.getElementById('hbStartBtn').style.display = 'none';
    document.getElementById('hbCircle').style.pointerEvents = 'auto';
    document.getElementById('hbCircle').style.opacity = '1';
    document.getElementById('hbCircle').classList.add('tapping');
    document.getElementById('hbInstruction').textContent = 'TAP THE HEART!';
    hbTimer = setInterval(() => {
        hbTimeLeft -= 0.1;
        document.getElementById('hbTimer').textContent = hbTimeLeft.toFixed(1);
        if (hbTimeLeft <= 0) {
            clearInterval(hbTimer);
            hbRunning = false;
            document.getElementById('hbCircle').style.pointerEvents = 'none';
            document.getElementById('hbCircle').classList.remove('tapping');
            document.getElementById('hbInstruction').textContent = "Time's up!";
            gameSync(myId() + '/taps', hbTaps);
            hbShowResults();
        }
    }, 100);
}

function hbTap() {
    if (!hbRunning) return;
    hbTaps++;
    document.getElementById('hbCount').textContent = hbTaps;
    // Sync live count every 5 taps
    if (hbTaps % 5 === 0) gameSync(myId() + '/taps', hbTaps);
}

function hbShowResults() {
    const rid = getRoomId();
    if (!rid || !db) return;
    db.ref(`rooms/${rid}/games/heartbeat/${partnerId()}/taps`).once('value', snap => {
        const pt = snap.val() || 0;
        const res = document.getElementById('hbResults');
        if (!res) return;
        res.innerHTML = `
            <div class="hb-results">
                <div class="hb-result-box">
                    <div class="hb-result-name">You</div>
                    <div class="hb-result-count">${hbTaps}</div>
                </div>
                <div class="hb-result-box">
                    <div class="hb-result-name">${partnerName()}</div>
                    <div class="hb-result-count">${pt || '?'}</div>
                </div>
            </div>
            ${hbTaps !== pt ? `<div class="hb-winner">${hbTaps > pt ? 'You win! &#127942;' : partnerName() + ' wins! &#127942;'}</div>` : '<div class="hb-winner">Tie! &#10024;</div>'}
            <button class="qd-next-btn" onclick="hbRematch()">Rematch</button>
        `;
    });
}

function hbRematch() {
    gameSync(myId() + '/taps', null);
    gameSync(partnerId() + '/taps', null);
    gameSync(myId() + '/ready', null);
    gameSync(partnerId() + '/ready', null);
    gameSync('countdown', null);
    renderHeartbeat(document.getElementById('gameContainer'));
}
