// =============================================
// VOICE NOTES
// =============================================
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
