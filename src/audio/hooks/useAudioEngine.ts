// 音频引擎 Hook - 在 React 中使用音频引擎

import { useEffect, useRef, useState, useCallback } from 'react'
import { audioEngine, AudioEngine, AudioEventType } from '../AudioEngine'
import { AudioState, AudioSource, PlaybackStatus } from '../types'

export interface UseAudioEngineReturn {
  // 状态
  state: AudioState
  status: PlaybackStatus
  currentSource: AudioSource | null
  currentTime: number
  duration: number
  isPlaying: boolean
  isLoading: boolean

  // 操作
  play: () => Promise<void>
  pause: () => void
  togglePlay: () => Promise<void>
  seek: (time: number) => void
  seekByPercent: (percent: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  load: (source: AudioSource) => Promise<void>

  // 可视化
  getFrequencyData: () => Uint8Array
  getTimeDomainData: () => Uint8Array

  // 销毁
  destroy: () => void
}

export function useAudioEngine(): UseAudioEngineReturn {
  const [state, setState] = useState<AudioState>(audioEngine.getState())
  const [status, setStatus] = useState<PlaybackStatus>(audioEngine.getStatus())
  const [currentSource, setCurrentSource] = useState<AudioSource | null>(
    audioEngine.getCurrentSource()
  )
  const [currentTime, setCurrentTime] = useState<number>(audioEngine.getCurrentTime())
  const [duration, setDuration] = useState<number>(audioEngine.getDuration())

  const eventHandlersRef = useRef<Map<AudioEventType, () => void>>(new Map())

  useEffect(() => {
    // 初始化音频引擎
    audioEngine.init()

    // 定义事件处理器
    const handlers: Record<AudioEventType, () => void> = {
      play: () => {
        setState(audioEngine.getState())
        setStatus(audioEngine.getStatus())
      },
      pause: () => {
        setState(audioEngine.getState())
        setStatus(audioEngine.getStatus())
      },
      ended: () => {
        setState(audioEngine.getState())
        setStatus(audioEngine.getStatus())
      },
      timeupdate: () => {
        setCurrentTime(audioEngine.getCurrentTime())
        setState(audioEngine.getState())
      },
      loadedmetadata: () => {
        setDuration(audioEngine.getDuration())
        setState(audioEngine.getState())
        setStatus(audioEngine.getStatus())
      },
      durationchange: () => {
        setDuration(audioEngine.getDuration())
        setState(audioEngine.getState())
      },
      volumechange: () => {
        setState(audioEngine.getState())
      },
      error: () => {
        setState(audioEngine.getState())
        setStatus(audioEngine.getStatus())
      },
      waiting: () => {
        setState(audioEngine.getState())
      },
      canplay: () => {
        setState(audioEngine.getState())
      },
    }

    // 保存引用用于清理
    eventHandlersRef.current = new Map(Object.entries(handlers) as [AudioEventType, () => void][])

    // 订阅事件
    Object.entries(handlers).forEach(([event, handler]) => {
      audioEngine.on(event as AudioEventType, handler)
    })

    // 清理
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        audioEngine.off(event as AudioEventType, handler)
      })
    }
  }, [])

  const play = useCallback(async () => {
    await audioEngine.play()
  }, [])

  const pause = useCallback(() => {
    audioEngine.pause()
  }, [])

  const togglePlay = useCallback(async () => {
    await audioEngine.togglePlay()
  }, [])

  const seek = useCallback((time: number) => {
    audioEngine.seek(time)
  }, [])

  const seekByPercent = useCallback((percent: number) => {
    audioEngine.seekByPercent(percent)
  }, [])

  const setVolume = useCallback((volume: number) => {
    audioEngine.setVolume(volume)
  }, [])

  const toggleMute = useCallback(() => {
    audioEngine.toggleMute()
  }, [])

  const load = useCallback(async (source: AudioSource) => {
    await audioEngine.load(source)
    setCurrentSource(audioEngine.getCurrentSource())
  }, [])

  const getFrequencyData = useCallback(() => {
    return audioEngine.getFrequencyData()
  }, [])

  const getTimeDomainData = useCallback(() => {
    return audioEngine.getTimeDomainData()
  }, [])

  const destroy = useCallback(() => {
    audioEngine.destroy()
  }, [])

  return {
    state,
    status,
    currentSource,
    currentTime,
    duration,
    isPlaying: state.isPlaying,
    isLoading: state.isLoading,
    play,
    pause,
    togglePlay,
    seek,
    seekByPercent,
    setVolume,
    toggleMute,
    load,
    getFrequencyData,
    getTimeDomainData,
    destroy,
  }
}
