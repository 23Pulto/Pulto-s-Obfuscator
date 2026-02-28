// music.js
class MusicPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.isVisible = true;
        this.volume = 50;
        this.musicUrl = CONFIG?.musicUrl || 'background_Music.mp3';
        
        this.init();
    }
    
    init() {
        // Check if music file exists
        fetch(this.musicUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    this.createPlayer();
                } else {
                    document.getElementById('musicControl').style.display = 'none';
                }
            })
            .catch(() => {
                document.getElementById('musicControl').style.display = 'none';
            });
    }
    
    createPlayer() {
        this.audio = new Audio(this.musicUrl);
        this.audio.loop = true;
        this.audio.volume = this.volume / 100;
        
        // Set up event listeners
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('toggleMusic').addEventListener('click', () => this.toggleMinimize());
        document.getElementById('volumeSlider').addEventListener('input', (e) => this.setVolume(e.target.value));
        
        // Update volume display
        document.getElementById('volumeValue').textContent = this.volume + '%';
    }
    
    togglePlay() {
        if (!this.audio) return;
        
        if (this.isPlaying) {
            this.audio.pause();
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audio.play();
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.isPlaying = !this.isPlaying;
    }
    
    setVolume(value) {
        this.volume = value;
        if (this.audio) {
            this.audio.volume = value / 100;
        }
        document.getElementById('volumeValue').textContent = value + '%';
    }
    
    toggleMinimize() {
        const player = document.getElementById('musicControl');
        const btn = document.getElementById('toggleMusic').querySelector('i');
        
        if (player.classList.contains('minimized')) {
            player.classList.remove('minimized');
            btn.className = 'fas fa-chevron-up';
        } else {
            player.classList.add('minimized');
            btn.className = 'fas fa-chevron-down';
        }
    }
}

// Initialize music player when page loads
window.addEventListener('load', () => {
    window.musicPlayer = new MusicPlayer();
});
