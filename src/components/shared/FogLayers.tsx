/**
 * src/components/shared/FogLayers.tsx
 * 
 * 使用旧的 THEME_PRESETS 系统
 */

import { useEffect, useRef } from 'react'
import { useThemeStore, THEME_PRESETS } from '../../stores/useThemeStore'

export default function FogLayers() {
  const fogRef = useRef<HTMLDivElement>(null)
  const { theme } = useThemeStore()
  const colors = THEME_PRESETS[theme]

  useEffect(() => {
    const handleScroll = function() {
      if (fogRef.current) {
        const scrolled = window.pageYOffset
        fogRef.current.style.transform = 'translateY(' + (scrolled * 0.3) + 'px)'
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return function() {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div ref={fogRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* 清晰的渐变背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: theme === 'sakura'
            ? `
              radial-gradient(ellipse at 20% 30%, ${colors.accent}30 0%, transparent 50%),
              radial-gradient(ellipse at 80% 40%, ${colors.lost.color}30 0%, transparent 50%),
              radial-gradient(ellipse at 50% 80%, ${colors.awaken.color}25 0%, transparent 60%),
              radial-gradient(ellipse at 30% 70%, ${colors.expand.color}20 0%, transparent 40%)
            `
            : `
              radial-gradient(ellipse at 20% 30%, ${colors.accent}20 0%, transparent 40%),
              radial-gradient(ellipse at 80% 40%, ${colors.lost.color}20 0%, transparent 40%),
              radial-gradient(ellipse at 50% 80%, ${colors.awaken.color}15 0%, transparent 50%)
            `,
          opacity: 0.6,
        }}
      />

      {/* 落樱动画效果 */}
      <SakuraParticles theme={theme} />

      <style>{`
        .sakura-petal {
          position: absolute;
          width: 12px;
          height: 12px;
          opacity: 0.8;
          animation: sakuraFall linear infinite;
          pointer-events: none;
        }

        .sakura-petal::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: currentColor;
          border-radius: 50% 0 50% 50%;
          transform: rotate(45deg);
        }

        @keyframes sakuraFall {
          0% {
            transform: translateY(-10vh) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(110vh) rotate(720deg) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes sakuraSway {
          0%, 100% { transform: translateX(-30px) rotate(-15deg); }
          50% { transform: translateX(30px) rotate(15deg); }
        }
        
        /* 樱花主题增强花瓣效果 */
        .sakura-petal.sakura-theme {
          width: 15px;
          height: 15px;
          opacity: 0.9;
          animation: sakuraFallEnhanced linear infinite;
        }
        
        .sakura-petal.sakura-theme::before {
          border-radius: 50% 0 50% 50%;
          box-shadow: 0 0 10px currentColor;
        }
        
        @keyframes sakuraFallEnhanced {
          0% {
            transform: translateY(-15vh) rotate(0deg) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          85% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(115vh) rotate(1080deg) translateX(150px);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

function SakuraParticles({ theme }: { theme: string }) {
  const colors = {
    moss: ['#8b7355', '#9b8365', '#a88868', '#b89878'],
    terracotta: ['#a86050', '#b88560', '#c89868', '#d8a888'],
    driedFlower: ['#c08070', '#d89888', '#e8b898', '#f8c8a8'],
    sakura: ['#FFB7C5', '#FFC8D5', '#FFD8E8', '#FFE8F0', '#FF9EB5', '#ff85a5', '#ffd5e0', '#fff0f5'],
  }

  const particleColors = colors[theme as keyof typeof colors] || colors.terracotta
  
  const isSakuraTheme = theme === 'sakura'
  const particleCount = isSakuraTheme ? 60 : 20
  const baseOpacity = isSakuraTheme ? 0.9 : 0.4
  const baseSize = isSakuraTheme ? 12 : 6

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(particleCount)].map((_, i) => (
        <div
          key={i}
          className={isSakuraTheme ? 'sakura-petal sakura-theme' : 'sakura-petal'}
          style={{
            left: `${Math.random() * 100}%`,
            color: particleColors[i % particleColors.length],
            animationDuration: `${isSakuraTheme ? (6 + Math.random() * 10) : (8 + Math.random() * 8)}s`,
            animationDelay: `${Math.random() * (isSakuraTheme ? 15 : 10)}s`,
            width: `${baseSize + Math.random() * (isSakuraTheme ? 16 : 8)}px`,
            height: `${baseSize + Math.random() * (isSakuraTheme ? 16 : 8)}px`,
            opacity: baseOpacity + Math.random() * 0.2,
          }}
        />
      ))}
    </div>
  )
}
