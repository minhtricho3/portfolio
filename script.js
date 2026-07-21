// ===== LIKE BUTTON =====
const likeBtn   = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');

const LIKED_KEY = 'tynh_liked'; // lưu trạng thái đã like chưa (per user)
const BASE_URL  = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
const HEADERS   = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY
};

let liked = localStorage.getItem(LIKED_KEY) === 'true';
let count = 0;

// Lấy số tim từ JSONBin
async function fetchLikes() {
  try {
    const res  = await fetch(`${BASE_URL}/latest`, { headers: HEADERS });
    const data = await res.json();
    count = data.record.likes || 0;
    renderLike();
  } catch (e) {
    likeCount.textContent = '—';
  }
}

// Ghi số tim lên JSONBin
async function saveLikes(newCount) {
  try {
    await fetch(BASE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify({ likes: newCount })
    });
  } catch (e) {
    console.error('Lưu tim thất bại:', e);
  }
}

function renderLike() {
  likeCount.textContent = count;
  likeBtn.classList.toggle('liked', liked);
}

likeBtn.addEventListener('click', async () => {
  liked  = !liked;
  count  = liked ? count + 1 : Math.max(0, count - 1);
  localStorage.setItem(LIKED_KEY, liked);

  // pop animation
  likeBtn.classList.remove('pop');
  void likeBtn.offsetWidth;
  if (liked) likeBtn.classList.add('pop');

  renderLike();
  await saveLikes(count);
});

fetchLikes();

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
const audio          = document.getElementById('audio');
const playBtn        = document.getElementById('playBtn');
const prevBtn        = document.getElementById('prevBtn');
const nextBtn        = document.getElementById('nextBtn');
const shuffleBtn     = document.getElementById('shuffleBtn');
const repeatBtn      = document.getElementById('repeatBtn');
const progressBar    = document.getElementById('progressBar');
const volumeBar      = document.getElementById('volumeBar');
const currentTimeEl  = document.getElementById('currentTime');
const totalTimeEl    = document.getElementById('totalTime');
const titleEl        = document.getElementById('playerTitle');
const artistEl       = document.getElementById('playerArtist');
const nowPlayingLabel= document.getElementById('nowPlayingLabel');
const playerToggle   = document.getElementById('playerToggle');
const player         = document.getElementById('player');

let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let isRepeat     = false;
let autoStarted  = false; // đã autoplay chưa

// ----- Helpers -----
function formatTime(sec) {
  if (isNaN(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateProgressStyle(pct) {
  progressBar.style.background =
    `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,0.1) ${pct}%)`;
}

function updateVolumeStyle(val) {
  volumeBar.style.background =
    `linear-gradient(to right, var(--accent) ${val}%, rgba(255,255,255,0.1) ${val}%)`;
}

// ----- Load / Play / Pause -----
function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  audio.src = song.src;
  titleEl.textContent        = song.title;
  artistEl.textContent       = song.artist;
  nowPlayingLabel.textContent = song.title;
  progressBar.value = 0;
  currentTimeEl.textContent = '0:00';
  totalTimeEl.textContent   = '0:00';
  updateProgressStyle(0);
}

function playSong() {
  audio.play().catch(() => {});
  isPlaying = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

function togglePlay() {
  isPlaying ? pauseSong() : playSong();
}

function prevSong() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  currentIndex = (currentIndex - 1 + songs.length) % songs.length;
  loadSong(currentIndex);
  playSong();
}

function nextSong() {
  if (isShuffle) {
    let r;
    do { r = Math.floor(Math.random() * songs.length); }
    while (r === currentIndex && songs.length > 1);
    currentIndex = r;
  } else {
    currentIndex = (currentIndex + 1) % songs.length;
  }
  loadSong(currentIndex);
  playSong();
}

// ----- Events -----
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
  const pct = (audio.currentTime / audio.duration) * 100;
  progressBar.value = pct;
  progressBar.max   = 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  totalTimeEl.textContent   = formatTime(audio.duration);
  updateProgressStyle(pct);
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
  isRepeat ? (audio.currentTime = 0, playSong()) : nextSong();
});

// ----- Toggle ẩn/hiện -----
playerToggle.addEventListener('click', () => {
  player.classList.toggle('collapsed');
});

// ----- Autoplay khi user tương tác lần đầu -----
function tryAutoPlay() {
  if (autoStarted) return;
  autoStarted = true;
  playSong();
  document.removeEventListener('click',     tryAutoPlay);
  document.removeEventListener('keydown',   tryAutoPlay);
  document.removeEventListener('touchstart',tryAutoPlay);
}

document.addEventListener('click',      tryAutoPlay);
document.addEventListener('keydown',    tryAutoPlay);
document.addEventListener('touchstart', tryAutoPlay);

// ----- Init -----
audio.volume = volumeBar.value / 100;
updateVolumeStyle(volumeBar.value);
loadSong(0);

// Thử autoplay thẳng (sẽ thành công nếu browser cho phép)
audio.play().then(() => {
  isPlaying    = true;
  autoStarted  = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  document.removeEventListener('click',      tryAutoPlay);
  document.removeEventListener('keydown',    tryAutoPlay);
  document.removeEventListener('touchstart', tryAutoPlay);
}).catch(() => {
  // Browser chặn autoplay → chờ user tương tác
});
