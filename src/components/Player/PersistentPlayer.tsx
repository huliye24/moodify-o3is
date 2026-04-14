import { useRef, useEffect, useState } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Heart,
} from 'lucide-react'
import { MOOD_TRACKS } from '../../stores/useMoodStore'
import { useMoodStore } from '../../stores/useMoodStore'

interface PersistentPlayerProps {
  mode?: 'fullscreen' | 'minimal'
}

export default function PersistentPlayer({ mode = 'minimal' }: PersistentPlayerProps) {
  const [activeNav, setActiveNav] = useState('home')

  const audioRef = useRef<HTMLAudioElement>(null)

  const {
    currentIndex,
    isPlaying,
    volume,
    isMuted,
    isLooping,
    currentTime,
    duration,
    setAudio,
    togglePlay,
    setVolume,
    toggleMute,
    toggleLoop,
    skipNext,
    skipPrev,
    seek,
    setCurrentTime,
    setDuration,
    loadTrack,
  } = useMoodStore()

  const currentTrack = MOOD_TRACKS[currentIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      setAudio(audio)
    }
  }, [setAudio])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime)
    const handleLoadedMetadata = () => setDuration(audio.duration)
    const handleEnded = () => {
      if (isLooping) {
        audio.currentTime = 0
        audio.play().catch(() => {})
      } else {
        skipNext()
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [isLooping, skipNext, setCurrentTime, setDuration])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 45

  if (mode === 'fullscreen') {
    return (
      <div
        className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FAD0C4 100%)`,
        }}
      >
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, #FF6B6B, transparent)',
              top: '10%',
              left: '10%',
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-80 h-80 rounded-full opacity-25 blur-3xl animate-pulse"
            style={{
              background: 'radial-gradient(circle, #4ECDC4, transparent)',
              bottom: '20%',
              right: '15%',
              animation: 'float 10s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Glassmorphism Container */}
        <div className="w-[1100px] h-[720px] bg-white/20 backdrop-blur-[40px] border border-white/40 rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.15)] overflow-hidden relative flex flex-col">

          {/* Top Section */}
          <div className="flex-1 flex min-h-0">

            {/* Left Sidebar */}
            <aside className="w-60 flex-shrink-0 bg-white/10 border-r border-white/20 p-8 flex flex-col h-full">
              <h2 className="text-xl font-bold text-gray-800 mb-10">M Moodify</h2>

              {/* Navigation */}
              <nav className="space-y-4">
                <div
                  className={`cursor-pointer transition-all duration-300 ${
                    activeNav === 'home' ? 'text-pink-600 font-bold' : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveNav('home')}
                >
                  🏠 Moodify
                </div>
                <div
                  className={`cursor-pointer transition-all duration-300 ${
                    activeNav === 'category' ? 'text-pink-600 font-bold' : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveNav('category')}
                >
                  ☰ Category
                </div>
                <div
                  className={`cursor-pointer transition-all duration-300 ${
                    activeNav === 'library' ? 'text-pink-600 font-bold' : 'text-gray-600 hover:text-gray-800'
                  }`}
                  onClick={() => setActiveNav('library')}
                >
                  ☆ Library
                </div>
              </nav>

              {/* Mood Sphere */}
              <div className="flex-1 flex items-center justify-center">
                <div
                  className="w-28 h-28 rounded-full cursor-pointer transition-all duration-500 hover:scale-110 shadow-xl"
                  style={{
                    background: currentTrack.gradient,
                    boxShadow: `0 0 50px ${currentTrack.color}66`,
                  }}
                />
              </div>

              {/* Color Palette */}
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#FF6B6B] to-[#FFE66D] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md" />
                <div className="w-8 h-8 bg-gradient-to-br from-[#4ECDC4] to-[#44B8A4] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md" />
                <div className="w-8 h-8 bg-gradient-to-br from-[#A8E6CF] to-[#88D8B0] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md" />
                <div className="w-8 h-8 bg-gradient-to-br from-[#FFB6C1] to-[#FF69B4] rounded-full cursor-pointer hover:scale-110 transition-transform shadow-md" />
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8 bg-white/5">
              <div className="text-xl tracking-wider mb-6 text-gray-800 font-semibold">Sweet Tracks</div>

              <div className="grid grid-cols-4 gap-4">
                {MOOD_TRACKS.map((track, index) => (
                  <div
                    key={track.mood}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border border-white/20 bg-white/20"
                    onClick={() => {
                      loadTrack(index)
                    }}
                  >
                    <img
                      src={track.cover}
                      alt={track.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </main>

            {/* Right Detail Panel */}
            <aside className="w-60 flex-shrink-0 bg-white/10 border-l border-white/20 p-8 flex flex-col">
              {/* Album Cover */}
              <div
                className="w-full aspect-square rounded-2xl mb-5 overflow-hidden shadow-xl"
                style={{
                  background: currentTrack.gradient,
                }}
              >
                <img
                  src={currentTrack.cover}
                  alt={currentTrack.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-base text-gray-800 font-semibold mb-1">Now Playing</div>
              <div className="text-sm text-gray-600">{currentTrack.artist}</div>
              <div className="text-sm text-gray-500 -mt-1 mb-6">{currentTrack.name}</div>

              {/* Liked Items */}
              <div className="mt-auto">
                <div className="text-sm mb-4 text-gray-700 font-medium">Liked Items</div>
                <div className="space-y-2">
                  {MOOD_TRACKS.slice(0, 3).map((track, index) => (
                    <div
                      key={track.mood}
                      className={`text-sm transition-all duration-300 flex items-center gap-2 ${
                        index === currentIndex ? 'text-pink-600 font-semibold' : 'text-gray-600'
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full shadow-sm"
                        style={{ backgroundColor: track.color }}
                      />
                      <span className="truncate">{track.artist}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          {/* Bottom Controls */}
          <footer className="h-20 bg-white/30 border-t border-white/40 flex items-center justify-center gap-12 backdrop-blur-md relative flex-shrink-0">
            {/* Play Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={skipPrev}
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-110"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-110 shadow-lg text-white"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-0.5" />
                )}
              </button>

              <button
                onClick={skipNext}
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-110"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Extra Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMute}
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-110"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleLoop}
                className={`transition-all duration-300 hover:scale-110 ${
                  isLooping ? 'text-pink-600' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Repeat className="w-5 h-5" />
              </button>

              <button
                className="text-gray-700 hover:text-gray-900 transition-all duration-300 hover:scale-110"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/30">
              <div
                className="h-full"
                style={{
                  width: `${progress}%`,
                  background: currentTrack.gradient,
                  boxShadow: `0 0 15px ${currentTrack.color}`,
                }}
              />
            </div>
          </footer>
        </div>

        <audio ref={audioRef} />
      </div>
    )
  }

  // Minimal Mode - Bottom Bar
  return (
    <div
      className="persistent-player fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-white/50 transition-all duration-500 shadow-lg"
    >
      <audio ref={audioRef} />

      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
        {/* Track Info with Cover */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="track-cover w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden shadow-md"
            style={{
              background: currentTrack.gradient,
            }}
          >
            <img
              src={currentTrack.cover}
              alt={currentTrack.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="truncate">
            <div className="text-sm text-gray-800 truncate font-medium">{currentTrack.name}</div>
            <div className="text-xs text-gray-500 truncate">{currentTrack.artist}</div>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-700 transition-all duration-300 hover:scale-110">
            <Heart className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={skipPrev}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-gray-800 transition-all duration-300 hover:scale-110"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-105 shadow-lg text-white"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          <button
            onClick={skipNext}
            className="p-2 text-gray-500 hover:text-gray-800 transition-all duration-300 hover:scale-110"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center gap-3">
          <span className="text-xs text-gray-500 w-12 text-right font-mono">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative group">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: currentTrack.gradient,
                  boxShadow: `0 0 10px ${currentTrack.color}66`,
                }}
              />
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                seek(Number(e.target.value))
              }}
              className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs text-gray-500 w-12 font-mono">
            {formatTime(duration)}
          </span>
        </div>

        {/* Extras */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleMute}
            className="p-2 text-gray-500 hover:text-gray-800 transition-all duration-300 hover:scale-110"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleLoop}
            className={`p-2 transition-all duration-300 hover:scale-110 ${
              isLooping ? 'text-pink-600' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Progress Bar */}
      <div className="md:hidden px-6 pb-2">
        <div className="relative">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              seek(Number(e.target.value))
            }}
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-pink-500"
          />
        </div>
      </div>
    </div>
  )
}
