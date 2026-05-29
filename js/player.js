// =============================================
// MUSIC PLAYER
// =============================================
// playlist declared in state.js
// currentTrackIdx declared in state.js
// isPlaying declared in state.js
// allSongs declared in state.js

DATA.monthsaries.forEach(m => {
    if (m.songs) {
        m.songs.forEach(s => {
            if (!allSongs.find(ex => ex.file === s.file)) allSongs.push({...s, monthsary: m.number});
        });
    }
});

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressFill = document.getElementById('progressFill');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const visualizer = document.getElementById('visualizer');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const playlistToggle = document.getElementById('playlistToggle');
const playlistDropdown = document.getElementById('playlistDropdown');

function initPlayer() {
    if (allSongs.length === 0) { trackTitle.textContent = 'No songs yet'; trackArtist.textContent = 'Add music to data.json'; return; }
    playlist = [...allSongs]; currentTrackIdx = 0;
    renderPlaylist(); loadTrack(currentTrackIdx);
    playBtn.onclick = togglePlay;
    prevBtn.onclick = prevTrack;
    nextBtn.onclick = nextTrack;
    audio.ontimeupdate = updateProgress;
    audio.onloadedmetadata = () => { durationEl.textContent = formatTime(audio.duration); };
    audio.onended = nextTrack;
    progressBar.onclick = (e) => { const rect = progressBar.getBoundingClientRect(); const pct = (e.clientX - rect.left) / rect.width; audio.currentTime = pct * audio.duration; };
    volumeSlider.oninput = (e) => { const v = parseFloat(e.target.value); audio.volume = v; updateMuteBtn(v, audio.muted); };
    muteBtn.onclick = () => { audio.muted = !audio.muted; updateMuteBtn(audio.muted ? 0 : audio.volume, audio.muted); };
    playlistToggle.onclick = (e) => { e.stopPropagation(); playlistDropdown.classList.toggle('active'); };
    document.addEventListener('click', () => playlistDropdown.classList.remove('active'));
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); togglePlay(); }
        if (e.key === 'ArrowRight' && e.ctrlKey) nextTrack();
        if (e.key === 'ArrowLeft' && e.ctrlKey) prevTrack();
    });
}

function loadTrack(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    currentTrackIdx = idx;
    const s = playlist[idx];
    audio.src = s.file; audio.load();
    trackTitle.textContent = s.title;
    trackArtist.textContent = s.artist;
    document.querySelectorAll('.playlist-item').forEach((el, i) => el.classList.toggle('active', i === idx));
    if (isPlaying) audio.play().catch(() => {});
}
function togglePlay() {
    if (playlist.length === 0) return;
    if (isPlaying) { audio.pause(); playBtn.textContent = '\u25B6'; visualizer.classList.add('paused'); }
    else { audio.play().catch(() => {}); playBtn.textContent = '\u23F8'; visualizer.classList.remove('paused'); }
    isPlaying = !isPlaying;
}
function prevTrack() {
    if (playlist.length === 0) return;
    if (audio.currentTime > 3) { audio.currentTime = 0; return; }
    currentTrackIdx = (currentTrackIdx - 1 + playlist.length) % playlist.length;
    loadTrack(currentTrackIdx);
    if (!isPlaying) togglePlay(); else audio.play().catch(() => {});
}
function nextTrack() {
    if (playlist.length === 0) return;
    currentTrackIdx = (currentTrackIdx + 1) % playlist.length;
    loadTrack(currentTrackIdx);
    if (!isPlaying) togglePlay(); else audio.play().catch(() => {});
}
function updateProgress() {
    if (!audio.duration) return;
    progressFill.style.width = (audio.currentTime / audio.duration) * 100 + '%';
    currentTimeEl.textContent = formatTime(audio.currentTime);
}
function formatTime(s) {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    return Math.floor(s / 60) + ':' + Math.floor(s % 60).toString().padStart(2, '0');
}
function updateMuteBtn(vol, muted) {
    muteBtn.textContent = muted || vol === 0 ? '\uD83D\uDD07' : vol < 0.5 ? '\uD83D\uDD09' : '\uD83D\uDD0A';
}
function renderPlaylist() {
    playlistDropdown.innerHTML = playlist.map((s, i) => `
        <div class="playlist-item ${i === currentTrackIdx ? 'active' : ''}" onclick="selectTrack(${i})">
            <span class="pl-num">${i + 1}</span>
            <span class="pl-title">${s.title}</span>
            <span class="pl-artist">${s.artist}</span>
            <span class="pl-playing">\u25B6</span>
        </div>
    `).join('');
}
function selectTrack(idx) {
    loadTrack(idx);
    if (!isPlaying) togglePlay(); else audio.play().catch(() => {});
    playlistDropdown.classList.remove('active');
}
