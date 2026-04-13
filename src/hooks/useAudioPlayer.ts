import { useEffect, useRef, useCallback } from 'react'
import { useMusicStore } from '../stores/useMusicStore'

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    pause
  } = useMusicStore()

  // 初始化音频元素
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
    }

    const audio = audioRef.current

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      pause()
      setCurrentTime(0)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [setCurrentTime, setDuration, pause])

  // 加载新曲目
  useEffect(() => {
    if (audioRef.current && currentTrack?.audio_url) {
      audioRef.current.src = currentTrack.audio_url
      audioRef.current.load()
    }
  }, [currentTrack])

  // 控制播放/暂停
  useEffect(() => {
    if (!audioRef.current) return

    if (isPlaying && currentTrack?.audio_url) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying, currentTrack])

  // 控制音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // 跳转
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [setCurrentTime])

  // 播放指定曲目
  const playTrack = useCallback((audioUrl: string) => {
    if (audioRef.current) {
      audioRef.current.src = audioUrl
      audioRef.current.play().catch(console.error)
    }
  }, [])

  return {
    seek,
    playTrack,
    audioRef
  }
}
