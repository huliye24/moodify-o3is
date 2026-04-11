import { useStore } from './stores/useStore'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import Player from './components/Player'
import SettingsModal from './components/SettingsModal'
import RulesModal from './components/RulesModal'

function App() {
  const { showSettings, showRules, setShowSettings, setShowRules } = useStore()

  return (
    <div className="h-full flex flex-col bg-dark-500">
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          onOpenSettings={() => setShowSettings(true)}
          onOpenRules={() => setShowRules(true)}
        />
        <MainContent />
      </div>
      <Player />
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}
    </div>
  )
}

export default App
