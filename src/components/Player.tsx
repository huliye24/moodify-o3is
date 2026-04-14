import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat, Heart,
  FolderOpen, ListMusic
} from 'lucide-react'

// 内置情绪歌单
const MOOD_PLAYLIST = [
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
]

const MOOD_NAMES: Record<string, string> = {
  coil: '蜷缩', lost: '迷茫', awaken: '觉醒', expand: '舒展', local: '本地'
}

export interface MoodTrack {
  name: string
  artist: string
  mood: string
  color: string
  url: string
  isLocal?: boolean
}

export default function Player() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [playlist, setPlaylist] = useState<MoodTrack[]>(MOOD_PLAYLIST)
  const [isLocalMode, setIsLocalMode] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number>(0)
  const moodBgRef = useRef<HTMLDivElement>(null)

  const currentTrack = playlist[currentIndex]

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // Canvas 波形动画
  const drawWave = useCallback((playing: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const barCount = 32
    const barWidth = w / barCount - 1
    const t = Date.now() * 0.001

    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + 1)
      let barH: number
      if (playing) {
        const base = 3 + Math.sin(i * 0.3 + t) * 2
        barH = Math.max(2, base + Math.sin(i * 0.15 + t * 1.2) * 5)
      } else {
        barH = 2 + Math.sin(i * 0.4) * 3
      }
      const y = (h - barH) / 2
      const grad = ctx.createLinearGradient(0, y, 0, y + barH)
      grad.addColorStop(0, 'rgba(107,122,143,0.3)')
      grad.addColorStop(0.5, 'rgba(139,158,183,0.5)')
      grad.addColorStop(1, 'rgba(107,122,143,0.3)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barH, 1)
      ctx.fill()
    }

    if (playing) {
      animationRef.current = requestAnimationFrame(() => drawWave(true))
    }
  }, [])

  // 播放控制
  const play = useCallback(() => {
    audioRef.current?.play().catch(() => {})
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const togglePlay = useCallback(() => {
    if (!isVisible) {
      setIsVisible(true)
      setTimeout(() => {
        play()
        setIsPlaying(true)
        drawWave(true)
      }, 100)
      return
    }
    if (isPlaying) {
      pause()
      setIsPlaying(false)
      cancelAnimationFrame(animationRef.current)
      drawWave(false)
    } else {
      play()
      setIsPlaying(true)
      drawWave(true)
    }
  }, [isVisible, isPlaying, play, pause, drawWave])

  const loadTrack = useCallback((index: number) => {
    const list = playlist
    if (!list.length) return
    const idx = ((index % list.length) + list.length) % list.length
    setCurrentIndex(idx)
    setCurrentTime(0)
    const track = list[idx]
    if (audioRef.current) {
      audioRef.current.src = track.url
      audioRef.current.load()
      audioRef.current.play().catch(() => {})
    }
    setIsPlaying(true)
    setIsVisible(true)
    drawWave(true)

    // 更新氛围背景
    if (moodBgRef.current) {
      moodBgRef.current.style.background = `linear-gradient(135deg, ${track.color}22, transparent)`
    }
  }, [playlist, drawWave])

  const skipNext = useCallback(() => {
    const list = playlist
    loadTrack(currentIndex + 1)
  }, [currentIndex, playlist, loadTrack])

  const skipPrev = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0
      return
    }
    loadTrack(currentIndex - 1)
  }, [currentIndex, loadTrack])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    if (audioRef.current && duration > 0) {
      audioRef.current.currentTime = pct * duration
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    setIsMuted(v === 0)
    if (audioRef.current) audioRef.current.volume = v
  }

  const toggleMute = () => {
    const next = !isMuted
    setIsMuted(next)
    if (audioRef.current) audioRef.current.muted = next
  }

  const toggleLoop = () => {
    setIsLooping(l => {
      const next = !l
      if (audioRef.current) audioRef.current.loop = next
      return next
    })
  }

  const selectMood = (index: number) => {
    setIsLocalMode(false)
    loadTrack(index)
  }

  // 选择本地音乐文件夹
  const selectMusicFolder = async () => {
    if (!window.api) return
    try {
      const result = await window.api.dialog.openDirectory()
      if (!result) return

      // 获取音频文件列表（通过 shell.openExternal 方式用户选择后回来）
      // 这里简化处理，实际通过 IPC
      const dirResult = await (window as any).api?.settings?.get('lastMusicPath')
      console.log('选择文件夹:', result)
    } catch (e) {
      console.error(e)
    }
  }

  // 初始化音频
  useEffect(() => {
    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.volume = volume
    audioRef.current = audio

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => {
      if (!isLooping) skipNext()
    })
    audio.addEventListener('play', () => setIsPlaying(true))
    audio.addEventListener('pause', () => setIsPlaying(false))

    // 初始化 Canvas
    const canvas = canvasRef.current
    if (canvas) {
      const resize = () => {
        const parent = canvas.parentElement
        if (parent) {
          canvas.width = parent.offsetWidth || 80
          canvas.height = parent.offsetHeight || 40
        }
      }
      resize()
      window.addEventListener('resize', resize)
      drawWave(false)
      return () => {
        window.removeEventListener('resize', resize)
        cancelAnimationFrame(animationRef.current)
        audio.pause()
      }
    }

    return () => {
      audio.pause()
    }
  }, [isLooping, skipNext, drawWave])

  // 监听情绪选择事件
  useEffect(() => {
    const handler = (e: Event) => {
      const { index } = (e as CustomEvent).detail as { index: number }
      selectMood(index)
    }
    window.addEventListener('moodify:selectMood', handler)
    return () => window.removeEventListener('moodify:selectMood', handler)
  }, [selectMood])

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlay(); break
        case 'ArrowLeft':
          if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5)
          break
        case 'ArrowRight':
          if (audioRef.current && duration > 0) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5)
          break
        case 'Digit1': selectMood(0); break
        case 'Digit2': selectMood(1); break
        case 'Digit3': selectMood(2); break
        case 'Digit4': selectMood(3); break
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [togglePlay, duration, selectMood])

  const moodText = currentTrack ? (MOOD_NAMES[currentTrack.mood] || '静默') : ''

  return (
    <>
      {/* 底部播放器 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-8 px-10 h-20 transition-all duration-500"
        style={{
          background: 'linear-gradient(180deg, rgba(17,17,24,0.99) 0%, rgba(10,10,15,1) 100%)',
          backdropFilter: 'blur(40px)',
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          opacity: isVisible ? 1 : 0,
          borderTop: '1px solid rgba(107,122,143,0.2)',
          boxShadow: '0 -20px 60px rgba(0,0,0,0.4)',
        }}
      >
        {/* 氛围背景光 */}
        <div
          ref={moodBgRef}
          className="absolute inset-0 pointer-events-none transition-all duration-1000"
          style={{ background: currentTrack ? `linear-gradient(135deg, ${currentTrack.color}15, transparent)` : '' }}
        />

        {/* 顶部光线 */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(107,122,143,0.2) 20%, rgba(139,158,183,0.5) 50%, rgba(107,122,143,0.2) 80%, transparent 100%)'
        }} />

        {/* 波形 */}
        <canvas
          ref={canvasRef}
          className="h-10 w-20 flex-shrink-0 opacity-60"
        />

        {/* 曲目信息 */}
        <div className="flex items-center gap-4 min-w-0 flex-shrink-0" style={{ minWidth: 200 }}>
          {currentTrack ? (
            <>
              {/* 封面 */}
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-500"
                style={{
                  background: currentTrack ? `linear-gradient(135deg, ${currentTrack.color}40, ${currentTrack.color}15)` : '',
                  borderColor: `${currentTrack.color}40`,
                  boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 0 20px ${currentTrack.color}15`
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke={currentTrack.color} strokeWidth="0.5" className="w-6 h-6">
                  <circle cx="12" cy="12" r="3" fill={currentTrack.color} />
                  <circle cx="12" cy="12" r="8" />
                </svg>
                {/* 情绪徽章 */}
                <span
                  className="absolute -bottom-1 -right-1 text-xs px-1.5 py-0.5 rounded-full text-white text-[10px] font-medium"
                  style={{ background: currentTrack.color }}
                >
                  {moodText}
                </span>
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-100 truncate max-w-[180px]">{currentTrack.name}</p>
                <p className="text-xs text-gray-500">{currentTrack.artist}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">等待潮汐</p>
          )}
        </div>

        {/* 控制按钮 */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <button onClick={skipPrev} className="text-gray-400 hover:text-white transition-colors p-1.5" title="上一曲">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: 'rgba(107,122,143,0.2)', border: '1px solid rgba(107,122,143,0.3)' }}
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying
              ? <Pause className="w-4 h-4 text-gray-200" />
              : <Play className="w-4 h-4 text-gray-200 ml-0.5" />
            }
          </button>
          <button onClick={skipNext} className="text-gray-400 hover:text-white transition-colors p-1.5" title="下一曲">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* 进度条 */}
        <div className="flex-1 max-w-xl flex items-center gap-3">
          <span className="text-xs text-gray-500 tabular-nums w-10 text-right flex-shrink-0">{formatTime(currentTime)}</span>
          <div
            className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer group relative"
            onClick={handleSeek}
          >
            <div
              className="h-full rounded-full relative transition-all"
              style={{
                width: `${progress}%`,
                background: currentTrack ? currentTrack.color : '#6B7A8F'
              }}
            >
              <div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              />
            </div>
          </div>
          <span className="text-xs text-gray-500 tabular-nums w-10 flex-shrink-0">{formatTime(duration)}</span>
        </div>

        {/* 扩展控制 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors p-1.5" title="静音">
            {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range" min="0" max="1" step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(107,122,143,0.6) ${(isMuted ? 0 : volume) * 100}%, #374151 ${(isMuted ? 0 : volume) * 100}%)`
            }}
          />
          <button onClick={toggleLoop} className={`p-1.5 transition-colors ${isLooping ? 'text-primary-400' : 'text-gray-400 hover:text-white'}`} title="循环">
            <Repeat className="w-4 h-4" />
          </button>
          <button onClick={() => setIsLiked(l => !l)} className={`p-1.5 transition-colors ${isLiked ? 'text-red-400' : 'text-gray-400 hover:text-white'}`} title="收藏">
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button onClick={selectMusicFolder} className="text-gray-400 hover:text-white transition-colors p-1.5" title="本地音乐">
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 全局音频元素 */}
      <audio ref={audioRef} crossOrigin="anonymous" />
    </>
  )
}
