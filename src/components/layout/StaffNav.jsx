import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, AlertTriangle, Map, DollarSign,
  Bell, Home
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const STAFF_NAV = [
  { to: '/staff', label: 'Staff Home', icon: Home },
  { to: '/agent', label: 'Agent Desk', icon: AlertTriangle, badge: 'Urgent' },
  { to: '/agent/trips', label: 'Customer Trips', icon: Map },
  { to: '/finance', label: 'Finance Office', icon: DollarSign },
  { to: '/finance/notifications', label: 'Admin Alerts', icon: Bell, badge: '3' },
]

export default function StaffNav() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-void/95 backdrop-blur border-b border-ocean/15">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-11">

        {/* Staff nav links */}
        <div className="flex items-center gap-1 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          <span className="text-[10px] text-ocean/80 font-bold uppercase tracking-wider mr-3 flex-shrink-0 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-ocean" /> Staff Portal
          </span>
          {STAFF_NAV.map(({ to, label, icon: Icon, badge }) => {
            const isActive = pathname === to || pathname.startsWith(to + '/')
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${isActive
                    ? 'bg-ocean/10 text-ocean border border-ocean/25 shadow-sm shadow-ocean/5'
                    : 'text-muted hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
                {badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-coral/20 text-coral">
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Right — user context */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <span className="text-muted text-xs hidden sm:block">
            {user?.name} · <span className="text-ocean capitalize font-semibold">{user?.role}</span>
          </span>
        </div>
      </div>
    </div>
  )
}