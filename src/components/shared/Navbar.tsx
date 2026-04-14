import { Link, useLocation } from 'react-router-dom'
import { Music, Home, FileQuestion, Package, Megaphone, Disc } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: '情绪潮汐' },
    // { path: '/boundary', icon: FileQuestion, label: '音乐边界' },
    { path: '/products', icon: Package, label: '情绪容器' },
    { path: '/voice', icon: Megaphone, label: '品牌声音' },
    { path: '/player', icon: Disc, label: '播放器' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/40 backdrop-blur-md border-b border-white/30 shadow-sm">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-wider text-gray-800">
              Moodify
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-8">
            {navItems.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className={`
                    flex items-center gap-2 text-sm transition-all duration-300
                    ${isActive
                      ? 'text-pink-600 font-semibold'
                      : 'text-gray-600 hover:text-gray-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </Link>
              )
            })}
          </div>

          {/* 歌词创作入口 */}
          <Link
            to="/app"
            className="px-5 py-2 text-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full hover:from-pink-600 hover:to-rose-600 transition-all shadow-md font-medium"
          >
            歌词创作
          </Link>
        </div>
      </div>
    </nav>
  )
}