import { useEffect, useRef, useCallback } from 'react'
import { useMoodStore } from '../stores/useMoodStore'

interface UseMoodPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>
  analyserRef: React.RefObject<AnalyserNode | null>
  startAudio: () => void
}

export function useMoodPlayer(): UseMoodPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const {
    setAudio, setCurrentTime, setDuration,
    setVolume, volume, isMuted
  } = useMoodStore()

  // 初始化音频元素
  useEffect(() => {
    if (audioRef.current) return

    const audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.volume = volume
    audioRef.current = audio
    setAudio(audio)

    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audio.addEventListener('ended', () => {
      useMoodStore.getState().pause()
    })

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [setAudio, setCurrentTime, setDuration, volume])

  // 音量同步
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  // 初始化 Web Audio API（可选，用于波形）
  const startAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return

    try {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.8

      const source = ctx.createMediaElementSource(audioRef.current)
      source.connect(analyser)
      analyser.connect(ctx.destination)

      audioContextRef.current = ctx
      analyserRef.current = analyser
      sourceRef.current = source
    } catch (e) {
      console.warn('Web Audio API 不可用:', e)
    }
  }, [])

  return { audioRef, analyserRef, startAudio }
}
