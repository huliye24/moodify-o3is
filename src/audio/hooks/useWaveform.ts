// 波形可视化 Hook

import { useEffect, useRef, useState, useCallback } from 'react'

export interface UseWaveformOptions {
  width?: number
  height?: number
  barWidth?: number
  barGap?: number
  minBarHeight?: number
  smoothing?: number
}

export interface UseWaveformReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  startVisualization: () => void
  stopVisualization: () => void
  isActive: boolean
  analyserData: Uint8Array
}

export function useWaveform(options: UseWaveformOptions = {}): UseWaveformReturn {
  const {
    width = 800,
    height = 100,
    barWidth = 3,
    barGap = 2,
    minBarHeight = 2,
  } = options

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [analyserData, setAnalyserData] = useState<Uint8Array>(new Uint8Array(0))

  const getAnalyserData = useCallback((): Uint8Array => {
    // 从 audioEngine 获取分析数据
    if (typeof window !== 'undefined' && (window as any).audioEngine) {
      const engine = (window as any).audioEngine as any
      if (engine.getFrequencyData) {
        return engine.getFrequencyData()
      }
    }
    return new Uint8Array(0)
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dataArray = getAnalyserData()
    if (dataArray.length === 0) {
      // 绘制静态波形
      ctx.fillStyle = '#1a1a2e'
      ctx.fillRect(0, 0, width, height)

      // 绘制静态波形条
      const barCount = Math.floor(width / (barWidth + barGap))
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.6 + minBarHeight
        const x = i * (barWidth + barGap)
        const y = (height - barHeight) / 2

        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
        gradient.addColorStop(0, '#6366f1')
        gradient.addColorStop(1, '#8b5cf6')
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, barHeight)
      }
      return
    }

    // 清除画布
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)

    // 计算条形数量
    const barCount = Math.min(dataArray.length, Math.floor(width / (barWidth + barGap)))

    // 绘制频谱条
    for (let i = 0; i < barCount; i++) {
      const dataIndex = Math.floor((i / barCount) * dataArray.length)
      const value = dataArray[dataIndex] / 255
      const barHeight = Math.max(value * height * 0.9, minBarHeight)
      const x = i * (barWidth + barGap)
      const y = (height - barHeight) / 2

      // 渐变颜色
      const hue = 240 + (i / barCount) * 60
      const gradient = ctx.createLinearGradient(x, y, x, y + barHeight)
      gradient.addColorStop(0, `hsla(${hue}, 80%, 65%, 1)`)
      gradient.addColorStop(1, `hsla(${hue}, 80%, 45%, 1)`)

      ctx.fillStyle = gradient
      ctx.fillRect(x, y, barWidth, barHeight)

      // 顶部高光
      ctx.fillStyle = `hsla(${hue}, 80%, 80%, 0.5)`
      ctx.fillRect(x, y, barWidth, 2)
    }

    setAnalyserData(dataArray)
  }, [width, height, barWidth, barGap, minBarHeight, getAnalyserData])

  const startVisualization = useCallback(() => {
    if (isActive) return

    setIsActive(true)

    const animate = () => {
      draw()
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()
  }, [isActive, draw])

  const stopVisualization = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    setIsActive(false)

    // 绘制静态波形
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#1a1a2e'
        ctx.fillRect(0, 0, width, height)
      }
    }
  }, [width, height])

  useEffect(() => {
    // 初始绘制
    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [draw])

  return {
    canvasRef,
    startVisualization,
    stopVisualization,
    isActive,
    analyserData,
  }
}
