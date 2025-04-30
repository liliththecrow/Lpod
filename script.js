const songs = [
  { title: "Song One", file: "tunes/Song1.mp3" },
  { title: "Song Two", file: "tunes/Song2.mp3" },
];

const audio = document.getElementById("audioPlayer");
const songListEl = document.getElementById("songList");
const albumArtEl = document.getElementById("albumArt");

let currentSongIndex = 0;

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
  audio.src = song.file;
  audio.play();
  loadEmbeddedArt(song.file);
  renderSongList();
}

function loadEmbeddedArt(path) {
  jsmediatags.read(path, {
    onSuccess: function(tag) {
      if (tag.tags.picture) {
        const { data, format } = tag.tags.picture;
        const byteArray = new Uint8Array(data);
        const blob = new Blob([byteArray], { type: format });
        const url = URL.createObjectURL(blob);
        albumArtEl.style.backgroundImage = `url(${url})`;
      } else {
        albumArtEl.style.backgroundImage = `url(tunes/default.jpg)`;
      }
    },
    onError: function() {
      albumArtEl.style.backgroundImage = `url(tunes/default.jpg)`;
    }
  });
}

document.getElementById("playPause").addEventListener("click", () => {
  if (audio.paused) audio.play();
  else audio.pause();
});

document.getElementById("next").addEventListener("click", () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong();
});

document.getElementById("prev").addEventListener("click", () => {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  playSong();
});

renderSongList();
