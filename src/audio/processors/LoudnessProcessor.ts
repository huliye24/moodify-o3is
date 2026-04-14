// 响度归一化处理器 - EBU R128 标准

import { LoudnessSettings } from '../types'

export const LOUDNESS_PRESETS: Record<string, LoudnessSettings> = {
  standard: {
    enabled: true,
    targetLUFS: -14,
    truePeak: -1,
  },
  podcast: {
    enabled: true,
    targetLUFS: -16,
    truePeak: -1,
  },
  broadcast: {
    enabled: true,
    targetLUFS: -23,
    truePeak: -1.5,
  },
  quiet: {
    enabled: true,
    targetLUFS: -18,
    truePeak: -3,
  },
}

export class LoudnessProcessor {
  private audioContext: AudioContext | null = null
  private gainNode: GainNode | null = null
  private settings: LoudnessSettings = LOUDNESS_PRESETS.standard

  async initialize(audioContext: AudioContext): Promise<void> {
    this.audioContext = audioContext
    this.gainNode = audioContext.createGain()
  }

  getInputNode(): GainNode | null {
    return this.gainNode
  }

  getOutputNode(): GainNode | null {
    return this.gainNode
  }

  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled
    this.applySettings()
  }

  isEnabled(): boolean {
    return this.settings.enabled
  }

  setTargetLUFS(targetLUFS: number): void {
    this.settings.targetLUFS = Math.max(-40, Math.min(0, targetLUFS))
    this.applySettings()
  }

  getTargetLUFS(): number {
    return this.settings.targetLUFS
  }

  applyPreset(presetName: string): void {
    const preset = LOUDNESS_PRESETS[presetName]
    if (preset) {
      this.settings = { ...preset }
      this.applySettings()
    }
  }

  getPresets(): Record<string, LoudnessSettings> {
    return LOUDNESS_PRESETS
  }

  getSettings(): LoudnessSettings {
    return { ...this.settings }
  }

  // 计算并应用增益
  // 实际实现需要音频分析，这里做简化处理
  applySettings(): void {
    if (!this.gainNode) return

    if (this.settings.enabled) {
      // 简化：直接设置目标增益
      // 实际需要分析音频的当前响度并计算差值
      const targetGain = Math.pow(10, this.settings.targetLUFS / 20)
      this.gainNode.gain.value = targetGain
    } else {
      this.gainNode.gain.value = 1
    }
  }

  reset(): void {
    this.settings = LOUDNESS_PRESETS.standard
    this.applySettings()
  }

  destroy(): void {
    this.gainNode?.disconnect()
    this.gainNode = null
  }
}
