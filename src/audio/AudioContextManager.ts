// 音频上下文管理器 - 单例模式管理 AudioContext

import { audioEngine, AudioEngine } from './AudioEngine'

class AudioContextManager {
  private static instance: AudioContextManager
  private engine: AudioEngine = audioEngine
  private initialized: boolean = false

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager()
    }
    return AudioContextManager.instance
  }

  getEngine(): AudioEngine {
    return this.engine
  }

  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.engine.init()
      this.initialized = true
    }
  }

  isInitialized(): boolean {
    return this.initialized
  }

  reset(): void {
    this.initialized = false
  }
}

export const audioContextManager = AudioContextManager.getInstance()
export { AudioContextManager }
