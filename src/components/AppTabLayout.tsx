import { useState, useEffect, useRef } from 'react'
import { Waves, Music, BookOpen, Library } from 'lucide-react'
import { useAuroraTheme } from '../context/ThemeContext'

export type TabId = 'o3ics' | 'mood' | 'brand' | 'library'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS_DATA: Tab[] = [
  { id: 'o3ics', label: '歌词创作', icon: <Music className="w-4 h-4" /> },
  { id: 'mood',   label: '情绪播放', icon: <Waves className="w-4 h-4" /> },
  { id: 'library', label: '本地乐库', icon: <Library className="w-4 h-4" /> },
  { id: 'brand',  label: '品牌故事', icon: <BookOpen className="w-4 h-4" /> },
]

interface AppTabLayoutProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: (activeTab: TabId) => React.ReactNode
}

export default function AppTabLayout({ activeTab, onTabChange, children }: AppTabLayoutProps) {
  const { theme } = useAuroraTheme()
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const tabGroupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab]
    const groupEl = tabGroupRef.current
    if (!activeEl || !groupEl) return
    const groupRect = groupEl.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()
    setIndicatorStyle({
      left: elRect.left - groupRect.left,
      width: elRect.width,
    })
  }, [activeTab])

  useEffect(() => {
    const el = tabRefs.current[activeTab]
    const groupEl = tabGroupRef.current
    if (!el || !groupEl) return
    const groupRect = groupEl.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setIndicatorStyle({
      left: elRect.left - groupRect.left,
      width: elRect.width,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: theme.card.bg }}>
      {/* 顶部 Tab 导航 */}
      <div
        className="relative flex items-center justify-center flex-shrink-0 z-20"
        style={{
          background: `linear-gradient(180deg, rgba(10,10,15,0.99) 0%, rgba(13,13,20,0.96) 100%)`,
          borderBottom: `1px solid ${theme.border.subtle}`,
        }}
      >
        {/* 顶部极光光边 */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: theme.tab.topBorder }} />

        {/* 噪声纹理 */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Tab 按钮组 */}
        <div className="relative flex items-center gap-1 px-4 py-3 z-10" ref={tabGroupRef}>
          {TABS_DATA.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el }}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none ${
                activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <span style={{
                color: activeTab === tab.id ? theme.tab.activeText : theme.tab.inactiveColor,
                transition: 'color 0.2s',
              }}>
                {tab.icon}
              </span>
              <span style={{ color: activeTab === tab.id ? theme.tab.activeText : theme.tab.inactiveColor, transition: 'color 0.2s' }}>
                {tab.label}
              </span>
            </button>
          ))}

          {/* 滑动指示器 */}
          <div
            className="absolute bottom-2 h-[2px] rounded-full"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              background: theme.indicator.gradient,
              boxShadow: theme.indicator.shadow,
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* 右侧：Logo */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 opacity-25">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(107,122,143,0.12)', border: '1px solid rgba(107,122,143,0.2)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke={theme.logoColor} strokeWidth="1.5" className="w-4 h-4">
                <path d="M2 10 Q6 7 10 10 T18 10 T26 10" />
                <path d="M2 14 Q6 11 10 14 T18 14 T26 14" />
                <path d="M2 18 Q6 15 10 18 T18 18 T26 18" />
              </svg>
            </div>
            <span className="text-xs tracking-[0.2em] font-light" style={{ color: theme.logoColor }}>Moodify</span>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {children(activeTab)}
      </div>
    </div>
  )
}
