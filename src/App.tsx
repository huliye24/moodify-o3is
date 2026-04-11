import { useState, useEffect } from 'react'
import { useStore } from './stores/useStore'
import Sidebar from './components/Sidebar'
import MainContent from './components/MainContent'
import SettingsModal from './components/SettingsModal'
import RulesModal from './components/RulesModal'

function App() {
  const { initialize, currentProject } = useStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showRules, setShowRules] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <div className="h-full flex bg-dark-500">
      <Sidebar
        onOpenSettings={() => setShowSettings(true)}
        onOpenRules={() => setShowRules(true)}
      />
      <MainContent />

      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showRules && (
        <RulesModal onClose={() => setShowRules(false)} />
      )}
    </div>
  )
}

export default App