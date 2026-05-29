function initLoveStats() {
    const grid = document.getElementById('statsGrid');
    if (!grid) return;
    const start = new Date(DATA.couple.start_date);
    const now = new Date();
    const days = Math.floor((now - start) / 86400000);
    const hours = days * 24;
    const minutes = hours * 60;
    const monthsaryCount = DATA.monthsaries ? DATA.monthsaries.length : 0;

    // Fun estimates
    const kisses = Math.floor(days * 3.5);
    const hugs = Math.floor(days * 5);
    const iloveyous = Math.floor(days * 8);
    const texts = Math.floor(days * 47);

    grid.innerHTML = `
        <div class="stat-item">
            <div class="stat-number">${days.toLocaleString()}</div>
            <div class="stat-label">Days Together</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${hours.toLocaleString()}</div>
            <div class="stat-label">Hours of Love</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${minutes.toLocaleString()}</div>
            <div class="stat-label">Minutes of Joy</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${monthsaryCount}</div>
            <div class="stat-label">Monthsaries Celebrated</div>
        </div>
        <div class="stat-item stat-fun">
            <div class="stat-number">~${kisses.toLocaleString()} kisses &bull; ~${hugs.toLocaleString()} hugs &bull; ~${iloveyous.toLocaleString()} "I love you"s &bull; ~${texts.toLocaleString()} texts</div>
            <div class="stat-label">(rough estimate, probably way more &#x1F60A;)</div>
        </div>
        <div class="stat-item stat-fun">
            <div class="stat-number">That's ${(days / 365).toFixed(1)} years &bull; ${(days / 7).toFixed(0)} weeks &bull; ${(days * 1440).toLocaleString()} heartbeats shared</div>
            <div class="stat-label">Because love is math too &#x2764;</div>
        </div>
    `;
}
