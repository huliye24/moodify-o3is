// 参数均衡器处理器 - 7-band EQ

import { EQBand, EQPreset } from '../types'

// 预设 EQ 配置
export const EQ_PRESETS: Record<string, EQPreset> = {
  flat: {
    name: '平坦',
    bands: [0, 0, 0, 0, 0, 0, 0],
  },
  pop: {
    name: '流行',
    bands: [-1, 2, 4, 5, 3, 1, -1],
  },
  rock: {
    name: '摇滚',
    bands: [4, 3, 1, -1, 2, 4, 5],
  },
  jazz: {
    name: '爵士',
    bands: [3, 2, 1, 2, 3, 4, 3],
  },
  classical: {
    name: '古典',
    bands: [4, 3, 2, 1, 2, 3, 4],
  },
  bass_boost: {
    name: '低音增强',
    bands: [6, 5, 3, 0, 0, 0, 0],
  },
  treble_boost: {
    name: '高音增强',
    bands: [0, 0, 0, 0, 2, 4, 6],
  },
  vocal: {
    name: '人声增强',
    bands: [-2, -1, 2, 4, 4, 2, -1],
  },
  electronic: {
    name: '电子',
    bands: [4, 3, 0, -2, 2, 4, 5],
  },
  acoustic: {
    name: '原声',
    bands: [3, 2, 0, 1, 3, 2, 3],
  },
}

// 默认频段配置
export const DEFAULT_EQ_BANDS: EQBand[] = [
  { frequency: 60, label: '60Hz', type: 'lowshelf', gain: 0, Q: 1 },
  { frequency: 170, label: '170Hz', type: 'peaking', gain: 0, Q: 1 },
  { frequency: 310, label: '310Hz', type: 'peaking', gain: 0, Q: 1 },
  { frequency: 600, label: '600Hz', type: 'peaking', gain: 0, Q: 1 },
  { frequency: 3000, label: '3kHz', type: 'peaking', gain: 0, Q: 1 },
  { frequency: 6000, label: '6kHz', type: 'peaking', gain: 0, Q: 1 },
  { frequency: 12000, label: '12kHz', type: 'highshelf', gain: 0, Q: 1 },
]

export class EQProcessor {
  private audioContext: AudioContext | null = null
  private filters: BiquadFilterNode[] = []
  private inputNode: GainNode | null = null
  private outputNode: GainNode | null = null
  private enabled: boolean = true

  async initialize(audioContext: AudioContext): Promise<void> {
    this.audioContext = audioContext

    // 创建输入输出节点
    this.inputNode = audioContext.createGain()
    this.outputNode = audioContext.createGain()

    // 创建 7 个滤波器
    this.filters = DEFAULT_EQ_BANDS.map((band) => {
      const filter = audioContext.createBiquadFilter()
      filter.type = band.type
      filter.frequency.value = band.frequency
      filter.Q.value = band.Q
      filter.gain.value = band.gain
      return filter
    })

    // 连接滤波器链
    this.connectFilters()
  }

  private connectFilters(): void {
    if (!this.inputNode || !this.outputNode || this.filters.length === 0) return

    // 输入 -> 第一个滤波器
    this.inputNode.connect(this.filters[0])

    // 滤波器链
    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1])
    }

    // 最后一个滤波器 -> 输出
    this.filters[this.filters.length - 1].connect(this.outputNode)
  }

  getInputNode(): GainNode | null {
    return this.inputNode
  }

  getOutputNode(): GainNode | null {
    return this.outputNode
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (this.inputNode && this.outputNode) {
      if (enabled) {
        this.inputNode.connect(this.filters[0])
        this.filters[this.filters.length - 1].connect(this.outputNode)
      } else {
        this.inputNode.disconnect()
        this.filters.forEach((f) => f.disconnect())
      }
    }
  }

  isEnabled(): boolean {
    return this.enabled
  }

  setBandGain(bandIndex: number, gain: number): void {
    if (bandIndex >= 0 && bandIndex < this.filters.length) {
      const clampedGain = Math.max(-12, Math.min(12, gain))
      this.filters[bandIndex].gain.value = clampedGain
    }
  }

  getBandGain(bandIndex: number): number {
    if (bandIndex >= 0 && bandIndex < this.filters.length) {
      return this.filters[bandIndex].gain.value
    }
    return 0
  }

  setAllGains(gains: number[]): void {
    gains.forEach((gain, index) => {
      this.setBandGain(index, gain)
    })
  }

  getAllGains(): number[] {
    return this.filters.map((f) => f.gain.value)
  }

  applyPreset(presetName: string): void {
    const preset = EQ_PRESETS[presetName]
    if (preset) {
      this.setAllGains(preset.bands)
    }
  }

  getPresets(): Record<string, EQPreset> {
    return EQ_PRESETS
  }

  getBands(): EQBand[] {
    return this.filters.map((filter, index) => ({
      frequency: filter.frequency.value,
      label: DEFAULT_EQ_BANDS[index].label,
      type: filter.type,
      gain: filter.gain.value,
      Q: filter.Q.value,
    }))
  }

  reset(): void {
    this.setAllGains([0, 0, 0, 0, 0, 0, 0])
  }

  destroy(): void {
    this.filters.forEach((filter) => {
      filter.disconnect()
    })
    this.inputNode?.disconnect()
    this.outputNode?.disconnect()
    this.filters = []
    this.inputNode = null
    this.outputNode = null
  }
}
