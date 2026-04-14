import { useState, useEffect } from 'react'
import { useStore } from './stores/useStore'
import Sidebar from './components/Sidebar'
import SettingsModal from './components/SettingsModal'
import RulesModal from './components/RulesModal'
import AppTabLayout, { TabId } from './components/AppTabLayout'
import LyricsPage from './pages/LyricsPage'
import MoodPage from './pages/MoodPage'
import BrandPage from './pages/BrandPage'
import LibraryPage from './pages/LibraryPage'
import MoodPlayer from './components/MoodPlayer'
import { useMoodStore } from './stores/useMoodStore'
import { AuroraThemeProvider } from './context/ThemeContext'

export default function App() {
  const { showSettings, showRules, setShowSettings, setShowRules } = useStore()
  const [activeTab, setActiveTab] = useState<TabId>('o3ics')

  const { audio } = useMoodStore()

  // 键盘快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (activeTab === 'mood') {
        switch (e.code) {
          case 'Space':
            e.preventDefault()
            useMoodStore.getState().togglePlay()
            break
          case 'ArrowLeft':
            if (audio) audio.currentTime = Math.max(0, audio.currentTime - 5)
            break
          case 'ArrowRight':
            if (audio && useMoodStore.getState().duration > 0)
              audio.currentTime = Math.min(useMoodStore.getState().duration, audio.currentTime + 5)
            break
          case 'Digit1': useMoodStore.getState().loadTrack(0); break
          case 'Digit2': useMoodStore.getState().loadTrack(1); break
          case 'Digit3': useMoodStore.getState().loadTrack(2); break
          case 'Digit4': useMoodStore.getState().loadTrack(3); break
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [activeTab, audio])

  return (
    <AuroraThemeProvider>
    <div className="h-full flex flex-col bg-moodify-bg overflow-hidden">
      {/* 噪声纹理叠加 */}
      <div className="noise-overlay" />

      {/* 顶部 Tab 导航 */}
      <AppTabLayout activeTab={activeTab} onTabChange={setActiveTab}>
        {(tab) => (
          <>
            {tab === 'o3ics' && (
              <div className="flex flex-1 overflow-hidden">
                <Sidebar
                  onOpenSettings={() => setShowSettings(true)}
                  onOpenRules={() => setShowRules(true)}
                />
                <LyricsPage />
              </div>
            )}
            {tab === 'mood' && <MoodPage />}
            {tab === 'library' && <LibraryPage />}
            {tab === 'brand' && <BrandPage />}
          </>
        )}
      </AppTabLayout>

      {/* 情绪播放器（始终固定在底部） */}
      <MoodPlayer />

      {/* 全局弹窗 */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
    </AuroraThemeProvider>
  )
}
