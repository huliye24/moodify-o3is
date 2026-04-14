import { createContext, useContext } from 'react'

export interface AuroraTheme {
  id: number
  name: string
  // 渐变色系
  colors: {
    primary: string      // 主色（用于高亮、激活态）
    secondary: string    // 副色
    tertiary: string     // 第三色
    accent: string       // 强调色
  }
  // 滑动指示器
  indicator: {
    gradient: string
    shadow: string
  }
  // Tab 导航
  tab: {
    activeText: string
    inactiveColor: string
    topBorder: string
  }
  // 全局文字色
  text: {
    heading: string
    body: string
    secondary: string
    tertiary: string
    white: string
  }
  // 按钮/标签激活态
  chip: {
    activeBg: string
    activeBorder: string
    activeText: string
    inactiveBg: string
    inactiveBorder: string
    inactiveText: string
    hoverBg: string
    hoverText: string
  }
  // 边框/分割线
  border: {
    subtle: string
    medium: string
  }
  // Logo
  logoColor: string
  // 卡片背景
  card: {
    bg: string
    border: string
  }
}

const AURORA_THEMES: AuroraTheme[] = [
  {
    id: 2,
    name: '翠光极光',
    colors: {
      primary: 'rgba(93,185,122,0.85)',
      secondary: 'rgba(45,90,61,0.85)',
      tertiary: 'rgba(139,212,168,0.9)',
      accent: 'rgba(58,122,82,0.85)',
    },
    indicator: {
      gradient: 'linear-gradient(90deg, rgba(45,90,61,0.9), rgba(93,185,122,0.85), rgba(139,212,168,0.9))',
      shadow: '0 0 16px rgba(93,185,122,0.5), 0 0 8px rgba(139,212,168,0.3)',
    },
    tab: {
      activeText: 'white',
      inactiveColor: 'rgba(93,185,122,0.4)',
      topBorder: 'linear-gradient(90deg, transparent 0%, rgba(93,185,122,0.15) 20%, rgba(139,212,168,0.25) 50%, rgba(93,185,122,0.15) 80%, transparent 100%)',
    },
    text: {
      heading: 'rgba(200,240,210,0.9)',
      body: 'rgba(200,240,210,0.75)',
      secondary: 'rgba(93,185,122,0.5)',
      tertiary: 'rgba(93,185,122,0.35)',
      white: 'rgba(200,240,210,1)',
    },
    chip: {
      activeBg: 'rgba(93,185,122,0.15)',
      activeBorder: 'rgba(93,185,122,0.35)',
      activeText: 'rgba(200,240,210,1)',
      inactiveBg: 'rgba(45,90,61,0.08)',
      inactiveBorder: 'rgba(45,90,61,0.15)',
      inactiveText: 'rgba(93,185,122,0.5)',
      hoverBg: 'rgba(93,185,122,0.1)',
      hoverText: 'rgba(200,240,210,0.85)',
    },
    border: {
      subtle: 'rgba(45,90,61,0.15)',
      medium: 'rgba(45,90,61,0.3)',
    },
    logoColor: '#5DB97A',
    card: {
      bg: 'rgba(10,18,12,0.85)',
      border: 'rgba(45,90,61,0.15)',
    },
  },
]

interface ThemeContextValue {
  theme: AuroraTheme
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function AuroraThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{ theme: AURORA_THEMES[0] }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useAuroraTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useAuroraTheme must be used inside AuroraThemeProvider')
  return ctx
}

export { AURORA_THEMES }
export type { AuroraTheme }
