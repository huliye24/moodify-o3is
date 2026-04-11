import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Edit2, Check, ChevronDown, ChevronRight, Settings } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Rule } from '../types'

const RULE_TYPES = [
  { value: 'emotion', label: '情感规则' },
  { value: 'theme', label: '主题规则' },
  { value: 'style', label: '风格规则' },
  { value: 'rhyme', label: '韵律规则' },
  { value: 'length', label: '长度规则' }
]

const TYPE_COLORS: Record<string, string> = {
  emotion: 'bg-purple-500',
  theme: 'bg-blue-500',
  style: 'bg-green-500',
  rhyme: 'bg-amber-500',
  length: 'bg-pink-500'
}

export default function RulesModal({ onClose }: { onClose: () => void }) {
  const { rules, loadRules } = useStore()
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showNewRule, setShowNewRule] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [newRuleName, setNewRuleName] = useState('')
  const [newRuleType, setNewRuleType] = useState('emotion')
  const [newRuleConfig, setNewRuleConfig] = useState('')

  useEffect(() => {
    loadRules()
  }, [loadRules])

  const filteredRules = selectedType === 'all'
    ? rules
    : rules.filter((r) => r.type === selectedType)

  const groupedRules = RULE_TYPES.reduce((acc, type) => {
    acc[type.value] = rules.filter((r) => r.type === type.value)
    return acc
  }, {} as Record<string, Rule[]>)

  const handleCreateRule = async () => {
    if (!newRuleName.trim() || !newRuleConfig.trim()) return

    try {
      await window.api.rules.create({
        name: newRuleName.trim(),
        type: newRuleType,
        config: newRuleConfig.trim()
      })
      await loadRules()
      setNewRuleName('')
      setNewRuleConfig('')
      setShowNewRule(false)
    } catch (error) {
      console.error('创建规则失败:', error)
    }
  }

  const handleUpdateRule = async () => {
    if (!editingRule || !newRuleName.trim() || !newRuleConfig.trim()) return

    try {
      await window.api.rules.update(editingRule.id, {
        name: newRuleName.trim(),
        config: newRuleConfig.trim()
      })
      await loadRules()
      setEditingRule(null)
      setNewRuleName('')
      setNewRuleConfig('')
    } catch (error) {
      console.error('更新规则失败:', error)
    }
  }

  const handleDeleteRule = async (id: number) => {
    if (!confirm('确定删除��条规则吗？')) return

    try {
      await window.api.rules.delete(id)
      await loadRules()
    } catch (error) {
      console.error('删除规则失败:', error)
    }
  }

  const handleToggleRule = async (rule: Rule) => {
    try {
      await window.api.rules.update(rule.id, { isActive: !rule.isActive })
      await loadRules()
    } catch (error) {
      console.error('切换规则状态失败:', error)
    }
  }

  const startEdit = (rule: Rule) => {
    setEditingRule(rule)
    setNewRuleName(rule.name)
    setNewRuleConfig(rule.config)
    setShowNewRule(false)
  }

  const cancelEdit = () => {
    setEditingRule(null)
    setNewRuleName('')
    setNewRuleConfig('')
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-dark-300 rounded-xl w-full max-w-3xl max-h-[80vh] border border-gray-700 shadow-2xl flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            规则管理
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-hidden flex">
          {/* 左侧类型列表 */}
          <div className="w-48 border-r border-gray-700 p-4 overflow-y-auto">
            <button
              onClick={() => { setSelectedType('all'); setShowNewRule(false); cancelEdit() }}
              className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors ${
                selectedType === 'all' ? 'bg-primary-600 text-white' : 'hover:bg-dark-200'
              }`}
            >
              全部规则 ({rules.length})
            </button>
            {RULE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => { setSelectedType(type.value); setShowNewRule(false); cancelEdit() }}
                className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition-colors flex items-center gap-2 ${
                  selectedType === type.value ? 'bg-primary-600 text-white' : 'hover:bg-dark-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[type.value]}`} />
                {type.label} ({groupedRules[type.value]?.length || 0})
              </button>
            ))}
          </div>

          {/* 右侧规则列表 */}
          <div className="flex-1 p-4 overflow-y-auto">
            {/* 新建规则表单 */}
            {(showNewRule || editingRule) && (
              <div className="bg-dark-100 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium mb-3">
                  {editingRule ? '编辑规则' : '新建规则'}
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">规则名称</label>
                    <input
                      type="text"
                      value={newRuleName}
                      onChange={(e) => setNewRuleName(e.target.value)}
                      placeholder="例如：悲伤情感"
                      className="input-field text-sm"
                    />
                  </div>
                  {!editingRule && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">规则类型</label>
                      <select
                        value={newRuleType}
                        onChange={(e) => setNewRuleType(e.target.value)}
                        className="input-field text-sm"
                      >
                        {RULE_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">配置内容 (JSON)</label>
                    <textarea
                      value={newRuleConfig}
                      onChange={(e) => setNewRuleConfig(e.target.value)}
                      placeholder='{"keywords": ["悲伤", "难过"], "tone": "忧伤"}'
                      className="input-field text-sm min-h-[100px] font-mono"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={editingRule ? handleUpdateRule : handleCreateRule}
                      className="btn-primary text-sm flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      {editingRule ? '保存修改' : '创建规则'}
                    </button>
                    <button
                      onClick={() => { setShowNewRule(false); cancelEdit() }}
                      className="btn-secondary text-sm"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 新建按钮 */}
            {!showNewRule && !editingRule && (
              <button
                onClick={() => setShowNewRule(true)}
                className="w-full btn-secondary mb-4 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                新建规则
              </button>
            )}

            {/* 规则列表 */}
            <div className="space-y-2">
              {filteredRules.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  暂无{selectedType === 'all' ? '' : RULE_TYPES.find(t => t.value === selectedType)?.label}规则
                </p>
              ) : (
                filteredRules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`bg-dark-100 rounded-lg p-4 border ${
                      rule.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[rule.type]}`} />
                          <h4 className="font-medium">{rule.name}</h4>
                          <span className="text-xs bg-dark-300 px-2 py-0.5 rounded text-gray-400">
                            {RULE_TYPES.find(t => t.value === rule.type)?.label}
                          </span>
                          {!rule.isActive && (
                            <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-400">
                              已禁用
                            </span>
                          )}
                        </div>
                        <pre className="text-xs text-gray-400 bg-dark-300 p-2 rounded overflow-x-auto">
                          {JSON.stringify(JSON.parse(rule.config), null, 2)}
                        </pre>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => handleToggleRule(rule)}
                          className={`px-3 py-1 rounded text-xs ${
                            rule.isActive
                              ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                              : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                          }`}
                        >
                          {rule.isActive ? '禁用' : '启用'}
                        </button>
                        <button
                          onClick={() => startEdit(rule)}
                          className="p-2 hover:bg-dark-300 rounded text-gray-400 hover:text-white"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 hover:bg-red-600/20 rounded text-gray-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}