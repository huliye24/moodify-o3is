/**
 * src/components/shared/ThemeSwitcher.tsx
 * 
 * 使用旧的 THEME_PRESETS 系统
 */

import { useThemeStore, THEME_PRESETS, BackgroundTheme } from '../../stores/useThemeStore'
import { cn } from '../../lib/utils'
import { useState, useRef, useEffect } from 'react'

const THEME_LABELS: Record<BackgroundTheme, string> = {
  moss: '苔藓',
  terracotta: '陶土',
  driedFlower: '干花',
  sakura: '樱花',
}

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore()
  const themes = Object.keys(THEME_LABELS) as BackgroundTheme[]
  
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const switcherRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    let newX = e.clientX - dragOffset.x
    let newY = e.clientY - dragOffset.y
    
    const maxX = window.innerWidth - (switcherRef.current?.offsetWidth || 200)
    const maxY = window.innerHeight - (switcherRef.current?.offsetHeight || 80)
    
    newX = Math.max(0, Math.min(newX, maxX))
    newY = Math.max(0, Math.min(newY, maxY))
    
    setPosition({ x: newX, y: newY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  return (
    <div
      ref={switcherRef}
      className={cn(
        'fixed z-[9999] flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-black/5 transition-shadow',
        isDragging && 'cursor-grabbing shadow-xl'
      )}
      style={{
        left: position.x,
        top: position.y,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      <span className="text-xs text-gray-500 mr-1">主题</span>
      {themes.map((t) => (
        <button
          key={t}
          onClick={(e) => {
            e.stopPropagation()
            setTheme(t)
          }}
          title={THEME_LABELS[t]}
          className={cn(
            'relative w-8 h-8 rounded-full transition-all duration-300',
            'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white',
            theme === t ? 'ring-2 ring-offset-2 ring-offset-white' : ''
          )}
          style={{
            background: theme === t 
              ? `linear-gradient(145deg, ${THEME_PRESETS[t].coil.color}40, ${THEME_PRESETS[t].coil.color}20)`
              : THEME_PRESETS[t].bgSurface,
            '--tw-ring-color': THEME_PRESETS[t].accent,
          } as React.CSSProperties}
        >
          {theme === t && (
            <div 
              className="absolute inset-0 rounded-full animate-pulse opacity-50"
              style={{ background: `radial-gradient(circle, ${THEME_PRESETS[t].coil.color}30 0%, transparent 70%)` }}
            />
          )}
          <span className="sr-only">{THEME_LABELS[t]}</span>
        </button>
      ))}
    </div>
  )
}
