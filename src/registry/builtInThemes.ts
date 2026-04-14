/**
 * src/registry/builtInThemes.ts
 * 
 * 内置主题配置
 */

import type { ThemeManifest } from '../types/theme'
import { themeRegistry } from './ThemeRegistry'

export const BUILT_IN_THEMES: ThemeManifest[] = [
  {
    id: 'moodify-theme-moss',
    name: '苔藓',
    description: '苔藓与旧纸的静谧时光',
    version: '1.0.0',
    builtIn: true,
    colors: {
      bgBase: '#eae8e2',
      bgSurface: '#dedad3',
      bgElevated: '#f5f3ef',
      coil: { color: '#6B7A8F', gradient: 'linear-gradient(145deg, #8b7355 0%, #7a6345 50%, #6B7A8F 100%)' },
      lost: { color: '#7A8A9F', gradient: 'linear-gradient(145deg, #9b8365 0%, #8a7355 50%, #7A8A9F 100%)' },
      awaken: { color: '#A8B8C9', gradient: 'linear-gradient(145deg, #b89878 0%, #a88868 50%, #A8B8C9 100%)' },
      expand: { color: '#C4D4E4', gradient: 'linear-gradient(145deg, #d4a888 0%, #c49878 50%, #C4D4E4 100%)' },
      textPrimary: '#3a3c32',
      textSecondary: '#5a5c52',
      textMuted: '#8a8c82',
      accent: '#8b7355',
      border: 'rgba(58, 60, 50, 0.1)',
      borderHover: 'rgba(58, 60, 50, 0.2)',
    },
    effects: {
      particles: { enabled: true, type: 'leaves', count: 20, colors: ['#8b7355', '#9b8365', '#a88868'] },
    },
  },
  {
    id: 'moodify-theme-terracotta',
    name: '陶土',
    description: '陶土与瓷器的温暖色调',
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
      particles: { enabled: true, type: 'none', count: 0 },
    },
  },
  {
    id: 'moodify-theme-driedFlower',
    name: '干花',
    description: '干花与旧绸的复古情怀',
    version: '1.0.0',
    builtIn: true,
    colors: {
      bgBase: '#ebe5e1',
      bgSurface: '#e0d8d6',
      bgElevated: '#f2ebe8',
      coil: { color: '#A86050', gradient: 'linear-gradient(145deg, #c08070 0%, #b07060 50%, #A86050 100%)' },
      lost: { color: '#B87868', gradient: 'linear-gradient(145deg, #d89888 0%, #c88878 50%, #B87868 100%)' },
      awaken: { color: '#C89878', gradient: 'linear-gradient(145deg, #e8b898 0%, #d8a888 50%, #C89878 100%)' },
      expand: { color: '#D8B8A8', gradient: 'linear-gradient(145deg, #e8c8b8 0%, #d8b8a8 50%, #D8B8A8 100%)' },
      textPrimary: '#3d3535',
      textSecondary: '#5d5555',
      textMuted: '#8d7575',
      accent: '#a86050',
      border: 'rgba(61, 53, 53, 0.1)',
      borderHover: 'rgba(61, 53, 53, 0.2)',
    },
    effects: {
      particles: { enabled: true, type: 'leaves', count: 15, colors: ['#c08070', '#d89888', '#e8b898'] },
    },
  },
  {
    id: 'moodify-theme-sakura',
    name: '樱花',
    description: '浪漫樱花飘落的春日时光',
    version: '1.0.0',
    builtIn: true,
    colors: {
      bgBase: '#fff5f5',
      bgSurface: '#ffe8e8',
      bgElevated: '#fffafa',
      coil: { color: '#FFB7C5', gradient: 'linear-gradient(145deg, #ff9eb5 0%, #ff85a5 50%, #FFB7C5 100%)' },
      lost: { color: '#FFC8D5', gradient: 'linear-gradient(145deg, #ffd5e0 0%, #ffc0d0 50%, #FFC8D5 100%)' },
      awaken: { color: '#FFD8E8', gradient: 'linear-gradient(145deg, #ffe5f0 0%, #ffd5e8 50%, #FFD8E8 100%)' },
      expand: { color: '#FFE8F0', gradient: 'linear-gradient(145deg, #fff0f5 0%, #ffe8f0 50%, #FFE8F0 100%)' },
      textPrimary: '#4a3040',
      textSecondary: '#6a5060',
      textMuted: '#9a7080',
      accent: '#ff85a5',
      border: 'rgba(74, 48, 64, 0.1)',
      borderHover: 'rgba(74, 48, 64, 0.2)',
    },
    effects: {
      particles: { 
        enabled: true, 
        type: 'sakura', 
        count: 60, 
        colors: ['#FFB7C5', '#FFC8D5', '#FFD8E8', '#FFE8F0', '#FF9EB5', '#ff85a5'] 
      },
    },
  },
]

export function initBuiltInThemes(): void {
  themeRegistry.registerBatch(BUILT_IN_THEMES)
}
