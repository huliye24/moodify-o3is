import { useEffect, useRef } from 'react'

interface WaveCanvasProps {
  moodColor: string
  isPlaying: boolean
}

export default function WaveCanvas({ moodColor, isPlaying }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw 5 layered sine waves
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.strokeStyle = moodColor
        ctx.globalAlpha = 0.2 + i * 0.15
        ctx.lineWidth = 1.5

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 +
            Math.sin((x * 0.02) + phase + (i * 0.6)) * (6 + i * 2)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.stroke()
      }

      phase += isPlaying ? 0.04 : 0
      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [moodColor, isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={40}
      className="w-full h-full"
    />
  )
}
