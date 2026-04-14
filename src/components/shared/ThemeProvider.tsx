/**
 * src/components/shared/ThemeProvider.tsx
 * 
 * 使用旧的 THEME_PRESETS 系统
 */

import { useEffect } from 'react'
import { useThemeStore, THEME_PRESETS } from '../../stores/useThemeStore'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore()
  const colors = THEME_PRESETS[theme]

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--theme-bg-base', colors.bgBase)
    root.style.setProperty('--theme-bg-surface', colors.bgSurface)
    root.style.setProperty('--theme-bg-elevated', colors.bgElevated)
    root.style.setProperty('--theme-text-primary', colors.textPrimary)
    root.style.setProperty('--theme-text-secondary', colors.textSecondary)
    root.style.setProperty('--theme-text-muted', colors.textMuted)
    root.style.setProperty('--theme-accent', colors.accent)
    root.style.setProperty('--theme-border', colors.border)
    root.style.setProperty('--theme-border-hover', colors.borderHover)
    root.style.setProperty('--theme-coil-color', colors.coil.color)
    root.style.setProperty('--theme-coil-gradient', colors.coil.gradient)
    root.style.setProperty('--theme-lost-color', colors.lost.color)
    root.style.setProperty('--theme-lost-gradient', colors.lost.gradient)
    root.style.setProperty('--theme-awaken-color', colors.awaken.color)
    root.style.setProperty('--theme-awaken-gradient', colors.awaken.gradient)
    root.style.setProperty('--theme-expand-color', colors.expand.color)
    root.style.setProperty('--theme-expand-gradient', colors.expand.gradient)
  }, [theme, colors])

  return <>{children}</>
}
