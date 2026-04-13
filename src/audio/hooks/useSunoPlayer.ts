// Suno Player Hook - 完整的 Suno 音乐播放流程

import { useState, useCallback, useRef, useEffect } from 'react'
import { SunoTask, SunoTaskStatus, EmotionData, EmotionType } from '../types'

export interface SunoPlayerState {
  taskId: string | null
  status: SunoTaskStatus
  progress: number
  title: string
  audioUrl: string | null
  videoUrl: string | null
  coverImageUrl: string | null
  prompt: string
  model: string
  duration: string
  hasVocal: boolean
  emotion: EmotionData | null
  error: string | null
}

export interface UseSunoPlayerOptions {
  pollInterval?: number // 轮询间隔 ms
  onComplete?: (task: SunoTask) => void
  onError?: (error: string) => void
}

export interface UseSunoPlayerReturn {
  state: SunoPlayerState
  isPlaying: boolean
  submitTask: (params: SunoSubmitParams) => Promise<void>
  pollTask: () => Promise<void>
  stopPolling: () => void
  reset: () => void
  playAudio: () => Promise<void>
  pauseAudio: () => void
}

interface SunoSubmitParams {
  title: string
  prompt: string
  makeInstrumental?: boolean
  model?: string
}

const DEFAULT_STATE: SunoPlayerState = {
  taskId: null,
  status: SunoTaskStatus.PENDING,
  progress: 0,
  title: '',
  audioUrl: null,
  videoUrl: null,
  coverImageUrl: null,
  prompt: '',
  model: 'chirp-v4-0',
  duration: '0:00',
  hasVocal: true,
  emotion: null,
  error: null,
}

export function useSunoPlayer(options: UseSunoPlayerOptions = {}): UseSunoPlayerReturn {
  const { pollInterval = 5000, onComplete, onError } = options

  const [state, setState] = useState<SunoPlayerState>(DEFAULT_STATE)
  const [isPlaying, setIsPlaying] = useState(false)

  const pollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 清理轮询定时器
  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  // 重置状态
  const reset = useCallback(() => {
    stopPolling()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setState(DEFAULT_STATE)
    setIsPlaying(false)
  }, [stopPolling])

  // 提交任务
  const submitTask = useCallback(async (params: SunoSubmitParams) => {
    try {
      setState((prev) => ({
        ...prev,
        status: SunoTaskStatus.SUBMITTED,
        progress: 10,
        title: params.title,
        prompt: params.prompt,
        model: params.model || 'chirp-v4-0',
        hasVocal: !params.makeInstrumental,
        error: null,
      }))

      const response = await fetch('/api/v1/suno/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: params.title,
          gpt_description_prompt: params.prompt,
          make_instrumental: params.makeInstrumental || false,
          model: params.model || 'chirp-v4-0',
        }),
      })

      if (!response.ok) {
        throw new Error(`提交失败: ${response.status}`)
      }

      const data = await response.json()
      const taskId = data.task_id || data.data?.task_id

      setState((prev) => ({
        ...prev,
        taskId,
        status: SunoTaskStatus.QUEUED,
        progress: 25,
      }))

      // 开始轮询
      pollTimerRef.current = setInterval(() => {
        pollTask()
      }, pollInterval)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '提交任务失败'
      setState((prev) => ({
        ...prev,
        status: SunoTaskStatus.FAILURE,
        error: errorMessage,
      }))
      onError?.(errorMessage)
    }
  }, [pollInterval, onError])

  // 轮询任务状态
  const pollTask = useCallback(async () => {
    const currentTaskId = state.taskId
    if (!currentTaskId) {
      stopPolling()
      return
    }

    try {
      const response = await fetch('/api/v1/suno/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_ids: [currentTaskId] }),
      })

      if (!response.ok) {
        throw new Error(`轮询失败: ${response.status}`)
      }

      const data = await response.json()
      const task = data.tasks?.[0]

      if (!task) {
        return
      }

      // 映射状态
      const status = mapSunoStatus(task.status)
      const progress = calculateProgress(status)

      setState((prev) => ({
        ...prev,
        status,
        progress,
        audioUrl: task.songs?.[0]?.audio_url || prev.audioUrl,
        videoUrl: task.songs?.[0]?.video_url || prev.videoUrl,
        coverImageUrl: task.songs?.[0]?.image_url || prev.coverImageUrl,
        error: task.fail_reason || null,
      }))

      // 完成处理
      if (status === SunoTaskStatus.SUCCESS) {
        stopPolling()
        onComplete?.({
          taskId: currentTaskId,
          status,
          title: task.songs?.[0]?.title,
          audioUrl: task.songs?.[0]?.audio_url,
          videoUrl: task.songs?.[0]?.video_url,
          coverImageUrl: task.songs?.[0]?.image_url,
          progress: 100,
        })
      } else if (status === SunoTaskStatus.FAILURE) {
        stopPolling()
        onError?.(task.fail_reason || '生成失败')
      }
    } catch (error) {
      console.error('Poll error:', error)
    }
  }, [state.taskId, stopPolling, onComplete, onError])

  // 播放音频
  const playAudio = useCallback(async () => {
    if (!state.audioUrl) return

    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.crossOrigin = 'anonymous'
    }

    audioRef.current.src = state.audioUrl

    try {
      await audioRef.current.play()
      setIsPlaying(true)
    } catch (error) {
      console.error('Play error:', error)
    }
  }, [state.audioUrl])

  // 暂停音频
  const pauseAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [])

  // 获取时长
  useEffect(() => {
    if (audioRef.current && state.audioUrl) {
      audioRef.current.onloadedmetadata = () => {
        const duration = audioRef.current?.duration || 0
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        setState((prev) => ({
          ...prev,
          duration: `${minutes}:${seconds.toString().padStart(2, '0')}`,
        }))
      }
    }
  }, [state.audioUrl])

  // 清理
  useEffect(() => {
    return () => {
      stopPolling()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [stopPolling])

  return {
    state,
    isPlaying,
    submitTask,
    pollTask,
    stopPolling,
    reset,
    playAudio,
    pauseAudio,
  }
}

// 状态映射
function mapSunoStatus(status: string): SunoTaskStatus {
  switch (status?.toUpperCase()) {
    case 'NOT_START':
      return SunoTaskStatus.PENDING
    case 'SUBMITTED':
      return SunoTaskStatus.SUBMITTED
    case 'QUEUED':
      return SunoTaskStatus.QUEUED
    case 'IN_PROGRESS':
      return SunoTaskStatus.IN_PROGRESS
    case 'SUCCESS':
      return SunoTaskStatus.SUCCESS
    case 'FAILURE':
      return SunoTaskStatus.FAILURE
    default:
      return SunoTaskStatus.PENDING
  }
}

// 计算进度
function calculateProgress(status: SunoTaskStatus): number {
  switch (status) {
    case SunoTaskStatus.PENDING:
      return 0
    case SunoTaskStatus.SUBMITTED:
      return 10
    case SunoTaskStatus.QUEUED:
      return 25
    case SunoTaskStatus.IN_PROGRESS:
      return 50
    case SunoTaskStatus.SUCCESS:
      return 100
    case SunoTaskStatus.FAILURE:
      return 100
    default:
      return 0
  }
}
