// 音频模块导出

// 类型
export * from './types'

// 核心引擎
export { AudioEngine, audioEngine } from './AudioEngine'
export { AudioContextManager, audioContextManager } from './AudioContextManager'

// 处理器
export { EQProcessor, EQ_PRESETS, DEFAULT_EQ_BANDS } from './processors/EQProcessor'
export { LoudnessProcessor, LOUDNESS_PRESETS } from './processors/LoudnessProcessor'

// Hooks
export { useAudioEngine } from './hooks/useAudioEngine'
export { useWaveform } from './hooks/useWaveform'
export { useLyrics } from './hooks/useLyrics'

// 组件
export { WaveformCanvas, WaveformBars } from './components/WaveformCanvas'
export { EQPanel } from './components/EQPanel'
export { LoudnessControl } from './components/LoudnessControl'
export { LyricsView, LyricLineSimple } from './components/LyricsView'
export { PromptCard, PromptTag } from './components/PromptCard'
export { EmotionDisplay, EmotionSelector, EmotionBar } from './components/EmotionDisplay'
export { TaskStatus, ProgressBar } from './components/TaskStatus'

// 工具
export {
  parseLRC,
  generateMockLRC,
  formatTime,
  getCurrentLineIndex,
  type LyricLine,
  type LrcData
} from './utils/LrcParser'
