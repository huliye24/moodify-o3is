/**
 * src/engine/ThemeEngine.ts
 * 
 * 主题引擎 - 独立于旧主题系统
 */

import type { ThemeManifest } from '../types/theme'

const DEFAULT_THEME: ThemeManifest = {
  id: 'moodify-theme-default',
  name: '默认',
  version: '1.0.0',
  builtIn: true,
  colors: {
    bgBase: '#f0ede8',
    bgSurface: '#e5dfd8',
    bgElevated: '#f7f4f0',
    coil: { color: '#C47B8E', gradient: 'linear-gradient(145deg, #a86050 0%, #985040 50%, #C47B8E 100%)' },
    lost: { color: '#D4A574', gradient: 'linear-gradient(145deg, #b88560 0%, #a87550 50%, #D4A574 100%)' },
    awaken: { color: '#E8B86C', gradient: 'linear-gradient(145deg, #c89858 0%, #b88848 50%, #E8B86C 100%)' },
    expand: { color: '#D8C8B8', gradient: 'linear-gradient(145deg, #c8b8a8 0%, #b8a898 50%, #D8C8B8 100%)' },
    textPrimary: '#3d2d2d',
    textSecondary: '#5d4d4d',
    textMuted: '#8d7d7d',
    accent: '#a86850',
    border: 'rgba(61, 45, 45, 0.1)',
    borderHover: 'rgba(61, 45, 45, 0.2)',
  },
  effects: {
    particles: { enabled: false, type: 'none', count: 0 },
  },
}

class ThemeEngine {
  private currentTheme: ThemeManifest | null = null
  
  apply(theme: ThemeManifest): void {
    this.currentTheme = theme
    const root = document.documentElement
    const colors = theme.colors
    
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
    
    if (theme.cssVariables) {
      Object.entries(theme.cssVariables).forEach(([key, value]) => {
        root.style.setProperty(key, value)
      })
    }
  }
  
  getCurrentTheme(): ThemeManifest | null {
    return this.currentTheme
  }
  
  getDefaultTheme(): ThemeManifest {
    return DEFAULT_THEME
  }
  
  applyDefault(): void {
    this.apply(DEFAULT_THEME)
  }
}

export const themeEngine = new ThemeEngine()
