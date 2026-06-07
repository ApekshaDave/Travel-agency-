import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function ProtectedRoute({ children, requiredRole, loginPath = '/login' }) {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 rounded-xl bg-gold-gradient flex items-center justify-center shadow-gold"
        >
          <Sparkles className="w-5 h-5 text-void" />
        </motion.div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (requiredRole) {
    const STAFF_ROLES = ['agent', 'admin', 'finance']
    if (!STAFF_ROLES.includes(user.role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}