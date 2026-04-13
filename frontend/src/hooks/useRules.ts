import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store'

export function useRules() {
  const { rules, setRules, addRule, removeRule, updateRule, setError } = useStore()
  const [loading, setLoading] = useState(false)

  const loadRules = async (type?: string) => {
    setLoading(true)
    try {
      const data = await api.rules.list({ type })
      setRules(data.rules)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载规则失败')
    } finally {
      setLoading(false)
    }
  }

  const createRule = async (rule: Partial<{ name: string; type: string; description: string; config: string; tags: string; is_public: boolean }>) => {
    try {
      const newRule = await api.rules.create(rule)
      addRule(newRule)
      return newRule
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建规则失败')
      throw err
    }
  }

  const deleteRule = async (id: string) => {
    try {
      await api.rules.delete(id)
      removeRule(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除规则失败')
      throw err
    }
  }

  const exportRule = async (id: string) => {
    try {
      const rule = await api.rules.export(id)
      const json = JSON.stringify(rule, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${rule.name}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出规则失败')
      throw err
    }
  }

  const importRule = async (file: File) => {
    try {
      const text = await file.text()
      const rule = JSON.parse(text)
      const newRule = await api.rules.import(rule)
      return newRule.id
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入规则失败')
      throw err
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  return { rules, loading, loadRules, createRule, deleteRule, exportRule, importRule }
}