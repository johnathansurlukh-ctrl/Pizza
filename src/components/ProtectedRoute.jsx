import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-4xl animate-spin">🍕</div>
    </div>
  )

  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}
