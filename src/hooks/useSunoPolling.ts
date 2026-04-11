import { useEffect, useRef, useCallback } from 'react'
import { useMusicStore } from '../stores/useMusicStore'

const POLLING_INTERVAL = 3000 // 3秒轮询一次

export function useSunoPolling() {
  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  const {
    currentTaskId,
    isGenerating,
    startGenerating,
    updateProgress,
    stopGenerating,
    setGenerationError,
    addToPlaylist,
    setCurrentTrack
  } = useMusicStore()

  // 执行轮询
  const poll = useCallback(async (taskId: string) => {
    try {
      const results = await window.api.suno.fetch([taskId])
      const task = results[0]

      if (!task) return

      // 更新进度
      updateProgress(task.progress)

      // 检查是否完成
      if (task.status === 'success') {
        stopGenerating()

        // 获取关联的 MusicTrack 并更新
        const tracks = await window.api.musicTrack.getByTaskId(taskId)
        if (tracks.length > 0) {
          // 更新 MusicTrack 的 URL 信息
          for (const song of task.songs) {
            const existingTrack = tracks.find(t => !t.audioUrl)
            if (existingTrack) {
              await window.api.musicTrack.update(existingTrack.id, {
                status: 'success',
                audioUrl: song.audio_url,
                videoUrl: song.video_url,
                coverImageUrl: song.image_url,
                sunoSongId: song.id,
                title: song.title || existingTrack.title
              })
            }

            // 添加到播放列表
            const updatedTrack = await window.api.musicTrack.getByTaskId(taskId)
            if (updatedTrack.length > 0) {
              const newTrack = updatedTrack.find(t => t.audioUrl)
              if (newTrack) {
                addToPlaylist(newTrack)
                setCurrentTrack(newTrack)
              }
            }
          }
        }
      } else if (task.status === 'failure') {
        stopGenerating()
        setGenerationError(task.failReason || '生成失败')

        // 更新数据库状态
        const tracks = await window.api.musicTrack.getByTaskId(taskId)
        if (tracks.length > 0) {
          await window.api.musicTrack.update(tracks[0].id, {
            status: 'failure',
            failReason: task.failReason
          })
        }
      }
      // 其他状态继续轮询
    } catch (error: any) {
      stopGenerating()
      setGenerationError(error.message || '查询状态失败')
    }
  }, [updateProgress, stopGenerating, setGenerationError, addToPlaylist, setCurrentTrack])

  // 开始轮询
  const startPolling = useCallback((taskId: string) => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
    }

    startGenerating(taskId)

    pollingRef.current = setInterval(() => {
      poll(taskId)
    }, POLLING_INTERVAL)

    // 立即执行一次
    poll(taskId)
  }, [poll, startGenerating])

  // 停止轮询
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current)
      pollingRef.current = null
    }
    stopGenerating()
  }, [stopGenerating])

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current)
      }
    }
  }, [])

  return {
    startPolling,
    stopPolling,
    isGenerating,
    currentTaskId
  }
}
