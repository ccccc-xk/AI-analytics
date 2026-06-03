import { useCallback } from 'react'
import { message } from 'antd'
import { useProjectStore } from '@/stores/projectStore'
import { projectsApi } from '@/api/projects'

export const useProjects = () => {
  const { projects, loading, setProjects, addProject, updateProject, removeProject, setLoading } =
    useProjectStore()

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    const { data, error } = await projectsApi.getProjects()
    if (error) {
      message.error('加载项目失败：' + error)
    } else if (data) {
      setProjects(data)
    }
    setLoading(false)
  }, [setProjects, setLoading])

  const createProject = useCallback(
    async (name: string, description?: string) => {
      const { data, error } = await projectsApi.createProject(name, description)
      if (error) {
        message.error('创建失败：' + error)
        return false
      }
      if (data) {
        addProject(data)
        message.success('项目创建成功')
        return true
      }
      return false
    },
    [addProject],
  )

  const editProject = useCallback(
    async (id: string, name: string, description?: string) => {
      const { data, error } = await projectsApi.updateProject(id, { name, description })
      if (error) {
        message.error('更新失败：' + error)
        return false
      }
      if (data) {
        updateProject(id, data)
        message.success('项目更新成功')
        return true
      }
      return false
    },
    [updateProject],
  )

  const deleteProject = useCallback(
    async (id: string) => {
      const { error } = await projectsApi.deleteProject(id)
      if (error) {
        message.error('删除失败：' + error)
        return false
      }
      removeProject(id)
      message.success('项目已删除')
      return true
    },
    [removeProject],
  )

  return {
    projects,
    loading,
    fetchProjects,
    createProject,
    editProject,
    deleteProject,
  }
}
