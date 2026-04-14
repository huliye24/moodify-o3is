// 音频引擎类型定义

export interface AudioSource {
  url: string
  title?: string
  artist?: string
  duration?: number
  coverUrl?: string
}

export interface AudioState {
  isPlaying: boolean
  isPaused: boolean
  isLoading: boolean
  currentTime: number
  duration: number
  buffered: number
  volume: number
  isMuted: boolean
}

export interface EQBand {
  frequency: number
  label: string
  type: BiquadFilterType
  gain: number
  Q: number
}

export interface EQPreset {
  name: string
  bands: number[] // 7 个频段的增益值
}

export interface LoudnessSettings {
  enabled: boolean
  targetLUFS: number
  truePeak: number
}

export interface WaveformData {
  peaks: Float32Array
  duration: number
}

export interface AudioEngineConfig {
  audioContext?: AudioContextOptions
  fftSize?: number
  smoothingTimeConstant?: number
}

// 播放状态枚举
export enum PlaybackStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  READY = 'ready',
  PLAYING = 'playing',
  PAUSED = 'paused',
  ENDED = 'ended',
  ERROR = 'error',
}

// 情感类型
export type EmotionType = 'coil' | 'lost' | 'awaken' | 'expand'

export interface EmotionData {
  type: EmotionType
  intensity: number
  tags: string[]
}

// Suno 任务状态
export enum SunoTaskStatus {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILURE = 'failure',
}

export interface SunoTask {
  taskId: string
  status: SunoTaskStatus
  title?: string
  audioUrl?: string
  videoUrl?: string
  coverImageUrl?: string
  progress?: number
  failReason?: string
}
