import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackToFlowProps {
  className?: string
}

export default function BackToFlow({ className = '' }: BackToFlowProps) {
  return (
    <section className={`py-20 ${className}`}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="tracking-wider">回到情绪潮汐</span>
        </Link>
      </div>
    </section>
  )
}
