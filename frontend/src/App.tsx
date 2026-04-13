import { useState, useEffect } from 'react'
import { Sparkles, Settings, History, Music, BookOpen, Library, FolderOpen, Heart, Play, RefreshCw, Search } from 'lucide-react'
import { useProjects, useO3ics, useOptions } from '@/hooks'
import { useStore } from '@/store'
import type { GenerateParams, GenerateResponse, O3ics } from '@/types'
import {
  ProjectSelector,
  ParamsSelector,
  LyricsEditor,
  O3icsList,
  RulesModal,
  RulesSection,
  SunoPrompts,
  DiceResultCard,
} from '@/components'

// 多 Tab 类型
type TabId = 'o3ics' | 'mood' | 'library' | 'brand'

const TABS = [
  { id: 'o3ics' as TabId, label: '歌词创作', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'mood' as TabId, label: '情绪播放', icon: <Music className="w-4 h-4" /> },
  { id: 'library' as TabId, label: '本地乐库', icon: <Library className="w-4 h-4" /> },
  { id: 'brand' as TabId, label: '品牌故事', icon: <BookOpen className="w-4 h-4" /> },
]

// 情绪播放数据（从 src/stores/useMoodStore.ts 同步）
const MOOD_TRACKS = [
  {
    name: '蜷缩 · 深蓝呼吸',
    artist: 'Moodify',
    mood: 'coil',
    color: '#6B7A8F',
    description: '紧 · 沉 · 冷',
    tags: ['无力', '崩溃边缘', '什么都不想做'],
    url: 'https://cdn.pixabay.com/download/audio/2022/01/20/audio_4bc6a09939.mp3'
  },
  {
    name: '迷茫 · 灰雾飘散',
    artist: 'Moodify',
    mood: 'lost',
    color: '#7A8A9F',
    description: '不确定 · 悬浮',
    tags: ['不知道方向', '停在原地', '想走但不知道往哪'],
    url: 'https://cdn.pixabay.com/download/audio/2022/03/24/audio_77ef6de6e5.mp3'
  },
  {
    name: '觉醒 · 透光微暖',
    artist: 'Moodify',
    mood: 'awaken',
    color: '#A8B8C9',
    description: '看见了什么',
    tags: ['某句话击中了你', '突然明白了什么', '光透进来了'],
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3'
  },
  {
    name: '舒展 · 透明呼吸',
    artist: 'Moodify',
    mood: 'expand',
    color: '#C4D4E4',
    description: '打开 · 呼吸',
    tags: ['微光', '可以呼吸了', '什么都不用做'],
    url: 'https://cdn.pixabay.com/download/audio/2021/08/09/audio_dc39bce8b3.mp3'
  }
]

const defaultParams: GenerateParams = {
  emotion: '悲伤',
  theme: '爱情',
  style: '流行',
  rhyme: 'AABB',
  length: '中等(24句)',
}

// ===== 歌词创作页面（保持原样）=====
function LyricsPage() {
  const options = useOptions()
  const { projects, createProject, deleteProject } = useProjects()
  const { o3icsList, generateO3ics, deleteO3ics, toggleFavorite, loadO3ics } = useO3ics()
  const { currentProject, setCurrentProject } = useStore()

  const [content, setContent] = useState('')
  const [params, setParams] = useState<GenerateParams>(defaultParams)
  const [useRules, setUseRules] = useState(false)
  const [useDice, setUseDice] = useState(false)
  const [selectedRules, setSelectedRules] = useState<string[]>([])
  const [result, setResult] = useState<GenerateResponse | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showRulesModal, setShowRulesModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [selectedO3ics, setSelectedO3ics] = useState<O3ics | null>(null)

  const handleGenerate = async () => {
    if (!content.trim()) return
    setIsGenerating(true)
    try {
      const response = await generateO3ics({
        content,
        project_id: currentProject?.id,
        params,
        use_rules: useRules,
        use_dice: useDice,
      })
      setResult(response)
      await loadO3ics()
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectProject = (project: any) => {
    setCurrentProject(project)
    setShowHistory(false)
  }

  const handleSelectO3ics = (o3ics: O3ics) => {
    setSelectedO3ics(o3ics)
    setShowHistory(false)
  }

  const handleToggleRule = (type: string) => {
    setSelectedRules(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  if (!options) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-lg">加载中...</div>
      </div>
    )
  }

  // 歌词创作页面 - 使用亮蓝色配色
  const MOODIFY_COLOR = 'rgba(14,165,233'
  const moodifyStyle = {
    bg: `${MOODIFY_COLOR},0.08)`,
    bgHover: `${MOODIFY_COLOR},0.12)`,
    border: `${MOODIFY_COLOR},0.12)`,
    borderLight: `${MOODIFY_COLOR},0.20)`,
    borderActive: `${MOODIFY_COLOR},0.35)`,
    text: 'rgba(255,255,255,0.90)',
    textSecondary: 'rgba(255,255,255,0.60)',
    textMuted: 'rgba(255,255,255,0.40)',
    primary: `${MOODIFY_COLOR},0.85)`,
    primaryHover: `${MOODIFY_COLOR},1)`,
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: moodifyStyle.text }}>Moodify</h1>
            <p style={{ color: moodifyStyle.textSecondary }}>AI 歌词生成器</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              style={{
                background: 'rgba(14,165,233,0.12)',
                border: '1px solid rgba(14,165,233,0.20)',
              }}
              className="p-2 rounded-lg transition-colors hover:bg-white/20"
            >
              <History className="w-5 h-5" style={{ color: 'rgba(14,165,233,0.85)' }} />
            </button>
            <button
              onClick={() => setShowRulesModal(true)}
              style={{
                background: 'rgba(14,165,233,0.12)',
                border: '1px solid rgba(14,165,233,0.20)',
              }}
              className="p-2 rounded-lg transition-colors hover:bg-white/20"
            >
              <Settings className="w-5 h-5" style={{ color: 'rgba(14,165,233,0.85)' }} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div
              style={{
                background: 'rgba(14,165,233,0.08)',
                border: '1px solid rgba(14,165,233,0.12)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
              }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: moodifyStyle.text }}>创作方向</h2>
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <ProjectSelector
                    projects={projects}
                    currentProject={currentProject}
                    onSelect={handleSelectProject}
                    onCreate={createProject}
                    onDelete={deleteProject}
                  />
                </div>
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  style={{
                    background: 'rgba(14,165,233,0.12)',
                    border: '1px solid rgba(14,165,233,0.20)',
                    color: 'rgba(14,165,233,0.85)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                  className="transition-colors hover:bg-white/10"
                >
                  {showOptions ? '收起' : '展开'}选项
                </button>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="输入你的创作想法... 例如：今天看到久违的阳光，想起那些温暖的时光"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '0.75rem',
                  background: 'rgba(14,165,233,0.08)',
                  border: '1px solid rgba(14,165,233,0.12)',
                  borderRadius: '0.5rem',
                  color: 'rgba(255,255,255,0.90)',
                  resize: 'none',
                  outline: 'none',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                }}
                className="focus:border-white/30 transition-colors"
              />

              {showOptions && (
                <div className="mb-4">
                  <ParamsSelector options={options} params={params} onChange={setParams} />
                </div>
              )}

              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useRules}
                    onChange={(e) => setUseRules(e.target.checked)}
                    style={{ accentColor: 'rgba(14,165,233,0.85)' }}
                  />
                  <span className="text-sm" style={{ color: moodifyStyle.textSecondary }}>启用规则引擎</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useDice}
                    onChange={(e) => setUseDice(e.target.checked)}
                    style={{ accentColor: 'rgba(14,165,233,0.85)' }}
                  />
                  <span className="text-sm" style={{ color: moodifyStyle.textSecondary }}>摇色子</span>
                </label>
              </div>

              {useRules && <RulesSection selectedRules={selectedRules} onToggle={handleToggleRule} />}

              <button
                onClick={handleGenerate}
                disabled={!content.trim() || isGenerating}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.85) 0%, rgba(14,165,233,0.70) 100%)',
                  border: '1px solid rgba(14,165,233,0.30)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontWeight: '500',
                  cursor: (!content.trim() || isGenerating) ? 'not-allowed' : 'pointer',
                  opacity: (!content.trim() || isGenerating) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
                className="transition-opacity hover:opacity-90"
              >
                <Sparkles className="w-5 h-5" />
                {isGenerating ? '生成中...' : '生成歌词'}
              </button>
            </div>

            {result && (
              <div className="space-y-4">
                <LyricsEditor content={result.o3ics} onChange={() => {}} />
                <SunoPrompts prompts={result.suno_prompts} />
                <DiceResultCard result={result.dice_result} />
              </div>
            )}

            {selectedO3ics && !result && (
              <LyricsEditor content={selectedO3ics.content} onChange={() => {}} />
            )}
          </div>

          <div className="space-y-4">
            <O3icsList
              items={o3icsList}
              onSelect={handleSelectO3ics}
              onDelete={deleteO3ics}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        </div>
      </div>

      <RulesModal isOpen={showRulesModal} onClose={() => setShowRulesModal(false)} />
    </div>
  )
}

// ===== 情绪播放页面 =====
function MoodPage() {
  const [currentTrack, setCurrentTrack] = useState<typeof MOOD_TRACKS[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)

  useEffect(() => {
    const a = new Audio()
    a.volume = volume
    a.addEventListener('timeupdate', () => setCurrentTime(a.currentTime))
    a.addEventListener('loadedmetadata', () => setDuration(a.duration))
    a.addEventListener('ended', () => setIsPlaying(false))
    setAudio(a)
    return () => { a.pause(); a.src = '' }
  }, [])

  const playTrack = (track: typeof MOOD_TRACKS[0]) => {
    if (!audio) return
    if (currentTrack?.mood === track.mood && isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.src = track.url
      audio.play().catch(() => {})
      setCurrentTrack(track)
      setIsPlaying(true)
    }
  }

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <div className="max-w-4xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-wider">Moodify</h1>
          <p className="text-white/50 text-lg">情绪的潮汐，终将抵达彼岸</p>
        </div>

        {/* 情绪卡片 */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          {MOOD_TRACKS.map((track) => (
            <div
              key={track.mood}
              onClick={() => playTrack(track)}
              className="cursor-pointer group rounded-2xl p-6 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: currentTrack?.mood === track.mood
                  ? `linear-gradient(135deg, ${track.color}25 0%, ${track.color}10 100%)`
                  : `linear-gradient(135deg, ${track.color}12 0%, rgba(10,10,15,0.98) 60%)`,
                border: currentTrack?.mood === track.mood
                  ? `1px solid ${track.color}50`
                  : `1px solid ${track.color}20`,
                boxShadow: currentTrack?.mood === track.mood
                  ? `0 12px 48px ${track.color}15`
                  : `0 4px 20px rgba(0,0,0,0.4)`
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center transition-all"
                  style={{ background: `${track.color}20` }}
                >
                  {currentTrack?.mood === track.mood && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 h-2 rounded-full animate-bounce" style={{ background: track.color, animationDelay: '0ms' }} />
                      <div className="w-0.5 h-3 rounded-full animate-bounce" style={{ background: track.color, animationDelay: '150ms' }} />
                      <div className="w-0.5 h-1.5 rounded-full animate-bounce" style={{ background: track.color, animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" style={{ color: track.color }} fill={`${track.color}50`} />
                  )}
                </div>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${track.color}15`, color: track.color, border: `1px solid ${track.color}25` }}
                >
                  {track.mood.toUpperCase()}
                </span>
              </div>

              <h3 className="text-base font-medium text-white/90 mb-1">{track.name}</h3>
              <p className="text-xs text-white/40 mb-3">{track.artist}</p>

              <div className="flex flex-wrap gap-1">
                {track.tags?.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ background: `${track.color}10`, color: `${track.color}70`, border: `1px solid ${track.color}18` }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 播放器控制条 */}
        {currentTrack && (
          <div
            className="fixed bottom-0 left-0 right-0 p-4 backdrop-blur-xl border-t border-white/10"
            style={{ background: 'rgba(10,10,15,0.95)' }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                {/* 封面 */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${currentTrack.color}20` }}
                >
                  <Music className="w-6 h-6" style={{ color: currentTrack.color }} />
                </div>

                {/* 信息 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{currentTrack.name}</p>
                  <p className="text-xs text-white/40">{currentTrack.artist}</p>
                </div>

                {/* 控制按钮 */}
                <button
                  onClick={() => {
                    if (!audio) return
                    if (isPlaying) { audio.pause(); setIsPlaying(false) }
                    else { audio.play().catch(() => {}); setIsPlaying(true) }
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                  style={{ background: `${currentTrack.color}20` }}
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill={currentTrack.color}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                  ) : (
                    <Play className="w-5 h-5 ml-0.5" style={{ color: currentTrack.color }} fill={currentTrack.color} />
                  )}
                </button>

                {/* 进度条 */}
                <div className="flex-1 hidden md:block">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/40 w-10 text-right">{formatTime(currentTime)}</span>
                    <div
                      className="flex-1 h-1 rounded-full cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.1)' }}
                      onClick={(e) => {
                        if (!audio || !duration) return
                        const rect = e.currentTarget.getBoundingClientRect()
                        const x = e.clientX - rect.left
                        audio.currentTime = (x / rect.width) * duration
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                          background: currentTrack.color
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/40 w-10">{formatTime(duration)}</span>
                  </div>
                </div>

                {/* 音量 */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value)
                    setVolume(v)
                    if (audio) audio.volume = v
                  }}
                  className="w-20 h-1 appearance-none cursor-pointer"
                  style={{ accentColor: currentTrack.color }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ===== 本地乐库页面 =====
function LibraryPage() {
  const [songs, setSongs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [libraryPath, setLibraryPath] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    loadSongs()
    loadLibraryPath()
    const a = new Audio()
    a.addEventListener('timeupdate', () => setCurrentTime(a.currentTime))
    a.addEventListener('loadedmetadata', () => setDuration(a.duration))
    a.addEventListener('ended', () => { setIsPlaying(false); setPlayingId(null) })
    setCurrentAudio(a)
    return () => { a.pause(); a.src = '' }
  }, [])

  const loadSongs = async () => {
    setLoading(true)
    try {
      if (!window.api) { setSongs([]); setLoading(false); return }
      const res = await (window.api as any).http.get('/api/v1/local-songs?page_size=500')
      const data = res?.data?.songs || res?.songs || []
      setSongs(data)
    } catch (err) {
      console.warn('加载歌曲失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadLibraryPath = async () => {
    try {
      if (!window.api) return
      const path = await (window.api as any).library.getLibraryPath()
      if (path) setLibraryPath(path)
    } catch {}
  }

  const handleSelectFolder = async () => {
    if (!window.api) return
    try {
      const folder = await (window.api as any).library.openFolder()
      if (!folder) return
      setLibraryPath(folder)
      setScanning(true)
      const files = await (window.api as any).library.scanFolder(folder)
      // 批量导入
      const payload = (files || []).map((f: any) => ({
        title: f.title || f.name?.replace(/\.[^.]+$/, ''),
        artist_name: f.artist || '',
        album_name: f.album || '',
        audio_path: f.path,
        file_hash: f.hash || ''
      }))
      if (payload.length > 0) {
        await (window.api as any).http.post('/api/v1/local-songs/import', { songs: payload })
        await loadSongs()
      }
    } catch (err) {
      console.error('导入失败:', err)
    } finally {
      setScanning(false)
    }
  }

  const playSong = (song: any) => {
    if (!currentAudio) return
    if (playingId === song.id) {
      if (isPlaying) { currentAudio.pause(); setIsPlaying(false) }
      else { currentAudio.play().catch(() => {}); setIsPlaying(true) }
    } else {
      currentAudio.src = song.audio_path
      currentAudio.play().catch(() => {})
      setPlayingId(song.id)
      setIsPlaying(true)
    }
  }

  const filteredSongs = songs.filter(s =>
    !searchQuery ||
    s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.artist_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">本地乐库</h1>
            <p className="text-white/50 text-sm">
              {libraryPath ? `已关联: ${libraryPath}` : '未关联本地文件夹'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadSongs}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="刷新"
            >
              <RefreshCw className="w-5 h-5 text-white/60" />
            </button>
            <button
              onClick={handleSelectFolder}
              disabled={scanning}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-sm text-white/80 transition-colors flex items-center gap-2"
            >
              <FolderOpen className="w-4 h-4" />
              {scanning ? '扫描中...' : '选择文件夹'}
            </button>
          </div>
        </header>

        {/* 搜索 */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索歌曲或艺术家..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
          />
        </div>

        {/* 歌曲列表 */}
        {loading ? (
          <div className="text-center py-20 text-white/40">加载中...</div>
        ) : filteredSongs.length === 0 ? (
          <div className="text-center py-20">
            <Library className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 mb-2">暂无本地音乐</p>
            <p className="text-white/30 text-sm">点击上方「选择文件夹」导入您的音乐</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group ${
                  playingId === song.id
                    ? 'bg-white/10 border border-white/10'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                {/* 播放图标 */}
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                  {playingId === song.id && isPlaying ? (
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-0.5 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-0.5 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-0.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <Play className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" fill="currentColor" />
                  )}
                </div>

                {/* 歌曲信息 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${playingId === song.id ? 'text-emerald-400' : 'text-white/90'}`}>
                    {song.title || '未知歌曲'}
                  </p>
                  <p className="text-xs text-white/40 truncate">{song.artist_name || '未知艺术家'}</p>
                </div>

                {/* 专辑 */}
                <p className="text-xs text-white/30 hidden md:block truncate max-w-[150px]">
                  {song.album_name}
                </p>

                {/* 时长 */}
                <p className="text-xs text-white/30 w-12 text-right">{song.duration || '--:--'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ===== 品牌故事页面 =====
function BrandPage() {
  return (
    <div className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-12">
          <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">品牌故事</h1>
          <p className="text-white/50">Moodify · 情绪的潮汐，终将抵达彼岸</p>
        </header>

        <div className="space-y-8">
          {/* 前言 */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-lg font-medium text-white/80 mb-4 text-center">前言</h2>
            <div className="space-y-4 text-white/60 leading-relaxed">
              <p className="text-lg font-light text-white/80">两个词之间，隔着一整个时代。</p>
              <p>2022年秋天，我在键盘上敲下第一个 Prompt。那一刻，我并不知道，一扇门正在打开。</p>
              <p>2025年春天，当 AI 开始批量替代白领工作，这个项目的意义变得不同了。</p>
              <p>这不是一本关于 AI 的书，这是一本关于人的书。</p>
              <p>Moodify 是这个信念的第一个产品。我希望它不只是一款应用，而是一种提醒——提醒你在效率之外，还有情绪；提醒你在效率之外，还有身体；提醒你在效率之外，还有美。</p>
            </div>
          </section>

          {/* 情绪四阶段 */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-lg font-medium text-white/80 mb-6 text-center">情绪四阶段</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: '蜷缩', en: 'Coil', color: '#6B7A8F', desc: '紧 · 沉 · 冷', tags: ['无力', '崩溃边缘', '什么都不想做'] },
                { name: '迷茫', en: 'Lost', color: '#7A8A9F', desc: '不确定 · 悬浮', tags: ['不知道方向', '停在原地'] },
                { name: '觉醒', en: 'Awaken', color: '#A8B8C9', desc: '看见了什么', tags: ['某句话击中了你', '光透进来了'] },
                { name: '舒展', en: 'Expand', color: '#C4D4E4', desc: '打开 · 呼吸', tags: ['微光', '可以呼吸了'] },
              ].map((mood) => (
                <div
                  key={mood.name}
                  className="p-5 rounded-xl"
                  style={{ background: `${mood.color}08`, border: `1px solid ${mood.color}20` }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-white/90">{mood.name}</span>
                    <span className="text-xs text-white/30">{mood.en}</span>
                  </div>
                  <p className="text-xs text-white/40 mb-2">{mood.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {mood.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: `${mood.color}10`, color: `${mood.color}70` }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 设计哲学 */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <h2 className="text-lg font-medium text-white/80 mb-6 text-center">设计哲学</h2>
            <div className="grid grid-cols-3 gap-4">
              {[
                { symbol: '○', title: '不催促', wrong: '"你想专注吗？点这个歌单。"', right: '"你今天想待在哪里？"' },
                { symbol: '◇', title: '不解释', wrong: '"这首音乐可以缓解焦虑"', right: '（没有文字，只有封套）' },
                { symbol: '◐', title: '不比较', wrong: '"你今天听了45分钟"', right: '（没有数据，只有音乐）' },
              ].map((p) => (
                <div key={p.title} className="p-4 rounded-xl bg-black/20 text-center">
                  <div className="text-2xl mb-3" style={{ color: 'rgba(107,122,143,0.6)' }}>{p.symbol}</div>
                  <h3 className="text-sm font-medium text-white/90 mb-3">{p.title}</h3>
                  <p className="text-xs line-through text-white/30 mb-1">{p.wrong}</p>
                  <p className="text-xs italic text-white/50">{p.right}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 温度隐喻 */}
          <section className="bg-white/5 rounded-2xl p-8 border border-white/10 text-center">
            <h2 className="text-lg font-medium text-white/80 mb-4">情绪温度</h2>
            <p className="text-lg text-white/80 mb-4">中性偏冷，但有底温</p>
            <div className="text-white/50 space-y-2 text-sm leading-relaxed">
              <p>想象冬天的一杯热水。</p>
              <p>杯子是冷的——我们不假装热情，不强迫你"开心"，不给你虚假的希望。</p>
              <p>但水是热的——温度在那里，只是没有沸腾。温和地陪着你。</p>
              <p className="text-white/70 italic">不烫伤你，也不让你冷。</p>
            </div>
          </section>

          {/* 结尾 */}
          <div className="text-center py-8">
            <p className="text-white/30 text-sm" style={{ fontFamily: "'Noto Serif SC', serif" }}>欢迎登船。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== 主应用 =====
export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('o3ics')

  const renderContent = () => {
    switch (activeTab) {
      case 'o3ics': return <LyricsPage />
      case 'mood': return <MoodPage />
      case 'library': return <LibraryPage />
      case 'brand': return <BrandPage />
      default: return <LyricsPage />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      {/* Tab 导航 */}
      <div className="flex-shrink-0 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-1 py-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  )
}
