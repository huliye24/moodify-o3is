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
  Wand2,
  Layout,
  Music2
} from 'lucide-react'

const EMOTIONS = ['悲伤', '喜悦', '浪漫', '励志', '平静', '愤怒', '迷茫', '感恩']
const THEMES = ['爱情', '友情', '成长', '自然', '生活', '梦想', '回忆', '未来']
const STYLES = ['流行', '古风', '民谣', '说唱', '情歌', '摇滚', '电子', '轻音乐']
const RHYMES = ['AABB', 'ABAB', '自由韵', 'AAAA', 'ABBA']
const LENGTHS = ['短歌 (16句)', '中等 (24句)', '长歌 (32句+)']

// ============================================
// 玻璃拟态配色系统 - 灵感来自深海极光
// ============================================
const GLASS_STYLES = {
  // 主色调
  accent: '#76E4CE',
  accentDim: 'rgba(118, 228, 206, 0.7)',
  accentGlow: 'rgba(118, 228, 206, 0.25)',
  
  // 背景层次
  bgDeep: '#0d1117',
  bgGradient: 'radial-gradient(circle at top right, #1e3a3a, #0d1117)',
  
  // 玻璃层级
  glassMain: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  glassHover: 'rgba(255, 255, 255, 0.12)',
  
  // 内容区（更深）
  contentBg: 'rgba(0, 0, 0, 0.2)',
  contentBorder: 'rgba(255, 255, 255, 0.08)',
  
  // 文字层级
  textPrimary: 'rgba(255, 255, 255, 0.95)',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.45)',
  
  // 按钮渐变
  buttonGradient: 'linear-gradient(135deg, #1A2A6C 0%, #76E4CE 100%)',
  buttonGlow: 'rgba(118, 228, 206, 0.35)',
}

// ============================================
// 全局动画样式
// ============================================
const GLOBAL_STYLES = `
@keyframes auroraFlow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
@keyframes glowPulse {
  0%, 100% { opacity: 0.3; box-shadow: 0 0 20px rgba(118, 228, 206, 0.2); }
  50% { opacity: 0.6; box-shadow: 0 0 35px rgba(118, 228, 206, 0.35); }
}
@keyframes floatUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}
@keyframes waveMove {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(6px); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
`

// ============================================
// Logo 组件 - 极光渐变 Serif 字体
// ============================================
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, rgba(118, 228, 206, 0.2), rgba(26, 42, 108, 0.3))',
          border: '1px solid rgba(118, 228, 206, 0.3)',
        }}
      >
        <Music2 className="w-5 h-5" style={{ color: GLASS_STYLES.accent }} />
      </div>
      <div>
        <h1 
          className="text-2xl font-bold tracking-wider"
          style={{
            fontFamily: "'Times New Roman', serif",
            background: `linear-gradient(to bottom, #fff, ${GLASS_STYLES.accent})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '3px',
          }}
        >
          Moodify
        </h1>
        <p className="text-[11px]" style={{ color: GLASS_STYLES.textMuted, letterSpacing: '2px' }}>
          AI 词曲灵感
        </p>
      </div>
    </div>
  )
}

// ============================================
// Chip 组件 - 玻璃拟态标签
// ============================================
interface ChipProps {
  label: string
  isSelected: boolean
  onClick: () => void
}

function Chip({ label, isSelected, onClick }: ChipProps) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        fontSize: '0.8rem',
        fontWeight: 500,
        cursor: 'pointer',
        border: `1px solid ${isSelected ? GLASS_STYLES.accent : GLASS_STYLES.contentBorder}`,
        background: isSelected 
          ? `linear-gradient(135deg, rgba(118, 228, 206, 0.2), rgba(118, 228, 206, 0.1))` 
          : 'transparent',
        color: isSelected ? GLASS_STYLES.accent : GLASS_STYLES.textMuted,
        boxShadow: isSelected ? `0 0 20px ${GLASS_STYLES.accentGlow}` : 'none',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = GLASS_STYLES.glassHover
          e.currentTarget.style.color = GLASS_STYLES.textSecondary
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = GLASS_STYLES.textMuted
        }
      }}
    >
      {label}
    </button>
  )
}

// ============================================
// 主页面组件
// ============================================
export default function LyricsPage() {
  const [title, setTitle] = useState('')
  const [showOptions, setShowOptions] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState<'home' | 'theme' | 'template' | 'design'>('home')

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
    <>
      <style>{GLOBAL_STYLES}</style>
      
      {/* 背景 */}
      <div 
        className="absolute inset-0"
        style={{
          background: GLASS_STYLES.bgGradient,
          backgroundSize: 'cover',
        }}
      />
      
      {/* 极光光晕 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 0%, rgba(118, 228, 206, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 10%, rgba(26, 42, 108, 0.15) 0%, transparent 50%)
          `,
          animation: 'glowPulse 8s ease-in-out infinite',
        }}
      />

      {/* 主容器 */}
      <div 
        className="absolute inset-4 rounded-[30px] overflow-hidden flex flex-col"
        style={{
          background: GLASS_STYLES.glassMain,
          backdropFilter: 'blur(25px) saturate(150%)',
          WebkitBackdropFilter: 'blur(25px) saturate(150%)',
          border: `1px solid ${GLASS_STYLES.glassBorder}`,
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          animation: 'scaleIn 0.4s ease-out',
        }}
      >
        {/* ===== 顶部导航 ===== */}
        <header 
          className="flex-shrink-0 flex items-center justify-between px-8 py-5"
          style={{
            borderBottom: `1px solid ${GLASS_STYLES.contentBorder}`,
            background: 'rgba(0, 0, 0, 0.15)',
          }}
        >
          <Logo />
          
          {/* 导航栏 */}
          <nav 
            className="flex items-center gap-1 px-2 py-1 rounded-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${GLASS_STYLES.contentBorder}`,
            }}
          >
            {[
              { id: 'home', label: '首页' },
              { id: 'theme', label: '主题' },
              { id: 'template', label: '模板' },
              { id: 'design', label: '设计图' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as typeof activeSection)}
                className="px-5 py-2 rounded-xl text-sm font-medium transition-all duration-300"
                style={{
                  background: activeSection === item.id 
                    ? 'rgba(255, 255, 255, 0.15)' 
                    : 'transparent',
                  color: activeSection === item.id 
                    ? GLASS_STYLES.textPrimary 
                    : GLASS_STYLES.textMuted,
                  boxShadow: activeSection === item.id 
                    ? '0 4px 15px rgba(118, 228, 206, 0.15)' 
                    : 'none',
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ===== 主内容区 ===== */}
        <div className="flex-1 flex overflow-hidden p-6 gap-6">
          {/* ===== 左侧主编辑区 ===== */}
          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
            {/* 输入文案卡片 */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: GLASS_STYLES.contentBg,
                border: `1px solid ${GLASS_STYLES.contentBorder}`,
                animation: 'floatUp 0.5s ease-out 0.1s both',
              }}
            >
              <h2 
                className="text-lg font-semibold mb-4 flex items-center gap-3"
                style={{ color: GLASS_STYLES.textPrimary }}
              >
                <FileText className="w-5 h-5" style={{ color: GLASS_STYLES.accent }} />
                我的歌词
              </h2>
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder={`在此输入您的文案、心情、故事或关键词...\n\n例如：\n- 今天看到了久违的阳光，想起了那些温暖的时光\n- 毕业那天，我们约定要一直保持联系\n- 春天来了，花开了，你还好吗？`}
                className="w-full rounded-xl px-5 py-4 resize-y min-h-[180px] text-base leading-relaxed transition-colors"
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: `1px solid ${GLASS_STYLES.contentBorder}`,
                  color: GLASS_STYLES.textPrimary,
                  fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
                }}
              />
              
              {/* AI 建议提示 */}
              {selectedLyrics && (
                <div 
                  className="mt-4 p-4 rounded-xl text-sm"
                  style={{
                    background: `${GLASS_STYLES.accentGlow}`,
                    border: `1px solid ${GLASS_STYLES.accent}40`,
                    color: GLASS_STYLES.accent,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                  }}
                >
                  <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>✨ AI 建议：根据当前情绪，尝试使用更意象化的表达方式</span>
                </div>
              )}
            </div>

            {/* 生成参数卡片 */}
            <div 
              className="rounded-2xl p-6"
              style={{
                background: GLASS_STYLES.contentBg,
                border: `1px solid ${GLASS_STYLES.contentBorder}`,
                animation: 'floatUp 0.5s ease-out 0.2s both',
              }}
            >
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="w-full flex items-center justify-between mb-5"
              >
                <h2 
                  className="text-lg font-semibold flex items-center gap-3"
                  style={{ color: GLASS_STYLES.textPrimary }}
                >
                  <Sparkles className="w-5 h-5" style={{ color: GLASS_STYLES.accent }} />
                  生成参数
                </h2>
                <ChevronDown
                  className={`w-5 h-5 transition-transform duration-300 ${showOptions ? 'rotate-180' : ''}`}
                  style={{ color: GLASS_STYLES.textMuted }}
                />
              </button>

              <div className={`space-y-5 overflow-hidden transition-all duration-300 ${showOptions ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>

                {/* 情感基调 */}
                <div>
                  <label className="block text-sm mb-3" style={{ color: GLASS_STYLES.textSecondary, letterSpacing: '0.05em' }}>
                    情感基调
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {EMOTIONS.map((emotion) => (
                      <Chip
                        key={emotion}
                        label={emotion}
                        isSelected={selectedEmotion === emotion}
                        onClick={() => setSelectedEmotion(emotion)}
                      />
                    ))}
                  </div>
                </div>

                {/* 歌曲主题 */}
                <div>
                  <label className="block text-sm mb-3" style={{ color: GLASS_STYLES.textSecondary, letterSpacing: '0.05em' }}>
                    歌曲主题
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {THEMES.map((themeItem) => (
                      <Chip
                        key={themeItem}
                        label={themeItem}
                        isSelected={selectedTheme === themeItem}
                        onClick={() => setSelectedTheme(themeItem)}
                      />
                    ))}
                  </div>
                </div>

                {/* 歌词风格 */}
                <div>
                  <label className="block text-sm mb-3" style={{ color: GLASS_STYLES.textSecondary, letterSpacing: '0.05em' }}>
                    歌词风格
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {STYLES.map((styleItem) => (
                      <Chip
                        key={styleItem}
                        label={styleItem}
                        isSelected={selectedStyle === styleItem}
                        onClick={() => setSelectedStyle(styleItem)}
                      />
                    ))}
                  </div>
                </div>

                {/* 韵律格式 */}
                <div>
                  <label className="block text-sm mb-3" style={{ color: GLASS_STYLES.textSecondary, letterSpacing: '0.05em' }}>
                    韵律格式
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {RHYMES.map((rhyme) => (
                      <Chip
                        key={rhyme}
                        label={rhyme}
                        isSelected={selectedRhyme === rhyme}
                        onClick={() => setSelectedRhyme(rhyme)}
                      />
                    ))}
                  </div>
                </div>

                {/* 歌曲长度 */}
                <div>
                  <label className="block text-sm mb-3" style={{ color: GLASS_STYLES.textSecondary, letterSpacing: '0.05em' }}>
                    歌曲长度
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LENGTHS.map((length) => (
                      <Chip
                        key={length}
                        label={length}
                        isSelected={selectedLength === length}
                        onClick={() => setSelectedLength(length)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div 
              className="flex items-center justify-between gap-4"
              style={{ animation: 'floatUp 0.5s ease-out 0.3s both' }}
            >
              <div className="flex items-center gap-4">
                <button 
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
                  style={{ 
                    color: GLASS_STYLES.textMuted,
                    border: `1px solid ${GLASS_STYLES.contentBorder}`,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>○</span>
                  设置偏好
                </button>
                <button 
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl transition-all"
                  style={{ 
                    color: GLASS_STYLES.textMuted,
                    border: `1px solid ${GLASS_STYLES.contentBorder}`,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>○</span>
                  选定词组
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={!inputContent.trim() || !currentProject}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium transition-all disabled:opacity-40"
                  style={{
                    background: 'transparent',
                    border: `1px solid ${GLASS_STYLES.glassBorder}`,
                    color: GLASS_STYLES.textSecondary,
                  }}
                >
                  <Save className="w-4 h-4" />
                  保存
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!currentProject || isGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                  style={{
                    background: GLASS_STYLES.buttonGradient,
                    color: '#fff',
                    boxShadow: `0 8px 25px ${GLASS_STYLES.buttonGlow}`,
                    letterSpacing: '0.05em',
                  }}
                  onMouseEnter={(e) => {
                    if (!e.currentTarget.disabled) {
                      e.currentTarget.style.transform = 'scale(1.03)'
                      e.currentTarget.style.boxShadow = `0 12px 35px ${GLASS_STYLES.buttonGlow}`
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = `0 8px 25px ${GLASS_STYLES.buttonGlow}`
                  }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      确认灵感
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Suno Prompt 建议 */}
            {selectedLyrics && selectedLyrics.sunoPrompts && selectedLyrics.sunoPrompts.length > 0 && (
              <div 
                className="rounded-2xl p-6"
                style={{
                  background: GLASS_STYLES.contentBg,
                  border: `1px solid ${GLASS_STYLES.contentBorder}`,
                  animation: 'floatUp 0.5s ease-out 0.4s both',
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center gap-3"
                  style={{ color: GLASS_STYLES.textPrimary }}
                >
                  <Wand2 className="w-5 h-5" style={{ color: GLASS_STYLES.accent }} />
                  Suno Prompt Suggestions
                </h3>
                <div className="space-y-3">
                  {selectedLyrics.sunoPrompts.map((prompt, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer"
                      style={{
                        background: 'rgba(0, 0, 0, 0.2)',
                        border: `1px solid ${GLASS_STYLES.contentBorder}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = `${GLASS_STYLES.accent}50`
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = GLASS_STYLES.contentBorder
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)'
                      }}
                    >
                      <span 
                        className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{
                          background: GLASS_STYLES.buttonGradient,
                          color: '#fff',
                        }}
                      >
                        {index + 1}
                      </span>
                      <p className="flex-1 text-sm leading-relaxed" style={{ color: GLASS_STYLES.textSecondary }}>
                        {prompt}
                      </p>
                      <button
                        onClick={() => handleCopyPrompt(prompt, index)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition-all"
                        style={{
                          background: `${GLASS_STYLES.accent}15`,
                          border: `1px solid ${GLASS_STYLES.accent}30`,
                          color: GLASS_STYLES.accent,
                        }}
                      >
                        <Copy className="w-3 h-3" />
                        {copiedIndex === index ? '已复制' : '复制'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div 
                className="p-4 rounded-xl flex items-center gap-3"
                style={{
                  background: 'rgba(220, 38, 38, 0.1)',
                  border: '1px solid rgba(220, 38, 38, 0.2)',
                }}
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'rgba(239, 68, 68, 0.8)' }} />
                <span className="text-sm" style={{ color: 'rgba(252, 165, 165, 0.9)' }}>{error}</span>
              </div>
            )}
          </div>

          {/* ===== 右侧灵感列表 ===== */}
          <div 
            className="w-80 flex-shrink-0 flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: GLASS_STYLES.contentBg,
              border: `1px solid ${GLASS_STYLES.contentBorder}`,
              animation: 'floatUp 0.5s ease-out 0.15s both',
            }}
          >
            <div 
              className="px-5 py-4"
              style={{
                borderBottom: `1px solid ${GLASS_STYLES.contentBorder}`,
                background: 'rgba(0, 0, 0, 0.15)',
              }}
            >
              <h3 
                className="text-base font-semibold flex items-center gap-3"
                style={{ color: GLASS_STYLES.textPrimary }}
              >
                <Layout className="w-5 h-5" style={{ color: GLASS_STYLES.accent }} />
                灵感清单
              </h3>
              
              {/* 歌词预览 */}
              {selectedLyrics && (
                <div className="mt-4 space-y-3">
                  <input
                    type="text"
                    value={title || selectedLyrics.title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-sm"
                    placeholder="歌词标题..."
                    style={{
                      background: 'rgba(0, 0, 0, 0.3)',
                      border: `1px solid ${GLASS_STYLES.contentBorder}`,
                      color: GLASS_STYLES.textPrimary,
                    }}
                  />
                  <div 
                    className="p-4 rounded-xl text-sm max-h-32 overflow-y-auto"
                    style={{
                      background: 'rgba(0, 0, 0, 0.2)',
                      border: `1px solid ${GLASS_STYLES.contentBorder}`,
                      color: GLASS_STYLES.textSecondary,
                      lineHeight: 1.8,
                    }}
                  >
                    {selectedLyrics.content}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleCopy}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium"
                      style={{
                        background: `${GLASS_STYLES.accent}15`,
                        border: `1px solid ${GLASS_STYLES.accent}30`,
                        color: GLASS_STYLES.accent,
                      }}
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? '已复制' : '复制'}
                    </button>
                    <button
                      onClick={() => toggleFavorite(selectedLyrics.id)}
                      className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium"
                      style={{
                        background: selectedLyrics.favorite ? `${GLASS_STYLES.accent}20` : 'transparent',
                        border: `1px solid ${selectedLyrics.favorite ? GLASS_STYLES.accent : GLASS_STYLES.contentBorder}`,
                        color: selectedLyrics.favorite ? GLASS_STYLES.accent : GLASS_STYLES.textMuted,
                      }}
                    >
                      <Heart className={`w-3 h-3 ${selectedLyrics.favorite ? 'fill-current' : ''}`} />
                      {selectedLyrics.favorite ? '已收藏' : '收藏'}
                    </button>
                    {!selectedLyrics.saved && currentProject && (
                      <button
                        onClick={() => saveToProject(selectedLyrics)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium"
                        style={{
                          background: 'transparent',
                          border: `1px solid ${GLASS_STYLES.accent}40`,
                          color: GLASS_STYLES.accent,
                        }}
                      >
                        <BookmarkPlus className="w-3 h-3" />
                        保存
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 列表 */}
            <div className="flex-1 overflow-y-auto">
              <h4 
                className="px-5 py-3 text-xs uppercase tracking-wider"
                style={{ color: GLASS_STYLES.textMuted }}
              >
                当前项目 ({o3icsList?.length || 0})
              </h4>
              
              <div className="px-3 pb-3 space-y-1">
                {!o3icsList || o3icsList.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: GLASS_STYLES.textMuted }}>
                    {currentProject ? '暂无歌词，生成一首吧' : '请先选择项目'}
                  </p>
                ) : (
                  o3icsList.map((o3ics) => (
                    <div
                      key={o3ics.id}
                      onClick={() => selectLyrics(o3ics)}
                      className="px-4 py-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        background: selectedLyrics?.id === o3ics.id 
                          ? `${GLASS_STYLES.accent}12` 
                          : 'transparent',
                        border: selectedLyrics?.id === o3ics.id 
                          ? `1px solid ${GLASS_STYLES.accent}35` 
                          : '1px solid transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (selectedLyrics?.id !== o3ics.id) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedLyrics?.id !== o3ics.id) {
                          e.currentTarget.style.background = 'transparent'
                        }
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-sm font-medium truncate"
                          style={{ color: selectedLyrics?.id === o3ics.id ? GLASS_STYLES.accent : GLASS_STYLES.textPrimary }}
                        >
                          {o3ics.title}
                        </span>
                        <span style={{ color: GLASS_STYLES.textMuted }}>›</span>
                      </div>
                      <p className="text-xs mt-1 truncate" style={{ color: GLASS_STYLES.textMuted }}>
                        {o3ics.content.substring(0, 40)}...
                      </p>
                      {o3ics.favorite && (
                        <Heart className="w-3 h-3 fill-current mt-1" style={{ color: GLASS_STYLES.accent }} />
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* 历史记录 */}
              {o3icsHistory.length > 0 && (
                <>
                  <h4 
                    className="px-5 py-3 text-xs uppercase tracking-wider"
                    style={{ 
                      color: GLASS_STYLES.textMuted,
                      borderTop: `1px solid ${GLASS_STYLES.contentBorder}`,
                    }}
                  >
                    历史记录 ({o3icsHistory.length})
                  </h4>
                  <div className="px-3 pb-3 space-y-1">
                    {o3icsHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => selectLyrics(item)}
                        className="px-4 py-3 rounded-xl cursor-pointer transition-all relative group"
                        style={{
                          background: selectedLyrics?.id === item.id 
                            ? `${GLASS_STYLES.accent}12` 
                            : 'transparent',
                          border: selectedLyrics?.id === item.id 
                            ? `1px solid ${GLASS_STYLES.accent}35` 
                            : '1px solid transparent',
                        }}
                        onMouseEnter={(e) => {
                          if (selectedLyrics?.id !== item.id) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedLyrics?.id !== item.id) {
                            e.currentTarget.style.background = 'transparent'
                          }
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span 
                            className="text-sm font-medium truncate flex items-center gap-1.5"
                            style={{ color: selectedLyrics?.id === item.id ? GLASS_STYLES.accent : GLASS_STYLES.textPrimary }}
                          >
                            {item.title}
                            {item.saved && (
                              <span className="text-xs" style={{ color: GLASS_STYLES.accent }}>✓</span>
                            )}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFromHistory(item.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-opacity"
                            style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                          >
                            <Trash2 className="w-3 h-3" style={{ color: 'rgba(239, 68, 68, 0.7)' }} />
                          </button>
                        </div>
                        <p className="text-xs mt-1 truncate" style={{ color: GLASS_STYLES.textMuted }}>
                          {item.content.substring(0, 40)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
