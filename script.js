const fileInput = document.getElementById("fileInput");
const songListEl = document.getElementById("songList");
const albumArtEl = document.getElementById("albumArt");
const audio = document.getElementById("audioPlayer");

let songs = [];
let currentSongIndex = 0;

fileInput.addEventListener("change", handleFiles);

function handleFiles(event) {
  const files = Array.from(event.target.files).filter(file => file.type === "audio/mpeg");

  if (files.length === 0) {
    alert("Please upload .mp3 files only.");
    return;
  }

  songs = files.map(file => ({
    file,
    title: file.name.replace(/\.[^/.]+$/, ""),
    objectURL: URL.createObjectURL(file)
  }));

  currentSongIndex = 0;
  renderSongList();
  playSong();
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
  if (!songs[currentSongIndex]) return;
  const song = songs[currentSongIndex];
  audio.src = song.objectURL;
  audio.play();
  extractEmbeddedArt(song.file);
  renderSongList();
}

function extractEmbeddedArt(file) {
  const reader = new FileReader();

  reader.onload = function () {
    jsmediatags.read(
      {
        file: new Blob([reader.result]),
        type: jsmediatags.Reader.BLOB
      },
      {
        onSuccess: function (tag) {
          const pic = tag.tags.picture;
          if (pic) {
            const byteArray = new Uint8Array(pic.data);
            const blob = new Blob([byteArray], { type: pic.format });
            const url = URL.createObjectURL(blob);
            albumArtEl.style.backgroundImage = `url(${url})`;
          } else {
            albumArtEl.style.backgroundImage = `url('default.jpg')`;
          }
        },
        onError: function (err) {
          console.error("Tag error:", err);
          albumArtEl.style.backgroundImage = `url('default.jpg')`;
        }
      }
    );
  };

  reader.onerror = function (e) {
    console.error("File read error:", e);
  };

  reader.readAsArrayBuffer(file);
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

audio.addEventListener("ended", () => {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  playSong();
});
