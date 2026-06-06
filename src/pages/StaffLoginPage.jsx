import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StaffLoginPage() {
  const navigate = useNavigate()
  
  useEffect(() => {
    navigate('/login?tab=agency', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
