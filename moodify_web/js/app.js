/**
 * Moodify SPA - 完整播放器 + 页面路由 + 情绪绑定
 * 迭代版本：修复按钮唤起 + 情绪点击 + 动画优化 + 桌面端自动播放
 */

// 检测是否为桌面端环境
const isDesktop = window.desktopAPI !== undefined;

class MoodifyApp {
    constructor() {
        // 播放器状态
        this.isPlayerVisible = false;
        this.isPlaying = false;
        this.isLooping = false;
        this.isMuted = false;
        this.isLiked = false;
        this.currentVolume = 0.7;
        this.currentIndex = 0;
        this.animationId = null;

        // 情绪映射
        this.moodMap = {
            coil: 0,
            lost: 1,
            awaken: 2,
            expand: 3
        };

        // 内置示例歌单
        this.playlist = [
            {
                name: '蜷缩 · 深蓝呼吸',
                artist: 'Moodify',
                mood: 'coil',
                color: '#6B7A8F',
                url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_4bc6a09939.mp3'
            },
            {
                name: '迷茫 · 灰雾飘散',
                artist: 'Moodify',
                mood: 'lost',
                color: '#7A8A9F',
                url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_77ef6de6e5.mp3'
            },
            {
                name: '觉醒 · 透光微暖',
                artist: 'Moodify',
                mood: 'awaken',
                color: '#A8B8C9',
                url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
            },
            {
                name: '舒展 · 透明呼吸',
                artist: 'Moodify',
                mood: 'expand',
                color: '#C4D4E4',
                url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bce8b3.mp3'
            }
        ];

        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';

        this.init();
    }

    init() {
        this.initListenButton();
        this.initNavigation();
        this.initTidalSelector();
        this.initPlayerControls();
        this.initKeyboardShortcuts();
        this.initWaveAnimation();
        this.initFolderSelector();
        this.loadTrack(0);

        // 桌面端：自动启动播放器
        if (isDesktop) {
            console.log('[桌面端] 检测到桌面环境，自动启动播放器');
            setTimeout(() => this.startListening(), 1000);
        }
    }

    // ============ 0. 音乐文件夹选择功能 ============
    initFolderSelector() {
        const folderBtn = document.getElementById('folder-btn');
        if (!folderBtn) return;

        folderBtn.addEventListener('click', () => this.selectMusicFolder());
    }

    async selectMusicFolder() {
        // 检查是否在桌面端
        if (!isDesktop || !window.desktopAPI) {
            alert('此功能仅在桌面端可用');
            return;
        }

        try {
            const result = await window.desktopAPI.selectMusicFolder();

            if (!result.success) {
                console.log('用户取消了文件夹选择');
                return;
            }

            if (result.files.length === 0) {
                alert('选择的文件夹中没有找到音乐文件');
                return;
            }

            // 更新按钮状态
            const folderBtn = document.getElementById('folder-btn');
            const folderPath = document.getElementById('folder-path');
            folderBtn.classList.add('selected');
            folderPath.textContent = this.getFolderName(result.path);

            // 将本地音乐文件添加到播放列表
            this.localPlaylist = result.files.map((file, index) => ({
                name: file.name.replace(/\.[^/.]+$/, ''), // 移除扩展名
                artist: '本地音乐',
                mood: 'local',
                color: this.getRandomColor(),
                url: file.url,
                isLocal: true
            }));

            // 切换到本地音乐播放模式
            this.isLocalMode = true;
            this.loadTrack(0);
            this.showPlayer();
            this.play();

            console.log(`已加载 ${result.files.length} 首本地音乐`);

        } catch (error) {
            console.error('选择文件夹失败:', error);
            alert('选择文件夹失败：' + error.message);
        }
    }

    getFolderName(path) {
        if (!path) return '选择音乐文件夹';
        const parts = path.split(/[/\\]/);
        return parts[parts.length - 1] || parts[parts.length - 2] || '音乐文件夹';
    }

    getRandomColor() {
        const colors = ['#6B7A8F', '#7A8A9F', '#8B9EB7', '#A8B8C9', '#C4D4E4'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // 获取当前播放列表
    getCurrentPlaylist() {
        if (this.isLocalMode && this.localPlaylist && this.localPlaylist.length > 0) {
            return this.localPlaylist;
        }
        return this.playlist;
    }

    // ============ 1. "开始聆听"按钮（修复后可重新唤起）============
    initListenButton() {
        const btn = document.getElementById('listen-btn');
        btn.addEventListener('click', () => this.startListening());
    }

    startListening() {
        const btn = document.getElementById('listen-btn');
        btn.classList.add('active');

        setTimeout(() => {
            btn.classList.add('hidden');
            this.showPlayer();
            if (!this.isPlaying) this.play();
        }, 300);
    }

    // 隐藏播放器，显示"开始聆听"按钮
    hidePlayer() {
        this.isPlayerVisible = false;
        const player = document.getElementById('persistent-player');
        const btn = document.getElementById('listen-btn');

        player.classList.remove('visible');
        this.pause();

        // 显示按钮
        setTimeout(() => {
            btn.classList.remove('hidden');
            btn.classList.remove('active');
        }, 300);
    }

    showPlayer() {
        this.isPlayerVisible = true;
        const player = document.getElementById('persistent-player');
        player.classList.add('visible');
    }

    // ============ 2. 导航切换 ============
    initNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.navigateTo(page);
            });
        });

        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1) || 'index';
            this.navigateTo(hash, false);
        });

        const hash = window.location.hash.slice(1) || 'index';
        this.navigateTo(hash, false);
    }

    navigateTo(pageName, pushState = true) {
        const pageConfig = {
            'index': { title: '情绪潮汐' },
            'boundary': { title: '音乐边界' },
            'products': { title: '情绪容器' },
            'voice': { title: '品牌声音' }
        };

        if (!pageConfig[pageName]) return;

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });

        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });

        const targetPage = document.getElementById(`page-${pageName}`);
        if (targetPage) targetPage.style.display = 'block';

        document.title = `${pageConfig[pageName].title} | Moodify`;

        if (pushState) {
            history.pushState({ page: pageName }, pageConfig[pageName].title, `#${pageName}`);
        }

        window.scrollTo(0, 0);

        // 导航到品牌声音时，定位到前言区块
        if (pageName === 'voice') {
            setTimeout(() => {
                const foreword = document.getElementById('foreword');
                if (foreword) foreword.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }

    // ============ 3. 情绪潮汐选择器（新增核心功能）============
    initTidalSelector() {
        const stages = document.querySelectorAll('.tidal-stage[data-mood]');
        const self = this;

        stages.forEach(stage => {
            stage.addEventListener('click', () => {
                const mood = stage.dataset.mood;
                const index = self.moodMap[mood];

                if (index !== undefined) {
                    self.selectMood(index);
                }
            });
        });
    }

    selectMood(index) {
        // 更新潮汐选中状态
        document.querySelectorAll('.tidal-stage[data-mood]').forEach(s => {
            s.classList.remove('active');
        });

        const moodNames = ['coil', 'lost', 'awaken', 'expand'];
        const activeStage = document.querySelector(`.tidal-stage[data-mood="${moodNames[index]}"]`);
        if (activeStage) activeStage.classList.add('active');

        // 加载对应音乐并播放
        this.loadTrack(index);
        this.showPlayer();

        if (!this.isPlaying) {
            setTimeout(() => this.play(), 100);
        }

        console.log(`🎵 情绪选择：${this.playlist[index].name}`);
    }

    // ============ 4. 播放器控制 ============
    initPlayerControls() {
        document.getElementById('btn-play').addEventListener('click', () => this.togglePlay());
        document.getElementById('btn-prev').addEventListener('click', () => this.skipPrev());
        document.getElementById('btn-next').addEventListener('click', () => this.skipNext());

        // 进度条（支持触屏）
        const progressBar = document.getElementById('progress-bar');
        progressBar.addEventListener('click', (e) => this.seek(e));
        progressBar.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.seek(e.changedTouches[0]);
        });

        document.getElementById('volume-control').addEventListener('click', (e) => this.toggleMute(e));
        document.getElementById('btn-loop').addEventListener('click', () => this.toggleLoop());
        document.getElementById('btn-like').addEventListener('click', () => this.toggleLike());

        // 音频事件
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('ended', () => this.onTrackEnded());
        this.audio.addEventListener('play', () => this.onPlay());
        this.audio.addEventListener('pause', () => this.onPause());
        this.audio.addEventListener('error', () => this.onError());

        this.audio.volume = this.currentVolume;
    }

    loadTrack(index) {
        const currentPlaylist = this.getCurrentPlaylist();
        if (currentPlaylist.length === 0) return;

        this.currentIndex = ((index % currentPlaylist.length) + currentPlaylist.length) % currentPlaylist.length;
        const track = currentPlaylist[this.currentIndex];

        this.audio.src = track.url;
        this.audio.load();

        document.getElementById('track-title').textContent = track.name;
        document.getElementById('track-artist').textContent = track.artist;

        // 封面颜色
        const cover = document.getElementById('track-cover');
        const gradient = cover.querySelector('.cover-gradient');
        gradient.style.background = `linear-gradient(135deg, ${track.color}, #A8B8C9)`;

        // 情绪徽章
        const moodText = { coil: '蜷缩', lost: '迷茫', awaken: '觉醒', expand: '舒展', local: '本地' }[track.mood] || '静默';
        let badge = cover.querySelector('.mood-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'mood-badge';
            cover.appendChild(badge);
        }
        badge.textContent = moodText;
        badge.style.background = track.color;

        // 更新潮汐选中状态
        document.querySelectorAll('.tidal-stage[data-mood]').forEach(s => {
            s.classList.toggle('active', s.dataset.mood === track.mood);
        });

        console.log(`🎵 加载：${track.name}（${moodText}）`);
    }

    play() {
        if (!this.isPlayerVisible) this.showPlayer();
        this.audio.play().catch(() => {});
    }

    pause() {
        this.audio.pause();
    }

    togglePlay() {
        if (!this.isPlayerVisible) {
            this.showPlayer();
            this.play();
            return;
        }
        this.isPlaying ? this.pause() : this.play();
    }

    onPlay() {
        this.isPlaying = true;
        const playBtn = document.getElementById('btn-play');
        playBtn.querySelector('.icon-play').style.display = 'none';
        playBtn.querySelector('.icon-pause').style.display = 'block';
        document.getElementById('track-cover').classList.add('playing');
        this.startWaveAnimation();
    }

    onPause() {
        this.isPlaying = false;
        const playBtn = document.getElementById('btn-play');
        playBtn.querySelector('.icon-play').style.display = 'block';
        playBtn.querySelector('.icon-pause').style.display = 'none';
        document.getElementById('track-cover').classList.remove('playing');
        this.stopWaveAnimation();
    }

    skipPrev() {
        const currentPlaylist = this.getCurrentPlaylist();
        if (this.audio.currentTime > 3) {
            this.audio.currentTime = 0;
        } else {
            this.loadTrack(this.currentIndex - 1);
            if (this.isPlaying) this.play();
        }
    }

    skipNext() {
        this.loadTrack(this.currentIndex + 1);
        if (this.isPlaying) this.play();
    }

    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            document.getElementById('progress-fill').style.width = `${percent}%`;
            document.getElementById('progress-thumb').style.left = `${percent}%`;
            document.getElementById('time-current').textContent = this.formatTime(this.audio.currentTime);
        }
    }

    updateDuration() {
        document.getElementById('time-duration').textContent = this.formatTime(this.audio.duration);
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    seek(e) {
        const rect = document.getElementById('progress-bar').getBoundingClientRect();
        const clientX = e.clientX !== undefined ? e.clientX : e.pageX;
        const percent = ((clientX - rect.left) / rect.width) * 100;
        if (this.audio.duration) {
            this.audio.currentTime = (percent / 100) * this.audio.duration;
        }
    }

    toggleMute(e) {
        e.stopPropagation();
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;

        const icon = document.getElementById('volume-icon');
        icon.innerHTML = this.isMuted
            ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`
            : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.audio.loop = this.isLooping;
        document.getElementById('btn-loop').classList.toggle('active', this.isLooping);
    }

    toggleLike() {
        this.isLiked = !this.isLiked;
        document.getElementById('btn-like').classList.toggle('liked', this.isLiked);
    }

    onTrackEnded() {
        if (!this.isLooping) this.skipNext();
    }

    onError() {
        console.warn('音频加载失败，尝试下一首...');
        const currentPlaylist = this.getCurrentPlaylist();
        if (currentPlaylist.length > 1) this.skipNext();
    }

    // ============ 5. 波形可视化 ============
    initWaveAnimation() {
        this.canvas = document.getElementById('waveform-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.drawIdleWave();
    }

    resizeCanvas() {
        if (!this.canvas) return;
        const container = this.canvas.parentElement;
        this.canvas.width = container.offsetWidth || 80;
        this.canvas.height = container.offsetHeight || 40;
    }

    drawIdleWave() {
        if (!this.ctx || !this.canvas) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = 32;
        const barWidth = width / barCount - 1;

        this.ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + 1);
            const barHeight = 2 + Math.sin(i * 0.4) * 3;
            const y = (height - barHeight) / 2;

            this.ctx.fillStyle = 'rgba(107, 122, 143, 0.2)';
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, barHeight, 1);
            this.ctx.fill();
        }
    }

    startWaveAnimation() {
        if (this.animationId) return;

        const animate = () => {
            if (!this.isPlaying) {
                this.drawIdleWave();
                return;
            }
            this.drawPlayingWave();
            this.animationId = requestAnimationFrame(animate);
        };

        animate();
    }

    stopWaveAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.drawIdleWave();
    }

    drawPlayingWave() {
        if (!this.ctx || !this.canvas) return;

        const width = this.canvas.width;
        const height = this.canvas.height;
        const barCount = 32;
        const barWidth = width / barCount - 1;
        const time = Date.now() * 0.001;

        this.ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < barCount; i++) {
            const x = i * (barWidth + 1);
            const base = 3 + Math.sin(i * 0.3 + time) * 2;
            const wave = Math.sin(i * 0.15 + time * 1.2) * 5;
            const barHeight = Math.max(2, base + wave);
            const y = (height - barHeight) / 2;

            const gradient = this.ctx.createLinearGradient(0, y, 0, y + barHeight);
            gradient.addColorStop(0, 'rgba(107, 122, 143, 0.3)');
            gradient.addColorStop(0.5, 'rgba(139, 158, 183, 0.5)');
            gradient.addColorStop(1, 'rgba(107, 122, 143, 0.3)');

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, barWidth, barHeight, 1);
            this.ctx.fill();
        }
    }

    // ============ 6. 键盘��捷键 ============
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    this.togglePlay();
                    break;
                case 'ArrowLeft':
                    if (this.audio.currentTime > 5) this.audio.currentTime -= 5;
                    break;
                case 'ArrowRight':
                    if (this.audio.duration && this.audio.currentTime < this.audio.duration - 5) {
                        this.audio.currentTime += 5;
                    }
                    break;
                case 'ArrowUp':
                    this.currentVolume = Math.min(1, this.currentVolume + 0.1);
                    this.audio.volume = this.currentVolume;
                    break;
                case 'ArrowDown':
                    this.currentVolume = Math.max(0, this.currentVolume - 0.1);
                    this.audio.volume = this.currentVolume;
                    break;
                case 'Digit1': this.selectMood(0); break;
                case 'Digit2': this.selectMood(1); break;
                case 'Digit3': this.selectMood(2); break;
                case 'Digit4': this.selectMood(3); break;
            }
        });
    }
}

// ============ 启动 ============
document.addEventListener('DOMContentLoaded', () => {
    window.moodifyApp = new MoodifyApp();
    console.log('🎵 Moodify 播放器已就绪');
    console.log('💡 提示：按空格键播放 | 1-4 快速切换情绪 | 点击情绪卡片选择音乐');
});
