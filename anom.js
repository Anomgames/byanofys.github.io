const playlistEl = document.getElementById("playlist");
const audio = document.getElementById("audioPlayer");
const nowPlaying = document.getElementById("nowPlaying");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volumeControl = document.getElementById("volumeControl");
const headerUser = document.getElementById("headerUser");
const playerControls = document.getElementById("playerControls");
const loginContainer = document.getElementById("loginContainer");
const usernameInput = document.getElementById("usernameInput");
const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");
const playPauseBtn = document.getElementById("playPauseBtn");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

let tracks = [];
let currentIndex = 0;
let isShuffle = false;
let isRepeat = false;
let isPlaying = false;

function login() {
  const username = usernameInput.value.trim();
  if (!username) {
    alert("Lütfen kullanıcı adı girin.");
    return;
  }
  localStorage.setItem("byanofy_currentUser", username);
  showPlayer();
}

function showPlayer() {
  const user = localStorage.getItem("byanofy_currentUser");
  if (!user) return;

  headerUser.textContent = `Hoşgeldin, ${user}`;
  loginContainer.style.display = "none";
  playerControls.style.display = "flex";
  playlistEl.style.display = "block";

  loadSongs();
  volumeControl.value = 1;
  audio.volume = 1;
}

async function loadSongs() {
  try {
    const res = await fetch("https://cdn.jsdelivr.net/gh/Anomgames/runing/anom.json");
    if (!res.ok) throw new Error("Sunucu hatası: " + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Beklenen format: dizi");
    tracks = data.filter(track => track.url);
    renderPlaylist(tracks);
    playTrack(currentIndex);
  } catch (err) {
    playlistEl.innerHTML = `<li>Şarkılar yüklenemedi: ${err.message}</li>`;
    console.error("Liste yüklenemedi:", err);
  }
}

function renderPlaylist(songs) {
  playlistEl.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.className = "track";
    li.innerHTML = `
      <img src="${song.artwork}" alt="Kapak" class="cover" />
      <div class="info">
        <div class="title">${song.title}</div>
        <div class="artist">${song.artist}</div>
      </div>`;
    li.onclick = () => playTrack(index);
    playlistEl.appendChild(li);
  });
  updatePlaylistActive();
}

function updatePlaylistActive() {
  document.querySelectorAll(".track").forEach((el, i) => {
    el.classList.toggle("active", i === currentIndex);
  });
}

function playTrack(index) {
  currentIndex = index;
  const track = tracks[currentIndex];
  audio.src = track.url;
  audio.play();
  isPlaying = true;
  playPauseBtn.textContent = "⏸️";
  nowPlaying.textContent = `🎵 Çalan parça: ${track.title} - ${track.artist}`;
  updatePlaylistActive();
}

function togglePlayPause() {
  if (!audio.src) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = "▶️";
  } else {
    audio.play();
    isPlaying = true;
    playPauseBtn.textContent = "⏸️";
  }
}

function nextTrack() {
  if (isShuffle) {
    currentIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentIndex = (currentIndex + 1) % tracks.length;
  }
  playTrack(currentIndex);
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
  playTrack(currentIndex);
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  shuffleBtn.style.color = isShuffle ? "var(--green)" : "inherit";
}

function toggleRepeat() {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? "var(--green)" : "inherit";
}

audio.addEventListener("ended", () => {
  if (isRepeat) playTrack(currentIndex);
  else nextTrack();
});

audio.addEventListener("timeupdate", () => {
  const progress = (audio.currentTime / audio.duration) * 100 || 0;
  progressBar.style.width = progress + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
  durationEl.textContent = formatTime(audio.duration);
});

function formatTime(sec) {
  if (isNaN(sec)) return "00:00";
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function seek(e) {
  const percent = e.offsetX / e.target.clientWidth;
  audio.currentTime = percent * audio.duration;
}

volumeControl.addEventListener("input", () => {
  audio.volume = volumeControl.value;
});

function searchTracks() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) {
    renderPlaylist(tracks);
    return;
  }
  const filtered = tracks.filter(track =>
    track.title.toLowerCase().includes(query) || track.artist.toLowerCase().includes(query)
  );
  if (filtered.length === 0) {
    playlistEl.innerHTML = `<li style="color:#ccc; text-align:center; padding:1rem;">Sonuç bulunamadı.</li>`;
  } else {
    renderPlaylist(filtered);
  }
}

searchBtn.onclick = searchTracks;
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") searchTracks();
});

window.onload = () => {
  const user = localStorage.getItem("byanofy_currentUser");
  if (user) {
    usernameInput.value = user;
    showPlayer();
  }
};
