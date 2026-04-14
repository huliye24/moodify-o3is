import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import AppTabLayout, { TabId } from '../AppTabLayout'
import MainContent from '../../components/MainContent'
import MoodPage from '../../pages/MoodPage'
import LibraryPage from '../../pages/LibraryPage'
import BrandPage from '../../pages/BrandPage'

interface AppLayoutProps {
  children?: (activeTab: TabId) => React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [activeTab, setActiveTab] = useState<TabId>('o3ics')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const renderTabContent = (tab: TabId) => {
    switch (tab) {
      case 'o3ics':
        return <MainContent />
      case 'mood':
        return <MoodPage />
      case 'library':
        return <LibraryPage />
      case 'brand':
        return <BrandPage />
      default:
        return <MainContent />
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#0a0a0f]">
      {/* 顶部导航栏（含移动端汉堡菜单） */}
      <div className="flex items-center justify-between px-4 py-3 lg:hidden" style={{
        background: 'linear-gradient(180deg, rgba(10,10,15,0.99) 0%, rgba(13,13,20,0.96) 100%)',
        borderBottom: '1px solid rgba(107,122,143,0.12)',
      }}>
        <span className="text-sm font-medium text-white">Moodify</span>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          aria-label="菜单"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 移动端菜单抽屉 */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-14 left-0 right-0 z-50" style={{
          background: 'linear-gradient(180deg, rgba(13,13,20,0.98) 0%, rgba(10,10,15,0.99) 100%)',
          borderBottom: '1px solid rgba(107,122,143,0.12)',
        }}>
          <div className="flex flex-col p-4 gap-2">
            {(['o3ics', 'mood', 'library', 'brand'] as TabId[]).map((tab) => {
              const labels: Record<TabId, string> = {
                o3ics: '歌词创作',
                mood: '情绪播放',
                library: '本地乐库',
                brand: '品牌故事',
              }
              return (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {labels[tab]}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 主要布局：桌面端 Tab + 移动端隐藏 */}
      <div className="hidden lg:block flex-1 overflow-hidden">
        <AppTabLayout
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {(tab) => children ? children(tab) : renderTabContent(tab)}
        </AppTabLayout>
      </div>

      {/* 移动端内容区域 */}
      <div className="lg:hidden flex-1 overflow-hidden">
        {renderTabContent(activeTab)}
      </div>
    </div>
  )
}