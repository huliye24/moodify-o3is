import { useState } from 'react'
import { TabId } from '../components/AppTabLayout'
import AppTabLayout from '../components/AppTabLayout'

import MainContent from '../components/MainContent'
import MoodPage from '../pages/MoodPage'
import LibraryPage from '../pages/LibraryPage'
import BrandPage from '../pages/BrandPage'

function TabContent({ activeTab }: { activeTab: TabId }) {
  switch (activeTab) {
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

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState<TabId>('o3ics')

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#0a0a0f' }}>
      <AppTabLayout
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {(tab) => (
          <TabContent activeTab={tab} />
        )}
      </AppTabLayout>
    </div>
  )
}
