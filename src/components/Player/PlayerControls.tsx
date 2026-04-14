import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface PlayerControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
}

export default function PlayerControls({
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
}: PlayerControlsProps) {
  return (
    <div className="player-controls flex items-center gap-2">
      <button
        onClick={onPrev}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="上一曲"
      >
        <SkipBack className="w-5 h-5" />
      </button>

      <button
        onClick={onPlayPause}
        className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all hover:scale-105"
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 text-white" />
        ) : (
          <Play className="w-5 h-5 text-white" />
        )}
      </button>

      <button
        onClick={onNext}
        className="p-2 text-gray-400 hover:text-white transition-colors"
        aria-label="下一曲"
      >
        <SkipForward className="w-5 h-5" />
      </button>
    </div>
  )
}
