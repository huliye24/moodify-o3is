import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import PersistentPlayer from '../Player/PersistentPlayer'

export default function PlayerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-100 to-orange-100">
      {/* Back Button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/60 hover:bg-white/80 rounded-full text-gray-700 hover:text-gray-900 transition-all duration-300 backdrop-blur-md border border-white/50 shadow-lg"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm font-medium">返回</span>
      </Link>

      {/* Fullscreen Player */}
      <PersistentPlayer mode="fullscreen" />
    </div>
  )
}
