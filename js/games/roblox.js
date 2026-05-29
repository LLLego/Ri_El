// =============================================
// ROBLOX DATE NIGHT
// =============================================
// ROBLOX_DATES, ROBLOX_ALL_GAMES, ROBLOX_FEATURED_COUNT declared in state.js
// robloxCat, robloxVotes declared in state.js

async function loadRobloxGames() {
    try {
        const resp = await fetch('roblox_games.json');
        if (!resp.ok) throw new Error('fetch failed');
        const all = await resp.json();
        ROBLOX_ALL_GAMES = all;
        // Daily rotation: use date as seed to shuffle, then pick featured
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth()+1) * 100 + today.getDate();
        const shuffled = [...all];
        // Fisher-Yates with seeded random
        let s = seed;
        for (let i = shuffled.length - 1; i > 0; i--) {
            s = (s * 16807 + 7) % 2147483647;
            const j = s % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        ROBLOX_DATES = shuffled.slice(0, ROBLOX_FEATURED_COUNT);
    } catch (e) {
        console.log('Using fallback Roblox games list');
    }
}

function renderRobloxDateNight(container) {
    container.innerHTML = `
        <div class="game-title">Roblox Date Night</div>
        <div class="game-subtitle">Featured today — suggest random for more</div>
        <div class="roblox-filters" id="robloxFilters"></div>
        <div class="roblox-grid" id="robloxGrid"></div>
        <button class="roblox-random-btn" onclick="robloxSuggestRandom()">&#x2727; Suggest Random &#x2727;</button>
    `;
    const filters = document.getElementById('robloxFilters');
    ['All', 'Cozy', 'Design', 'Chill', 'Adventure', 'Horror', 'Creative', 'Competitive'].forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'roblox-filter-btn' + (cat.toLowerCase() === 'all' ? ' active' : '');
        btn.textContent = cat;
        btn.onclick = () => robloxFilter(cat.toLowerCase());
        filters.appendChild(btn);
    });
    gameOn('votes', v => {
        robloxVotes = v || {};
        robloxRenderGrid();
    });
    robloxRenderGrid();
}

function robloxFilter(cat) {
    robloxCat = cat;
    document.querySelectorAll('.roblox-filter-btn').forEach(b => {
        b.classList.toggle('active', b.textContent.toLowerCase() === cat);
    });
    robloxRenderGrid();
}

function robloxRenderGrid() {
    const grid = document.getElementById('robloxGrid');
    if (!grid) return;
    const filtered = robloxCat === 'all' ? ROBLOX_DATES : ROBLOX_DATES.filter(g => g.cat === robloxCat);
    grid.innerHTML = filtered.map(g => {
        const votes = robloxVotes[g.id] || {};
        const voteCount = Object.keys(votes).length;
        const myVote = votes[myId()] ? ' voted' : '';
        const bothVoted = votes[myId()] && votes[partnerId()];
        const matchHtml = bothVoted ? '<div class="roblox-match-badge">&#x2764; Both want to play!</div>' : '';
        return '<div class="roblox-card" id="roblox-' + g.id + '">' +
            '<div class="roblox-card-name">' + g.name + '</div>' +
            '<span class="roblox-cat-badge roblox-cat-' + g.cat + '">' + g.cat + '</span>' +
            '<div class="roblox-card-desc">' + g.desc + '</div>' +
            '<div class="roblox-card-actions">' +
                '<a class="roblox-play-btn" href="https://www.roblox.com/games/' + g.id + '" target="_blank" rel="noopener">&#x25B7; Play</a>' +
                '<button class="roblox-vote-btn' + myVote + '" onclick="robloxVote(' + g.id + ')">&#x2661; Vote</button>' +
            '</div>' +
            (voteCount > 0 ? '<div class="roblox-vote-count">' + voteCount + ' vote' + (voteCount > 1 ? 's' : '') + '</div>' : '') +
            matchHtml +
            '</div>';
    }).join('');
}

function robloxVote(gameId) {
    const path = gamePath('votes/' + gameId + '/' + myId());
    if (!path || !db) return;
    const ref = db.ref(path);
    ref.once('value', snap => {
        if (snap.val()) {
            ref.remove();
        } else {
            ref.set({ name: myName(), time: Date.now() });
        }
    });
}

function robloxSuggestRandom() {
    const pool = ROBLOX_ALL_GAMES.length > 0 ? ROBLOX_ALL_GAMES : ROBLOX_DATES;
    const filtered = robloxCat === 'all' ? pool : pool.filter(g => g.cat === robloxCat);
    const pick = filtered[Math.floor(Math.random() * filtered.length)];
    if (!document.getElementById('roblox-' + pick.id)) {
        ROBLOX_DATES.unshift(pick);
        if (ROBLOX_DATES.length > ROBLOX_FEATURED_COUNT) ROBLOX_DATES.pop();
        robloxRenderGrid();
    }
    document.querySelectorAll('.roblox-card.highlight').forEach(c => c.classList.remove('highlight'));
    const card = document.getElementById('roblox-' + pick.id);
    if (card) {
        card.classList.add('highlight');
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}
