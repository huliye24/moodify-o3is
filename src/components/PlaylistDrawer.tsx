import { X, Play, Pause, Trash2, Music } from 'lucide-react'
import { useMusicStore } from '../stores/useMusicStore'

interface PlaylistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function PlaylistDrawer({ isOpen, onClose }: PlaylistDrawerProps) {
  const {
    playlist,
    currentTrack,
    isPlaying,
    setCurrentTrack,
    removeFromPlaylist,
    play,
    pause
  } = useMusicStore()

  const togglePlay = (track: typeof currentTrack, e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentTrack?.id === track?.id) {
      if (isPlaying) {
        pause()
      } else {
        play()
      }
    } else {
      setCurrentTrack(track)
      play()
    }
  }

  const handleSelectTrack = (track: typeof currentTrack) => {
    setCurrentTrack(track)
    play()
  }

  const handleDelete = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFromPlaylist(trackId)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-80 bg-dark-300 border-l border-gray-700 z-50 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
          <h2 className="font-semibold flex items-center gap-2">
            <Music className="w-5 h-5 text-primary-400" />
            播放列表
            <span className="text-sm text-gray-400 font-normal">({playlist.length})</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Music className="w-12 h-12 mb-3 opacity-50" />
              <p>播放列表为空</p>
              <p className="text-sm mt-1">生成音乐后将显示在这里</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handleSelectTrack(track)}
                  className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    currentTrack?.id === track.id
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'hover:bg-dark-200 border border-transparent'
                  }`}
                >
                  <div className="w-6 text-center">
                    {currentTrack?.id === track.id && isPlaying ? (
                      <span className="text-primary-400 animate-pulse">▶</span>
                    ) : (
                      <span className="text-xs text-gray-500">{index + 1}</span>
                    )}
                  </div>

                  <div className="w-10 h-10 rounded bg-dark-400 flex-shrink-0 overflow-hidden">
                    {track.cover_image_url ? (
                      <img src={track.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <Music className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${currentTrack?.id === track.id ? 'text-primary-400' : ''}`}>
                      {track.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{track.style || '未知风格'}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => togglePlay(track, e)}
                      className="p-1.5 hover:bg-dark-300 rounded transition-colors"
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(track.id, e)}
                      className="p-1.5 hover:bg-red-600/20 rounded transition-colors text-gray-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {playlist.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-700 text-xs text-gray-500">
            共 {playlist.length} 首曲目
          </div>
        )}
      </div>
    </>
  )
}
