import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useStore } from '@/store'
import type { GenerateRequest, GenerateResponse } from '@/types'

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
