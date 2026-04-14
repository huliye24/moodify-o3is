// 波形可视化画布组件

import React, { useEffect, useRef } from 'react'
import { useWaveform } from '../hooks/useWaveform'

interface WaveformCanvasProps {
  width?: number
  height?: number
  barWidth?: number
  barGap?: number
  minBarHeight?: number
  color?: string
  isPlaying?: boolean
  className?: string
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({
  width = 800,
  height = 80,
  barWidth = 3,
  barGap = 2,
  minBarHeight = 2,
  color = '#6366f1',
  isPlaying = false,
  className = '',
}) => {
  const { canvasRef, startVisualization, stopVisualization } = useWaveform({
    width,
    height,
    barWidth,
    barGap,
    minBarHeight,
  })

  useEffect(() => {
    if (isPlaying) {
      startVisualization()
    } else {
      stopVisualization()
    }
  }, [isPlaying, startVisualization, stopVisualization])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`waveform-canvas ${className}`}
      style={{
        display: 'block',
        borderRadius: '4px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
      }}
    />
  )
}

// 简化版波形条组件
interface WaveformBarsProps {
  progress?: number
  duration?: number
  onSeek?: (percent: number) => void
  height?: number
  color?: string
  className?: string
}

export const WaveformBars: React.FC<WaveformBarsProps> = ({
  progress = 0,
  duration = 0,
  onSeek,
  height = 60,
  color = '#6366f1',
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [bars, setBars] = React.useState<number[]>([])

  // 生成随机波形数据
  useEffect(() => {
    const barCount = 100
    const newBars: number[] = []
    for (let i = 0; i < barCount; i++) {
      // 使用正弦波 + 随机噪声生成更自然的波形
      const baseHeight = Math.sin((i / barCount) * Math.PI) * 0.5 + 0.3
      const noise = Math.random() * 0.3
      newBars.push(Math.min(1, Math.max(0.1, baseHeight + noise)))
    }
    setBars(newBars)
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !onSeek) return

    const rect = containerRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    onSeek(Math.max(0, Math.min(1, percent)))
  }

  const progressPercent = duration > 0 ? progress / duration : 0

  return (
    <div
      ref={containerRef}
      className={`waveform-bars ${className}`}
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        height: `${height}px`,
        cursor: onSeek ? 'pointer' : 'default',
        padding: '4px 0',
      }}
    >
      {bars.map((bar, index) => {
        const barPercent = index / bars.length
        const isPlayed = barPercent <= progressPercent

        return (
          <div
            key={index}
            style={{
              flex: 1,
              height: `${bar * 100}%`,
              background: isPlayed
                ? `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`
                : '#3f3f5a',
              borderRadius: '2px',
              transition: 'background 0.1s ease',
              minWidth: '3px',
              maxWidth: '6px',
            }}
          />
        )
      })}
    </div>
  )
}

export default WaveformCanvas
