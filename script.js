// ===== LIKE & VIEWS =====
const likeBtn   = document.getElementById('likeBtn');
const likeCount = document.getElementById('likeCount');
const viewCount = document.getElementById('viewCount');

const LIKED_KEY  = 'tynh_liked';
const VIEWED_KEY = 'tynh_viewed';
const BASE_URL   = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;
const HEADERS    = {
  'Content-Type': 'application/json',
  'X-Master-Key': JSONBIN_API_KEY
};

let liked  = localStorage.getItem(LIKED_KEY)  === 'true';
let viewed = localStorage.getItem(VIEWED_KEY) === 'true';
let db     = { likes: 0, views: 0 };

async function fetchData() {
  try {
    const res  = await fetch(`${BASE_URL}/latest`, { headers: HEADERS });
    const json = await res.json();
    db.likes = json.record.likes || 0;
    db.views = json.record.views || 0;
    renderStats();
    if (!viewed) {
      viewed = true;
      localStorage.setItem(VIEWED_KEY, 'true');
      db.views++;
      renderStats();
      await saveData();
    }
  } catch (e) {
    likeCount.textContent = '—';
    viewCount.textContent = '—';
  }
}

async function saveData() {
  try {
    await fetch(BASE_URL, {
      method: 'PUT',
      headers: HEADERS,
      body: JSON.stringify(db)
    });
  } catch (e) {
    console.error('Lưu thất bại:', e);
  }
}

function renderStats() {
  likeCount.textContent = db.likes;
  viewCount.textContent = db.views;
  likeBtn.classList.toggle('liked', liked);
}

likeBtn.addEventListener('click', async () => {
  liked    = !liked;
  db.likes = liked ? db.likes + 1 : Math.max(0, db.likes - 1);
  localStorage.setItem(LIKED_KEY, liked);
  likeBtn.classList.remove('pop');
  void likeBtn.offsetWidth;
  if (liked) likeBtn.classList.add('pop');
  renderStats();
  await saveData();
});

fetchData();

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
        const icon  = el.querySelector('.action-icon');
        const label = el.querySelector('.btn-label');
        icon.className    = 'fas fa-check action-icon';
        label.textContent = 'Đã copy!';
        el.classList.add('copied');
        setTimeout(() => {
          icon.className    = 'fas fa-copy action-icon';
          label.textContent = item.label;
          el.classList.remove('copied');
        }, 2000);
      });
    });
  }

  container.appendChild(el);
});

// ===== MUSIC PLAYER =====
const audio           = document.getElementById('audio');
const playBtn         = document.getElementById('playBtn');
const prevBtn         = document.getElementById('prevBtn');
const nextBtn         = document.getElementById('nextBtn');
const shuffleBtn      = document.getElementById('shuffleBtn');
const repeatBtn       = document.getElementById('repeatBtn');
const progressBar     = document.getElementById('progressBar');
const volumeBar       = document.getElementById('volumeBar');
const currentTimeEl   = document.getElementById('currentTime');
const totalTimeEl     = document.getElementById('totalTime');
const titleEl         = document.getElementById('playerTitle');
const artistEl        = document.getElementById('playerArtist');
const nowPlayingLabel = document.getElementById('nowPlayingLabel');
const playerToggle    = document.getElementById('playerToggle');
const player          = document.getElementById('player');

let currentIndex = 0;
let isPlaying    = false;
let isShuffle    = false;
let isRepeat     = false;
let autoStarted  = false;

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

function loadSong(index) {
  const song = songs[index];
  if (!song) return;
  audio.src = song.src;
  titleEl.textContent         = song.title;
  artistEl.textContent        = song.artist;
  nowPlayingLabel.textContent = song.title;
  progressBar.value           = 0;
  currentTimeEl.textContent   = '0:00';
  totalTimeEl.textContent     = '0:00';
  updateProgressStyle(0);
}

function playSong() {
  audio.play().catch(() => {});
  isPlaying         = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
  audio.pause();
  isPlaying         = false;
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
  const pct       = (audio.currentTime / audio.duration) * 100;
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

playerToggle.addEventListener('click', () => {
  player.classList.toggle('collapsed');
});

function tryAutoPlay() {
  if (autoStarted) return;
  autoStarted = true;
  playSong();
  document.removeEventListener('click',      tryAutoPlay);
  document.removeEventListener('keydown',    tryAutoPlay);
  document.removeEventListener('touchstart', tryAutoPlay);
}

document.addEventListener('click',      tryAutoPlay);
document.addEventListener('keydown',    tryAutoPlay);
document.addEventListener('touchstart', tryAutoPlay);

audio.volume = volumeBar.value / 100;
updateVolumeStyle(volumeBar.value);
loadSong(0);

audio.play().then(() => {
  isPlaying         = true;
  autoStarted       = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
  document.removeEventListener('click',      tryAutoPlay);
  document.removeEventListener('keydown',    tryAutoPlay);
  document.removeEventListener('touchstart', tryAutoPlay);
}).catch(() => {});

// ===== CHỐNG DEVTOOLS =====
// Chặn F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
document.addEventListener('keydown', (e) => {
  if (
    e.key === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I','i','J','j','C','c'].includes(e.key)) ||
    (e.ctrlKey && ['U','u'].includes(e.key))
  ) {
    e.preventDefault();
    return false;
  }
});

// Chặn chuột phải
document.addEventListener('contextmenu', (e) => e.preventDefault());

// ===== CURSOR TRAIL =====
const canvas = document.getElementById('trailCanvas');
const ctx    = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const trails = [];
const TRAIL_COUNT = 35;     // số sợi
const TRAIL_LEN   = 22;     // độ dài lịch sử mỗi sợi
const SPEED       = 0.12;   // tốc độ đuổi theo chuột (0~1)

// Khởi tạo các sợi với offset lệch nhau
for (let i = 0; i < TRAIL_COUNT; i++) {
  trails.push({
    x: window.innerWidth  / 2,
    y: window.innerHeight / 2,
    history: [],
    delay: i * 1.8,        // sợi sau trễ hơn sợi trước
    angle: (i / TRAIL_COUNT) * Math.PI * 2
  });
}

let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

// Vị trí trung gian cho từng sợi (mỗi sợi đuổi theo sợi trước)
const positions = Array.from({ length: TRAIL_COUNT }, () => ({
  x: mouse.x, y: mouse.y
}));

function animateTrail() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cập nhật vị trí từng sợi theo chain
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const target = i === 0 ? mouse : positions[i - 1];
    positions[i].x += (target.x - positions[i].x) * (SPEED - i * 0.001);
    positions[i].y += (target.y - positions[i].y) * (SPEED - i * 0.001);

    const t = trails[i];
    t.history.push({ x: positions[i].x, y: positions[i].y });
    if (t.history.length > TRAIL_LEN) t.history.shift();
  }

  // Vẽ từng sợi
  for (let i = 0; i < TRAIL_COUNT; i++) {
    const t = trails[i];
    if (t.history.length < 2) continue;

    const ratio    = i / TRAIL_COUNT;
    const alpha    = 0.55 - ratio * 0.3;
    const width    = 1.8 - ratio * 1.2;

    ctx.beginPath();
    ctx.moveTo(t.history[0].x, t.history[0].y);

    for (let j = 1; j < t.history.length; j++) {
      const segAlpha = (j / t.history.length) * alpha;
      ctx.strokeStyle = `rgba(255, 255, 255, ${segAlpha})`;
      ctx.lineWidth   = width * (j / t.history.length);
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';

      const xc = (t.history[j].x + t.history[j - 1].x) / 2;
      const yc = (t.history[j].y + t.history[j - 1].y) / 2;
      ctx.quadraticCurveTo(t.history[j - 1].x, t.history[j - 1].y, xc, yc);
    }
    ctx.stroke();
  }

  requestAnimationFrame(animateTrail);
}

animateTrail();
