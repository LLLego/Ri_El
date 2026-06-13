// =============================================
// WATCH LIST (Movie Night)
// =============================================
// wlData declared in state.js (mirrors Firebase)
//
// This file is invoked from movienight.js's HTML, which sets up the
// gameOn('watchlist', ...) subscription in renderMovieNight. That
// subscription calls wlRenderList(), which keeps wlData in sync with
// Firebase. All write functions below mutate wlData and call
// gameSync('watchlist', ...) so both users see updates.

function wlAddItem() {
    const input = document.getElementById('wlInput');
    if (!input || !input.value.trim()) return;
    const title = input.value.trim();
    if (Object.keys(wlData).length >= 100) return; // sanity cap
    const id = 'item_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    const newData = { ...wlData, [id]: {
        title: title,
        addedBy: myName() || 'Unknown',
        addedByKey: myId(),
        watched: false,
        timestamp: Date.now()
    }};
    gameSync('watchlist', newData);
    input.value = '';
}

function wlKeyHandler(e) {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'wlInput') {
        wlAddItem();
    }
}

function wlToggleWatched(id) {
    if (!wlData || !wlData[id]) return;
    const newData = { ...wlData, [id]: { ...wlData[id], watched: !wlData[id].watched }};
    gameSync('watchlist', newData);
}

function wlDeleteItem(id) {
    if (!wlData || !wlData[id]) return;
    const newData = { ...wlData };
    delete newData[id];
    gameSync('watchlist', newData);
}

function wlRenderList(data) {
    // Keep wlData in sync — this is the single source of truth shared with movienight.js
    wlData = (data && typeof data === 'object') ? data : {};
    const list = document.getElementById('wlList');
    if (!list) return;
    if (Object.keys(wlData).length === 0) {
        list.innerHTML = '<div class="wl-empty">No items in your watch list yet</div>';
        return;
    }
    const entries = Object.entries(wlData).sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    list.innerHTML = entries.map(([id, item]) => {
        const checkedClass = item.watched ? ' checked' : '';
        const watchedClass = item.watched ? ' watched' : '';
        return '<div class="wl-item' + watchedClass + '">' +
            '<button class="wl-checkbox' + checkedClass + '" onclick="wlToggleWatched(\'' + id + '\')">' + (item.watched ? '&#10003;' : '') + '</button>' +
            '<span class="wl-item-title">' + escapeHtml(item.title || 'Untitled') + '</span>' +
            '<span class="wl-item-by">' + escapeHtml(item.addedBy || '') + '</span>' +
            '<button class="wl-delete-btn" onclick="wlDeleteItem(\'' + id + '\')">&#x2717;</button>' +
            '</div>';
    }).join('');
}

function wlPickRandom() {
    const data = wlData || {};
    const unwatched = Object.entries(data).filter(([_, item]) => !item.watched);
    const result = document.getElementById('wlPickResult');
    if (!result) return;
    if (unwatched.length === 0) {
        result.textContent = 'Add some movies first!';
        result.className = 'wl-pick-result';
        return;
    }
    // Fun spin animation
    let spins = 0;
    const maxSpins = 10;
    const spinInterval = setInterval(() => {
        const random = unwatched[Math.floor(Math.random() * unwatched.length)];
        result.textContent = random[1].title;
        result.className = 'wl-pick-result';
        spins++;
        if (spins >= maxSpins) {
            clearInterval(spinInterval);
            const pick = unwatched[Math.floor(Math.random() * unwatched.length)];
            result.textContent = '\u2727 ' + pick[1].title + ' \u2727';
            result.className = 'wl-pick-result spin';
        }
    }, 150);
}
