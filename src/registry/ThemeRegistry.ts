/**
 * src/registry/ThemeRegistry.ts
 * 
 * 主题注册表 - 管理所有已注册的主题
 * 独立于旧主题系统
 */

import type { ThemeManifest } from '../types/theme'

class ThemeRegistry {
  private themes: Map<string, ThemeManifest> = new Map()
  private listeners: Set<() => void> = new Set()
  
  register(theme: ThemeManifest): void {
    if (this.themes.has(theme.id)) {
      console.warn(`[ThemeRegistry] 主题 ${theme.id} 已存在，将被覆盖`)
    }
    this.themes.set(theme.id, theme)
    this.notify()
  }
  
  registerBatch(themes: ThemeManifest[]): void {
    themes.forEach(theme => this.register(theme))
  }
  
  unregister(themeId: string): boolean {
    const result = this.themes.delete(themeId)
    if (result) this.notify()
    return result
  }
  
  get(themeId: string): ThemeManifest | undefined {
    return this.themes.get(themeId)
  }
  
  getAll(): ThemeManifest[] {
    return Array.from(this.themes.values())
  }
  
  has(themeId: string): boolean {
    return this.themes.has(themeId)
  }
  
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  private notify(): void {
    this.listeners.forEach(listener => listener())
  }
}

export const themeRegistry = new ThemeRegistry()
