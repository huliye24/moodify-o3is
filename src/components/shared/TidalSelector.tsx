import { useState, useEffect, useMemo } from 'react'
import { MOOD_TRACKS, useMoodStore } from '../../stores/useMoodStore'
import { useThemeStore, THEME_PRESETS } from '../../stores/useThemeStore'

export default function TidalSelector() {
  const { currentIndex, loadTrack, isPlaying } = useMoodStore()
  const { theme } = useThemeStore()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const currentTheme = THEME_PRESETS[theme]

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleMoodClick = (index: number) => {
    setSelectedIndex(index)
    loadTrack(index)
    setTimeout(() => setSelectedIndex(null), 300)
  }

  return (
    <div className="tidal-selector">
      {/* 主题切换按钮 */}
      <div className="flex justify-center mb-16">
        <ThemeSwitcher />
      </div>

      {/* 标题区域 */}
      <div className="text-center mb-16">
        <h2 className="text-4xl font-light tracking-[0.2em] text-white mb-4 drop-shadow-lg">
          情绪的潮汐
        </h2>
        <p className="text-gray-400/80 text-sm tracking-wider">
          点击选择一个情绪状态，开始你的音乐旅程
        </p>
      </div>

      {/* 情绪卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto px-4">
        {MOOD_TRACKS.map((mood, index) => {
          const isActive = currentIndex === index
          const isHovered = hoveredIndex === index
          const isSelected = selectedIndex === index

          const moodColor = currentTheme[mood.mood as keyof typeof currentTheme]?.color || '#a86050'
          const moodGradient = currentTheme[mood.mood as keyof typeof currentTheme]?.gradient || mood.gradient

          return (
            <button
              key={mood.mood}
              className={`mood-card relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer ${
                mounted ? 'animate-fadeInUp' : 'opacity-0'
              } ${
                isSelected ? 'scale-95' : isHovered ? 'scale-105' : isActive ? 'scale-[1.03]' : ''
              } ${isActive ? 'ring-2 ring-white/60' : ''}`}
              style={{
                background: moodGradient,
                animationDelay: `${index * 100}ms`,
                minHeight: '220px',
                boxShadow: isHovered || isActive
                  ? `0 20px 60px ${moodColor}40, 0 0 40px ${moodColor}20`
                  : `0 10px 30px rgba(0,0,0,0.1)`,
              }}
              onClick={() => handleMoodClick(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* 内层光效 */}
              <div className="absolute inset-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10" />

              {/* 内容区域 */}
              <div className="relative z-10 p-6 h-full flex flex-col items-center justify-center text-center">
                {/* 情绪符号 */}
                <div
                  className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center transition-all duration-400 ${
                    isHovered || isActive
                      ? 'bg-white/30 backdrop-blur-md scale-110'
                      : 'bg-white/15'
                  }`}
                >
                  <MoodIcon mood={mood.mood} isActive={isHovered || isActive} />
                </div>

                {/* 情绪名称 */}
                <h3
                  className={`text-xl font-light tracking-wider mb-2 transition-all duration-300 ${
                    isHovered || isActive ? 'text-white drop-shadow-md' : 'text-white/90'
                  }`}
                >
                  {mood.name.split(' · ')[0]}
                </h3>

                {/* 描述文字 */}
                <p className="text-sm text-white/60 tracking-wide mb-3">
                  {mood.description}
                </p>

                {/* 标签 */}
                <div className="flex gap-2 justify-center">
                  {mood.tags?.slice(0, 2).map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs text-white/50 px-2 py-1 rounded-full bg-white/10 backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 播放状态指示器 */}
                {isActive && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <PlayingIndicator isPlaying={isPlaying} />
                  </div>
                )}

                {/* 悬停播放图标 */}
                {!isActive && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-all duration-400 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transform scale-90 hover:scale-100 transition-transform">
                      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>

              {/* 顶部高光 */}
              <div
                className={`absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent transition-opacity duration-500 ${
                  isHovered || isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </button>
          )
        })}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .mood-card {
          border: 1px solid rgba(255,255,255,0.1);
        }

        .mood-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(255,255,255,0.1) 0%,
            transparent 50%,
            rgba(255,255,255,0.05) 100%
          );
          opacity: 0;
          transition: opacity 0.3s;
        }

        .mood-card:hover::before {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

function MoodIcon({ mood, isActive }: { mood: string; isActive: boolean }) {
  const icons: Record<string, { default: JSX.Element; active: JSX.Element }> = {
    coil: {
      default: <span className="text-lg text-white/70">○</span>,
      active: <span className="text-xl text-white">◉</span>,
    },
    lost: {
      default: <span className="text-lg text-white/70">◇</span>,
      active: <span className="text-xl text-white">◆</span>,
    },
    awaken: {
      default: <span className="text-lg text-white/70">△</span>,
      active: <span className="text-xl text-white">▲</span>,
    },
    expand: {
      default: <span className="text-lg text-white/70">□</span>,
      active: <span className="text-xl text-white">■</span>,
    },
  }

  const icon = icons[mood] || icons.coil

  return (
    <div className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`}>
      {isActive ? icon.active : icon.default}
    </div>
  )
}

function PlayingIndicator({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-1 h-5">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all"
          style={{
            height: isPlaying ? `${8 + i * 3}px` : '4px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            animation: isPlaying ? `soundWave 0.8s ease-in-out infinite` : 'none',
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
      <style>{`
        @keyframes soundWave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }
      `}</style>
    </div>
  )
}

function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()

  const themes = [
    { id: 'moss' as const, label: '苔藓', icon: '🌿' },
    { id: 'terracotta' as const, label: '陶土', icon: '🏺' },
    { id: 'driedFlower' as const, label: '干花', icon: '🥀' },
  ]

  return (
    <div className="flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition-all duration-300 ${
            theme === t.id
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <span>{t.icon}</span>
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  )
}
