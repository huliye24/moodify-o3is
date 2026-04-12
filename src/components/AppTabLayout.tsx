import { useState, useEffect, useRef } from 'react'
import { Waves, Music, BookOpen } from 'lucide-react'

export type TabId = 'o3ics' | 'mood' | 'brand'

interface Tab {
  id: TabId
  label: string
  icon: React.ReactNode
}

const TABS_DATA: Tab[] = [
  { id: 'o3ics', label: '歌词创作', icon: <Music className="w-4 h-4" /> },
  { id: 'mood',   label: '情绪播放', icon: <Waves className="w-4 h-4" /> },
  { id: 'brand',  label: '品牌故事', icon: <BookOpen className="w-4 h-4" /> },
]

interface AppTabLayoutProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  children: (activeTab: TabId) => React.ReactNode
}

export default function AppTabLayout({ activeTab, onTabChange, children }: AppTabLayoutProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  // 用内部 tab 组作为位置计算的参考基准
  const tabGroupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const activeEl = tabRefs.current[activeTab]
    const groupEl = tabGroupRef.current
    if (!activeEl || !groupEl) return

    // 用 getBoundingClientRect 计算按钮相对于 tab 组内边沿的偏移
    const groupRect = groupEl.getBoundingClientRect()
    const elRect = activeEl.getBoundingClientRect()

    setIndicatorStyle({
      left: elRect.left - groupRect.left,
      width: elRect.width,
    })
  }, [activeTab])

  // 初始化时也计算一次
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
    <div className="h-full flex flex-col bg-moodify-bg overflow-hidden">
      {/* 顶部 Tab 导航 */}
      <div
        className="relative flex items-center justify-center flex-shrink-0 z-20"
        style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.98) 0%, rgba(13,13,20,0.95) 100%)', borderBottom: '1px solid rgba(107,122,143,0.1)' }}
      >
        {/* 顶部光边 */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(107,122,143,0.15) 20%, rgba(107,122,143,0.25) 50%, rgba(107,122,143,0.15) 80%, transparent 100%)',
        }} />

        {/* 噪声纹理 */}
        <div className="absolute inset-0 opacity-[0.025]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }} />

        {/* Tab 按钮组（指示器以此为基准定位） */}
        <div className="relative flex items-center gap-1 px-4 py-3 z-10" ref={tabGroupRef}>
          {TABS_DATA.map((tab) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[tab.id] = el }}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300 select-none ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span style={{ color: activeTab === tab.id ? undefined : 'rgba(107,122,143,0.5)', transition: 'color 0.2s' }}>{tab.label}</span>
            </button>
          ))}

          {/* 滑动指示器（absolute 相对于 tabGroupRef） */}
          <div
            className="absolute bottom-2 h-[2px] rounded-full"
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
              background: 'linear-gradient(90deg, rgba(107,122,143,0.8), rgba(139,158,183,1))',
              boxShadow: '0 0 16px rgba(107,122,143,0.5), 0 0 8px rgba(107,122,143,0.3)',
              transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </div>

        {/* Logo 角标 */}
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-2 opacity-30">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(107,122,143,0.15)', border: '1px solid rgba(107,122,143,0.25)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#8B9EB7" strokeWidth="1.5" className="w-4 h-4">
              <path d="M2 10 Q6 7 10 10 T18 10 T26 10" />
              <path d="M2 14 Q6 11 10 14 T18 14 T26 14" />
              <path d="M2 18 Q6 15 10 18 T18 18 T26 18" />
            </svg>
          </div>
          <span className="text-xs text-gray-500 tracking-[0.2em] font-light">MOODIFY</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {children(activeTab)}
      </div>
    </div>
  )
}
