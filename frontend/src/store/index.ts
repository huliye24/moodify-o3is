import { create } from 'zustand'
import type { Project, O3ics, Rule, Options } from '@/types'

interface AppState {
  projects: Project[]
  currentProject: Project | null
  o3icsList: O3ics[]
  rules: Rule[]
  options: Options | null
  isLoading: boolean
  error: string | null
  
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  setO3icsList: (o3icsList: O3ics[]) => void
  setRules: (rules: Rule[]) => void
  setOptions: (options: Options) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  addProject: (project: Project) => void
  removeProject: (id: string) => void
  addO3ics: (o3ics: O3ics) => void
  updateO3ics: (o3ics: O3ics) => void
  removeO3ics: (id: string) => void
  addRule: (rule: Rule) => void
  updateRule: (rule: Rule) => void
  removeRule: (id: string) => void
}

export const useStore = create<AppState>((set) => ({
  projects: [],
  currentProject: null,
  o3icsList: [],
  rules: [],
  options: null,
  isLoading: false,
  error: null,
  
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setO3icsList: (o3icsList) => set({ o3icsList }),
  setRules: (rules) => set({ rules }),
  setOptions: (options) => set({ options }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  removeProject: (id) => set((state) => ({ 
    projects: state.projects.filter(p => p.id !== id),
    currentProject: state.currentProject?.id === id ? null : state.currentProject,
  })),
  addO3ics: (o3ics) => set((state) => ({ o3icsList: [o3ics, ...state.o3icsList] })),
  updateO3ics: (o3ics) => set((state) => ({ 
    o3icsList: state.o3icsList.map(o => o.id === o3ics.id ? o3ics : o),
  })),
  removeO3ics: (id) => set((state) => ({ o3icsList: state.o3icsList.filter(o => o.id !== id) })),
  addRule: (rule) => set((state) => ({ rules: [rule, ...state.rules] })),
  updateRule: (rule) => set((state) => ({ 
    rules: state.rules.map(r => r.id === rule.id ? rule : r),
  })),
  removeRule: (id) => set((state) => ({ rules: state.rules.filter(r => r.id !== id) })),
}))