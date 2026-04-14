import { useState, useEffect, useRef } from 'react'
import { Play, Pause, ListMusic } from 'lucide-react'
import { MOOD_TRACKS, useMoodStore } from '../stores/useMoodStore'

// 全局 CSS 动画
const GLOBAL_STYLES = `
@keyframes auroraPulse {
  0%, 100% { transform: scale(1); opacity: 0.85; }
  50% { transform: scale(1.02); opacity: 1; }
}
@keyframes auroraFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes auroraDrift {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-30px) scale(1.1); opacity: 0.7; }
}
@keyframes waveMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(8px); }
}
@keyframes waveMoveV {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.6); }
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.03); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`

// ─────────────────────────────────────────
// 极光背景层
// ─────────────────────────────────────────
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 主极光渐变 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(45,90,61,0.35) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 20% 10%, rgba(58,122,82,0.25) 0%, transparent 50%),
            radial-gradient(ellipse 60% 50% at 80% 5%, rgba(93,185,122,0.2) 0%, transparent 50%),
            linear-gradient(180deg, rgba(10,18,12,0) 0%, rgba(10,18,12,0.4) 100%)
          `,
          animation: 'auroraPulse 8s ease-in-out infinite',
        }}
      />

      {/* 极光流动层1 */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          right: '-10%',
          height: '60%',
          background: `linear-gradient(135deg,
            rgba(45,90,61,0.15) 0%,
            rgba(93,185,122,0.1) 30%,
            rgba(139,212,168,0.12) 60%,
            rgba(93,185,122,0.08) 100%)`,
          backgroundSize: '400% 400%',
          animation: 'auroraFlow 12s ease infinite',
          filter: 'blur(40px)',
        }}
      />

      {/* 极光流动层2 */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          left: '-5%',
          right: '-5%',
          height: '50%',
          background: `linear-gradient(225deg,
            rgba(58,122,82,0.12) 0%,
            rgba(139,212,168,0.08) 40%,
            rgba(45,90,61,0.1) 100%)`,
          animation: 'auroraFlow 16s ease infinite reverse',
          filter: 'blur(60px)',
        }}
      />

      {/* 绿色光晕点 */}
      <div style={{
        position: 'absolute',
        top: '8%',
        left: '15%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(93,185,122,0.15) 0%, transparent 70%)',
        animation: 'auroraDrift 10s ease-in-out infinite',
        animationDelay: '0s',
      }} />
      <div style={{
        position: 'absolute',
        top: '12%',
        right: '20%',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,212,168,0.12) 0%, transparent 70%)',
        animation: 'auroraDrift 14s ease-in-out infinite',
        animationDelay: '-5s',
      }} />
      <div style={{
        position: 'absolute',
        top: '3%',
        left: '55%',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(58,122,82,0.18) 0%, transparent 70%)',
        animation: 'auroraDrift 12s ease-in-out infinite',
        animationDelay: '-3s',
      }} />

      {/* 底部微光 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(0deg, rgba(10,18,12,0.6) 0%, transparent 100%)',
      }} />
    </div>
  )
}

// ─────────────────────────────────────────
// 波浪 Logo
// ─────────────────────────────────────────
function WaveLogo({ size = 22 }: { size?: number }) {
  return (
    <svg viewBox="0 0 100 40" style={{ width: size, height: size * 0.4 }}>
      <defs>
        <linearGradient id="auroraGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(139,212,168,0.9)" />
          <stop offset="100%" stopColor="rgba(45,90,61,0.6)" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3, 4, 5].map(i => (
        <path
          key={i}
          d={`M5,${12 + i * 4} Q30,${8 + i * 4} 50,${12 + i * 4} T95,${12 + i * 4}`}
          fill="none"
          stroke="url(#auroraGrad)"
          strokeWidth="1.5"
          strokeLinecap="round"
          style={{
            animation: `waveMove ${2.5 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
    </svg>
  )
}

// ─────────────────────────────────────────
// 标题 — 极光渐变字体
// ─────────────────────────────────────────
function Header() {
  return (
    <div className="flex flex-col items-center">
      <WaveLogo size={22} />
      <h1
        className="text-6xl font-extrabold tracking-[0.2em] select-none"
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          background: 'linear-gradient(135deg, rgba(139,212,168,0.9) 0%, rgba(93,185,122,0.85) 35%, rgba(58,122,82,0.9) 65%, rgba(139,212,168,0.8) 100%)',
          backgroundSize: '200% 200%',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          animation: 'auroraFlow 6s ease infinite, auroraPulse 4s ease-in-out infinite',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 20px rgba(93,185,122,0.3))',
        }}
      >
        Moodify
      </h1>
    </div>
  )
}

// ─────────────────────────────────────────
// 副标题 — 绿色极光渐变
// ─────────────────────────────────────────
function SubtitleAurora() {
  return (
    <p
      className="text-[15px] tracking-[0.25em]"
      style={{
        fontFamily: "'Noto Serif SC', serif",
        fontWeight: 300,
        background: 'linear-gradient(90deg, rgba(45,90,61,0.8) 0%, rgba(93,185,122,0.75) 50%, rgba(139,212,168,0.8) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      情绪的潮汐，终将抵达彼岸
    </p>
  )
}

// ─────────────────────────────────────────
// 英文副标题
// ─────────────────────────────────────────
function EnglishSubtitle() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-4 h-px" style={{ background: 'rgba(93,185,122,0.3)' }} />
      <p
        className="text-[11px] tracking-[0.2em]"
        style={{
          fontFamily: "'Cormorant Garamond', cursive",
          color: 'rgba(93,185,122,0.5)',
          fontStyle: 'italic',
        }}
      >
        Stay in the flow, stay in the soul.
      </p>
      <div className="w-4 h-px" style={{ background: 'rgba(93,185,122,0.3)' }} />
    </div>
  )
}

// ─────────────────────────────────────────
// 情绪卡片
// ─────────────────────────────────────────
function TrackCard({ index, track, isActive, entered }: {
  index: number
  track: typeof MOOD_TRACKS[0]
  isActive: boolean
  entered: boolean
}) {
  const { loadTrack, isPlaying } = useMoodStore()

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-500"
      onClick={() => loadTrack(index)}
      style={{
        minHeight: '185px',
        background: isActive
          ? `linear-gradient(160deg, ${track.color}30 0%, ${track.color}12 40%, rgba(10,18,12,0.95) 100%)`
          : `linear-gradient(160deg, ${track.color}18 0%, rgba(10,18,12,0.97) 65%)`,
        border: isActive
          ? `1px solid ${track.color}50`
          : `1px solid ${track.color}20`,
        boxShadow: isActive
          ? `0 12px 48px ${track.color}20, inset 0 1px 0 ${track.color}25, 0 0 30px ${track.color}10`
          : `0 4px 20px rgba(0,0,0,0.3)`,
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.94)',
        transition: `all 0.5s cubic-bezier(0.4,0,0.2,1) ${0.2 + index * 0.12}s`,
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* 卡片极光光晕 */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(circle, ${track.color}18 0%, transparent 70%)`,
          filter: 'blur(12px)',
          opacity: isActive ? 1 : 0,
          animation: isActive ? 'glowPulse 3s ease-in-out infinite' : 'none',
        }}
      />

      {/* 波浪装饰 */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <svg viewBox="0 0 200 100" className="absolute w-full h-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id={`wave_${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={track.color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={track.color} stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 Q30,50 60,65 T120,60 T180,70 T240,65"
            fill="none"
            stroke={`url(#wave_${index})`}
            strokeWidth="1.5"
            style={{ animation: `waveMove 5s ease-in-out infinite`, animationDelay: `${index * 0.5}s` }}
          />
          <path
            d="M0,80 Q40,60 80,75 T160,70 T240,78"
            fill="none"
            stroke={`url(#wave_${index})`}
            strokeWidth="1"
            style={{ animation: `waveMove 7s ease-in-out infinite reverse`, animationDelay: `${index * 0.3}s` }}
          />
        </svg>
      </div>

      {/* 内容 */}
      <div className="relative z-10 p-5 flex flex-col justify-between h-full">
        {/* 顶部：播放状态 */}
        <div className="flex justify-between items-start">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300"
            style={{
              background: isActive ? `${track.color}28` : `${track.color}14`,
              border: `1px solid ${track.color}35`,
              backdropFilter: 'blur(8px)',
              boxShadow: isActive ? `0 0 16px ${track.color}20` : 'none',
            }}
          >
            {isActive && isPlaying ? (
              <div className="flex gap-0.5 items-end h-3">
                <div className="w-0.5 h-2 rounded-full animate-bounce" style={{ background: track.color, animationDelay: '0ms' }} />
                <div className="w-0.5 h-3 rounded-full animate-bounce" style={{ background: track.color, animationDelay: '150ms' }} />
                <div className="w-0.5 h-1.5 rounded-full animate-bounce" style={{ background: track.color, animationDelay: '300ms' }} />
              </div>
            ) : isActive ? (
              <Pause className="w-4 h-4" style={{ color: track.color }} fill={track.color} />
            ) : (
              <Play className="w-4 h-4 ml-0.5" style={{ color: `${track.color}80` }} fill={`${track.color}35`} />
            )}
          </div>

          {/* 情绪徽章 */}
          <span
            className="text-[9px] px-2.5 py-0.5 rounded-full font-medium tracking-wider"
            style={{
              background: `${track.color}15`,
              color: track.color,
              border: `1px solid ${track.color}28`,
              letterSpacing: '0.12em',
              backdropFilter: 'blur(4px)',
            }}
          >
            {track.mood.toUpperCase()}
          </span>
        </div>

        {/* 底部：文字信息 */}
        <div className="mt-4">
          <h3
            className="text-[15px] font-medium mb-1 leading-snug"
            style={{
              color: isActive ? 'rgba(200,240,210,0.95)' : 'rgba(200,240,210,0.7)',
            }}
          >
            {track.name}
          </h3>
          <p className="text-xs mb-3" style={{ color: `${track.color}60` }}>
            {track.artist}
          </p>
          {/* 描述 */}
          <p className="text-[10px] mb-2.5" style={{ color: `${track.color}50` }}>
            {track.description}
          </p>
          {/* 标签 */}
          <div className="flex flex-wrap gap-1">
            {track.tags?.slice(0, 2).map((tag, i) => (
              <span
                key={i}
                className="text-[9px] px-2 py-0.5 rounded-full"
                style={{
                  background: `${track.color}12`,
                  color: `${track.color}70`,
                  border: `1px solid ${track.color}20`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// 主组件
// ─────────────────────────────────────────
export default function MoodSelector() {
  const { currentIndex } = useMoodStore()
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div className="w-full h-full flex flex-col overflow-hidden relative">
        <AuroraBackground />

        {/* 顶部标题 */}
        <div
          className="flex-shrink-0 flex flex-col items-center pt-10 pb-5 px-6 relative z-10"
          style={{
            opacity: entered ? 1 : 0,
            transform: entered ? 'translateY(0)' : 'translateY(-16px)',
            transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          <Header />
          <div className="mt-2">
            <SubtitleAurora />
          </div>
          <div className="mt-1.5">
            <EnglishSubtitle />
          </div>
        </div>

        {/* 分隔线 */}
        <div className="mx-8 h-px mb-5" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(93,185,122,0.2) 50%, transparent 100%)',
          opacity: entered ? 1 : 0,
          transition: 'opacity 0.8s 0.5s',
        }} />

        {/* 播放列表 */}
        <div
          className="flex-1 overflow-y-auto px-8 pb-6 relative z-10"
          style={{ opacity: entered ? 1 : 0, transition: 'opacity 0.8s 0.4s' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <ListMusic className="w-3.5 h-3.5" style={{ color: 'rgba(93,185,122,0.4)' }} />
            <span className="text-xs tracking-[0.2em]" style={{ color: 'rgba(93,185,122,0.35)', letterSpacing: '0.2em' }}>
              PLAYLIST
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MOOD_TRACKS.map((track, i) => (
              <TrackCard
                key={track.mood}
                index={i}
                track={track}
                isActive={currentIndex === i}
                entered={entered}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
