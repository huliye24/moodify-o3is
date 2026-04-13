import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Download, Upload, Sparkles } from 'lucide-react'
import { useRules, useOptions } from '@/hooks'
import type { Rule, Options } from '@/types'

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectRule?: (rule: Rule) => void
}

export function RulesModal({ isOpen, onClose, onSelectRule }: RulesModalProps) {
  const { rules, loading, createRule, deleteRule, exportRule, importRule, loadRules } = useRules()
  const options = useOptions()
  const [selectedType, setSelectedType] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'custom',
    description: '',
    config: '',
    is_public: false,
  })

  useEffect(() => {
    if (isOpen) {
      loadRules(selectedType || undefined)
    }
  }, [isOpen, selectedType])

  if (!isOpen) return null

  const filteredRules = selectedType
    ? rules.filter(r => r.type === selectedType)
    : rules

  const handleCreate = async () => {
    if (!newRule.name.trim() || !newRule.config.trim()) return
    try {
      await createRule(newRule)
      setNewRule({ name: '', type: 'custom', description: '', config: '', is_public: false })
      setIsCreating(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importRule(file)
      loadRules()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">规则管理</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="select w-48"
            >
              <option value="">全部类型</option>
              {options?.ruleTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <button onClick={() => setIsCreating(true)} className="btn btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建规则
            </button>

            <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              导入规则
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        {isCreating && (
          <div className="p-6 bg-gray-50 border-b">
            <h3 className="font-medium mb-4">创建新规则</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="规则名称"
                className="input"
              />
              <select
                value={newRule.type}
                onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                className="select"
              >
                {options?.ruleTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <textarea
              value={newRule.config}
              onChange={(e) => setNewRule({ ...newRule, config: e.target.value })}
              placeholder="规则配置内容（每行一个关键词）"
              className="input min-h-[100px] mb-4"
            />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="btn btn-primary">创建</button>
              <button onClick={() => setIsCreating(false)} className="btn btn-secondary">取消</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : filteredRules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无规则</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRules.map((rule) => (
                <div key={rule.id} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{rule.name}</h4>
                      <span className="text-xs text-gray-500">{rule.type}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => exportRule(rule.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                        title="导出"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{rule.description}</p>
                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded font-mono whitespace-pre-wrap">
                    {rule.config}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>使用 {rule.use_count} 次</span>
                    <span>收藏 {rule.like_count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function RulesSection({ selectedRules, onToggle }: { selectedRules: string[]; onToggle: (type: string) => void }) {
  const { rules } = useRules()

  const groupedRules = rules.reduce((acc, rule) => {
    if (!acc[rule.type]) acc[rule.type] = []
    acc[rule.type].push(rule)
    return acc
  }, {} as Record<string, Rule[]>)

  return (
    <div className="card">
      <h3 className="font-semibold mb-4">启用规则</h3>
      <div className="space-y-4">
        {Object.entries(groupedRules).map(([type, typeRules]) => (
          <div key={type}>
            <h4 className="text-sm font-medium text-gray-700 mb-2 capitalize">{type}</h4>
            <div className="flex flex-wrap gap-2">
              {typeRules.slice(0, 5).map((rule) => (
                <button
                  key={rule.id}
                  onClick={() => onToggle(type)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedRules.includes(type)
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {rule.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}