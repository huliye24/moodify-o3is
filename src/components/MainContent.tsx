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
      {!currentProject && (
        <div className="bg-amber-600/20 border-b border-amber-600/30 px-4 py-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500" />
          <span className="text-sm text-amber-200">
            请在左侧创建一个项目或选择一个已有项目开始创作
          </span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-500" />
                输入文案
              </h2>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="在此输入您的文案、心情、故事或关键词...

例如：
- 今天看到了久违的阳光，想起了那些温暖的时光
- 毕业那天，我们约定要一直保持联系
- 春天来了，花开了，你还好吗？"
                className="input-field min-h-[150px] resize-y"
                disabled={!currentProject}
              />
            </div>

            <div className="card">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-full flex items-center justify-between text-lg font-semibold mb-4"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-500" />
                  生成参数
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform ${showOptions && 'rotate-180'}`} />
              </button>

              <div className={`space-y-4 ${showOptions ? 'block' : 'hidden'}`}>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">情感基调</label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map((emotion) => (
                      <button
                        key={emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedEmotion === emotion
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        {emotion}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">歌曲主题</label>
                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSelectedTheme(theme)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedTheme === theme
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">歌词风格</label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((style) => (
                      <button
                        key={style}
                        onClick={() => setSelectedStyle(style)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedStyle === style
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">韵律格式</label>
                  <div className="flex flex-wrap gap-2">
                    {RHYMES.map((rhyme) => (
                      <button
                        key={rhyme}
                        onClick={() => setSelectedRhyme(rhyme)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedRhyme === rhyme
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        {rhyme}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">歌曲长度</label>
                  <div className="flex flex-wrap gap-2">
                    {LENGTHS.map((length) => (
                      <button
                        key={length}
                        onClick={() => setSelectedLength(length)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          selectedLength === length
                            ? 'bg-primary-600 text-white'
                            : 'bg-dark-100 text-gray-300 hover:bg-dark-200'
                        }`}
                      >
                        {length}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={!currentProject || isGenerating}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    生成歌词
                  </>
                )}
              </button>
              <button
                onClick={handleSave}
                disabled={!inputContent.trim() || !currentProject}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <Save className="w-4 h-4" />
                保存
              </button>
            </div>

            {/* Suno Prompt 建议区域 */}
            {selectedLyrics && selectedLyrics.sunoPrompts && selectedLyrics.sunoPrompts.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary-500" />
                  Suno Prompt Suggestions
                </h3>
                <div className="space-y-3">
                  {selectedLyrics.sunoPrompts.map((prompt, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-dark-100 rounded-lg border border-gray-700 hover:border-primary-500/30 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-dark-300 flex items-center justify-center text-gray-500 text-xs font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="flex-1 text-sm text-gray-300">{prompt}</p>
                      <button
                        onClick={() => handleCopyPrompt(prompt, index)}
                        className="btn-secondary text-xs flex items-center gap-1 px-2 py-1 flex-shrink-0"
                      >
                        <Copy className="w-3 h-3" />
                        {copiedIndex === index ? '已复制' : '复制'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-4 py-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-200">{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-80 border-l border-gray-800 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800">
            <h3 className="text-sm font-medium text-gray-300 mb-3">歌词预览</h3>
            {selectedLyrics ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={title || selectedLyrics.title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field text-sm"
                  placeholder="歌词标题..."
                />
                <div className="bg-dark-100 rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedLyrics.content}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={handleCopy}
                    className="btn-secondary text-xs flex items-center gap-1 flex-1 justify-center min-w-[60px]"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? '已复制' : '复制'}
                  </button>
                  <button
                    onClick={() => toggleFavorite(selectedLyrics.id)}
                    className={`btn-secondary text-xs flex items-center gap-1 min-w-[60px] ${
                      selectedLyrics.favorite ? 'text-red-500 border-red-500' : ''
                    }`}
                  >
                    <Heart className={`w-3 h-3 ${selectedLyrics.favorite && 'fill-current'}`} />
                    {selectedLyrics.favorite ? '已收藏' : '收藏'}
                  </button>
                  {!selectedLyrics.saved && currentProject && (
                    <button
                      onClick={() => saveToProject(selectedLyrics)}
                      className="btn-secondary text-xs flex items-center gap-1 text-green-400 hover:border-green-400 min-w-[60px]"
                    >
                      <BookmarkPlus className="w-3 h-3" />
                      保存
                    </button>
                  )}
                  {selectedLyrics.projectId ? (
                    <button
                      onClick={() => deleteLyrics(selectedLyrics.id)}
                      className="btn-secondary text-xs flex items-center gap-1 text-red-400 hover:border-red-400 min-w-[60px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteFromHistory(selectedLyrics.id)}
                      className="btn-secondary text-xs flex items-center gap-1 text-red-400 hover:border-red-400 min-w-[60px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      删除
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">
                {inputContent ? '点击下方列表中的歌词查看' : '生成歌词后可在列表中查看'}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <h4 className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2">
              当前项目 ({o3icsList?.length || 0})
            </h4>
            <div className="space-y-1">
              {!o3icsList || o3icsList.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {currentProject ? '暂无歌词，生成一首吧' : '请先选择项目'}
                </p>
              ) : (
                o3icsList.map((o3ics) => (
                  <div
                    key={o3ics.id}
                    onClick={() => selectLyrics(o3ics)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors group ${
                      selectedLyrics?.id === o3ics.id
                        ? 'bg-primary-600/20 border border-primary-600/50'
                        : 'hover:bg-dark-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-medium truncate flex-1">{o3ics.title}</h5>
                      {o3ics.favorite && <Heart className="w-3 h-3 text-red-500 fill-current flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {o3ics.content.substring(0, 80)}...
                    </p>
                    <div className="flex gap-2 mt-2">
                      {o3ics.emotion && (
                        <span className="text-xs bg-dark-100 px-2 py-0.5 rounded">
                          {o3ics.emotion}
                        </span>
                      )}
                      {o3ics.style && (
                        <span className="text-xs bg-primary-600/20 text-primary-400 px-2 py-0.5 rounded">
                          {o3ics.style}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {o3icsHistory.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-800">
                <h4 className="text-xs text-gray-500 uppercase tracking-wider px-2 mb-2 flex items-center gap-1">
                  <History className="w-3 h-3" />
                  历史记录 ({o3icsHistory.length})
                </h4>
                <div className="space-y-1">
                  {o3icsHistory.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectLyrics(item)}
                      className={`p-3 rounded-lg cursor-pointer transition-colors group relative ${
                        selectedLyrics?.id === item.id
                          ? 'bg-yellow-600/20 border border-yellow-600/50'
                          : 'hover:bg-dark-200 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="text-sm font-medium truncate flex-1">
                          {item.title}
                          {item.saved && <span className="ml-1 text-xs text-green-400">✓</span>}
                        </h5>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteFromHistory(item.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-dark-100 rounded transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {item.content.substring(0, 60)}...
                      </p>
                      <div className="flex gap-2 mt-2">
                        {item.emotion && (
                          <span className="text-xs bg-dark-100 px-2 py-0.5 rounded">
                            {item.emotion}
                          </span>
                        )}
                        {item.style && (
                          <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-0.5 rounded">
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
    </div>
  )
}
