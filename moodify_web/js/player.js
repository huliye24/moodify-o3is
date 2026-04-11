/**
 * Moodify Player - 艺术化播放器 v3.1
 * 潮汐美学设计
 * 优雅、不眼花
 */

class MoodifyPlayer {
    constructor(options = {}) {
        this.container = options.container || document.body;
        this.serverUrl = 'http://127.0.0.1:5000';
        this.currentTrack = null;
        this.currentIndex = 0;
        this.isPlaying = false;
        this.playlist = [];
        this.audio = new Audio();
        this.isLooping = false;
        this.isShuffle = false;
        this.isLike = false;
        this.waveBars = [];
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.createPlayer();
        this.bindEvents();
        this.loadPlaylist();
        this.initWaveAnimation();
    }
    
    async loadPlaylist() {
        try {
            const response = await fetch(`${this.serverUrl}/api/music`);
            const data = await response.json();
            this.playlist = data.songs;
            
            if (this.playlist.length > 0) {
                this.loadTrack(0);
                this.updateTrackCount();
            }
            
            console.log(`🎵 已加载 ${this.playlist.length} 首音乐`);
        } catch (error) {
            console.warn('无法连接到服务器，请确保后端正在运行');
            console.warn('提示：双击 "启动Moodify.bat" 启动后端');
        }
    }
    
    createPlayer() {
        const playerHTML = `
            <div class="moodify-player" id="moodify-player">
                <!-- 极简波浪背景 -->
                <div class="player-waveform" id="player-waveform">
                    <canvas id="waveform-canvas"></canvas>
                </div>
                
                <!-- Track Info -->
                <div class="player-track-info">
                    <div class="track-cover" id="track-cover">
                        <div class="cover-gradient"></div>
                        <div class="cover-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="3"/>
                                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="0.5"/>
                            </svg>
                        </div>
                    </div>
                    <div class="track-details">
                        <span class="track-title" id="track-title">等待潮汐</span>
                        <span class="track-artist" id="track-artist">Moodify</span>
                    </div>
                    <div class="track-mood">
                        <span class="mood-badge" id="mood-badge">静默</span>
                    </div>
                </div>
                
                <!-- Controls -->
                <div class="player-controls">
                    <div class="control-btn control-skip" id="btn-prev" title="上一首">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                        </svg>
                    </div>
                    
                    <div class="control-btn control-play" id="btn-play" title="播放">
                        <div class="play-icon">
                            <svg class="icon-play" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z"/>
                            </svg>
                            <svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="control-btn control-skip" id="btn-next" title="下一首">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                        </svg>
                    </div>
                </div>
                
                <!-- Timeline -->
                <div class="player-timeline">
                    <span class="time-current" id="time-current">0:00</span>
                    <div class="progress-bar" id="progress-bar">
                        <div class="progress-track">
                            <div class="progress-fill" id="progress-fill"></div>
                            <div class="progress-thumb" id="progress-thumb"></div>
                        </div>
                    </div>
                    <span class="time-duration" id="time-duration">0:00</span>
                </div>
                
                <!-- Extras -->
                <div class="player-extras">
                    <div class="volume-control" id="volume-control">
                        <div class="volume-icon" id="volume-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
                            </svg>
                        </div>
                        <div class="volume-slider">
                            <div class="volume-track">
                                <div class="volume-fill" id="volume-fill" style="width: 70%"></div>
                                <div class="volume-thumb" id="volume-thumb"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="extra-controls">
                        <div class="control-btn control-loop" id="btn-loop" title="循环">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>
                            </svg>
                        </div>
                        
                        <div class="control-btn control-shuffle" id="btn-shuffle" title="随机">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="player-like">
                        <div class="like-btn" id="btn-like" title="收藏">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.insertAdjacentHTML('beforeend', playerHTML);
        this.player = document.getElementById('moodify-player');
        this.canvas = document.getElementById('waveform-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.trackCover = document.getElementById('track-cover');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const waveform = document.getElementById('player-waveform');
        if (waveform && this.canvas) {
            this.canvas.width = waveform.offsetWidth;
            this.canvas.height = waveform.offsetHeight;
            this.drawIdleWave();
        }
    }
    
    // 初始化波浪动画数据
    initWaveAnimation() {
        this.waveBars = [];
        for (let i = 0; i < 50; i++) {
            this.waveBars.push({
                targetHeight: 0,
                currentHeight: 0,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02
            });
        }
    }
    
    // 绘制静态波浪（不眼花）
    drawIdleWave() {
        if (!this.ctx) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = 40;
        const barWidth = width / barCount - 2;
        
        this.ctx.clearRect(0, 0, width, height);
        
        for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + 2);
            const barHeight = 2 + Math.sin(i * 0.3) * 3;
            const y = (height - barHeight) / 2;
            
            this.ctx.fillStyle = 'rgba(107, 122, 143, 0.15)';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, barHeight, 1);
            this.ctx.fill();
        }
    }
    
    // 绘制动态波浪（播放时）
    drawPlayingWave() {
        if (!this.ctx || !this.isPlaying) return;
        
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = 40;
        const barWidth = width / barCount - 2;
        
        this.ctx.clearRect(0, 0, width, height);
        
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < barCount; i++) {
            const bar = this.waveBars[i];
            
            // 柔和的波浪动画
            const baseHeight = 3 + Math.sin(i * 0.2 + time) * 2;
            const wave = Math.sin(i * 0.15 + time * 1.5) * 4;
            const barHeight = baseHeight + wave;
            
            const x = i * (barWidth + 2);
            const y = (height - barHeight) / 2;
            
            // 渐变色
            const gradient = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, 'rgba(107, 122, 143, 0.25)');
            gradient.addColorStop(0.5, 'rgba(139, 158, 183, 0.35)');
            gradient.addColorStop(1, 'rgba(107, 122, 143, 0.25)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, barHeight, 1);
            this.ctx.fill();
        }
    }
    
    startWaveAnimation() {
        const animate = () => {
            if (this.isPlaying) {
                this.drawPlayingWave();
            } else {
                this.drawIdleWave();
            }
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    bindEvents() {
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-prev').addEventListener('click', () => this.skipPrev());
        document.getElementById('btn-next').addEventListener('click', () => this.skipNext());
        
        const progressBar = document.getElementById('progress-bar');
        progressBar.addEventListener('click', (e) => this.seek(e));
        
        const volumeControl = document.getElementById('volume-control');
        volumeControl.addEventListener('click', (e) => this.setVolume(e));
        
        document.getElementById('btn-like').addEventListener('click', () => this.toggleLike());
        document.getElementById('btn-loop').addEventListener('click', () => this.toggleLoop());
        document.getElementById('btn-shuffle').addEventListener('click', () => this.toggleShuffle());
        
        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('error', (e) => this.onError(e));
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    loadTrack(index) {
        if (this.playlist.length === 0) return;
        
        this.currentIndex = index;
        if (this.currentIndex < 0) this.currentIndex = this.playlist.length - 1;
        if (this.currentIndex >= this.playlist.length) this.currentIndex = 0;
        
        const track = this.playlist[this.currentIndex];
        this.currentTrack = track;
        
        this.audio.src = `${this.serverUrl}${track.path}`;
        this.audio.volume = 0.7;
        
        document.getElementById('track-title').textContent = track.name;
        document.getElementById('track-artist').textContent = 'Moodify';
        document.getElementById('mood-badge').textContent = this.getMoodText();
        
        console.log(`🎵 加载: ${track.name}`);
    }
    
    getMoodText() {
        const moods = ['静默', '蜷缩', '迷茫', '觉醒', '舒展'];
        const index = this.currentIndex % moods.length;
        return moods[index];
    }
    
    togglePlay() {
        if (this.playlist.length === 0) {
            console.warn('没有音乐，请确保后端正在运行');
            return;
        }
        
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().catch(e => console.warn('播放失败:', e));
        }
    }
    
    onPlay() {
        this.isPlaying = true;
        const playBtn = document.getElementById('btn-play');
        const playIcon = playBtn.querySelector('.icon-play');
        const pauseIcon = playBtn.querySelector('.icon-pause');
        
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        playBtn.classList.add('playing');
        
        this.trackCover.classList.add('playing');
    }
    
    onPause() {
        this.isPlaying = false;
        const playBtn = document.getElementById('btn-play');
        const playIcon = playBtn.querySelector('.icon-play');
        const pauseIcon = playBtn.querySelector('.icon-pause');
        
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        playBtn.classList.remove('playing');
        
        this.trackCover.classList.remove('playing');
    }
    
    skipPrev() {
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            if (this.isShuffle) {
                this.currentIndex = Math.floor(Math.random() * this.playlist.length);
            } else {
                this.currentIndex = (this.currentIndex - 1 + this.playlist.length) % this.playlist.length;
            }
            this.loadTrack(this.currentIndex);
            if (this.isPlaying) this.audio.play();
        }
    }
    
    skipNext() {
        if (this.isShuffle) {
            this.currentIndex = Math.floor(Math.random() * this.playlist.length);
        } else {
            this.currentIndex = (this.currentIndex + 1) % this.playlist.length;
        }
        this.loadTrack(this.currentIndex);
        if (this.isPlaying) this.audio.play();
    }
    
    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress-fill').style.width = `${percent}%`;
            document.getElementById('progress-thumb').style.left = `${percent}%`;
            
            const currentTime = this.formatTime(this.audio.currentTime);
            document.getElementById('time-current').textContent = currentTime;
        }
    }
    
    updateDuration() {
        const duration = this.formatTime(this.audio.duration);
        document.getElementById('time-duration').textContent = duration;
    }
    
    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    seek(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        if (this.audio.duration) {
            this.audio.currentTime = (percent / 100) * this.audio.duration;
        }
    }
    
    setVolume(e) {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        const clampedPercent = Math.max(0, Math.min(100, percent));
        
        this.audio.volume = clampedPercent / 100;
        document.getElementById('volume-fill').style.width = `${clampedPercent}%`;
        
        const volumeIcon = document.getElementById('volume-icon');
        if (clampedPercent === 0) {
            volumeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;
        } else if (clampedPercent < 50) {
            volumeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>`;
        } else {
            volumeIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
        }
    }
    
    toggleLike() {
        const likeBtn = document.getElementById('btn-like');
        this.isLike = !this.isLike;
        likeBtn.classList.toggle('liked', this.isLike);
    }
    
    toggleLoop() {
        const btn = document.getElementById('btn-loop');
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        btn.classList.toggle('active', this.isLooping);
    }
    
    toggleShuffle() {
        const btn = document.getElementById('btn-shuffle');
        this.isShuffle = !this.isShuffle;
        btn.classList.toggle('active', this.isShuffle);
    }
    
    onTrackEnded() {
        if (!this.isLooping) {
            this.skipNext();
        }
    }
    
    onError(e) {
        console.warn('音频加载失败');
    }
    
    handleKeyboard(e) {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            this.togglePlay();
        } else if (e.code === 'ArrowLeft') {
            if (this.audio.currentTime > 5) {
                this.audio.currentTime -= 5;
            }
        } else if (e.code === 'ArrowRight') {
            if (this.audio.currentTime < this.audio.duration - 5) {
                this.audio.currentTime += 5;
            }
        }
    }
    
    updateTrackCount() {
        // 更新播放计数显示
        const count = this.playlist.length;
        console.log(`📂 共 ${count} 首音乐`);
    }
    
    show() {
        this.player.classList.add('visible');
        this.startWaveAnimation();
        
        const listenBtn = document.getElementById('listen-btn');
        if (listenBtn) {
            listenBtn.classList.add('hidden');
        }
    }
    
    hide() {
        this.player.classList.remove('visible');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.moodifyPlayer = new MoodifyPlayer();
});
