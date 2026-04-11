import { useState, useEffect } from 'react'
import { Music, Play, Trash2, RefreshCw, Loader2, AlertCircle, ChevronDown, X } from 'lucide-react'
import { useMusicStore } from '../stores/useMusicStore'
import { useSunoPolling } from '../hooks/useSunoPolling'
import { MUSIC_STYLES, SUNO_MODELS } from '../types'
import type { Lyrics, MusicTrack } from '../types'

interface MusicPanelProps {
  o3ics: Lyrics | null
  onSelectTrack?: (track: MusicTrack) => void
  onClose?: () => void
  initialPrompt?: string  // 从MainContent传来的初始prompt
}

export default function MusicPanel({ o3ics, onSelectTrack, onClose, initialPrompt }: MusicPanelProps) {
  const { setCurrentTrack, generationProgress, isGenerating } = useMusicStore()
  const { startPolling } = useSunoPolling()

  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [loading, setLoading] = useState(false)

  const [selectedStyles, setSelectedStyles] = useState<string[]>(o3ics?.style ? [o3ics.style] : ['流行'])
  const [selectedModel, setSelectedModel] = useState('chirp-v3-5')
  const [instrumental, setInstrumental] = useState(false)
  const [customPrompt, setCustomPrompt] = useState(initialPrompt || '')

  const [showStyleDropdown, setShowStyleDropdown] = useState(false)
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (o3ics) {
      loadTracks()
    }
  }, [o3ics])

  const loadTracks = async () => {
    if (!o3ics) return
    setLoading(true)
    try {
      const data = await window.api.musicTrack.getByO3ics(o3ics.id)
      setTracks(data)
    } catch (err) {
      console.error('加载曲目失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!o3ics) {
      setError('请先选择要生成音乐的歌词')
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      const stylePrompt = selectedStyles.length > 0 ? selectedStyles.join(', ') : customPrompt || '流行音乐'

      const response = await window.api.suno.submit({
        gpt_description_prompt: customPrompt || stylePrompt,
        make_instrumental: instrumental,
        model: selectedModel,
        o3ics: instrumental ? undefined : o3ics.content,
        title: o3ics.title
      })

      const track = await window.api.musicTrack.create({
        o3icsId: o3ics.id,
        title: o3ics.title || '未命名',
        taskId: response.task_id,
        style: selectedStyles.join(', '),
        model: selectedModel,
        instrumental
      })

      setTracks(prev => [track, ...prev])
      startPolling(response.task_id)

    } catch (err: any) {
      setError(err.message || '提交生成任务失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (trackId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await window.api.musicTrack.delete(trackId)
      setTracks(prev => prev.filter(t => t.id !== trackId))
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handlePlay = (track: MusicTrack) => {
    if (track.audioUrl) {
      setCurrentTrack(track)
      onSelectTrack?.(track)
    }
  }

  const handleRegenerate = (_track: MusicTrack) => {
    // TODO: 实现重新生成逻辑
  }

  const getStatusDisplay = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': '等待中',
      'submitted': '提交中',
      'queued': '排队中',
      'in_progress': '生成中',
      'success': '已完成',
      'failure': '失败'
    }
    return statusMap[status] || status
  }

  const toggleStyle = (style: string) => {
    setSelectedStyles(prev =>
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    )
  }

  if (!o3ics) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-dark-300 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl">
          <div className="p-6 text-center text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>请先在左侧选择或创建歌词</p>
            <button onClick={onClose} className="btn-secondary mt-4">关闭</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-300 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="font-semibold flex items-center gap-2">
            <Music className="w-5 h-5 text-primary-400" />
            音乐生成
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="px-6 py-3 text-sm text-gray-400 border-b border-gray-700">
          歌词: {o3ics.title}
        </p>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">音乐风格</label>
            <div className="relative">
              <button
                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                className="w-full btn-secondary justify-between"
              >
                <span>{selectedStyles.length > 0 ? selectedStyles.join(', ') : '选择风格'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showStyleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showStyleDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-dark-200 border border-gray-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {MUSIC_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-dark-300 transition-colors ${
                        selectedStyles.includes(style) ? 'text-primary-400 bg-primary-400/10' : ''
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">模型版本</label>
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full btn-secondary justify-between"
              >
                <span>{SUNO_MODELS.find(m => m.value === selectedModel)?.label || selectedModel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showModelDropdown && (
                <div className="absolute z-20 mt-1 w-full bg-dark-200 border border-gray-700 rounded-lg shadow-xl">
                  {SUNO_MODELS.map(model => (
                    <button
                      key={model.value}
                      onClick={() => { setSelectedModel(model.value); setShowModelDropdown(false) }}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-dark-300 transition-colors ${
                        selectedModel === model.value ? 'text-primary-400 bg-primary-400/10' : ''
                      }`}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-2">自定义描述 (可选)</label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如: A dreamy pop song with soft piano..."
              className="input-field resize-none h-20"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 bg-dark-200 text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-300">纯音乐 (无人声)</span>
          </label>

          <button
            onClick={handleGenerate}
            disabled={submitting || isGenerating}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitting || isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                生成中 {isGenerating ? `${generationProgress}%` : '提交中...'}
              </>
            ) : (
              <>
                <Music className="w-4 h-4" />
                生成音乐
              </>
            )}
          </button>

          {isGenerating && (
            <div className="space-y-2">
              <div className="h-2 bg-dark-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">正在生成，请稍候...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-200">{error}</span>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">生成的曲目</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无生成的曲目</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => handlePlay(track)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                      track.status === 'success' && track.audioUrl
                        ? 'bg-dark-200 border-gray-700 hover:border-primary-500/50'
                        : 'bg-dark-300 border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg bg-dark-300 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {track.coverImageUrl ? (
                          <img src={track.coverImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : track.status === 'success' ? (
                          <Music className="w-5 h-5 text-primary-400" />
                        ) : (
                          <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{track.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {getStatusDisplay(track.status)}
                          {track.style && ` · ${track.style}`}
                        </p>
                        {track.status === 'failure' && track.failReason && (
                          <p className="text-xs text-red-400 mt-1">{track.failReason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {track.status === 'success' && track.audioUrl && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handlePlay(track) }} className="p-2 hover:bg-dark-300 rounded-lg" title="播放">
                              <Play className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleRegenerate(track) }} className="p-2 hover:bg-dark-300 rounded-lg" title="重新生成">
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={(e) => handleDelete(track.id, e)} className="p-2 hover:bg-red-600/20 rounded-lg text-gray-400 hover:text-red-400" title="删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}