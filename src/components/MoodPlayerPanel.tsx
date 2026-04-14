import { useEffect, useRef, useCallback } from 'react'
import { MOOD_TRACKS, useMoodStore } from '../stores/useMoodStore'

export default function MoodPlayerPanel() {
  const { isPlaying, currentTime, duration, currentIndex, togglePlay } = useMoodStore()
  const currentTrack = MOOD_TRACKS[currentIndex]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const drawWave = useCallback((playing: boolean) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height
    const t = Date.now() * 0.001
    const bars = 48
    const bw = w / bars - 1

    ctx.clearRect(0, 0, w, h)
    for (let i = 0; i < bars; i++) {
      let bh: number
      if (playing) {
        bh = Math.max(2, 4 + Math.sin(i * 0.25 + t) * 4 + Math.sin(i * 0.15 + t * 1.3) * 3)
      } else {
        bh = 3 + Math.sin(i * 0.4) * 3
      }
      const x = i * (bw + 1)
      const y = (h - bh) / 2
      const grad = ctx.createLinearGradient(0, y, 0, y + bh)
      grad.addColorStop(0, `${currentTrack.color}55`)
      grad.addColorStop(0.5, `${currentTrack.color}90`)
      grad.addColorStop(1, `${currentTrack.color}55`)
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.roundRect(x, y, bw, bh, 2)
      ctx.fill()
    }

    if (playing) animRef.current = requestAnimationFrame(() => drawWave(true))
  }, [currentTrack.color])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (parent) { canvas.width = parent.offsetWidth; canvas.height = 60 }

    if (isPlaying) {
      animRef.current = requestAnimationFrame(() => drawWave(true))
    } else {
      cancelAnimationFrame(animRef.current)
      drawWave(false)
    }
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, drawWave])

  return (
    <div
      className="w-full max-w-lg mx-auto p-6 rounded-2xl"
      style={{
        background: `linear-gradient(135deg, ${currentTrack.color}12, rgba(10,18,12,0.95))`,
        border: `1px solid ${currentTrack.color}22`,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 40px ${currentTrack.color}08`,
      }}
    >
      {/* 封面 */}
      <div className="flex items-center gap-5 mb-5">
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${currentTrack.color}30, ${currentTrack.color}10)`,
            border: `1px solid ${currentTrack.color}30`,
            boxShadow: `0 8px 32px ${currentTrack.color}20, inset 0 0 20px ${currentTrack.color}10`,
            animation: isPlaying ? 'auroraPulse 3s ease-in-out infinite' : 'none',
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10">
            <circle cx="12" cy="12" r="3" fill={currentTrack.color} opacity="0.85" />
            <circle cx="12" cy="12" r="8" stroke={currentTrack.color} strokeWidth="0.5" opacity="0.5" />
            <circle cx="12" cy="12" r="5" stroke={currentTrack.color} strokeWidth="0.3" opacity="0.3" />
          </svg>
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-medium text-gray-100 truncate">{currentTrack.name}</h3>
          <p className="text-sm" style={{ color: currentTrack.color }}>{currentTrack.artist}</p>
          <p className="text-xs mt-1" style={{ color: `${currentTrack.color}55` }}>
            {currentTrack.description}
          </p>
        </div>

        {/* 播放按钮 */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${currentTrack.color}40, ${currentTrack.color}20)`,
            border: `1px solid ${currentTrack.color}50`,
            boxShadow: `0 0 24px ${currentTrack.color}28`,
          }}
        >
          {isPlaying
            ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill={currentTrack.color}>
                <rect x="6" y="5" width="4" height="14" rx="1"/>
                <rect x="14" y="5" width="4" height="14" rx="1"/>
              </svg>
            : <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill={currentTrack.color}>
                <path d="M8 5.14v14l11-7-11-7z"/>
              </svg>
          }
        </button>
      </div>

      {/* 波形 */}
      <canvas
        ref={canvasRef}
        className="w-full h-[60px] rounded-lg mb-3"
        style={{ background: `rgba(45,90,61,0.04)` }}
      />

      {/* 进度条 */}
      <div className="flex items-center gap-3">
        <span className="text-xs tabular-nums w-10" style={{ color: `${currentTrack.color}55` }}>
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: `${currentTrack.color}18` }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${progress}%`,
              background: `linear-gradient(90deg, ${currentTrack.color}80, ${currentTrack.color})`,
            }}
          />
        </div>
        <span className="text-xs tabular-nums w-10" style={{ color: `${currentTrack.color}55` }}>
          {formatTime(duration)}
        </span>
      </div>
    </div>
  )
}
