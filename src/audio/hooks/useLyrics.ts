// 歌词同步 Hook

import { useState, useCallback, useRef, useEffect } from 'react'
import { parseLRC, LrcData, LyricLine, getCurrentLineIndex } from '../utils/LrcParser'

export interface UseLyricsOptions {
  autoScroll?: boolean
  highlightTime?: number // 当前播放时间
}

export interface UseLyricsReturn {
  lrcData: LrcData | null
  currentLineIndex: number
  currentLine: LyricLine | null
  isLoading: boolean
  error: string | null
  loadLyrics: (content: string) => void
  loadFromUrl: (url: string) => Promise<void>
  getCurrentLine: (time: number) => LyricLine | null
  reset: () => void
}

export function useLyrics(options: UseLyricsOptions = {}): UseLyricsReturn {
  const { autoScroll = true } = options

  const [lrcData, setLrcData] = useState<LrcData | null>(null)
  const [currentLineIndex, setCurrentLineIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const highlightTimeRef = useRef(0)
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  // 监听时间变化
  useEffect(() => {
    if (lrcData && lrcData.lines.length > 0) {
      const index = getCurrentLineIndex(highlightTimeRef.current, lrcData.lines)
      if (index !== currentLineIndex) {
        setCurrentLineIndex(index)
      }
    }
  }, [highlightTimeRef.current, lrcData, currentLineIndex])

  // 更新高亮时间
  const updateHighlightTime = useCallback((time: number) => {
    highlightTimeRef.current = time
    if (lrcData && lrcData.lines.length > 0) {
      const index = getCurrentLineIndex(time, lrcData.lines)
      setCurrentLineIndex(index)
    }
  }, [lrcData])

  const loadLyrics = useCallback((content: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const parsed = parseLRC(content)
      setLrcData(parsed)
      setCurrentLineIndex(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析歌词失败')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadFromUrl = useCallback(async (url: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`加载歌词失败: ${response.status}`)
      }
      const content = await response.text()
      loadLyrics(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载歌词失败')
    } finally {
      setIsLoading(false)
    }
  }, [loadLyrics])

  const getCurrentLine = useCallback((time: number): LyricLine | null => {
    if (!lrcData || lrcData.lines.length === 0) return null
    const index = getCurrentLineIndex(time, lrcData.lines)
    return index >= 0 ? lrcData.lines[index] : null
  }, [lrcData])

  const reset = useCallback(() => {
    setLrcData(null)
    setCurrentLineIndex(-1)
    setError(null)
    setIsLoading(false)
  }, [])

  const currentLine = currentLineIndex >= 0 && lrcData
    ? lrcData.lines[currentLineIndex]
    : null

  return {
    lrcData,
    currentLineIndex,
    currentLine,
    isLoading,
    error,
    loadLyrics,
    loadFromUrl,
    getCurrentLine,
    reset,
  }
}
