// =============================================
// WATCH LIST (Movie Night)
// =============================================
function wlAddItem() {
    const input = document.getElementById('wlInput');
    if (!input || !input.value.trim()) return;
    const title = input.value.trim();
    const path = gamePath('watchlist');
    if (!path || !db) return;
    db.ref(path).push({
        title: title,
        addedBy: myName() || 'Unknown',
        addedByKey: myId(),
        watched: false,
        timestamp: Date.now()
    });
    input.value = '';
}

function wlKeyHandler(e) {
    if (e.key === 'Enter' && document.activeElement && document.activeElement.id === 'wlInput') {
        wlAddItem();
    }
}

function wlToggleWatched(id) {
    const itemPath = gamePath('watchlist/' + id + '/watched');
    if (!itemPath || !db) return;
    const ref = db.ref(itemPath);
    ref.once('value', snap => {
        ref.set(!snap.val());
    });
}

function wlDeleteItem(id) {
    const itemPath = gamePath('watchlist/' + id);
    if (!itemPath || !db) return;
    db.ref(itemPath).remove();
}

function wlRenderList(data) {
    const list = document.getElementById('wlList');
    if (!list) return;
    if (!data || Object.keys(data).length === 0) {
        list.innerHTML = '<div class="wl-empty">No items in your watch list yet</div>';
        return;
    }
    const entries = Object.entries(data).sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    list.innerHTML = entries.map(([id, item]) => {
        const checkedClass = item.watched ? ' checked' : '';
        const watchedClass = item.watched ? ' watched' : '';
        return '<div class="wl-item' + watchedClass + '">' +
            '<button class="wl-checkbox' + checkedClass + '" onclick="wlToggleWatched(\'' + id + '\')">' + (item.watched ? '&#10003;' : '') + '</button>' +
            '<span class="wl-item-title">' + (item.title || 'Untitled') + '</span>' +
            '<span class="wl-item-by">' + (item.addedBy || '') + '</span>' +
            '<button class="wl-delete-btn" onclick="wlDeleteItem(\'' + id + '\')">&#x2717;</button>' +
            '</div>';
    }).join('');
}

function wlPickRandom() {
    const list = document.getElementById('wlList');
    if (!list) return;
    // Get unwatched items from current data
    const path = gamePath('watchlist');
    if (!path || !db) return;
    db.ref(path).once('value', snap => {
        const data = snap.val() || {};
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
    });
}
