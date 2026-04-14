import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './stores/useStore'

// Layouts
import MarketingLayout from './components/layouts/MarketingLayout'
import AppLayout from './components/layouts/AppLayout'

// Components
import PersistentPlayer from './components/Player/PersistentPlayer'

// Marketing Pages
import TidalHome from './components/pages/TidalHome'
// import BoundaryPage from './components/pages/BoundaryPage'
import ProductsPage from './components/pages/ProductsPage'
import VoicePage from './components/pages/VoicePage'
import PlayerPage from './components/pages/PlayerPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Player Tab - Full screen dashboard */}
        <Route path="/player" element={<PlayerPage />} />

        {/* App Pages - With bottom player bar */}
        <Route path="/app" element={
          <>
            <AppLayout />
            <PersistentPlayer mode="minimal" />
          </>
        } />

        {/* Marketing Pages - With bottom player bar */}
        <Route path="/" element={
          <>
            <MarketingLayout />
            <PersistentPlayer mode="minimal" />
          </>
        }>
          <Route index element={<TidalHome />} />
          {/* <Route path="boundary" element={<BoundaryPage />} /> */}
          <Route path="products" element={<ProductsPage />} />
          <Route path="voice" element={<VoicePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
