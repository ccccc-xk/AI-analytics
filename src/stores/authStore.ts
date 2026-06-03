import { create } from 'zustand'
import { supabase } from '@/utils/supabase'
import type { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  getSession: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      set({ user: { id: user.id, email: user.email!, created_at: user.created_at, user_metadata: user.user_metadata } })
    }
    return { error: null }
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) return { error: error.message }
    return { error: null }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },

  refreshUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      set({ user: { id: user.id, email: user.email!, created_at: user.created_at, user_metadata: user.user_metadata } })
    }
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      set({
        user: {
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
          user_metadata: session.user.user_metadata,
        },
        loading: false,
      })
    } else {
      set({ user: null, loading: false })
    }
  },
}))
