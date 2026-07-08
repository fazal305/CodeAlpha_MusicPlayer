const playlist = [
  {
    id: 1,
    title: "Late Shift Drive",
    artist: "Neon Valley",
    duration: "2:45",
    src: "assets/audio/track-01.mp3",
    cover: "assets/covers/cover-01.jpg",
    color: "#00c2ff"
  },
  {
    id: 2,
    title: "Midnight Signal",
    artist: "Lunar Static",
    duration: "3:12",
    src: "assets/audio/track-02.mp3",
    cover: "assets/covers/cover-02.jpg",
    color: "#8b5cf6"
  },
  {
    id: 3,
    title: "Golden Hour Loop",
    artist: "Retro Bloom",
    duration: "2:58",
    src: "assets/audio/track-03.mp3",
    cover: "assets/covers/cover-03.jpg",
    color: "#f59e0b"
  },
  {
    id: 4,
    title: "City Rain FM",
    artist: "Echo District",
    duration: "3:30",
    src: "assets/audio/track-04.mp3",
    cover: "assets/covers/cover-04.jpg",
    color: "#22c55e"
  },
  {
    id: 5,
    title: "Redline Dreams",
    artist: "Night Arcade",
    duration: "2:36",
    src: "assets/audio/track-05.mp3",
    cover: "assets/covers/cover-05.jpg",
    color: "#ef4444"
  }
];

const audio = new Audio();

let currentIndex = 0;
let isPlaying = false;
let isMuted = false;
let isShuffled = false;
let repeatMode = "none";
let shuffleHistory = [];

const vinylDisc = document.querySelector("#vinyl-disc");
const vinylCover = document.querySelector("#vinyl-cover");
const vinylFallback = document.querySelector("#vinyl-fallback");
const songTitle = document.querySelector("#song-title");
const songArtist = document.querySelector("#song-artist");
const currentTimeText = document.querySelector("#current-time");
const totalDurationText = document.querySelector("#total-duration");
const progressBar = document.querySelector("#progress-bar");
const playBtn = document.querySelector("#play-btn");
const prevBtn = document.querySelector("#prev-btn");
const nextBtn = document.querySelector("#next-btn");
const shuffleBtn = document.querySelector("#shuffle-btn");
const repeatBtn = document.querySelector("#repeat-btn");
const muteBtn = document.querySelector("#mute-btn");
const volumeSlider = document.querySelector("#volume-slider");
const volumeValue = document.querySelector("#volume-value");
const playlistToggle = document.querySelector("#playlist-toggle");
const playlistPanel = document.querySelector("#playlist-panel");
const playlistList = document.querySelector("#playlist-list");
const trackCount = document.querySelector("#track-count");

function loadSong(index) {
  const song = playlist[index];

  currentIndex = index;
  audio.src = song.src;

  document.documentElement.style.setProperty("--accent-color", song.color);

  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  vinylCover.src = song.cover;
  vinylCover.alt = `${song.title} cover`;
  vinylFallback.textContent = getSongInitials(song.title);

  songTitle.classList.toggle("is-long", song.title.length > 18);

  progressBar.value = 0;
  currentTimeText.textContent = "0:00";
  totalDurationText.textContent = song.duration;

  updateRangeFill(progressBar, 0);
  highlightActiveRow(index);
}

function playSong() {
  const playRequest = audio.play();

  if (playRequest !== undefined) {
    playRequest.catch(function () {
      pauseSong();
    });
  }

  isPlaying = true;
  playBtn.textContent = "PAUSE";
  playBtn.setAttribute("aria-label", "Pause current track");
  vinylDisc.classList.add("is-playing");
}

function pauseSong() {
  audio.pause();

  isPlaying = false;
  playBtn.textContent = "PLAY";
  playBtn.setAttribute("aria-label", "Play current track");
  vinylDisc.classList.remove("is-playing");
}

function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
    return;
  }

  playSong();
}

function nextSong() {
  if (isShuffled) {
    currentIndex = getNextShuffleIndex();
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }

  loadSong(currentIndex);
  playSong();
}

function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  currentIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
  loadSong(currentIndex);
  playSong();
}

function updateProgressBar() {
  if (!audio.duration) {
    return;
  }

  const progressPercent = (audio.currentTime / audio.duration) * 100;

  progressBar.value = progressPercent;
  currentTimeText.textContent = formatTime(audio.currentTime);
  totalDurationText.textContent = formatTime(audio.duration);

  updateRangeFill(progressBar, progressPercent);
}

function seekTo(value) {
  if (!audio.duration) {
    return;
  }

  audio.currentTime = (value / 100) * audio.duration;
}

function updateVolume(value) {
  const volumeLevel = Number(value) / 100;

  audio.volume = volumeLevel;
  volumeValue.textContent = `${value}%`;
  localStorage.setItem("musicPlayerVolume", value);

  updateRangeFill(volumeSlider, value);

  if (volumeLevel === 0) {
    isMuted = true;
    audio.muted = true;
  } else {
    isMuted = false;
    audio.muted = false;
  }

  updateMuteButton();
}

function toggleMute() {
  isMuted = !isMuted;
  audio.muted = isMuted;
  updateMuteButton();
}

function updateMuteButton() {
  muteBtn.textContent = isMuted ? "MUTE" : "VOL";
  muteBtn.setAttribute("aria-label", isMuted ? "Unmute audio" : "Mute audio");
}

function loadVolume() {
  const savedVolume = localStorage.getItem("musicPlayerVolume") || "80";

  volumeSlider.value = savedVolume;
  updateVolume(savedVolume);
}

function formatTime(seconds) {
  if (Number.isNaN(seconds) || !Number.isFinite(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

function renderPlaylist() {
  playlistList.innerHTML = "";
  trackCount.textContent = `${playlist.length} tracks`;

  playlist.forEach(function (song, index) {
    const row = document.createElement("button");
    row.className = "playlist-row";
    row.type = "button";
    row.dataset.index = index;
    row.setAttribute("aria-label", `Play ${song.title} by ${song.artist}`);

    row.innerHTML = `
      <span class="track-number">${String(index + 1).padStart(2, "0")}</span>
      <span>
        <span class="track-title">${song.title}</span>
        <span class="track-artist">${song.artist}</span>
      </span>
      <span class="playlist-right">
        <span class="track-duration">${song.duration}</span>
        <span class="equalizer" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </span>
      </span>
    `;

    playlistList.appendChild(row);
  });
}

function highlightActiveRow(index) {
  const rows = document.querySelectorAll(".playlist-row");

  rows.forEach(function (row) {
    row.classList.remove("is-active");
    row.setAttribute("aria-current", "false");
  });

  const activeRow = document.querySelector(`.playlist-row[data-index="${index}"]`);

  if (activeRow) {
    activeRow.classList.add("is-active");
    activeRow.setAttribute("aria-current", "true");
  }
}

function toggleRepeat() {
  if (repeatMode === "none") {
    repeatMode = "all";
  } else if (repeatMode === "all") {
    repeatMode = "one";
  } else {
    repeatMode = "none";
  }

  updateRepeatButton();
}

function updateRepeatButton() {
  repeatBtn.classList.toggle("is-active", repeatMode !== "none");
  repeatBtn.textContent = repeatMode === "one" ? "RPT 1" : "RPT";
  repeatBtn.setAttribute("aria-label", `Repeat mode: ${repeatMode}`);
}

function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle("is-active", isShuffled);
  shuffleBtn.setAttribute("aria-pressed", String(isShuffled));

  shuffleHistory = isShuffled ? [currentIndex] : [];
}

function getNextShuffleIndex() {
  if (shuffleHistory.length >= playlist.length) {
    shuffleHistory = [currentIndex];
  }

  let randomIndex = currentIndex;

  while (shuffleHistory.includes(randomIndex)) {
    randomIndex = Math.floor(Math.random() * playlist.length);
  }

  shuffleHistory.push(randomIndex);

  return randomIndex;
}

function handleSongEnd() {
  if (repeatMode === "one") {
    loadSong(currentIndex);
    playSong();
    return;
  }

  if (currentIndex === playlist.length - 1 && repeatMode === "none" && !isShuffled) {
    pauseSong();
    audio.currentTime = 0;
    updateProgressBar();
    return;
  }

  nextSong();
}

function updateRangeFill(rangeInput, value) {
  rangeInput.style.background = `
    linear-gradient(
      to right,
      var(--accent-color) 0%,
      var(--accent-color) ${value}%,
      rgba(255, 255, 255, 0.16) ${value}%,
      rgba(255, 255, 255, 0.16) 100%
    )
  `;
}

function getSongInitials(title) {
  return title
    .split(" ")
    .map(function (word) {
      return word.charAt(0);
    })
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function togglePlaylist() {
  const isHidden = !playlistPanel.hidden;

  playlistPanel.hidden = isHidden;
  playlistToggle.textContent = isHidden ? "Show Playlist" : "Hide Playlist";
  playlistToggle.setAttribute("aria-expanded", String(!isHidden));
}

function init() {
  renderPlaylist();
  loadVolume();
  loadSong(currentIndex);
  updateRepeatButton();
  updateMuteButton();

  playBtn.addEventListener("click", togglePlayPause);
  nextBtn.addEventListener("click", nextSong);
  prevBtn.addEventListener("click", prevSong);
  shuffleBtn.addEventListener("click", toggleShuffle);
  repeatBtn.addEventListener("click", toggleRepeat);
  muteBtn.addEventListener("click", toggleMute);

  progressBar.addEventListener("input", function () {
    seekTo(progressBar.value);
  });

  volumeSlider.addEventListener("input", function () {
    updateVolume(volumeSlider.value);
  });

  playlistToggle.addEventListener("click", togglePlaylist);

  playlistList.addEventListener("click", function (event) {
    const row = event.target.closest(".playlist-row");

    if (!row) {
      return;
    }

    loadSong(Number(row.dataset.index));
    playSong();
  });

  vinylCover.addEventListener("error", function () {
    vinylCover.style.display = "none";
    vinylFallback.style.display = "grid";
  });

  vinylCover.addEventListener("load", function () {
    vinylCover.style.display = "block";
    vinylFallback.style.display = "none";
  });

  audio.addEventListener("loadedmetadata", updateProgressBar);
  audio.addEventListener("timeupdate", updateProgressBar);
  audio.addEventListener("ended", handleSongEnd);
}

init();
