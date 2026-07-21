// ===== CONTACT BUTTONS =====
const container = document.getElementById('contactLinks');

Object.values(contact).forEach(item => {
  const el = document.createElement(item.type === 'link' ? 'a' : 'button');
  el.className = 'contact-btn';

  if (item.type === 'link') {
    el.href = item.value;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }

  el.innerHTML = `
    <i class="${item.icon}"></i>
    <span class="btn-label">${item.label}</span>
    <span class="btn-value">${item.type === 'copy' ? item.value : ''}</span>
    <i class="${item.type === 'copy' ? 'fas fa-copy' : 'fas fa-arrow-right'} action-icon"></i>
  `;

  if (item.type === 'copy') {
    el.addEventListener('click', () => {
      navigator.clipboard.writeText(item.value).then(() => {
        const icon = el.querySelector('.action-icon');
        const label = el.querySelector('.btn-label');

        icon.className = 'fas fa-check action-icon';
        label.textContent = 'Đã copy!';
        el.classList.add('copied');

        setTimeout(() => {
          icon.className = 'fas fa-copy action-icon';
          label.textContent = item.label;
          el.classList.remove('copied');
        }, 2000);
      });
    });
  }

  container.appendChild(el);
});

// ===== MUSIC PLAYER =====
const audio       = document.getElementById('audio');
const playBtn     = document.getElementById('playBtn');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const shuffleBtn  = document.getElementById('shuffleBtn');
const repeatBtn   = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const volumeBar   = document.getElementById('volumeBar');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl   = document.getElementById('totalTime');
const titleEl     = document.getElementById('playerTitle');
const artistEl    = document.getElementById('playerArtist');

let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  audio.src = song.src;
  titleEl.textContent = song.title;
  artistEl.textContent = song.artist;
  progressBar.value = 0;
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent = '0:00';
  updateProgressStyle(0);
}

function playSong() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function togglePlay() {
  if (!audio.src) { loadSong(0); playSong(); return; }
  isPlaying ? pauseSong() : playSong();
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function nextSong() {
  if (isShuffle) {
    let rand;
    do { rand = Math.floor(Math.random() * songs.length); } while (rand === currentIndex && songs.length > 1);
    currentIndex = rand;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  playSong();
}

function updateProgressStyle(percent) {
  progressBar.style.background = `linear-gradient(to right, var(--accent) ${percent}%, rgba(255,255,255,0.1) ${percent}%)`;
}

function updateVolumeStyle(val) {
  volumeBar.style.background = `linear-gradient(to right, var(--accent) ${val}%, rgba(255,255,255,0.1) ${val}%)`;
}

// Events
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active', isShuffle);
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active', isRepeat);
});

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progressBar.value = percent;
  progressBar.max = 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent = formatTime(audio.duration);
  updateProgressStyle(percent);
});

progressBar.addEventListener('input', () => {
  if (!audio.duration) return;
  audio.currentTime = (progressBar.value / 100) * audio.duration;
  updateProgressStyle(progressBar.value);
});

volumeBar.addEventListener('input', () => {
  audio.volume = volumeBar.value / 100;
  updateVolumeStyle(volumeBar.value);
});

audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    playSong();
  } else {
    nextSong();
  }
});

// Init
audio.volume = volumeBar.value / 100;
updateVolumeStyle(volumeBar.value);
loadSong(0);
