const playlist = [
  {
    id: 1,
    title: "Late Shift Drive",
    artist: "Neon Valley",
    duration: "2:45",
    src: "assets/audio/track-01.mp3",
    cover: "assets/covers/cover-01.jpg",
    color: "#00f5ff"
  },
  {
    id: 2,
    title: "Midnight Signal",
    artist: "Lunar Static",
    duration: "3:12",
    src: "assets/audio/track-02.mp3",
    cover: "assets/covers/cover-02.jpg",
    color: "#a855f7"
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

// Loads selected song data into the player.
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

// Plays the current song.
function playSong() {
  audio.play();

  isPlaying = true;
  playBtn.textContent = "⏸";
  vinylDisc.classList.add("is-playing");
}

// Pauses the current song.
function pauseSong() {
  audio.pause();

  isPlaying = false;
  playBtn.textContent = "▶";
  vinylDisc.classList.remove("is-playing");
}

// Switches between play and pause.
function togglePlayPause() {
  if (isPlaying) {
    pauseSong();
    return;
  }

  playSong();
}

// Moves to the next song.
function nextSong() {
  if (isShuffled) {
    currentIndex = getNextShuffleIndex();
  } else {
    currentIndex++;

    if (currentIndex >= playlist.length) {
      currentIndex = 0;
    }
  }

  loadSong(currentIndex);
  playSong();
}

// Moves to the previous song or restarts current song.
function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  currentIndex--;

  if (currentIndex < 0) {
    currentIndex = playlist.length - 1;
  }

  loadSong(currentIndex);
  playSong();
}

// Updates progress bar while audio is playing.
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

// Moves audio to selected progress position.
function seekTo(value) {
  if (!audio.duration) {
    return;
  }

  audio.currentTime = (value / 100) * audio.duration;
}

// Updates audio volume.
function updateVolume(value) {
  const volumeLevel = value / 100;

  audio.volume = volumeLevel;
  volumeValue.textContent = `${value}%`;
  localStorage.setItem("musicPlayerVolume", value);

  updateRangeFill(volumeSlider, value);

  if (volumeLevel === 0) {
    isMuted = true;
    audio.muted = true;
    muteBtn.textContent = "🔇";
  } else {
    isMuted = false;
    audio.muted = false;
    muteBtn.textContent = "🔊";
  }
}

// Mutes or unmutes the player.
function toggleMute() {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.textContent = isMuted ? "🔇" : "🔊";
}

// Loads saved volume from browser storage.
function loadVolume() {
  const savedVolume = localStorage.getItem("musicPlayerVolume") || "80";

  volumeSlider.value = savedVolume;
  updateVolume(savedVolume);
}

// Converts seconds into MM:SS format.
function formatTime(seconds) {
  if (Number.isNaN(seconds)) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");

  return `${minutes}:${remainingSeconds}`;
}

// Builds the playlist rows.
function renderPlaylist() {
  playlistList.innerHTML = "";
  trackCount.textContent = `${playlist.length} tracks`;

  playlist.forEach(function (song, index) {
    const row = document.createElement("button");
    row.className = "playlist-row";
    row.type = "button";
    row.dataset.index = index;

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

// Highlights the active playlist song.
function highlightActiveRow(index) {
  const rows = document.querySelectorAll(".playlist-row");

  rows.forEach(function (row) {
    row.classList.remove("is-active");
  });

  const activeRow = document.querySelector(`.playlist-row[data-index="${index}"]`);

  if (activeRow) {
    activeRow.classList.add("is-active");
  }
}

// Changes repeat mode.
function toggleRepeat() {
  if (repeatMode === "none") {
    repeatMode = "all";
    repeatBtn.textContent = "🔁";
    repeatBtn.classList.add("is-active");
  } else if (repeatMode === "all") {
    repeatMode = "one";
    repeatBtn.textContent = "🔂";
    repeatBtn.classList.add("is-active");
  } else {
    repeatMode = "none";
    repeatBtn.textContent = "🔁";
    repeatBtn.classList.remove("is-active");
  }
}

// Turns shuffle on or off.
function toggleShuffle() {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle("is-active", isShuffled);

  if (isShuffled) {
    shuffleHistory = [currentIndex];
  } else {
    shuffleHistory = [];
  }
}

// Gets a random unplayed song index.
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

// Handles what happens when a song ends.
function handleSongEnd() {
  if (repeatMode === "one") {
    loadSong(currentIndex);
    playSong();
    return;
  }

  if (currentIndex === playlist.length - 1 && repeatMode === "none" && !isShuffled) {
    pauseSong();
    return;
  }

  nextSong();
}

// Updates the filled part of range sliders.
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

// Creates initials for missing cover images.
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

// Starts the music player.
function init() {
  renderPlaylist();
  loadVolume();
  loadSong(currentIndex);

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

  playlistToggle.addEventListener("click", function () {
    playlistPanel.hidden = !playlistPanel.hidden;
    playlistToggle.textContent = playlistPanel.hidden ? "Show Playlist" : "Hide Playlist";
  });

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