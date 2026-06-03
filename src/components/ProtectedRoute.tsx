import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, getSession } = useAuthStore()

  useEffect(() => {
    getSession()
  }, [getSession])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
