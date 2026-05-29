// =============================================
// TOGETHER — NAME SYSTEM + PASSWORD AUTH
// =============================================

async function hashPassword(pw) {
    const enc = new TextEncoder().encode(pw + 'ri-el-love-salt');
    const hash = await crypto.subtle.digest('SHA-256', enc);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function showNameError(msg) {
    const el = document.getElementById('nameError');
    el.textContent = msg;
    el.style.display = 'block';
}

// ── Check which names have passwords set ──
function checkRegisteredNames() {
    if (!firebaseReady || !db || !roomId) return;
    const authRef = db.ref(`rooms/${roomId}/auth`);
    authRef.once('value', snap => {
        const data = snap.val() || {};
        const n1Registered = !!(data.name1 && data.name1.passHash);
        const n2Registered = !!(data.name2 && data.name2.passHash);
        // Update name cards with registration status
        const card1 = document.getElementById('nameCard1');
        const card2 = document.getElementById('nameCard2');
        if (card1) {
            const badge1 = card1.querySelector('.name-reg-badge');
            if (badge1) {
                badge1.textContent = n1Registered ? 'Registered' : 'First time';
                badge1.className = 'name-reg-badge ' + (n1Registered ? 'registered' : 'new');
            }
        }
        if (card2) {
            const badge2 = card2.querySelector('.name-reg-badge');
            if (badge2) {
                badge2.textContent = n2Registered ? 'Registered' : 'First time';
                badge2.className = 'name-reg-badge ' + (n2Registered ? 'registered' : 'new');
            }
        }
    });
}

function initNameSystem() {
    // ALWAYS show login modal — no sessionStorage bypass
    document.getElementById('nameModal').classList.remove('hidden');
    authStep = 'name';
    document.getElementById('nameStep').style.display = '';
    document.getElementById('passwordStep').style.display = 'none';
    document.getElementById('nameError').style.display = 'none';
    // Check which names already have passwords
    checkRegisteredNames();
}

function selectName(name) {
    pendingName = name;
    resolveUserKeyFromName(name);
    if (!userKey) {
        showNameError("Hmm, that doesn\'t match~");
        return;
    }
    if (!firebaseReady) {
        // No Firebase — just proceed
        userName = name;
        document.getElementById('nameModal').classList.add('hidden');
        resolveUserKey();
        showUserBadge();
        initTogetherLocal();
        return;
    }
    // Show password step
    authStep = 'password';
    document.getElementById('nameStep').style.display = 'none';
    document.getElementById('passwordStep').style.display = '';
    document.getElementById('passwordTitle').textContent = 'Welcome, ' + name + '! 💕';
    document.getElementById('passwordSub').textContent = 'Whisper our secret~';
    document.getElementById('passwordHint').textContent = 'First time? Pick a password and it will be saved!';
    document.getElementById('passwordInput').value = '';
    document.getElementById('nameError').style.display = 'none';
    document.getElementById('passwordInput').focus();
}

function backToNameStep() {
    authStep = 'name';
    document.getElementById('nameStep').style.display = '';
    document.getElementById('passwordStep').style.display = 'none';
    document.getElementById('nameError').style.display = 'none';
}

async function submitPassword() {
    const pw = document.getElementById('passwordInput').value.trim();
    if (!pw) { showNameError('Please enter a password'); return; }
    if (pw.length < 4) { showNameError('Password must be at least 4 characters'); return; }
    const hash = await hashPassword(pw);
    const authRef = db.ref(`rooms/${roomId}/auth/${userKey}`);

    authRef.once('value', snap => {
        const data = snap.val();
        if (data && data.passHash) {
            // Existing user — verify
            if (data.passHash === hash) {
                completeLogin(pendingName);
            } else {
                showNameError('Wrong password~ Try again');
            }
        } else {
            // First time — set password
            authRef.set({ passHash: hash, name: pendingName });
            completeLogin(pendingName);
        }
    });
}

function completeLogin(name) {
    userName = name;
    document.getElementById('nameModal').classList.add('hidden');
    document.getElementById('nameError').style.display = 'none';
    resolveUserKey();
    showUserBadge();
    if (firebaseReady) initTogetherSync();
    else initTogetherLocal();
}

// ── Show who's logged in ──
function showUserBadge() {
    const badge = document.getElementById('userBadge');
    if (!badge) return;
    const emoji = userKey === 'name1' ? '🦆' : '🐯';
    badge.textContent = emoji + ' ' + userName;
    badge.style.display = 'inline-flex';
}

function logout() {
    sessionStorage.removeItem('re-authed-user');
    userName = null;
    userKey = null;
    pendingName = null;
    const badge = document.getElementById('userBadge');
    if (badge) badge.style.display = 'none';
    document.getElementById('nameModal').classList.remove('hidden');
    authStep = 'name';
    document.getElementById('nameStep').style.display = '';
    document.getElementById('passwordStep').style.display = 'none';
    document.getElementById('nameError').style.display = 'none';
    checkRegisteredNames();
}

function resolveUserKeyFromName(name) {
    const n = name.toLowerCase();
    const n1 = DATA.couple.name1.toLowerCase();
    const n2 = DATA.couple.name2.toLowerCase();
    const n1a = (DATA.couple.name1_alt || '').toLowerCase();
    const n2a = (DATA.couple.name2_alt || '').toLowerCase();
    if (n === n1 || n === n1a) userKey = 'name1';
    else if (n === n2 || n === n2a) userKey = 'name2';
    else userKey = null;
}

function resolveUserKey() {
    if (!userName) return;
    resolveUserKeyFromName(userName);
    if (!userKey) userKey = 'name1'; // fallback

    // Update mood labels (null-guarded — elements may not exist yet)
    const themName = userKey === 'name1' ? DATA.couple.name2 : DATA.couple.name1;
    const moodYou = document.getElementById('moodYouName');
    if (moodYou) moodYou.textContent = userName;
    const moodThem = document.getElementById('moodThemName');
    if (moodThem) moodThem.textContent = themName;
    const thinkYou = document.getElementById('thinkingLabelYou');
    if (thinkYou) thinkYou.textContent = userName + ' today';
    const thinkThem = document.getElementById('thinkingLabelThem');
    if (thinkThem) thinkThem.textContent = themName + ' today';
    const letterTo = document.getElementById('letterRecipientName');
    if (letterTo) letterTo.textContent = themName;
    letterRecipient = userKey === 'name1' ? 'name2' : 'name1'; // default to partner
}
