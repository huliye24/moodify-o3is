import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store'
import type { GenerateRequest, GenerateResponse } from '@/types'

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
