import { useState, useEffect, useCallback } from 'react'
import { Music, FolderOpen, Heart, Play, Trash2, Search, RefreshCw, Loader2, HardDrive } from 'lucide-react'
import { useAuroraTheme } from '../../context/ThemeContext'
import type { LocalSong } from '../../types/library'

export default function FileSystemView() {
  const { theme } = useAuroraTheme()
  const [songs, setSongs] = useState<LocalSong[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [libraryPath, setLibraryPath] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [stats, setStats] = useState({ totalSongs: 0, totalArtists: 0, totalAlbums: 0 })

  const loadSongs = useCallback(async () => {
    setLoading(true)
    try {
      if (!window.api) { setSongs([]); setLoading(false); return }
      const res = await window.api.http.get('/api/v1/local-songs?page_size=500')
      const data = res?.data?.songs || res?.songs || []
      setSongs(data as LocalSong[])
    } catch (err) {
      console.warn('加载歌曲失败:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadStats = useCallback(async () => {
    if (!window.api?.library) return
    try {
      const res = await window.api.library.getLibraryStats()
      const data = res?.data
      if (data) {
        setStats({
          totalSongs: data.total_songs || 0,
          totalArtists: data.total_artists || 0,
          totalAlbums: data.total_albums || 0,
        })
      }
    } catch (err) {
      console.warn('加载统计失败:', err)
    }
  }, [])

  useEffect(() => {
    loadSongs()
    loadStats()
  }, [loadSongs, loadStats])

  const handleSelectFolder = async () => {
    if (!window.api?.library) {
      console.error('window.api.library 不可用，请确保 Electron 应用正在运行')
      return
    }
    try {
      const folder = await window.api.library.openFolder()
      if (!folder) return
      setLibraryPath(folder)
      await scanFolder(folder)
    } catch (err) {
      console.error('选择文件夹失败:', err)
    }
  }

  const scanFolder = async (folder: string) => {
    if (!window.api?.library) return
    setScanning(true)
    try {
      // 调用后端 API：扫描 + 元数据提取 + 导入，一条龙完成
      const res = await window.api.library.scanFolder(folder)
      if (res?.code === 0) {
        const data = res.data as { scanned?: number; imported?: number; songs?: LocalSong[] }
        console.log(`扫描完成：共 ${data.scanned} 首，导入了 ${data.imported} 首`)
      }
      // 重新加载歌曲列表（后端已导入，直接查库）
      await loadSongs()
      await loadStats()
    } catch (err) {
      console.error('扫描失败:', err)
    } finally {
      setScanning(false)
    }
  }

  const handleDelete = async (song: LocalSong) => {
    if (!window.api) return
    try {
      await window.api.http.delete(`/api/v1/local-songs/${song.id}`)
      await loadSongs()
      await loadStats()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleToggleFavorite = async (id: string) => {
    try {
      await window.api.http.post(`/api/v1/local-songs/${id}/favorite`)
      await loadSongs()
    } catch (err) {
      console.error('收藏失败:', err)
    }
  }

  const handlePlay = async (song: LocalSong) => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.ontimeupdate = null
      currentAudio.onended = null
    }
    if (!song.audio_path) return

    let audioSrc = song.audio_path.replace(/\\/g, '/')
    if (!audioSrc.startsWith('file://')) {
      audioSrc = `file:///${audioSrc}`
    }

    const audio = new Audio(audioSrc)
    setCurrentAudio(audio)
    setPlayingId(song.id)
    setIsPlaying(true)
    setCurrentTime(0)

    audio.ontimeupdate = () => setCurrentTime(audio.currentTime)
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.onended = () => {
      setIsPlaying(false)
      setPlayingId(null)
      setCurrentTime(0)
    }
    audio.onerror = () => {
      console.error('音频加载失败:', audioSrc)
      setIsPlaying(false)
      setPlayingId(null)
    }

    await audio.play().catch(err => {
      console.error('播放失败:', err)
      setIsPlaying(false)
      setPlayingId(null)
    })

    try {
      await window.api.http.post(`/api/v1/local-songs/${song.id}/play`)
    } catch {}
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (currentAudio) {
      const time = parseFloat(e.target.value)
      currentAudio.currentTime = time
      setCurrentTime(time)
    }
  }

  const handlePause = () => {
    if (currentAudio) {
      currentAudio.pause()
      setIsPlaying(false)
    }
  }

  const handleResume = () => {
    if (currentAudio) {
      currentAudio.play()
      setIsPlaying(true)
    }
  }

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause()
      currentAudio.ontimeupdate = null
      currentAudio.onended = null
      setCurrentAudio(null)
      setPlayingId(null)
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }
  }

  const filteredSongs = songs.filter((s) => {
    const q = searchQuery.toLowerCase()
    return !q || s.title?.toLowerCase().includes(q) || s.artist_name?.toLowerCase().includes(q)
  })

  const formatDuration = (sec: number) => {
    if (!sec) return '--:--'
    return `${Math.floor(sec / 60)}:${(sec % 60).toString().padStart(2, '0')}`
  }

  const renderPlayerBar = () => {
    if (!playingId) return null
    const song = songs.find(s => s.id === playingId)
    return (
      <div
        className="flex items-center gap-3 px-6 py-3"
        style={{ borderBottom: `1px solid ${theme.border.subtle}`, background: theme.chip.activeBg + '20' }}
      >
        <button
          onClick={isPlaying ? handlePause : handleResume}
          className="p-2 rounded-lg transition-colors"
          style={{ background: theme.chip.activeBg }}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill={theme.chip.activeText} viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <Play className="w-4 h-4" fill={theme.chip.activeText} style={{ color: theme.chip.activeText }} />
          )}
        </button>

        <span className="text-xs font-mono" style={{ color: theme.text.secondary }}>
          {formatDuration(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${theme.chip.activeText} ${(currentTime / (duration || 1)) * 100}%, ${theme.border.subtle} 0%)`
          }}
        />

        <span className="text-xs font-mono" style={{ color: theme.text.tertiary }}>
          {formatDuration(duration)}
        </span>

        {song && (
          <span className="text-xs truncate max-w-32" style={{ color: theme.text.body }}>
            {song.title}
          </span>
        )}

        <button
          onClick={handleStop}
          className="p-2 rounded-lg transition-colors"
          style={{ color: theme.text.tertiary }}
          title="停止"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {renderPlayerBar()}

      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${theme.border.subtle}` }}>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSelectFolder}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: theme.chip.activeBg, border: `1px solid ${theme.chip.activeBorder}`, color: theme.chip.activeText }}
          >
            <FolderOpen className="w-4 h-4" />
            {scanning ? '扫描中...' : '选择文件夹'}
          </button>
          {libraryPath && (
            <button
              onClick={() => scanFolder(libraryPath)}
              disabled={scanning}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all"
              style={{ background: theme.chip.inactiveBg, border: `1px solid ${theme.chip.inactiveBorder}`, color: theme.chip.inactiveText }}
            >
              <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
              重新扫描
            </button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: theme.text.tertiary }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索歌曲..."
            className="pl-9 pr-4 py-2 rounded-lg text-sm w-64"
            style={{ background: theme.chip.inactiveBg, border: `1px solid ${theme.chip.inactiveBorder}`, color: theme.text.body, outline: 'none' }}
          />
        </div>
      </div>

      {/* 统计信息 */}
      <div className="flex items-center gap-6 px-6 py-3" style={{ borderBottom: `1px solid ${theme.border.subtle}` }}>
        <span className="text-xs" style={{ color: theme.text.tertiary }}>共 <span style={{ color: theme.text.body }}>{stats.totalSongs}</span> 首歌曲</span>
        <span className="text-xs" style={{ color: theme.text.tertiary }}><span style={{ color: theme.text.body }}>{stats.totalArtists}</span> 位歌手</span>
        <span className="text-xs" style={{ color: theme.text.tertiary }}><span style={{ color: theme.text.body }}>{stats.totalAlbums}</span> 张专辑</span>
        <span className="text-xs ml-auto" style={{ color: theme.text.tertiary }}>存储方式：文件系统 + SQLite 索引</span>
      </div>

      {/* 扫描中状态 */}
      {scanning && (
        <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: `1px solid ${theme.border.subtle}`, background: theme.chip.activeBg }}>
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: theme.chip.activeText }} />
          <span className="text-xs" style={{ color: theme.chip.activeText }}>正在扫描文件夹，分析音频文件...</span>
        </div>
      )}

      {/* 库路径 */}
      {libraryPath && !scanning && (
        <div className="flex items-center gap-2 px-6 py-2 overflow-x-auto" style={{ borderBottom: `1px solid ${theme.border.subtle}` }}>
          <span className="text-xs flex-shrink-0" style={{ color: theme.text.tertiary }}>库路径：</span>
          <span className="text-xs" style={{ color: theme.text.secondary, fontFamily: 'monospace' }}>{libraryPath}</span>
        </div>
      )}

      {/* 歌曲列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-2">
        {!libraryPath ? (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: theme.text.tertiary }}>
            <HardDrive className="w-16 h-16 opacity-20" />
            <p className="text-sm">请先选择音乐文件夹，系统将自动扫描并导入音频文件</p>
            <button
              onClick={handleSelectFolder}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: theme.chip.activeBg, border: `1px solid ${theme.chip.activeBorder}`, color: theme.chip.activeText }}
            >
              <FolderOpen className="w-4 h-4" />
              选择文件夹
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full" style={{ color: theme.text.tertiary }}>
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: theme.text.tertiary }}>
            <Music className="w-16 h-16 opacity-20" />
            <p className="text-sm">
              {searchQuery ? '未找到匹配的歌曲' : '文件夹中未找到音频文件，请选择包含音乐文件的文件夹'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-3 px-4 py-3 rounded-lg group transition-all cursor-pointer"
                style={{
                  background: playingId === song.id ? theme.chip.activeBg : 'transparent',
                  border: `1px solid ${playingId === song.id ? theme.chip.activeBorder : 'transparent'}`,
                }}
                onMouseEnter={e => { if (playingId !== song.id) (e.currentTarget as HTMLElement).style.background = theme.chip.inactiveBg }}
                onMouseLeave={e => { if (playingId !== song.id) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
              >
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: theme.border.subtle }}>
                  <Music className="w-5 h-5" style={{ color: theme.text.tertiary }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: theme.text.heading }}>{song.title}</p>
                  <p className="text-xs truncate" style={{ color: theme.text.secondary }}>
                    {song.artist_name || '未知歌手'} · {song.album_name || '未知专辑'}
                  </p>
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: theme.text.tertiary }}>{formatDuration(song.duration)}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleFavorite(song.id)}
                    className="p-2 rounded-lg transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.chip.inactiveBg }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <Heart
                      className="w-4 h-4"
                      style={{ color: song.favorite ? 'rgba(239,68,68,0.7)' : theme.text.tertiary, fill: song.favorite ? 'rgba(239,68,68,0.3)' : 'none' }}
                    />
                  </button>
                  <button
                    onClick={() => handlePlay(song)}
                    className="p-2 rounded-lg transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.chip.inactiveBg }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <Play className="w-4 h-4" style={{ color: theme.text.body }} />
                  </button>
                  <button
                    onClick={() => handleDelete(song)}
                    className="p-2 rounded-lg transition-colors"
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: theme.text.tertiary }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
