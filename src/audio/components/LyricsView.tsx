// 歌词显示视图组件

import React, { useRef, useEffect, useMemo } from 'react'
import { LrcData, LyricLine, formatTime } from '../utils/LrcParser'

interface LyricsViewProps {
  lrcData: LrcData | null
  currentLineIndex: number
  currentTime: number
  onLineClick?: (time: number) => void
  autoScroll?: boolean
  className?: string
}

export const LyricsView: React.FC<LyricsViewProps> = ({
  lrcData,
  currentLineIndex,
  currentTime,
  onLineClick,
  autoScroll = true,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const lineRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // 自动滚动到当前行
  useEffect(() => {
    if (!autoScroll || currentLineIndex < 0) return

    const currentLineEl = lineRefs.current.get(currentLineIndex)
    const container = containerRef.current

    if (currentLineEl && container) {
      const containerRect = container.getBoundingClientRect()
      const lineRect = currentLineEl.getBoundingClientRect()
      const scrollTop =
        currentLineEl.offsetTop - container.offsetHeight / 2 + lineRect.height / 2

      container.scrollTo({
        top: scrollTop,
        behavior: 'smooth',
      })
    }
  }, [currentLineIndex, autoScroll])

  if (!lrcData || lrcData.lines.length === 0) {
    return (
      <div
        className={`lyrics-view-empty ${className}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#6b7280',
          fontSize: '14px',
        }}
      >
        暂无歌词
      </div>
    )
  }

  const handleLineClick = (line: LyricLine) => {
    onLineClick?.(line.time)
  }

  return (
    <div
      ref={containerRef}
      className={`lyrics-view ${className}`}
      style={{
        height: '100%',
        overflowY: 'auto',
        padding: '20px 0',
        scrollBehavior: 'smooth',
      }}
    >
      <div style={{ padding: '0 24px' }}>
        {lrcData.lines.map((line, index) => {
          const isActive = index === currentLineIndex
          const isPast = index < currentLineIndex

          return (
            <div
              key={`${line.time}-${index}`}
              ref={(el) => {
                if (el) lineRefs.current.set(index, el)
              }}
              onClick={() => handleLineClick(line)}
              style={{
                padding: '12px 16px',
                margin: '4px 0',
                borderRadius: '8px',
                cursor: onLineClick ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)'
                  : 'transparent',
              }}
            >
              {/* 主歌词 */}
              <div
                style={{
                  color: isActive ? '#fff' : isPast ? '#6b7280' : '#9ca3af',
                  fontSize: isActive ? '18px' : '15px',
                  fontWeight: isActive ? 600 : 400,
                  lineHeight: 1.6,
                  textAlign: 'center',
                  textShadow: isActive
                    ? '0 0 20px rgba(99, 102, 241, 0.5)'
                    : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {line.text}
              </div>

              {/* 翻译歌词 */}
              {line.translation && (
                <div
                  style={{
                    color: isActive ? '#a5b4fc' : '#4b5563',
                    fontSize: isActive ? '14px' : '12px',
                    textAlign: 'center',
                    marginTop: '4px',
                  }}
                >
                  {line.translation}
                </div>
              )}

              {/* 时间标签（调试用，可隐藏） */}
              <div
                style={{
                  color: '#374151',
                  fontSize: '10px',
                  textAlign: 'center',
                  marginTop: '2px',
                }}
              >
                {formatTime(line.time)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 简化版歌词行组件（用于迷你播放器）
interface LyricLineSimpleProps {
  line: LyricLine | null
  isPlaying?: boolean
}

export const LyricLineSimple: React.FC<LyricLineSimpleProps> = ({
  line,
  isPlaying = false,
}) => {
  if (!line) {
    return (
      <div
        style={{
          color: '#6b7280',
          fontSize: '14px',
          textAlign: 'center',
          padding: '8px',
        }}
      >
        ♪ ♫ ♪
      </div>
    )
  }

  return (
    <div
      style={{
        color: '#fff',
        fontSize: '14px',
        textAlign: 'center',
        padding: '8px',
        animation: isPlaying ? 'lyricsPulse 2s ease-in-out infinite' : 'none',
        textShadow: isPlaying ? '0 0 10px rgba(99, 102, 241, 0.5)' : 'none',
      }}
    >
      {line.text}
    </div>
  )
}

export default LyricsView
