function initPresence() {
    if (!firebaseReady || !roomId) return;
    const myPresRef = db.ref(`rooms/${roomId}/presence/${userKey}`);
    const connRef = db.ref('.info/connected');

    connRef.on('value', snap => {
        if (snap.val() === true) {
            myPresRef.onDisconnect().remove();
            myPresRef.set({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP });
        }
    });

    // Also update lastSeen periodically
    const heartbeatInterval = setInterval(() => {
        myPresRef.set({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP });
    }, 30000);

    // Clear heartbeat + mark offline when leaving
    window.addEventListener('beforeunload', () => {
        clearInterval(heartbeatInterval);
        myPresRef.set({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
    });

    // Listen for partner presence
    const partnerKey = userKey === 'name1' ? 'name2' : 'name1';
    db.ref(`rooms/${roomId}/presence/${partnerKey}`).on('value', snap => {
        renderPresence(snap.val(), partnerKey);
    });

    // Initial banner text
    document.getElementById('presenceText').textContent = 'Waiting for your partner to visit...';
}

function renderPresence(data, partnerKey) {
    const banner = document.getElementById('presenceBanner');
    const dot = document.getElementById('presenceDot');
    const text = document.getElementById('presenceText');
    const partnerName = partnerKey === 'name1' ? DATA.couple.name1 : DATA.couple.name2;

    if (data && data.online) {
        banner.classList.add('online');
        dot.classList.add('online');
        text.innerHTML = `<span class="presence-name">${partnerName}</span> is here right now \u2764`;
    } else if (data && data.lastSeen) {
        banner.classList.remove('online');
        dot.classList.remove('online');
        text.innerHTML = `<span class="presence-name">${partnerName}</span> was here ${formatRelativeTime(data.lastSeen)}`;
    } else {
        banner.classList.remove('online');
        dot.classList.remove('online');
        text.textContent = `Waiting for ${partnerName} to visit...`;
    }
}

// =============================================
// LOVE POKES
// =============================================
function sendPoke(type) {
    if (!userName) { document.getElementById('nameModal').classList.remove('hidden'); return; }
    const poke = { type, from: userName, timestamp: Date.now() };
    if (firebaseReady) {
        db.ref(`rooms/${roomId}/pokes`).push(poke);
    }
    // Show local feedback
    const labels = { hug: 'hug sent!', kiss: 'kiss sent!', poke: 'poke sent!', miss: 'missing you sent!' };
    document.getElementById('pokeLastSent').textContent = labels[type] || 'sent!';
    setTimeout(() => { document.getElementById('pokeLastSent').textContent = ''; }, 3000);
}

function initPokeListener() {
    if (!firebaseReady || !roomId) return;
    db.ref(`rooms/${roomId}/pokes`).orderByChild('timestamp').limitToLast(1).on('child_added', snap => {
        const poke = snap.val();
        if (!poke || poke.from === userName) return;
        showPokeAnimation(poke);
    });
}

function showPokeAnimation(poke) {
    const emojis = { hug: '\u{1F917}', kiss: '\u{1F48B}', poke: '\u{1F449}', miss: '\u{1F494}' };
    const messages = {
        hug: `${poke.from} is sending you a hug!`,
        kiss: `${poke.from} sent you a kiss!`,
        poke: `${poke.from} poked you!`,
        miss: `${poke.from} misses you!`
    };

    // Main emoji
    const el = document.createElement('div');
    el.className = 'poke-received-toast';
    el.textContent = emojis[poke.type] || '\u2764';
    document.body.appendChild(el);

    // Message
    const msg = document.createElement('div');
    msg.className = 'poke-float-text';
    msg.textContent = messages[poke.type] || `${poke.from} sent love!`;
    document.body.appendChild(msg);

    // Burst particles
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'poke-burst';
            const angle = (Math.PI * 2 * i) / 12;
            const dist = 60 + Math.random() * 80;
            particle.style.cssText = `
                left: 50%; top: 50%;
                background: ${['#e06080','#e8b84a','#c9a58f','#4ade80','#f4a4c4'][i % 5]};
                --bx: ${Math.cos(angle) * dist}px;
                --by: ${Math.sin(angle) * dist}px;
            `;
            document.body.appendChild(particle);
            setTimeout(() => particle.remove(), 1600);
        }, i * 50);
    }

    // Cleanup
    setTimeout(() => { el.remove(); msg.remove(); }, 2600);

    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
}
