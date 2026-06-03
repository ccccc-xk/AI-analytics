import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from '@/layouts/AppLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import ProjectsPage from '@/pages/ProjectsPage'
import ProjectDetail from '@/pages/ProjectDetail'
import ProjectAnalysis from '@/pages/ProjectAnalysis'
import ShareView from '@/pages/ShareView'
import Admin from '@/pages/Admin'
import SettingsPage from '@/pages/SettingsPage'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/utils/supabase'

function App() {
  const { getSession } = useAuthStore()

  useEffect(() => {
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        useAuthStore.setState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
          },
        })
      } else {
        useAuthStore.setState({ user: null })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [getSession])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:token" element={<ShareView />} />

        {/* Protected routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/projects/:id/analysis" element={<ProjectAnalysis />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
