import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { message } from 'antd'

export const useAuth = () => {
  const navigate = useNavigate()
  const { user, loading, signIn, signUp, signOut, getSession } = useAuthStore()

  const handleSignIn = useCallback(async (email: string, password: string) => {
    const { error } = await signIn(email, password)
    if (error) {
      message.error(error)
      return false
    }
    message.success('登录成功')
    navigate('/dashboard')
    return true
  }, [signIn, navigate])

  const handleSignUp = useCallback(async (email: string, password: string) => {
    const { error } = await signUp(email, password)
    if (error) {
      message.error(error)
      return false
    }
    message.success('注册成功，请登录')
    navigate('/login')
    return true
  }, [signUp, navigate])

  const handleSignOut = useCallback(async () => {
    await signOut()
    message.success('已退出登录')
    navigate('/login')
  }, [signOut, navigate])

  return {
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
    getSession,
  }
}
