import { useEffect, useRef, useCallback } from 'react'
import { usePlayerStore } from '../stores/usePlayerStore'

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
  } = usePlayerStore()

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

        // 通过 HTTP 代理查询 MusicTrack 并更新
        try {
          const tracksRes = await window.api.http.get(`/api/v1/music-tracks/by-task?task_id=${taskId}`)
          const tracks = Array.isArray(tracksRes) ? tracksRes : (tracksRes.data || [])

          if (tracks.length > 0) {
            for (const song of task.songs) {
              const existingTrack = tracks.find((t: any) => !t.audio_url)

              if (existingTrack) {
                await window.api.http.post('/api/v1/music-tracks', {
                  id: existingTrack.id,
                  status: 'success',
                  audio_url: song.audio_url,
                  video_url: song.video_url,
                  cover_image_url: song.image_url,
                  suno_song_id: song.id,
                  title: song.title || existingTrack.title
                })
              }

              // 重新获取更新后的 track
              const updatedRes = await window.api.http.get(`/api/v1/music-tracks/by-task?task_id=${taskId}`)
              const updatedTracks = Array.isArray(updatedRes) ? updatedRes : (updatedRes.data || [])
              const newTrack = updatedTracks.find((t: any) => t.audio_url)
              if (newTrack) {
                addToPlaylist(newTrack)
                setCurrentTrack(newTrack)
              }
            }
          }
        } catch (e) {
          console.error('更新 track 失败:', e)
        }
      } else if (task.status === 'failure') {
        stopGenerating()
        setGenerationError(task.failReason || '生成失败')

        try {
          const tracksRes = await window.api.http.get(`/api/v1/music-tracks/by-task?task_id=${taskId}`)
          const tracks = Array.isArray(tracksRes) ? tracksRes : (tracksRes.data || [])
          if (tracks.length > 0) {
            await window.api.http.post('/api/v1/music-tracks', {
              id: tracks[0].id,
              status: 'failure',
              fail_reason: task.failReason
            })
          }
        } catch (e) {
          console.error('更新失败状态失败:', e)
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
