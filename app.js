class MusicPlayer {
    constructor() {
        this.songs = [];
        this.currentSongIndex = -1;
        this.isPlaying = false;
        this.audio = new Audio();
        this.currentView = 'home';
        
        this.songsGrid = document.getElementById('songs-grid');
        this.playPauseBtn = document.getElementById('play-pause-btn');
        this.prevBtn = document.getElementById('prev-btn');
        this.nextBtn = document.getElementById('next-btn');
        this.progressSlider = document.getElementById('progress-slider');
        this.volumeSlider = document.getElementById('volume-slider');
        this.currentTimeLabel = document.getElementById('current-time');
        this.totalTimeLabel = document.getElementById('total-time');
        this.playerTitle = document.getElementById('player-title');
        this.playerArtist = document.getElementById('player-artist');
        this.playerCover = document.getElementById('player-cover');
        this.searchInput = document.getElementById('song-search');
        this.playerLikeBtn = document.getElementById('player-like-btn');
        
        this.navHome = document.getElementById('nav-home');
        this.navFavorites = document.getElementById('nav-favorites');
        this.viewTitle = document.getElementById('view-title');

        this.init();
    }

    async init() {
        try {
            await window.musicDB.init();
            this.loadSongs();
            this.setupEventListeners();
        } catch (error) {
            console.error(error);
            this.songsGrid.innerHTML = '<p>Error loading database.</p>';
        }
    }

    loadSongs() {
        if (this.currentView === 'home') {
            this.songs = window.musicDB.getAllSongs();
            this.viewTitle.textContent = 'Home';
        } else {
            this.songs = window.musicDB.getFavorites();
            this.viewTitle.textContent = 'Favorites';
        }
        this.renderCards(this.songs);
    }

    setupEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.nextBtn.addEventListener('click', () => this.playNext());
        this.prevBtn.addEventListener('click', () => this.playPrev());

        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => {
            this.totalTimeLabel.textContent = this.formatTime(this.audio.duration);
            this.progressSlider.max = Math.floor(this.audio.duration);
        });
        this.audio.addEventListener('ended', () => this.playNext());

        this.progressSlider.addEventListener('input', () => {
            this.audio.currentTime = this.progressSlider.value;
        });

        this.volumeSlider.addEventListener('input', () => {
            this.audio.volume = this.volumeSlider.value / 100;
        });

        this.searchInput.addEventListener('input', (e) => {
            const term = e.target.value.trim();
            if (term === "") {
                this.loadSongs();
            } else {
                this.songs = window.musicDB.searchSongs(term);
                this.renderCards(this.songs);
            }
        });

        this.navHome.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentView = 'home';
            document.getElementById('li-home').classList.add('active');
            document.getElementById('li-favorites').classList.remove('active');
            this.loadSongs();
        });

        this.navFavorites.addEventListener('click', (e) => {
            e.preventDefault();
            this.currentView = 'favorites';
            document.getElementById('li-home').classList.remove('active');
            document.getElementById('li-favorites').classList.add('active');
            this.loadSongs();
        });

        this.playerLikeBtn.addEventListener('click', () => {
            if (this.currentSongIndex !== -1) {
                const song = this.songs[this.currentSongIndex];
                const newStatus = !song.isFavorite;
                window.musicDB.toggleFavorite(song.id, newStatus);
                song.isFavorite = newStatus;
                this.updateLikeButtons();
                if (this.currentView === 'favorites' && !newStatus) {
                    this.loadSongs();
                }
            }
        });
    }

    renderCards(songs) {
        this.songsGrid.innerHTML = '';
        songs.forEach((song, index) => {
            const card = document.createElement('div');
            card.className = 'song-card';
            card.innerHTML = `
                <div class="card-image-container">
                    <img src="library/covers/${song.cover}" class="card-image" alt="${song.title}">
                    <button class="card-play-btn">▶</button>
                </div>
                <button class="card-like-btn ${song.isFavorite ? 'liked' : ''}">❤</button>
                <div class="card-title">${song.title}</div>
                <div class="card-artist">${song.artist}</div>
            `;

            card.querySelector('.card-play-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.playSong(index);
            });

            card.querySelector('.card-like-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const newStatus = !song.isFavorite;
                window.musicDB.toggleFavorite(song.id, newStatus);
                song.isFavorite = newStatus;
                e.target.classList.toggle('liked', newStatus);
                if (this.currentSongIndex !== -1 && this.songs[this.currentSongIndex].id === song.id) {
                    this.updateLikeButtons();
                }
                if (this.currentView === 'favorites' && !newStatus) {
                    this.loadSongs();
                }
            });

            card.addEventListener('click', () => this.playSong(index));
            this.songsGrid.appendChild(card);
        });
    }

    playSong(index) {
        if (index < 0 || index >= this.songs.length) return;
        this.currentSongIndex = index;
        const song = this.songs[index];
        this.audio.src = `library/songs/${song.fileName}`;
        this.playerTitle.textContent = song.title;
        this.playerArtist.textContent = song.artist;
        this.playerCover.style.backgroundImage = `url('library/covers/${song.cover}')`;
        this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.textContent = '⏸';
        this.updateLikeButtons();
    }

    updateLikeButtons() {
        if (this.currentSongIndex !== -1) {
            const song = this.songs[this.currentSongIndex];
            this.playerLikeBtn.classList.toggle('liked', song.isFavorite);
        }
    }

    togglePlay() {
        if (this.currentSongIndex === -1 && this.songs.length > 0) {
            this.playSong(0);
            return;
        }
        if (this.isPlaying) {
            this.audio.pause();
            this.playPauseBtn.textContent = '▶';
        } else {
            this.audio.play();
            this.playPauseBtn.textContent = '⏸';
        }
        this.isPlaying = !this.isPlaying;
    }

    playNext() {
        let nextIndex = this.currentSongIndex + 1;
        if (nextIndex >= this.songs.length) nextIndex = 0;
        this.playSong(nextIndex);
    }

    playPrev() {
        let prevIndex = this.currentSongIndex - 1;
        if (prevIndex < 0) prevIndex = this.songs.length - 1;
        this.playSong(prevIndex);
    }

    updateProgress() {
        if (!isNaN(this.audio.currentTime)) {
            this.progressSlider.value = Math.floor(this.audio.currentTime);
            this.currentTimeLabel.textContent = this.formatTime(this.audio.currentTime);
        }
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.musicPlayer = new MusicPlayer();
});
