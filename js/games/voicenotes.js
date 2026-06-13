// =============================================
// VOICE NOTES
// =============================================
// ⚠️  STATUS (June 13 2026): BROKEN ON THE LIVE SITE.
//     The UI for this feature (vnSection, vnRecordBtn, vnList) lives
//     only in index_backup.html — it was lost during the May 29
//     monolith split. The JS loads silently and the functions all
//     no-op because their target elements don't exist in the
//     current index.html.
//
//     ALSO: the current data model stores audio as base64 in
//     Firebase Realtime Database at `rooms/{rid}/voiceNotes/{id}`.
//     This is the WRONG architecture for audio — base64 inflates
//     the data ~33%, RTDB charges per GB downloaded, and the
//     30-second cap exists only as a UX guard. Real fix path:
//
//       1. Upgrade Firebase project to Blaze (pay-as-you-go; the
//          free tier covers personal couple use).
//       2. Enable Firebase Storage on the project.
//       3. Replace `audio: base64` with a Storage upload:
//            const file = new Blob(vnChunks, {type: 'audio/webm'});
//            const path = `rooms/${roomId}/voiceNotes/${uid}.webm`;
//            const snap = await firebase.storage().ref(path).put(file);
//            const audioUrl = await snap.ref.getDownloadURL();
//            db.ref(`rooms/${roomId}/voiceNotes/${uid}`).set({
//              sender, senderKey, audioUrl, duration, timestamp
//            });
//       4. In vnPlayNote, swap `new Audio(audioData)` for
//          `new Audio(audioUrl)`. Free CDN-served playback, no
//          RTDB bandwidth cost.
//       5. Restore the UI from index_backup.html (lines ~2843-2900)
//          into index.html inside #tab-together, after the existing
//          voice-note-related sections.
//
//     Until then, the size-limit guard below prevents the worst
//     failure mode (recording works locally, then crashes the
//     write when the base64 string is several MB).
// =============================================

// Max audio size we accept (in base64 chars; ~0.75 MB decoded).
// Above this, RTDB costs spike and the write may fail. The right
// long-term answer is Firebase Storage (see comment above).
const VN_MAX_BASE64_CHARS = 1_000_000;   // ~750 KB of audio at opus 32kbps ≈ ~3 min

// vnRecording declared in state.js
// vnMediaRecorder declared in state.js
// vnChunks declared in state.js
// vnTimerInterval declared in state.js
// vnRecordStart declared in state.js
// VN_MAX_SECONDS declared in state.js

function toggleVoiceNotes() {
    const sec = document.getElementById('vnSection');
    if (sec) sec.classList.toggle('open');
}

function vnToggleRecord(e) {
    if (e) e.stopPropagation();
    if (vnRecording) {
        vnStopRecord();
    } else {
        vnStartRecord();
    }
}

function vnStartRecord() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Voice recording is not supported in this browser.');
        return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        vnMediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        vnChunks = [];
        vnMediaRecorder.ondataavailable = e => { if (e.data.size > 0) vnChunks.push(e.data); };
        vnMediaRecorder.onstop = () => {
            stream.getTracks().forEach(t => t.stop());
            vnProcessRecording();
        };
        vnMediaRecorder.start();
        vnRecording = true;
        vnRecordStart = Date.now();
        const btn = document.getElementById('vnRecordBtn');
        if (btn) btn.classList.add('vn-recording');
        const label = document.getElementById('vnRecordLabel');
        if (label) label.textContent = 'Tap to Stop';
        const icon = document.getElementById('vnMicIcon');
        if (icon) icon.innerHTML = '&#9632;';
        vnTimerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - vnRecordStart) / 1000);
            const timer = document.getElementById('vnTimer');
            if (timer) timer.textContent = elapsed + 's / ' + VN_MAX_SECONDS + 's';
            if (elapsed >= VN_MAX_SECONDS) vnStopRecord();
        }, 200);
    }).catch(() => {
        alert('Could not access microphone. Please allow microphone access.');
    });
}

function vnStopRecord() {
    if (!vnRecording) return;
    vnRecording = false;
    if (vnMediaRecorder && vnMediaRecorder.state !== 'inactive') vnMediaRecorder.stop();
    clearInterval(vnTimerInterval);
    const btn = document.getElementById('vnRecordBtn');
    if (btn) btn.classList.remove('vn-recording');
    const label = document.getElementById('vnRecordLabel');
    if (label) label.textContent = 'Tap to Record';
    const icon = document.getElementById('vnMicIcon');
    if (icon) icon.innerHTML = '&#9679;';
    const timer = document.getElementById('vnTimer');
    if (timer) timer.textContent = '';
}

function vnProcessRecording() {
    if (vnChunks.length === 0) return;
    const blob = new Blob(vnChunks, { type: 'audio/webm' });
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64 = reader.result;
        // Size guard: see VOICE NOTES header comment for why this
        // exists and the right long-term answer (Firebase Storage).
        if (base64.length > VN_MAX_BASE64_CHARS) {
            alert('Recording is too long to save. Keep voice notes under ~30 seconds, or migrate to Firebase Storage (see voicenotes.js header).');
            return;
        }
        const rid = roomId || (typeof getRoomId === 'function' ? getRoomId() : null);
        if (!rid || !db) return;
        const ref = db.ref('rooms/' + rid + '/voiceNotes');
        ref.push({
            sender: userName || 'Unknown',
            senderKey: userKey || 'name1',
            audio: base64,
            timestamp: Date.now(),
            duration: Math.floor((Date.now() - vnRecordStart) / 1000)
        });
    };
    reader.readAsDataURL(blob);
}

function vnRenderNotes(data) {
    const list = document.getElementById('vnList');
    if (!list) return;
    if (!data || Object.keys(data).length === 0) {
        list.innerHTML = '<div class="vn-empty">No voice notes yet &#x2014; send one!</div>';
        return;
    }
    const entries = Object.entries(data).sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
    list.innerHTML = entries.map(([id, note]) => {
        const time = note.timestamp ? new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const dur = note.duration ? note.duration + 's' : '';
        const bars = Array.from({ length: 20 }, (_, i) => {
            const h = 4 + Math.floor(Math.random() * 20);
            return '<div class="vn-waveform-bar" style="height:' + h + 'px;"></div>';
        }).join('');
        return '<div class="vn-note" data-id="' + id + '">' +
            '<span class="vn-note-sender">' + (note.sender || 'Unknown') + '</span>' +
            '<button class="vn-play-btn" onclick="vnPlayNote(\'' + id + '\')">&#9654;</button>' +
            '<div class="vn-waveform" id="vnWave-' + id + '">' + bars + '</div>' +
            '<span class="vn-time">' + time + (dur ? ' &middot; ' + dur : '') + '</span>' +
            '</div>';
    }).join('');
}

// vnCurrentAudio declared in state.js
function vnPlayNote(id) {
    const rid = roomId || (typeof getRoomId === 'function' ? getRoomId() : null);
    if (!rid || !db) return;
    db.ref('rooms/' + rid + '/voiceNotes/' + id + '/audio').once('value', snap => {
        const audioData = snap.val();
        if (!audioData) return;
        if (vnCurrentAudio) { vnCurrentAudio.pause(); vnCurrentAudio = null; }
        vnCurrentAudio = new Audio(audioData);
        vnCurrentAudio.play();
        // Animate waveform
        const waveEl = document.getElementById('vnWave-' + id);
        if (waveEl) {
            const bars = waveEl.querySelectorAll('.vn-waveform-bar');
            let idx = 0;
            const anim = setInterval(() => {
                bars.forEach(b => b.classList.remove('active'));
                if (idx < bars.length) bars[idx].classList.add('active');
                idx = (idx + 1) % (bars.length + 1);
            }, 100);
            vnCurrentAudio.onended = () => {
                clearInterval(anim);
                bars.forEach(b => b.classList.remove('active'));
            };
        }
    });
}

function vnAutoPlayPartner(data) {
    if (!data) return;
    const entries = Object.values(data);
    if (entries.length === 0) return;
    const latest = entries.reduce((a, b) => (b.timestamp || 0) > (a.timestamp || 0) ? b : a);
    if (latest.senderKey !== userKey && latest.timestamp > (Date.now() - 5000)) {
        // Auto-play if this note was just added and is from partner
    }
}
