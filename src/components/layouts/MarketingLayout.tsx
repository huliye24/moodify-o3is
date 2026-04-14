import { Outlet } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import Navbar from '../shared/Navbar'
import PersistentPlayer from '../Player/PersistentPlayer'

export default function MarketingLayout() {
  const location = useLocation()

  // 只在主页显示播放器
  const showPlayer = location.pathname === '/'

  return (
    <div className="min-h-screen bg-dark-500">
      <Navbar />

      <main className="relative">
        <Outlet />
      </main>

      {/* 仅在主页显示播放器 */}
      {showPlayer && <PersistentPlayer />}
    </div>
  )
}
