import { supabase } from '@/utils/supabase'
import type { ApiResponse } from '@/types'

export interface Share {
  id: string
  project_id: string
  token: string
  created_at: string
  expires_at: string | null
  created_by: string
}

export const sharesApi = {
  // Create a share link (tries RPC first, falls back to direct insert)
  async createShare(projectId: string): Promise<ApiResponse<Share>> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: null, error: '未登录' }

    const token = crypto.randomUUID().replace(/-/g, '') + Date.now().toString(36)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Try RPC function first (bypasses RLS issues)
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('create_share', {
          p_project_id: projectId,
          p_token: token,
          p_expires_at: expiresAt,
        })

      if (!rpcError && rpcData) {
        return { data: rpcData as Share, error: null }
      }
    } catch {
      // RPC function might not exist, fall through to direct insert
    }

    // Fallback: direct insert
    const { data, error } = await supabase
      .from('shares')
      .insert({
        project_id: projectId,
        token,
        created_by: user.id,
        expires_at: expiresAt,
      })
      .select()
      .single()

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // Get all shares for a project
  async getShares(projectId: string): Promise<ApiResponse<Share[]>> {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error: error.message }
    return { data, error: null }
  },

  // Get share by token (public access)
  async getShareByToken(token: string): Promise<ApiResponse<Share>> {
    const { data, error } = await supabase
      .from('shares')
      .select('*')
      .eq('token', token)
      .single()

    if (error) return { data: null, error: '分享链接无效或已过期' }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { data: null, error: '分享链接已过期' }
    }

    return { data, error: null }
  },

  // Delete a share
  async deleteShare(id: string): Promise<ApiResponse<null>> {
    const { error } = await supabase
      .from('shares')
      .delete()
      .eq('id', id)

    if (error) return { data: null, error: error.message }
    return { data: null, error: null }
  },
}
