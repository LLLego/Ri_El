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

function initNameSystem() {
    const saved = sessionStorage.getItem('re-authed-user');
    if (saved) {
        userName = saved;
        document.getElementById('nameModal').classList.add('hidden');
        resolveUserKey();
        if (firebaseReady) initTogetherSync();
        else initTogetherLocal();
        return;
    }
    document.getElementById('nameModal').classList.remove('hidden');
    authStep = 'name';
    document.getElementById('nameStep').style.display = '';
    document.getElementById('passwordStep').style.display = 'none';
    document.getElementById('nameError').style.display = 'none';
}

function selectName(name) {
    pendingName = name;
    resolveUserKeyFromName(name);
    if (!userKey) {
        showNameError("Hmm, that doesn't match~");
        return;
    }
    if (!firebaseReady) {
        // No Firebase — just proceed
        userName = name;
        sessionStorage.setItem('re-authed-user', name);
        document.getElementById('nameModal').classList.add('hidden');
        resolveUserKey();
        initTogetherLocal();
        return;
    }
    // Show password step
    authStep = 'password';
    document.getElementById('nameStep').style.display = 'none';
    document.getElementById('passwordStep').style.display = '';
    document.getElementById('passwordTitle').textContent = 'Welcome back, ' + name + '! 💕';
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
    sessionStorage.setItem('re-authed-user', name);
    document.getElementById('nameModal').classList.add('hidden');
    document.getElementById('nameError').style.display = 'none';
    resolveUserKey();
    if (firebaseReady) initTogetherSync();
    else initTogetherLocal();
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

    // Update mood labels
    document.getElementById('moodYouName').textContent = userName;
    document.getElementById('moodThemName').textContent = userKey === 'name1' ? DATA.couple.name2 : DATA.couple.name1;
    document.getElementById('thinkingLabelYou').textContent = userName + ' today';
    document.getElementById('thinkingLabelThem').textContent = (userKey === 'name1' ? DATA.couple.name2 : DATA.couple.name1) + ' today';
    document.getElementById('letterRecipientName').textContent = userKey === 'name1' ? DATA.couple.name2 : DATA.couple.name1;
    letterRecipient = userKey === 'name1' ? 'name2' : 'name1'; // default to partner
}
