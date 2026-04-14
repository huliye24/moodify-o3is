import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store'
import type { GenerateRequest, GenerateResponse, Options } from '@/types'

export function useProjects() {
  const { projects, setProjects, addProject, removeProject, setLoading, setError } = useStore()
  const [loading, setLocalLoading] = useState(false)

  const loadProjects = async () => {
    setLocalLoading(true)
    try {
      const data = await api.projects.list()
      setProjects(data.projects)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载项目失败')
    } finally {
      setLocalLoading(false)
    }
  }

  const createProject = async (name: string, description?: string) => {
    try {
      const project = await api.projects.create({ name, description })
      addProject(project)
      return project
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建项目失败')
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      await api.projects.delete(id)
      removeProject(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除项目失败')
      throw err
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  return { projects, loading: loading || useStore.getState().isLoading, loadProjects, createProject, deleteProject }
}

export function useO3ics(projectId?: string) {
  const { o3icsList, setO3icsList, addO3ics, removeO3ics, updateO3ics, setLoading, setError } = useStore()
  const [loading, setLocalLoading] = useState(false)

  const loadO3ics = async () => {
    setLocalLoading(true)
    try {
      const data = await api.o3ics.list({ project_id: projectId })
      setO3icsList(data.o3ics)
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载歌词失败')
    } finally {
      setLocalLoading(false)
    }
  }

  const generateO3ics = async (request: GenerateRequest): Promise<GenerateResponse> => {
    setLoading(true)
    try {
      const result = await api.o3ics.generate(request)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成歌词失败')
      throw err
    } finally {
      setLoading(false)
    }
  }

  const deleteO3ics = async (id: string) => {
    try {
      await api.o3ics.delete(id)
      removeO3ics(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除歌词失败')
      throw err
    }
  }

  const toggleFavorite = async (id: string) => {
    try {
      const result = await api.o3ics.toggleFavorite(id)
      const o3ics = o3icsList.find(o => o.id === id)
      if (o3ics) {
        updateO3ics({ ...o3ics, favorite: result.favorite })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败')
      throw err
    }
  }

  useEffect(() => {
    loadO3ics()
  }, [projectId])

  return { o3icsList, loading: loading || useStore.getState().isLoading, loadO3ics, generateO3ics, deleteO3ics, toggleFavorite }
}

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

export function useOptions() {
  const { options, setOptions } = useStore()

  const loadOptions = async () => {
    try {
      const data = await api.options()
      setOptions(data)
    } catch (err) {
      console.error('加载选项失败', err)
    }
  }

  useEffect(() => {
    if (!options) {
      loadOptions()
    }
  }, [])

  return options
}