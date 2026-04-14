/**
 * src/types/theme.ts
 * 
 * 主题系统核心类型定义
 */

export interface MoodColor {
  color: string
  gradient: string
}

export interface ThemeColors {
  bgBase: string
  bgSurface: string
  bgElevated: string
  coil: MoodColor
  lost: MoodColor
  awaken: MoodColor
  expand: MoodColor
  textPrimary: string
  textSecondary: string
  textMuted: string
  accent: string
  border: string
  borderHover: string
}

export type ParticleType = 'sakura' | 'snow' | 'leaves' | 'none'

export interface ThemeEffects {
  particles?: {
    enabled: boolean
    type: ParticleType
    count?: number
    colors?: string[]
  }
  gradients?: {
    enabled: boolean
    intensity?: number
  }
}

export interface ThemeManifest {
  id: string
  name: string
  description?: string
  author?: string
  version: string
  thumbnail?: string
  colors: ThemeColors
  effects?: ThemeEffects
  builtIn?: boolean
  cssVariables?: Record<string, string>
}

export interface ThemeRegistryState {
  currentThemeId: string
  previewThemeId: string | null
}
