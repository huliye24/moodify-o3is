import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ListMusic } from 'lucide-react'
import { useMusicStore } from '../stores/useMusicStore'
import { useAudioPlayer } from '../hooks/useAudioPlayer'

interface PlayerControlBarProps {
  onOpenPlaylist?: () => void
}

export default function PlayerControlBar({ onOpenPlaylist }: PlayerControlBarProps) {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playlist,
    play,
    pause,
    setVolume,
    toggleMute,
    setCurrentTrack
  } = useMusicStore()

  const { seek } = useAudioPlayer()
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const volumeRef = useRef<HTMLDivElement>(null)

  // 格式化时间
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 进度百分比
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  // 拖动进度条
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    seek(percentage * duration)
  }

  // 播放/暂停
  const togglePlay = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  // 上一曲/下一曲
  const handlePrevious = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id)
    if (currentIndex > 0) {
      setCurrentTrack(playlist[currentIndex - 1])
    }
  }

  const handleNext = () => {
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id)
    if (currentIndex < playlist.length - 1) {
      setCurrentTrack(playlist[currentIndex + 1])
    }
  }

  // 点击音量图标
  const handleVolumeClick = () => {
    toggleMute()
  }

  // 音量滑块变化
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value))
  }

  // 点击播放列表按钮
  const handlePlaylistClick = () => {
    onOpenPlaylist?.()
  }

  // 点击空白处关闭音量滑块
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (volumeRef.current && !volumeRef.current.contains(e.target as Node)) {
        setShowVolumeSlider(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 获取曲目标题（截断）
  const getDisplayTitle = () => {
    if (!currentTrack) return '未选择曲目'
    return currentTrack.title.length > 20
      ? currentTrack.title.substring(0, 20) + '...'
      : currentTrack.title
  }

  return (
    <div className="bg-dark-200 border-t border-gray-800 px-4 py-3">
      <div className="flex items-center gap-4">
        {/* 曲目信息 */}
        <div className="w-48 flex items-center gap-3">
          {currentTrack ? (
            <>
              {/* 封面 */}
              <div className="w-10 h-10 rounded bg-dark-300 flex-shrink-0 overflow-hidden">
                {currentTrack.cover_image_url ? (
                  <img
                    src={currentTrack.cover_image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    ♪
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{getDisplayTitle()}</p>
                <p className="text-xs text-gray-500 truncate">
                  {currentTrack.style || '未知风格'}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">未选择曲目</p>
          )}
        </div>

        {/* 播放控制 */}
        <div className="flex-1 flex flex-col items-center gap-1">
          {/* 控制按钮 */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={!currentTrack}
              className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="上一曲"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              disabled={!currentTrack?.audio_url}
              className="p-2 bg-primary-500 hover:bg-primary-400 rounded-full text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={!currentTrack}
              className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="下一曲"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* 进度条 */}
          <div className="w-full max-w-xl flex items-center gap-2">
            <span className="text-xs text-gray-500 w-10 text-right tabular-nums">
              {formatTime(currentTime)}
            </span>

            <div
              className="flex-1 h-1 bg-dark-300 rounded-full cursor-pointer group"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-primary-500 rounded-full relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
              </div>
            </div>

            <span className="text-xs text-gray-500 w-10 tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* 音量控制 */}
        <div className="w-32 flex items-center gap-2" ref={volumeRef}>
          <button
            onClick={handleVolumeClick}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title={isMuted ? '取消静音' : '静音'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              onMouseEnter={() => setShowVolumeSlider(true)}
              className="w-full h-1 bg-dark-300 rounded-full appearance-none cursor-pointer accent-primary-500"
              style={{
                background: `linear-gradient(to right, var(--primary-500) ${(isMuted ? 0 : volume) * 100}%, var(--dark-300) ${(isMuted ? 0 : volume) * 100}%)`
              }}
            />
          </div>

          <button
            onClick={handlePlaylistClick}
            className="p-1.5 text-gray-400 hover:text-white transition-colors"
            title="播放列表"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
