// 音频引擎 - 核心类

import { AudioState, AudioSource, PlaybackStatus, WaveformData } from './types'

export type AudioEventType =
  | 'play'
  | 'pause'
  | 'ended'
  | 'timeupdate'
  | 'loadedmetadata'
  | 'durationchange'
  | 'volumechange'
  | 'error'
  | 'waiting'
  | 'canplay'

export interface AudioEvent {
  type: AudioEventType
  data?: unknown
}

export type AudioEventListener = (event: AudioEvent) => void

export class AudioEngine {
  private audioContext: AudioContext | null = null
  private audioElement: HTMLAudioElement | null = null
  private sourceNode: MediaElementAudioSourceNode | null = null
  private gainNode: GainNode | null = null
  private analyserNode: AnalyserNode | null = null

  private state: AudioState = {
    isPlaying: false,
    isPaused: true,
    isLoading: false,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    volume: 1,
    isMuted: false,
  }

  private status: PlaybackStatus = PlaybackStatus.IDLE
  private currentSource: AudioSource | null = null
  private listeners: Map<AudioEventType, Set<AudioEventListener>> = new Map()

  constructor() {
    this.initAudioElement()
  }

  private initAudioElement(): void {
    if (typeof window !== 'undefined') {
      this.audioElement = new Audio()
      this.audioElement.crossOrigin = 'anonymous'

      // 绑定事件
      this.audioElement.addEventListener('play', () => this.handlePlay())
      this.audioElement.addEventListener('pause', () => this.handlePause())
      this.audioElement.addEventListener('ended', () => this.handleEnded())
      this.audioElement.addEventListener('timeupdate', () => this.handleTimeUpdate())
      this.audioElement.addEventListener('loadedmetadata', () => this.handleLoadedMetadata())
      this.audioElement.addEventListener('durationchange', () => this.handleDurationChange())
      this.audioElement.addEventListener('volumechange', () => this.handleVolumeChange())
      this.audioElement.addEventListener('error', (e) => this.handleError(e))
      this.audioElement.addEventListener('waiting', () => this.handleWaiting())
      this.audioElement.addEventListener('canplay', () => this.handleCanPlay())
    }
  }

  async init(): Promise<void> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
      await this.setupAudioGraph()
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  private async setupAudioGraph(): Promise<void> {
    if (!this.audioContext || !this.audioElement) return

    // 创建音频节点
    this.gainNode = this.audioContext.createGain()
    this.analyserNode = this.audioContext.createAnalyser()
    this.analyserNode.fftSize = 256
    this.analyserNode.smoothingTimeConstant = 0.8

    // 连接: source -> gain -> analyser -> destination
    this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement)
    this.sourceNode.connect(this.gainNode)
    this.gainNode.connect(this.analyserNode)
    this.analyserNode.connect(this.audioContext.destination)
  }

  // ==================== 播放控制 ====================

  async load(source: AudioSource): Promise<void> {
    if (!this.audioElement) return

    this.currentSource = source
    this.setStatus(PlaybackStatus.LOADING)
    this.state.isLoading = true
    this.emit('waiting')

    this.audioElement.src = source.url
    this.audioElement.load()
  }

  async play(): Promise<void> {
    if (!this.audioElement) return

    await this.init()
    if (this.audioElement.paused) {
      try {
        await this.audioElement.play()
      } catch (error) {
        console.error('Play failed:', error)
        this.setStatus(PlaybackStatus.ERROR)
      }
    }
  }

  pause(): void {
    if (!this.audioElement) return

    if (!this.audioElement.paused) {
      this.audioElement.pause()
    }
  }

  async togglePlay(): Promise<void> {
    if (this.state.isPlaying) {
      this.pause()
    } else {
      await this.play()
    }
  }

  seek(time: number): void {
    if (!this.audioElement) return

    const clampedTime = Math.max(0, Math.min(time, this.state.duration))
    this.audioElement.currentTime = clampedTime
    this.state.currentTime = clampedTime
    this.emit('timeupdate')
  }

  seekByPercent(percent: number): void {
    const time = this.state.duration * percent
    this.seek(time)
  }

  setVolume(volume: number): void {
    if (!this.audioElement || !this.gainNode) return

    const clampedVolume = Math.max(0, Math.min(1, volume))
    this.audioElement.volume = clampedVolume
    this.gainNode.gain.value = clampedVolume
    this.state.volume = clampedVolume
    this.state.isMuted = clampedVolume === 0
  }

  toggleMute(): void {
    if (this.state.isMuted) {
      this.setVolume(this.state.volume || 0.8)
      this.state.isMuted = false
    } else {
      if (this.gainNode) {
        this.gainNode.gain.value = 0
      }
      this.state.isMuted = true
    }
  }

  // ==================== 可视化 ====================

  getAnalyserNode(): AnalyserNode | null {
    return this.analyserNode
  }

  getFrequencyData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0)

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getByteFrequencyData(dataArray)
    return dataArray
  }

  getTimeDomainData(): Uint8Array {
    if (!this.analyserNode) return new Uint8Array(0)

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount)
    this.analyserNode.getByteTimeDomainData(dataArray)
    return dataArray
  }

  async generateWaveform(): Promise<WaveformData> {
    // 返回模拟波形数据（实际应使用 Web Audio API 的 decodeAudioData）
    const peaks = new Float32Array(200)
    for (let i = 0; i < peaks.length; i++) {
      peaks[i] = Math.random() * 0.8 + 0.2
    }
    return {
      peaks,
      duration: this.state.duration,
    }
  }

  // ==================== 状态管理 ====================

  getState(): AudioState {
    return { ...this.state }
  }

  getStatus(): PlaybackStatus {
    return this.status
  }

  getCurrentSource(): AudioSource | null {
    return this.currentSource
  }

  getCurrentTime(): number {
    return this.audioElement?.currentTime ?? 0
  }

  getDuration(): number {
    return this.state.duration
  }

  // ==================== 事件系统 ====================

  on(event: AudioEventType, listener: AudioEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)?.add(listener)
  }

  off(event: AudioEventType, listener: AudioEventListener): void {
    this.listeners.get(event)?.delete(listener)
  }

  private emit(type: AudioEventType, data?: unknown): void {
    const event: AudioEvent = { type, data }
    this.listeners.get(type)?.forEach((listener) => listener(event))
  }

  // ==================== 事件处理 ====================

  private setStatus(status: PlaybackStatus): void {
    this.status = status
  }

  private handlePlay(): void {
    this.state.isPlaying = true
    this.state.isPaused = false
    this.state.isLoading = false
    this.setStatus(PlaybackStatus.PLAYING)
    this.emit('play')
  }

  private handlePause(): void {
    this.state.isPlaying = false
    this.state.isPaused = true
    this.setStatus(PlaybackStatus.PAUSED)
    this.emit('pause')
  }

  private handleEnded(): void {
    this.state.isPlaying = false
    this.state.isPaused = true
    this.setStatus(PlaybackStatus.ENDED)
    this.emit('ended')
  }

  private handleTimeUpdate(): void {
    if (this.audioElement) {
      this.state.currentTime = this.audioElement.currentTime
    }
    this.emit('timeupdate')
  }

  private handleLoadedMetadata(): void {
    if (this.audioElement) {
      this.state.duration = this.audioElement.duration
      this.state.isLoading = false
    }
    this.setStatus(PlaybackStatus.READY)
    this.emit('loadedmetadata')
  }

  private handleDurationChange(): void {
    if (this.audioElement) {
      this.state.duration = this.audioElement.duration
    }
    this.emit('durationchange')
  }

  private handleVolumeChange(): void {
    if (this.audioElement) {
      this.state.volume = this.audioElement.volume
    }
    this.emit('volumechange')
  }

  private handleError(e: Event): void {
    console.error('Audio error:', e)
    this.state.isLoading = false
    this.setStatus(PlaybackStatus.ERROR)
    this.emit('error', e)
  }

  private handleWaiting(): void {
    this.state.isLoading = true
    this.emit('waiting')
  }

  private handleCanPlay(): void {
    this.state.isLoading = false
    this.emit('canplay')
  }

  // ==================== 生命周期 ====================

  destroy(): void {
    if (this.audioElement) {
      this.audioElement.pause()
      this.audioElement.src = ''
      this.audioElement.remove()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
    this.listeners.clear()
    this.audioElement = null
    this.audioContext = null
    this.sourceNode = null
    this.gainNode = null
    this.analyserNode = null
  }
}

// 单例导出
export const audioEngine = new AudioEngine()
