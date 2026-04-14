import { useState, useEffect } from 'react'
import { Music, Play, Trash2, RefreshCw, Loader2, AlertCircle, ChevronDown, X } from 'lucide-react'
import { usePlayerStore } from '../stores/usePlayerStore'
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
  const { setCurrentTrack, generationProgress, isGenerating } = usePlayerStore()
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
      const res = await window.api.http.get(`/api/v1/music-tracks?o3ics_id=${o3ics.id}`)
      const data = res?.data || res || []
      setTracks(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('加载曲目失败:', err)
      setTracks([])
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

      // 通过 HTTP 代理创建 music track
      const trackRes = await window.api.http.post('/api/v1/music-tracks', {
        o3ics_id: o3ics.id,
        title: o3ics.title || '未命名',
        task_id: response.task_id,
        style: selectedStyles.join(', '),
        model: selectedModel,
        instrumental,
        status: 'submitted',
      })
      const track = trackRes?.data || trackRes

      setTracks(prev => [track, ...prev])
      startPolling(response.task_id)

    } catch (err: any) {
      setError(err.message || '提交生成任务失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await window.api.http.post('/api/v1/music-tracks', { id: trackId })
      setTracks(prev => prev.filter(t => t.id !== trackId))
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handlePlay = (track: any) => {
    if (track.audio_url) {
      setCurrentTrack(track)
      onSelectTrack?.(track)
    }
  }

  const handleRegenerate = (_track: any) => {
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
        <div className="bg-dark-300 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl" style={{ background: 'rgba(107,122,143,0.04)', border: '1px solid rgba(107,122,143,0.15)' }}>
          <div className="p-6 text-center">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: 'rgba(107,122,143,0.5)' }} />
            <p style={{ color: 'rgba(107,122,143,0.5)' }}>请先在左侧选择或创建歌词</p>
            <button onClick={onClose} className="btn-secondary mt-4">关闭</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-300 rounded-xl w-full max-w-lg border border-gray-700 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: 'rgba(107,122,143,0.04)', border: '1px solid rgba(107,122,143,0.15)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(107,122,143,0.15)' }}>
          <h2 className="font-semibold flex items-center gap-2">
            <Music className="w-5 h-5" style={{ color: 'rgba(107,122,143,0.7)' }} />
            音乐生成
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors" onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="px-6 py-3 text-sm border-b" style={{ color: 'rgba(107,122,143,0.5)', borderBottom: '1px solid rgba(107,122,143,0.15)' }}>
          歌词: {o3ics.title}
        </p>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs mb-2" style={{ color: 'rgba(107,122,143,0.5)' }}>音乐风格</label>
            <div className="relative">
              <button
                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                className="w-full btn-secondary justify-between"
              >
                <span>{selectedStyles.length > 0 ? selectedStyles.join(', ') : '选择风格'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showStyleDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showStyleDropdown && (
                <div className="absolute z-20 mt-1 w-full rounded-lg shadow-xl max-h-48 overflow-y-auto" style={{ background: 'rgba(107,122,143,0.08)', border: '1px solid rgba(107,122,143,0.15)' }}>
                  {MUSIC_STYLES.map(style => (
                    <button
                      key={style}
                      onClick={() => toggleStyle(style)}
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        selectedStyles.includes(style) ? '' : ''
                      }`}
                      style={selectedStyles.includes(style) ? { background: 'rgba(107,122,143,0.08)', color: 'rgba(107,122,143,0.7)' } : {}}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedStyles.includes(style) ? 'rgba(107,122,143,0.08)' : '' }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-2" style={{ color: 'rgba(107,122,143,0.5)' }}>模型版本</label>
            <div className="relative">
              <button
                onClick={() => setShowModelDropdown(!showModelDropdown)}
                className="w-full btn-secondary justify-between"
              >
                <span>{SUNO_MODELS.find(m => m.value === selectedModel)?.label || selectedModel}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showModelDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showModelDropdown && (
                <div className="absolute z-20 mt-1 w-full rounded-lg shadow-xl" style={{ background: 'rgba(107,122,143,0.08)', border: '1px solid rgba(107,122,143,0.15)' }}>
                  {SUNO_MODELS.map(model => (
                    <button
                      key={model.value}
                      onClick={() => { setSelectedModel(model.value); setShowModelDropdown(false) }}
                      className="w-full px-3 py-2 text-left text-sm transition-colors"
                      style={selectedModel === model.value ? { background: 'rgba(107,122,143,0.08)', color: 'rgba(107,122,143,0.7)' } : {}}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = selectedModel === model.value ? 'rgba(107,122,143,0.08)' : '' }}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs mb-2" style={{ color: 'rgba(107,122,143,0.5)' }}>自定义描述 (可选)</label>
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
              className="w-4 h-4 rounded text-primary-500 bg-dark-200"
              style={{ border: '1px solid rgba(107,122,143,0.15)', color: 'rgba(107,122,143,0.7)', boxShadow: '0 0 0 2px rgba(107,122,143,0.2)' }}
            />
            <span className="text-sm" style={{ color: 'rgba(196,212,228,0.75)' }}>纯音乐 (无人声)</span>
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
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(107,122,143,0.08)' }}>
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${generationProgress}%`, background: 'linear-gradient(to right, rgba(107,122,143,0.7), rgba(107,122,143,0.7))' }}
                />
              </div>
              <p className="text-xs text-center" style={{ color: 'rgba(107,122,143,0.5)' }}>正在生成，请稍候...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-4 py-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(239,68,68,0.7)' }} />
              <span className="text-sm" style={{ color: 'rgba(252,165,165,0.8)' }}>{error}</span>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium mb-3" style={{ color: 'rgba(107,122,143,0.5)' }}>生成的曲目</h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'rgba(107,122,143,0.5)' }} />
              </div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'rgba(107,122,143,0.5)' }}>
                <Music className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无生成的曲目</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tracks.map(track => (
                  <div
                    key={track.id}
                    onClick={() => handlePlay(track)}
                    className="p-3 rounded-lg border transition-colors cursor-pointer"
                    style={track.status === 'success' && track.audio_url
                      ? { background: 'rgba(107,122,143,0.08)', border: '1px solid rgba(107,122,143,0.15)' }
                      : { background: 'rgba(107,122,143,0.04)', border: '1px solid rgba(107,122,143,0.1)', opacity: 0.6 }
                    }
                    onMouseEnter={(e) => {
                      if (track.status === 'success' && track.audio_url) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,122,143,0.3)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (track.status === 'success' && track.audio_url) {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,122,143,0.15)'
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden" style={{ background: 'rgba(107,122,143,0.04)' }}>
                        {track.cover_image_url ? (
                          <img src={track.cover_image_url} alt="" className="w-full h-full object-cover" />
                        ) : track.status === 'success' ? (
                          <Music className="w-5 h-5" style={{ color: 'rgba(107,122,143,0.7)' }} />
                        ) : (
                          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(107,122,143,0.5)' }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate" style={{ color: 'rgba(196,212,228,0.9)' }}>{track.title}</h4>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(107,122,143,0.5)' }}>
                          {getStatusDisplay(track.status)}
                          {track.style && ` · ${track.style}`}
                        </p>
                        {track.status === 'failure' && track.fail_reason && (
                          <p className="text-xs mt-1" style={{ color: 'rgba(252,165,165,0.8)' }}>{track.fail_reason}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {track.status === 'success' && track.audio_url && (
                          <>
                            <button onClick={(e) => { e.stopPropagation(); handlePlay(track) }} className="p-2 rounded-lg" title="播放" onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}>
                              <Play className="w-4 h-4" />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); handleRegenerate(track) }} className="p-2 rounded-lg" title="重新生成" onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)' }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '' }}>
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button onClick={(e) => handleDelete(track.id, e)} className="p-2 rounded-lg" title="删除" onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.2)'; (e.currentTarget.querySelector('svg') as SVGElement)?.style && ((e.currentTarget.querySelector('svg') as SVGElement).style.color = 'rgba(239,68,68,0.7)') }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ''; const svg = e.currentTarget.querySelector('svg') as SVGElement; if (svg) svg.style.color = '' }}>
                          <Trash2 className="w-4 h-4" style={{ color: 'rgba(107,122,143,0.5)' }} />
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