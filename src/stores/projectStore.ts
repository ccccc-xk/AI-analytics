import { create } from 'zustand'
import type { Project } from '@/types'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void
  addProject: (project: Project) => void
  updateProject: (id: string, data: Partial<Project>) => void
  removeProject: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,

  setProjects: (projects) => set({ projects }),
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project],
  })),
  
  updateProject: (id, data) => set((state) => ({
    projects: state.projects.map((p) => (p.id === id ? { ...p, ...data } : p)),
  })),
  
  removeProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
  })),
  
  setLoading: (loading) => set({ loading }),
}))
