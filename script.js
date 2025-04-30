const fileInput = document.getElementById("fileInput");
const songListEl = document.getElementById("songList");
const albumArtEl = document.getElementById("albumArt");
const audio = document.getElementById("audioPlayer");

let songs = [];
let currentSongIndex = 0;

fileInput.addEventListener("change", handleFiles);

function handleFiles(event) {
  const files = Array.from(event.target.files).filter(file => file.type === "audio/mpeg");

  songs = files.map(file => ({ file, title: file.name }));

  if (songs.length > 0) {
    currentSongIndex = 0;
    renderSongList();
    playSong();
  }
}

function renderSongList() {
  songListEl.innerHTML = "";
  songs.forEach((song, index) => {
    const li = document.createElement("li");
    li.textContent = song.title;
    if (index === currentSongIndex) li.classList.add("active");
    li.addEventListener("click", () => {
      currentSongIndex = index;
      playSong();
    });
    songListEl.appendChild(li);
  });
}

function playSong() {
  const song = songs[currentSongIndex];
  const objectURL = URL.createObjectURL(song.file);
  audio.src = objectURL;
  audio.play();
  extractEmbeddedArt(song.file);
  renderSongList();
}

function extractEmbeddedArt(file) {
  jsmediatags.read(file, {
    onSuccess: tag => {
      const picture = tag.tags.picture;
      if (picture) {
        const base64String = picture.data
          .map(byte => String.fromCharCode(byte))
          .join("");
        const imageUrl = `data:${picture.format};base64,${btoa(base64String)}`;
        albumArtEl.style.backgroundImage = `url(${imageUrl})`;
      } else {
        albumArtEl.style.backgroundImage = `url('default.jpg')`;
      }
    },
    onError: () => {
      albumArtEl.style.backgroundImage = `url('default.jpg')`;
    }
  });
}

document.getElementById("playPause").addEventListener("click", () => {
  if (audio.paused) audio.play();
  else audio.pause();
});

document.getElementById("next").addEventListener("click", () => {
  if (songs.length === 0) return;
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong();
});

document.getElementById("prev").addEventListener("click", () => {
  if (songs.length === 0) return;
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong();
});
