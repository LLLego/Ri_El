// =============================================
// SPIN THE WHEEL GAME
// =============================================
// DEFAULT_WHEEL_ITEMS declared in state.js
// wheelItems declared in state.js
// wheelSpinning declared in state.js

function renderWheel(container) {
    container.innerHTML = `
        <div class="game-title">Spin the Wheel</div>
        <div class="game-subtitle">Can't decide? Let fate choose!</div>
        <div class="wheel-container">
            <div class="wheel-canvas-wrap">
                <div class="wheel-pointer"></div>
                <canvas id="spinWheelCanvas" width="560" height="560"></canvas>
            </div>
            <button class="wheel-spin-btn" id="wheelSpinBtn" onclick="spinWheel()">&#x1F3B2; SPIN!</button>
            <div class="wheel-result" id="wheelResult"></div>
            <div class="wheel-items-edit" id="wheelItemsEdit"></div>
            <div style="display:flex;gap:6px;justify-content:center;margin-top:8px;">
                <input class="wheel-add-input" id="wheelAddInput" placeholder="Add item..." maxlength="30">
                <button class="tod-next-btn" onclick="addWheelItem()" style="margin:0;padding:6px 14px;">Add</button>
            </div>
        </div>
    `;
    drawWheel();
    renderWheelChips();
}

function drawWheel() {
    const canvas = document.getElementById('spinWheelCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 280, cy = 280, r = 260;
    ctx.clearRect(0, 0, 560, 560);
    const sliceAngle = (2 * Math.PI) / wheelItems.length;
    const colors = ['#e06080','#e8b84a','#c9a58f','#58a6ff','#d4a88c','#ef476f','#80cbc4','#ffd54f'];
    wheelItems.forEach((item, i) => {
        const startAngle = i * sliceAngle - Math.PI / 2;
        const endAngle = startAngle + sliceAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, startAngle, endAngle);
        ctx.fillStyle = colors[i % colors.length] + '33';
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Text
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.fillStyle = '#e6edf3';
        ctx.font = '22px Caveat, cursive';
        ctx.textAlign = 'center';
        ctx.fillText(item, r * 0.6, 8);
        ctx.restore();
    });
    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#2c344e';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.stroke();
}

function spinWheel() {
    if (wheelSpinning) return;
    wheelSpinning = true;
    const btn = document.getElementById('wheelSpinBtn');
    btn.disabled = true;
    document.getElementById('wheelResult').textContent = '';

    const canvas = document.getElementById('spinWheelCanvas');
    const totalRotation = 1440 + Math.random() * 720;
    let current = 0;
    const duration = 3000;
    const start = performance.now();

    function animate(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = totalRotation * eased;
        canvas.style.transform = `rotate(${current}deg)`;
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            wheelSpinning = false;
            btn.disabled = false;
            const normalized = current % 360;
            const sliceAngle = 360 / wheelItems.length;
            const idx = Math.floor(((360 - normalized + 90) % 360) / sliceAngle) % wheelItems.length;
            document.getElementById('wheelResult').textContent = `${wheelItems[idx]}!`;
            if (navigator.vibrate) navigator.vibrate(200);
        }
    }
    requestAnimationFrame(animate);
}

function renderWheelChips() {
    const container = document.getElementById('wheelItemsEdit');
    if (!container) return;
    container.innerHTML = wheelItems.map((item, i) => `
        <span class="wheel-item-chip" onclick="removeWheelItem(${i})">${escapeHtml(item)} &times;</span>
    `).join('');
}

function addWheelItem() {
    const input = document.getElementById('wheelAddInput');
    const text = input.value.trim();
    if (!text || wheelItems.length >= 12) return;
    wheelItems.push(text);
    input.value = '';
    drawWheel();
    renderWheelChips();
}

function removeWheelItem(idx) {
    if (wheelItems.length <= 2) return;
    wheelItems.splice(idx, 1);
    drawWheel();
    renderWheelChips();
}
