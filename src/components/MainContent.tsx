import { useState } from 'react'
import { useStore } from '../stores/useStore'
import {
  Sparkles,
  Save,
  Copy,
  Trash2,
  Heart,
  Loader2,
  AlertCircle,
  ChevronDown,
  FileText,
  BookmarkPlus,
  History,
  Wand2
} from 'lucide-react'

const EMOTIONS = ['悲伤', '喜悦', '浪漫', '励志', '平静', '愤怒', '迷茫', '感恩']
const THEMES = ['爱情', '友情', '成长', '自然', '生活', '梦想', '回忆', '未来']
const STYLES = ['流行', '古风', '民谣', '说唱', '情歌', '摇滚', '电子', '轻音乐']
const RHYMES = ['AABB', 'ABAB', '自由韵', 'AAAA', 'ABBA']
const LENGTHS = ['短歌 (16句)', '中等 (24句)', '长歌 (32句+)']

// 统一的 Moodify 文字色
const T = {
  secondary: 'rgba(107,122,143,0.5)',   // 次要文字（标签、描述）
  tertiary:   'rgba(107,122,143,0.35)', // 占位符、序号
  body:       'rgba(196,212,228,0.75)', // 正文
  heading:    'rgba(196,212,228,0.9)',  // 标题
  white:      'rgba(196,212,228,1)',    // 纯白
}

export default function MainContent() {
  const {
    currentProject,
    o3icsList,
    o3icsHistory,
    selectedLyrics,
    isGenerating,
    inputContent,
    selectedEmotion,
    selectedTheme,
    selectedStyle,
    selectedRhyme,
    selectedLength,
    setInputContent,
    setSelectedEmotion,
    setSelectedTheme,
    setSelectedStyle,
    setSelectedRhyme,
    setSelectedLength,
    generateLyrics,
    saveLyrics,
    toggleFavorite,
    deleteLyrics,
    deleteFromHistory,
    saveToProject,
    selectLyrics
  } = useStore()

  const [title, setTitle] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleGenerate = async () => {
    setError('')
    try {
      await generateLyrics()
    } catch (err: any) {
      setError(err.message || '生成失败，请重试')
    }
  }

  const handleSave = async () => {
    if (!inputContent.trim()) {
      setError('请先生成歌词')
      return
    }
    try {
      await saveLyrics()
    } catch (err: any) {
      setError(err.message || '保存失败')
    }
  }

  const handleCopy = async () => {
    if (selectedLyrics) {
      await navigator.clipboard.writeText(selectedLyrics.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleCopyPrompt = async (prompt: string, index: number) => {
    await navigator.clipboard.writeText(prompt)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      <div className="flex-1 flex overflow-hidden">
        {/* ===== 左侧主内容 ===== */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">

            {/* 输入文案卡片 */}
            <div className="card">
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: T.heading }}>
                <FileText className="w-5 h-5" style={{ color: 'rgba(107,122,143,0.7)' }} />
                输入文案
              </h2>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={`在此输入您的文案、心情、故事或关键词...\n\n例如：\n- 今天看到了久违的阳光，想起了那些温暖的时光\n- 毕业那天，我们约定要一直保持联系\n- 春天来了，花开了，你还好吗？`}
                className="input-field min-h-[150px] resize-y"
              />
            </div>

            {/* 生成参数卡片 */}
            <div className="card">
              <button
                onClick={() => setShowOptions(!showOptions)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: T.heading }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles className="w-5 h-5" style={{ color: 'rgba(107,122,143,0.7)' }} />
                  生成参数
                </span>
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${showOptions && 'rotate-180'}`}
                  style={{ color: T.secondary, transition: 'transform 0.2s' }}
                />
              </button>

              <div className={`space-y-4 ${showOptions ? 'block' : 'hidden'}`}>

                {/* 情感基调 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: T.secondary, marginBottom: '0.5rem' }}>情感基调</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {EMOTIONS.map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s',
                          ...(selectedEmotion === emotion
                            ? { background: 'rgba(107,122,143,0.2)', color: T.white, border: '1px solid rgba(107,122,143,0.4)' }
                            : { background: 'rgba(107,122,143,0.08)', color: T.secondary, border: '1px solid rgba(107,122,143,0.15)' }
                          )
                        }}
                        onMouseEnter={(e) => {
                          if (selectedEmotion !== emotion) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.15)'
                            ;(e.target as HTMLElement).style.color = T.body
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedEmotion !== emotion) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                            ;(e.target as HTMLElement).style.color = T.secondary
                          }
                        }}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 歌曲主题 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: T.secondary, marginBottom: '0.5rem' }}>歌曲主题</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {THEMES.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s',
                          ...(selectedTheme === theme
                            ? { background: 'rgba(107,122,143,0.2)', color: T.white, border: '1px solid rgba(107,122,143,0.4)' }
                            : { background: 'rgba(107,122,143,0.08)', color: T.secondary, border: '1px solid rgba(107,122,143,0.15)' }
                          )
                        }}
                        onMouseEnter={(e) => {
                          if (selectedTheme !== theme) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.15)'
                            ;(e.target as HTMLElement).style.color = T.body
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedTheme !== theme) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                            ;(e.target as HTMLElement).style.color = T.secondary
                          }
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 歌词风格 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: T.secondary, marginBottom: '0.5rem' }}>歌词风格</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s',
                          ...(selectedStyle === style
                            ? { background: 'rgba(107,122,143,0.2)', color: T.white, border: '1px solid rgba(107,122,143,0.4)' }
                            : { background: 'rgba(107,122,143,0.08)', color: T.secondary, border: '1px solid rgba(107,122,143,0.15)' }
                          )
                        }}
                        onMouseEnter={(e) => {
                          if (selectedStyle !== style) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.15)'
                            ;(e.target as HTMLElement).style.color = T.body
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedStyle !== style) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                            ;(e.target as HTMLElement).style.color = T.secondary
                          }
                        }}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 韵律格式 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: T.secondary, marginBottom: '0.5rem' }}>韵律格式</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {RHYMES.map((rhyme) => (
                      <button
                        key={rhyme}
                        onClick={() => setSelectedRhyme(rhyme)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s',
                          ...(selectedRhyme === rhyme
                            ? { background: 'rgba(107,122,143,0.2)', color: T.white, border: '1px solid rgba(107,122,143,0.4)' }
                            : { background: 'rgba(107,122,143,0.08)', color: T.secondary, border: '1px solid rgba(107,122,143,0.15)' }
                          )
                        }}
                        onMouseEnter={(e) => {
                          if (selectedRhyme !== rhyme) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.15)'
                            ;(e.target as HTMLElement).style.color = T.body
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedRhyme !== rhyme) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                            ;(e.target as HTMLElement).style.color = T.secondary
                          }
                        }}
                      >
                        {rhyme}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 歌曲长度 */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', color: T.secondary, marginBottom: '0.5rem' }}>歌曲长度</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {LENGTHS.map((length) => (
                      <button
                        key={length}
                        onClick={() => setSelectedLength(length)}
                        style={{
                          padding: '0.375rem 0.75rem',
                          borderRadius: '9999px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s',
                          ...(selectedLength === length
                            ? { background: 'rgba(107,122,143,0.2)', color: T.white, border: '1px solid rgba(107,122,143,0.4)' }
                            : { background: 'rgba(107,122,143,0.08)', color: T.secondary, border: '1px solid rgba(107,122,143,0.15)' }
                          )
                        }}
                        onMouseEnter={(e) => {
                          if (selectedLength !== length) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.15)'
                            ;(e.target as HTMLElement).style.color = T.body
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedLength !== length) {
                            (e.target as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                            ;(e.target as HTMLElement).style.color = T.secondary
                          }
                        }}
                      >
                        {length}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleGenerate}
                disabled={!currentProject || isGenerating}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'rgba(107,122,143,0.7)' }} />
                    <span style={{ color: T.body }}>生成中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" style={{ color: 'rgba(107,122,143,0.7)' }} />
                    <span style={{ color: T.white }}>生成歌词</span>
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!inputContent.trim() || !currentProject}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <Save className="w-4 h-4" style={{ color: T.secondary }} />
                <span>保存</span>
              </button>
            </div>

            {/* Suno Prompt 建议 */}
            {selectedLyrics && selectedLyrics.sunoPrompts && selectedLyrics.sunoPrompts.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: T.heading }}>
                  <Wand2 className="w-5 h-5" style={{ color: 'rgba(107,122,143,0.7)' }} />
                  Suno Prompt Suggestions
                </h3>
                <div className="space-y-3">
                  {selectedLyrics.sunoPrompts.map((prompt, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        background: 'rgba(107,122,143,0.08)',
                        border: '1px solid rgba(107,122,143,0.15)',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,122,143,0.35)'
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(107,122,143,0.15)'
                      }}
                    >
                      <span style={{
                        width: '1.5rem', height: '1.5rem', borderRadius: '9999px',
                        background: 'rgba(107,122,143,0.08)',
                        border: '1px solid rgba(107,122,143,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 500,
                        color: T.tertiary, flexShrink: 0, marginTop: '0.125rem'
                      }}>
                        {index + 1}
                      </span>
                      <p style={{ flex: 1, fontSize: '0.875rem', color: T.body }}>{prompt}</p>
                      <button
                        onClick={() => handleCopyPrompt(prompt, index)}
                        className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 flex-shrink-0"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Copy className="w-3 h-3" style={{ color: T.secondary }} />
                        <span>{copiedIndex === index ? '已复制' : '复制'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div style={{
                background: 'rgba(220,38,38,0.08)',
                border: '1px solid rgba(220,38,38,0.15)',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(239,68,68,0.7)' }} />
                <span style={{ fontSize: '0.875rem', color: 'rgba(252,165,165,0.8)' }}>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* ===== 右侧歌词预览面板 ===== */}
        <div style={{
          width: '20rem', flexShrink: 0,
          borderLeft: '1px solid rgba(107,122,143,0.12)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(107,122,143,0.12)' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: T.body, marginBottom: '0.75rem' }}>歌词预览</h3>
            {selectedLyrics ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={title || selectedLyrics.title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field text-sm"
                  placeholder="歌词标题..."
                />
                <div style={{
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: T.body,
                  whiteSpace: 'pre-wrap',
                  maxHeight: '12rem',
                  overflowY: 'auto',
                  background: 'rgba(107,122,143,0.08)',
                  border: '1px solid rgba(107,122,143,0.12)',
                }}>
                  {selectedLyrics.content}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={handleCopy}
                    className="btn-secondary text-xs flex items-center gap-1 flex-1 justify-center min-w-[60px]"
                    style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem' }}
                  >
                    <Copy className="w-3 h-3" style={{ color: T.secondary }} />
                    <span>{copied ? '已复制' : '复制'}</span>
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedLyrics.id)}
                    className="btn-secondary text-xs flex items-center gap-1 min-w-[60px]"
                    style={{
                      fontSize: '0.75rem', padding: '0.375rem 0.5rem',
                      ...(selectedLyrics.favorite
                        ? { color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.3)' }
                        : {}
                      )
                    }}
                  >
                    <Heart className={`w-3 h-3 ${selectedLyrics.favorite ? 'fill-current' : ''}`}
                      style={{ color: selectedLyrics.favorite ? 'rgba(239,68,68,0.7)' : T.secondary }} />
                    <span>{selectedLyrics.favorite ? '已收藏' : '收藏'}</span>
                  </button>
                  {!selectedLyrics.saved && currentProject && (
                    <button
                      onClick={() => saveToProject(selectedLyrics)}
                      className="btn-secondary text-xs flex items-center gap-1 min-w-[60px]"
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', color: 'rgba(74,222,128,0.7)', border: '1px solid rgba(74,222,128,0.2)' }}
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      <span>保存</span>
                    </button>
                  )}
                  {selectedLyrics.projectId ? (
                    <button
                      onClick={() => deleteLyrics(selectedLyrics.id)}
                      className="btn-secondary text-xs flex items-center gap-1 min-w-[60px]"
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>删除</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteFromHistory(selectedLyrics.id)}
                      className="btn-secondary text-xs flex items-center gap-1 min-w-[60px]"
                      style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', color: 'rgba(239,68,68,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>删除</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: T.tertiary }}>
                {inputContent ? '点击下方列表中的歌词查看' : '生成歌词后可在列表中查看'}
              </p>
            )}
          </div>

          {/* 歌词列表 */}
          <div className="flex-1 overflow-y-auto p-2">
            <h4 style={{
              fontSize: '0.75rem', color: T.tertiary, textTransform: 'uppercase',
              letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.5rem'
            }}>
              当前项目 ({o3icsList?.length || 0})
            </h4>
            <div className="space-y-1">
              {!o3icsList || o3icsList.length === 0 ? (
                <p style={{ fontSize: '0.875rem', color: T.tertiary, textAlign: 'center', padding: '1rem 0' }}>
                  {currentProject ? '暂无歌词，生成一首吧' : '请先选择项目'}
                </p>
              ) : (
                o3icsList.map((o3ics) => (
                  <div
                    key={o3ics.id}
                    onClick={() => selectLyrics(o3ics)}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: selectedLyrics?.id === o3ics.id
                        ? 'rgba(107,122,143,0.12)'
                        : 'transparent',
                      border: selectedLyrics?.id === o3ics.id
                        ? '1px solid rgba(107,122,143,0.3)'
                        : '1px solid transparent',
                      ...(selectedLyrics?.id !== o3ics.id ? {
                      } : {})
                    }}
                    onMouseEnter={(e) => {
                      if (selectedLyrics?.id !== o3ics.id) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedLyrics?.id !== o3ics.id) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <h5 style={{ fontSize: '0.875rem', fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: selectedLyrics?.id === o3ics.id ? T.heading : T.body }}>
                        {o3ics.title}
                      </h5>
                      {o3ics.favorite && <Heart className="w-3 h-3 fill-current flex-shrink-0" style={{ color: 'rgba(239,68,68,0.7)' }} />}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: T.tertiary, marginTop: '0.25rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {o3ics.content.substring(0, 80)}...
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      {o3ics.emotion && (
                        <span style={{
                          fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px',
                          background: 'rgba(107,122,143,0.08)',
                          color: T.secondary,
                          border: '1px solid rgba(107,122,143,0.12)'
                        }}>
                          {o3ics.emotion}
                        </span>
                      )}
                      {o3ics.style && (
                        <span style={{
                          fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px',
                          background: 'rgba(107,122,143,0.12)',
                          color: T.body,
                          border: '1px solid rgba(107,122,143,0.2)'
                        }}>
                          {o3ics.style}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 历史记录 */}
            {o3icsHistory.length > 0 && (
              <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(107,122,143,0.12)' }}>
                <h4 style={{
                  fontSize: '0.75rem', color: T.tertiary, textTransform: 'uppercase',
                  letterSpacing: '0.1em', padding: '0 0.5rem', marginBottom: '0.5rem',
                  display: 'flex', alignItems: 'center', gap: '0.25rem'
                }}>
                  <History className="w-3 h-3" style={{ color: T.tertiary }} />
                  历史记录 ({o3icsHistory.length})
                </h4>
                <div className="space-y-1">
                  {o3icsHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectLyrics(item)}
                      style={{
                        padding: '0.75rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        background: selectedLyrics?.id === item.id
                          ? 'rgba(107,122,143,0.12)'
                          : 'transparent',
                        border: selectedLyrics?.id === item.id
                          ? '1px solid rgba(107,122,143,0.3)'
                          : '1px solid transparent',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedLyrics?.id !== item.id) {
                          (e.currentTarget as HTMLElement).style.background = 'rgba(107,122,143,0.08)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLyrics?.id !== item.id) {
                          (e.currentTarget as HTMLElement).style.background = 'transparent'
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                        <h5 style={{
                          fontSize: '0.875rem', fontWeight: 500, flex: 1,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          color: selectedLyrics?.id === item.id ? T.heading : T.body,
                          display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}>
                          {item.title}
                          {item.saved && <span style={{ fontSize: '0.75rem', color: 'rgba(74,222,128,0.7)' }}>✓</span>}
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFromHistory(item.id)
                          }}
                          style={{
                            opacity: 0, transition: 'opacity 0.2s',
                            padding: '0.25rem', borderRadius: '0.25rem',
                            background: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
                          className="delete-btn"
                        >
                          <Trash2 className="w-3 h-3" style={{ color: 'rgba(239,68,68,0.7)' }} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: T.tertiary, marginTop: '0.25rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.content.substring(0, 60)}...
                      </p>
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {item.emotion && (
                          <span style={{
                            fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px',
                            background: 'rgba(107,122,143,0.08)',
                            color: T.secondary,
                            border: '1px solid rgba(107,122,143,0.12)'
                          }}>
                            {item.emotion}
                          </span>
                        )}
                        {item.style && (
                          <span style={{
                            fontSize: '0.75rem', padding: '0.125rem 0.5rem', borderRadius: '9999px',
                            background: 'rgba(107,122,143,0.12)',
                            color: T.body,
                            border: '1px solid rgba(107,122,143,0.2)'
                          }}>
                            {item.style}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* hover 时显示删除按钮的样式 */}
      <style>{`
        [class*="rounded-lg"][class*="cursor-pointer"]:hover .delete-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
