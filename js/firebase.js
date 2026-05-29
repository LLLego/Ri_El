// =============================================
// FIREBASE INITIALIZATION
// =============================================

function initFirebase() {
    if (!FIREBASE_CONFIG.apiKey || !FIREBASE_CONFIG.databaseURL) {
        document.getElementById('firebaseNotice').style.display = 'block';
        initNameSystem(); // no Firebase, no password
        return;
    }
    try {
        firebase.initializeApp(FIREBASE_CONFIG);
        db = firebase.database();
        // Authenticate anonymously so RTDB rules can require auth
        firebase.auth().signInAnonymously().catch(e => {
            console.warn('Anonymous auth failed:', e);
            initNameSystem(); // auth failed, no password
        });

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                firebaseReady = true;
                // Generate room ID from couple identity
                roomId = btoa(DATA.couple.name1 + '_' + DATA.couple.name2 + '_' + DATA.couple.start_date).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
                initNameSystem(); // Firebase ready, password step available
            }
        });
    } catch (e) {
        console.warn('Firebase init failed:', e);
        document.getElementById('firebaseNotice').style.display = 'block';
        initNameSystem(); // init failed, no password
    }
}

// =============================================
// GAME HELPER SHIMS
// =============================================

function myId()      { return userKey; }
function partnerId() { return userKey === 'name1' ? 'name2' : 'name1'; }
function myName()    { return userName; }
function partnerName() {
    if (!DATA || !DATA.couple) return 'Partner';
    return userKey === 'name1' ? DATA.couple.name2 : DATA.couple.name1;
}
function getRoomId() { return roomId; }
