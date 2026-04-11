import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Sparkles, AlertCircle, Loader2, Copy, Wand2, Download, Upload, MessageSquare } from 'lucide-react'

interface Rule {
  id: number
  name: string
  type: 'emotion' | 'theme' | 'style' | 'rhyme' | 'length' | 'custom'
  config: string
  priority: number
  isActive: boolean
  author?: string
  version?: string
  tags?: string[]
  description?: string
  createdAt: string
}

interface GeneratedRule {
  name: string
  type: string
  config: string
  description: string
  tags: string[]
}

const RULE_TYPES = [
  { value: 'emotion', label: '情感', description: '定义情感基调关键词' },
  { value: 'theme', label: '主题', description: '定义歌曲主题关键词' },
  { value: 'style', label: '风格', description: '定义音乐风格描述' },
  { value: 'rhyme', label: '韵律', description: '定义韵律规则' },
  { value: 'length', label: '长度', description: '定义歌曲长度偏好' },
  { value: 'custom', label: '自定义', description: '自定义提示词模板' }
]

export default function RulesModal({ onClose }: { onClose: () => void }) {
  const [rules, setRules] = useState<Rule[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [error, setError] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null)

  // AI 生成对话框
  const [showAIGenerate, setShowAIGenerate] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResult, setAiResult] = useState<GeneratedRule[]>([])
  const [selectedRules, setSelectedRules] = useState<Set<number>>(new Set())
  const [generatingResult, setGeneratingResult] = useState(false)

  // 表单状态
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState<string>('emotion')
  const [formConfig, setFormConfig] = useState('')
  const [formPriority, setFormPriority] = useState(5)
  const [formAuthor, setFormAuthor] = useState('')
  const [formVersion, setFormVersion] = useState('1.0')
  const [formTags, setFormTags] = useState('')
  const [formDescription, setFormDescription] = useState('')

  useEffect(() => {
    loadRules()
  }, [])

  const loadRules = async () => {
    try {
      const data = await window.api.rules.getAll()
      setRules(data)
    } catch (err) {
      console.error('加载规则失败:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formName.trim() || !formConfig.trim()) {
      setError('请填写规则名称和配置内容')
      return
    }

    try {
      const ruleData = {
        name: formName,
        type: formType,
        config: formConfig,
        priority: formPriority,
        author: formAuthor || undefined,
        version: formVersion || undefined,
        tags: formTags ? formTags.split(',').map(t => t.trim()).filter(Boolean) : [],
        description: formDescription || undefined
      }

      if (editingRule) {
        await window.api.rules.update(editingRule.id, {
          name: formName,
          config: formConfig,
          priority: formPriority
        })
      } else {
        await window.api.rules.create(ruleData)
      }
      await loadRules()
      resetForm()
    } catch (err: any) {
      setError(err.message || '保存失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条规则吗？')) return
    try {
      await window.api.rules.delete(id)
      await loadRules()
    } catch (err) {
      console.error('删除失败:', err)
    }
  }

  const handleToggle = async (rule: Rule) => {
    try {
      await window.api.rules.update(rule.id, {
        isActive: !rule.isActive
      })
      await loadRules()
    } catch (err) {
      console.error('切换失败:', err)
    }
  }

  const startEdit = (rule: Rule) => {
    setEditingRule(rule)
    setFormName(rule.name)
    setFormType(rule.type)
    setFormConfig(rule.config)
    setFormPriority(rule.priority)
    setFormAuthor(rule.author || '')
    setFormVersion(rule.version || '1.0')
    setFormTags(rule.tags?.join(', ') || '')
    setFormDescription(rule.description || '')
    setShowAddForm(true)
  }

  const resetForm = () => {
    setShowAddForm(false)
    setEditingRule(null)
    setFormName('')
    setFormType('emotion')
    setFormConfig('')
    setFormPriority(5)
    setFormAuthor('')
    setFormVersion('1.0')
    setFormTags('')
    setFormDescription('')
    setError('')
  }

  // AI 生成规则
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setError('请输入创作方向描述')
      return
    }

    setGeneratingResult(true)
    setError('')
    setAiResult([])

    try {
      const prompt = `你是一个歌词创作规则助手。请根据用户描述的创作方向，生成3-5个规则。

用户创作方向：${aiPrompt}

请为歌词创作生成规则，规则类型包括：
- emotion（情感）：定义情感基调关键词，如"释怀"、"迷茫"、"喜悦"等
- theme（主题）：定义歌曲主题，如"成长"、"怀旧"、"梦想"等
- style（风格）：定义音乐风格，如"国风"、"民谣"、"摇滚"等

请按以下JSON格式输出（不要包含任何其他内容）：
{
  "rules": [
    {
      "name": "规则名称",
      "type": "emotion/theme/style/rhyme/length",
      "description": "规则的简短描述",
      "tags": ["标签1", "标签2"],
      "config": "关键词1\n关键词2\n关键词3"
    }
  ]
}

要求：
- 每个规则生成8-12个关键词
- 关键词要符合中文歌词创作习惯
- config中的关键词用换行分隔
- 只输出JSON，不要其他解释`

      const response = await window.api.deepseek.generate({
        systemPrompt: '你是一个专业的歌词创作助手，擅长生成情感词库和创作规则。请只输出JSON格式。',
        userPrompt: prompt
      })

      // 解析 JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0])
        if (data.rules && Array.isArray(data.rules)) {
          setAiResult(data.rules.map((r: any, idx: number) => ({
            name: r.name || `未命名规则${idx + 1}`,
            type: r.type || 'emotion',
            config: r.config || '',
            description: r.description || '',
            tags: Array.isArray(r.tags) ? r.tags : []
          })))
        }
      } else {
        setError('AI返回格式有误，请重试')
      }
    } catch (err: any) {
      setError(err.message || 'AI生成失败，请重试')
    } finally {
      setGeneratingResult(false)
    }
  }

  // 保存选中的AI生成规则
  const handleSaveSelectedRules = async () => {
    if (selectedRules.size === 0) {
      setError('请选择要保存的规则')
      return
    }

    try {
      for (const idx of selectedRules) {
        const rule = aiResult[idx]
        await window.api.rules.create({
          name: rule.name,
          type: rule.type,
          config: rule.config,
          priority: 5,
          author: 'AI生成',
          version: '1.0',
          tags: rule.tags,
          description: rule.description
        })
      }
      await loadRules()
      setShowAIGenerate(false)
      setAiPrompt('')
      setAiResult([])
      setSelectedRules(new Set())
    } catch (err: any) {
      setError(err.message || '保存失败')
    }
  }

  // 导出规则
  const handleExportRule = async (rule: Rule) => {
    const exportData = {
      name: rule.name,
      type: rule.type,
      config: rule.config,
      author: rule.author,
      version: rule.version,
      tags: rule.tags,
      description: rule.description,
      priority: rule.priority
    }

    const jsonStr = JSON.stringify(exportData, null, 2)
    await navigator.clipboard.writeText(jsonStr)
    setCopiedConfig(rule.id.toString())
    setTimeout(() => setCopiedConfig(null), 2000)
  }

  // 导入规则
  const handleImport = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (!text.trim()) {
        setError('剪贴板为空')
        return
      }

      // 尝试解析 JSON
      try {
        const data = JSON.parse(text)
        if (data.name && data.config) {
          setFormName(data.name)
          setFormType(data.type || 'emotion')
          setFormConfig(data.config)
          setFormPriority(data.priority || 5)
          setFormAuthor(data.author || '')
          setFormVersion(data.version || '1.0')
          setFormTags(Array.isArray(data.tags) ? data.tags.join(', ') : '')
          setFormDescription(data.description || '')
          setShowAddForm(true)
          return
        }
      } catch {
        // 不是JSON，尝试按行解析
      }

      // 按行解析
      const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
      if (lines.length > 0) {
        setFormConfig(lines.join('\n'))
        setFormName('导入规则')
        setShowAddForm(true)
      }
    } catch (err) {
      setError('导入失败，请确保剪贴板有内容')
    }
  }

  // 批量导出所有规则
  const handleExportAll = () => {
    const exportData = rules.map(rule => ({
      name: rule.name,
      type: rule.type,
      config: rule.config,
      author: rule.author,
      version: rule.version,
      tags: rule.tags,
      description: rule.description,
      priority: rule.priority
    }))

    const jsonStr = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `moodify-rules-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 按类型分组规则
  const groupedRules = RULE_TYPES.map(type => ({
    ...type,
    rules: rules.filter(r => r.type === type.value)
  }))

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-300 rounded-xl w-full max-w-4xl border border-gray-700 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            规则管理
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-dark-200 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 工具栏 */}
        <div className="px-6 py-3 border-b border-gray-700 bg-dark-200 flex flex-wrap gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-sm flex items-center gap-1.5 px-3 py-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            新增规则
          </button>
          <button
            onClick={() => setShowAIGenerate(true)}
            className="btn-secondary text-sm flex items-center gap-1.5 px-3 py-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            AI生成规则
          </button>
          <button
            onClick={handleImport}
            className="btn-secondary text-sm flex items-center gap-1.5 px-3 py-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            导入
          </button>
          <button
            onClick={handleExportAll}
            disabled={rules.length === 0}
            className="btn-secondary text-sm flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            导出全部
          </button>
        </div>

        {/* 新增/编辑表单 */}
        {showAddForm ? (
          <div className="p-6 border-b border-gray-700 bg-dark-200">
            <h3 className="text-sm font-medium text-gray-300 mb-4">
              {editingRule ? '编辑规则' : '新增规则'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">规则名称</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="input-field text-sm"
                    placeholder="例如: 悲伤情感词库"
                  />
                </div>
                {!editingRule && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">规则类型</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="input-field text-sm"
                    >
                      {RULE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">作者（可选）</label>
                  <input
                    type="text"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="input-field text-sm"
                    placeholder="规则创建者"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">版本（可选）</label>
                  <input
                    type="text"
                    value={formVersion}
                    onChange={(e) => setFormVersion(e.target.value)}
                    className="input-field text-sm"
                    placeholder="1.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="input-field text-sm"
                  placeholder="例如: 爱情, 失恋, 疗愈"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">规则描述（可选）</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input-field text-sm"
                  placeholder="简要描述这个规则的用途"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">
                  {RULE_TYPES.find(t => t.value === formType)?.description}
                </label>
                <textarea
                  value={formConfig}
                  onChange={(e) => setFormConfig(e.target.value)}
                  className="input-field text-sm h-32 resize-none"
                  placeholder={
                    formType === 'custom'
                      ? '在此输入自定义的提示词模板...\n可用变量: {{content}}, {{emotion}}, {{style}}, {{theme}}, {{rhyme}}, {{length}}'
                      : '在此输入关键词或配置内容，每行一条'
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">优先级 (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formPriority}
                    onChange={(e) => setFormPriority(parseInt(e.target.value) || 5)}
                    className="input-field text-sm w-24"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-5">
                  优先级高的规则优先生效
                </p>
              </div>
              {error && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-200">{error}</span>
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={handleSave} className="btn-primary px-4">
                  {editingRule ? '保存修改' : '添加规则'}
                </button>
                <button onClick={resetForm} className="btn-secondary px-4">
                  取消
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* 规则列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>暂无规则，使用上方按钮添加</p>
              <p className="text-xs mt-2">点击"AI生成规则"快速创建，或手动添加</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedRules.filter(g => g.rules.length > 0).map(group => (
                <div key={group.value}>
                  <h4 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary-500" />
                    {group.label}
                    <span className="text-xs text-gray-500">({group.rules.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {group.rules.map(rule => (
                      <div
                        key={rule.id}
                        className={`p-3 rounded-lg border transition-colors ${
                          rule.isActive
                            ? 'bg-dark-200 border-gray-700'
                            : 'bg-dark-300 border-gray-800 opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="text-sm font-medium">{rule.name}</h5>
                              <span className="text-xs text-gray-500">优先级: {rule.priority}</span>
                              {rule.author && (
                                <span className="text-xs text-gray-500">作者: {rule.author}</span>
                              )}
                            </div>
                            {rule.description && (
                              <p className="text-xs text-gray-400 mt-1">{rule.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1 line-clamp-2 whitespace-pre-wrap">
                              {rule.config.substring(0, 80)}
                              {rule.config.length > 80 ? '...' : ''}
                            </p>
                            {rule.tags && rule.tags.length > 0 && (
                              <div className="flex gap-1 mt-2 flex-wrap">
                                {rule.tags.slice(0, 5).map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-dark-100 rounded text-xs text-gray-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-1 mt-2 flex-wrap">
                              <button
                                onClick={() => handleExportRule(rule)}
                                className="text-xs text-gray-500 hover:text-primary-400 flex items-center gap-1"
                              >
                                <Copy className="w-3 h-3" />
                                {copiedConfig === rule.id.toString() ? '已复制' : '导出'}
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleToggle(rule)}
                              className={`p-2 rounded-lg transition-colors ${
                                rule.isActive
                                  ? 'text-green-400 hover:bg-green-600/20'
                                  : 'text-gray-500 hover:bg-dark-100'
                              }`}
                              title={rule.isActive ? '禁用' : '启用'}
                            >
                              {rule.isActive ? (
                                <ToggleRight className="w-5 h-5" />
                              ) : (
                                <ToggleLeft className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              onClick={() => startEdit(rule)}
                              className="p-2 hover:bg-dark-100 rounded-lg text-gray-400 hover:text-white transition-colors"
                              title="编辑"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(rule.id)}
                              className="p-2 hover:bg-red-600/20 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-700 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            共 {rules.length} 条规则，{rules.filter(r => r.isActive).length} 条启用
          </p>
          <button onClick={onClose} className="btn-secondary px-6">
            关闭
          </button>
        </div>
      </div>

      {/* AI 生成规则对话框 */}
      {showAIGenerate && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-dark-300 rounded-xl w-full max-w-2xl border border-gray-700 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-primary-400" />
                AI 生成规则
              </h3>
              <button
                onClick={() => {
                  setShowAIGenerate(false)
                  setAiPrompt('')
                  setAiResult([])
                  setSelectedRules(new Set())
                  setError('')
                }}
                className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              <div>
                <label className="block text-sm text-gray-300 mb-2">
                  描述你的创作方向
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="input-field text-sm h-24 resize-none"
                  placeholder="例如：我想写一首关于失恋后逐渐释怀的抒情歌曲，带有一点民谣风格..."
                />
              </div>

              <button
                onClick={handleAIGenerate}
                disabled={generatingResult || !aiPrompt.trim()}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {generatingResult ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    生成规则
                  </>
                )}
              </button>

              {error && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-lg px-3 py-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-200">{error}</span>
                </div>
              )}

              {aiResult.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-400">
                      生成了 {aiResult.length} 个规则，请选择要保存的：
                    </p>
                    <button
                      onClick={() => {
                        if (selectedRules.size === aiResult.length) {
                          setSelectedRules(new Set())
                        } else {
                          setSelectedRules(new Set(aiResult.map((_, i) => i)))
                        }
                      }}
                      className="text-xs text-primary-400 hover:underline"
                    >
                      {selectedRules.size === aiResult.length ? '取消全选' : '全选'}
                    </button>
                  </div>

                  {aiResult.map((rule, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedRules.has(idx)
                          ? 'bg-primary-900/20 border-primary-600'
                          : 'bg-dark-200 border-gray-700 hover:border-gray-600'
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedRules)
                        if (newSelected.has(idx)) {
                          newSelected.delete(idx)
                        } else {
                          newSelected.add(idx)
                        }
                        setSelectedRules(newSelected)
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="checkbox"
                          checked={selectedRules.has(idx)}
                          onChange={() => {}}
                          className="w-4 h-4 rounded accent-primary-500"
                        />
                        <span className="font-medium">{rule.name}</span>
                        <span className="px-2 py-0.5 bg-dark-100 rounded text-xs text-gray-400">
                          {RULE_TYPES.find(t => t.value === rule.type)?.label || rule.type}
                        </span>
                      </div>
                      {rule.description && (
                        <p className="text-sm text-gray-400 mb-2 ml-7">{rule.description}</p>
                      )}
                      {rule.tags.length > 0 && (
                        <div className="flex gap-1 ml-7 mb-2 flex-wrap">
                          {rule.tags.map((tag, tagIdx) => (
                            <span key={tagIdx} className="px-2 py-0.5 bg-dark-100 rounded text-xs text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 ml-7 line-clamp-2 whitespace-pre-wrap">
                        {rule.config}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAIGenerate(false)
                  setAiPrompt('')
                  setAiResult([])
                  setSelectedRules(new Set())
                  setError('')
                }}
                className="btn-secondary px-4"
              >
                取消
              </button>
              <button
                onClick={handleSaveSelectedRules}
                disabled={selectedRules.size === 0}
                className="btn-primary px-4 disabled:opacity-50"
              >
                保存选中规则 ({selectedRules.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
