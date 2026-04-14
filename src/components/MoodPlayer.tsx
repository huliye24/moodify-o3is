import { useRef, useEffect, useCallback } from 'react'
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, VolumeX, Repeat
} from 'lucide-react'
import { useMoodStore, MOOD_TRACKS } from '../stores/useMoodStore'

export default function MoodPlayer() {
  const {
    isPlaying, isLooping, isMuted, volume,
    currentTime, duration, currentIndex
  } = useMoodStore()

  const {
    togglePlay, skipNext, skipPrev,
    setVolume, toggleMute, toggleLoop,
    seek, volume: vol, setAudio
  } = useMoodStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number>(0)
  const initialized = useRef(false)

  const currentTrack = MOOD_TRACKS[currentIndex] ?? MOOD_TRACKS[0]
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  // Canvas 波形
  const drawWave = useCallback((playing: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const t = Date.now() * 0.001

    ctx.clearRect(0, 0, w, h)
    const bars = 28
    const bw = w / bars - 1
    for (let i = 0; i < bars; i++) {
      let bh: number
      if (playing) {
        bh = Math.max(2, 3 + Math.sin(i * 0.35 + t) * 3 + Math.sin(i * 0.2 + t * 1.4) * 2)
      } else {
        bh = 2 + Math.sin(i * 0.4) * 2
      }
      const x = i * (bw + 1)
      const y = (h - bh) / 2
      const grad = ctx.createLinearGradient(0, y, 0, y + bh)
      grad.addColorStop(0, `${currentTrack.color}40`)
      grad.addColorStop(0.5, `${currentTrack.color}80`)
      grad.addColorStop(1, `${currentTrack.color}40`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x, y, bw, bh, 1)
      ctx.fill()
    }

    if (playing) {
      animRef.current = requestAnimationFrame(() => drawWave(true))
    }
  }, [currentTrack.color])

  // 初始化音频
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.volume = volume
    audioRef.current = audio
    setAudio(audio)

    audio.addEventListener('timeupdate', () => {
      useMoodStore.getState().setCurrentTime(audio.currentTime)
    })
    audio.addEventListener('loadedmetadata', () => {
      useMoodStore.getState().setDuration(audio.duration)
    })
    audio.addEventListener('ended', () => {
      useMoodStore.getState().pause()
    })

    return () => {
      audio.pause()
    }
  }, [setAudio, volume])

  // 播放状态驱动波形
  useEffect(() => {
    if (isPlaying) {
      animRef.current = requestAnimationFrame(() => drawWave(true))
    } else {
      cancelAnimationFrame(animRef.current)
      drawWave(false)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, drawWave])

  // 监听 loadTrack
  useEffect(() => {
    const unsub = useMoodStore.subscribe((state, prev) => {
      if (state.currentIndex !== prev.currentIndex && audioRef.current) {
        const track = MOOD_TRACKS[state.currentIndex]
        if (track) {
          audioRef.current.src = track.url
          audioRef.current.load()
          audioRef.current.play().catch(() => {})
        }
      }
      if (state.isPlaying !== prev.isPlaying && audioRef.current) {
        if (state.isPlaying) {
          audioRef.current.play().catch(() => {})
        } else {
          audioRef.current.pause()
        }
      }
    })
    return unsub
  }, [])

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const p = canvas.parentElement
      if (p) { canvas.width = p.offsetWidth; canvas.height = p.offsetHeight }
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const t = pct * duration
    seek(t)
    if (audioRef.current) audioRef.current.currentTime = t
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
  }

  return (
    <div
      className="relative flex-shrink-0 flex items-center justify-center gap-8 px-8 h-20 transition-all duration-700"
      style={{
        background: 'linear-gradient(180deg, rgba(10,18,12,0.99) 0%, rgba(8,14,10,1) 100%)',
        backdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(45,90,61,0.2)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5), 0 -1px 0 rgba(93,185,122,0.08)',
      }}
    >
      {/* 绿色极光顶部光边 */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{
        background: `linear-gradient(90deg, transparent 0%, ${currentTrack.color}35 20%, ${currentTrack.color}55 50%, ${currentTrack.color}35 80%, transparent 100%)`,
      }} />

      {/* 底部绿色极光氛围光晕 */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${currentTrack.color}0D, transparent 65%)`,
        }}
      />

      {/* 波形 */}
      <canvas
        ref={canvasRef}
        className="h-10 w-20 flex-shrink-0 opacity-60"
        style={{ filter: `drop-shadow(0 0 6px ${currentTrack.color}40)` }}
      />

      {/* 曲目信息 */}
      <div className="flex items-center gap-3 flex-shrink-0" style={{ minWidth: 180 }}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-700 relative"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentTrack.color}35, ${currentTrack.color}12)`,
            border: `1px solid ${currentTrack.color}45`,
            boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 0 16px ${currentTrack.color}12, 0 0 20px ${currentTrack.color}20`,
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
            <circle cx="12" cy="12" r="3" fill={currentTrack.color} opacity="0.85" />
            <circle cx="12" cy="12" r="7" stroke={currentTrack.color} strokeWidth="0.5" opacity="0.5" />
            <circle cx="12" cy="12" r="10" stroke={currentTrack.color} strokeWidth="0.3" opacity="0.25" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-100 truncate max-w-[160px]">{currentTrack.name}</p>
          <p className="text-xs" style={{ color: `${currentTrack.color}70` }}>{currentTrack.artist}</p>
        </div>
      </div>

      {/* 控制按钮 */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={skipPrev}
          className="p-1.5 transition-all duration-200 hover:scale-110"
          style={{ color: 'rgba(93,185,122,0.5)' }}
          title="上一曲"
        >
          <SkipBack className="w-4 h-4" />
        </button>
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.color}35, ${currentTrack.color}18)`,
            border: `1px solid ${currentTrack.color}45`,
            boxShadow: `0 0 20px ${currentTrack.color}22`,
          }}
          title={isPlaying ? '暂停' : '播放'}
        >
          {isPlaying
            ? <Pause className="w-4 h-4 text-gray-100" />
            : <Play className="w-4 h-4 text-gray-100 ml-0.5" />
          }
        </button>
        <button
          onClick={skipNext}
          className="p-1.5 transition-all duration-200 hover:scale-110"
          style={{ color: 'rgba(93,185,122,0.5)' }}
          title="下一曲"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* 进度条 */}
      <div className="flex-1 max-w-lg flex items-center gap-3">
        <span className="text-xs tabular-nums w-10 text-right flex-shrink-0" style={{ color: 'rgba(93,185,122,0.45)' }}>
          {formatTime(currentTime)}
        </span>
        <div
          className="flex-1 h-1 rounded-full cursor-pointer group relative overflow-hidden"
          style={{ background: 'rgba(45,90,61,0.25)' }}
          onClick={handleSeek}
        >
          <div
            className="h-full rounded-full relative transition-all"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${currentTrack.color}80, ${currentTrack.color})`,
            }}
          >
            <div
              className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: currentTrack.color, boxShadow: `0 0 6px ${currentTrack.color}` }}
            />
          </div>
        </div>
        <span className="text-xs tabular-nums w-10 flex-shrink-0" style={{ color: 'rgba(93,185,122,0.45)' }}>
          {formatTime(duration)}
        </span>
      </div>

      {/* 扩展控制 */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onClick={toggleMute}
          className="p-1.5 transition-all duration-200"
          style={{ color: 'rgba(93,185,122,0.45)' }}
          title={isMuted ? '取消静音' : '静音'}
        >
          {isMuted || vol === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range" min="0" max="1" step="0.01"
          value={isMuted ? 0 : vol}
          onChange={handleVolumeChange}
          className="w-16 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${currentTrack.color}60 ${(isMuted ? 0 : vol) * 100}%, rgba(45,90,61,0.3) ${(isMuted ? 0 : vol) * 100}%)`,
          }}
        />
        <button
          onClick={toggleLoop}
          className="p-1.5 transition-all duration-200"
          style={{ color: isLooping ? 'rgba(93,185,122,0.8)' : 'rgba(93,185,122,0.35)' }}
          title="循环"
        >
          <Repeat className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
