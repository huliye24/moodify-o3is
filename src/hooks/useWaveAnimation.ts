import { useEffect, useRef } from 'react'

export default function useWaveAnimation(canvasRef: React.RefObject<HTMLCanvasElement>, isActive: boolean) {
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.strokeStyle = 'rgba(168, 184, 201, 0.5)'
        ctx.lineWidth = 2

        for (let x = 0; x < canvas.width; x++) {
          const y = canvas.height / 2 +
            Math.sin((x * 0.02) + phase + (i * 0.6)) * (8 + i * 2)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }

        ctx.stroke()
      }

      if (isActive) {
        phase += 0.04
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive])
}
