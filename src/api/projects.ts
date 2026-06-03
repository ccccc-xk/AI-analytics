import { supabase } from '@/utils/supabase'
import type { Project, ApiResponse } from '@/types'

export const projectsApi = {
  // 获取用户的所有项目
  async getProjects(): Promise<ApiResponse<Project[]>> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // 获取单个项目
  async getProject(id: string): Promise<ApiResponse<Project>> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // 创建项目
  async createProject(name: string, description?: string): Promise<ApiResponse<Project>> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: '未登录' }

    const { data, error } = await supabase
      .from('projects')
      .insert({ name, description, user_id: user.id })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // 更新项目
  async updateProject(id: string, updates: Partial<Project>): Promise<ApiResponse<Project>> {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // 删除项目
  async deleteProject(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) return { data: null, error: error.message }
    return { data: null, error: null }
  },
}
