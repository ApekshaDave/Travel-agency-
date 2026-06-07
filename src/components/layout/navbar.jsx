import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Building2, Map,
  LayoutDashboard, Menu, X,
  Sparkles, RefreshCw,
  ChevronDown, ArrowRight, LogIn,
  AlertTriangle, DollarSign, Bell, LogOut, Globe2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
const NAV_LINKS = [
  { to: '/trip-builder', label: 'Trip Builder', icon: Map },
  { to: '/visa', label: 'Visa Checker', icon: Globe2 },
  { to: '/chat', label: 'AI Chat', icon: Sparkles },
]

const USER_LINKS = [
  { to: '/dashboard', label: 'My Trips', icon: LayoutDashboard },
  { to: '/post-booking', label: 'Manage Booking', icon: RefreshCw },
  { to: '/corporate', label: 'Corporate', icon: Building2 },
]

function GenericDropdown({ label, links, active, isStaff }) {
  const [open, setOpen] = useState(false)
  const hasActive = links.some(l => active === l.to || active.startsWith(l.to + '/'))

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${hasActive
        ? isStaff ? 'text-accent-500 font-semibold' : 'text-brand-600 font-semibold'
        : 'text-slate-600 hover:text-slate-900'
        }`}>
        {label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full right-0 mt-2 w-52 bg-white border rounded-2xl p-1.5 shadow-xl z-50 ${isStaff ? 'border-accent-200' : 'border-brand-100'
              }`}
          >
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = active === to || active.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive
                    ? isStaff ? 'bg-accent-50 text-accent-600 font-semibold' : 'bg-brand-50 text-brand-600 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isStaff ? 'text-accent-500' : 'text-brand-500') : 'text-slate-400'}`} />
                  {label}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const active = location.pathname
  const { user, logout } = useAuth()

  const isStaff = user && (user.role === 'agent' || user.role === 'admin' || user.role === 'finance')

  // Check if we're on the hero homepage (dark bg) so we use white text
  const isHeroPage = active === '/' // Keep this for potential future dark hero sections

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully')
    setMobileOpen(false)
  }

  const staffLinks = [
    { to: '/agent', label: 'Agent Desk', icon: AlertTriangle },
    { to: '/finance', label: 'Finance Office', icon: DollarSign },
    { to: '/finance/notifications', label: 'Admin Alerts', icon: Bell }
  ]

  // Determine nav style based on page + scroll
  const navBg = scrolled || !isHeroPage // Always light for now, unless hero is dark
    ? 'bg-white/90 backdrop-blur-md border-b border-border shadow-sm'
    : 'bg-transparent border-b border-border/0'

  const logoTextColor = (!scrolled && isHeroPage) ? 'text-slate-900' : 'text-brand-primary'
  const linkColor = (!scrolled && isHeroPage) ? 'text-white/80 hover:text-white' : 'text-slate-600 hover:text-slate-900'
  const activeColor = (!scrolled && isHeroPage) ? 'text-white font-bold' : 'text-brand-primary font-bold'

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-brand-sm">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className={`font-display font-bold text-xl transition-colors ${logoTextColor}`}>VoyageAI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(link => {
            const isLinkActive = active === link.to || active.startsWith(link.to + '/')
            if (link.primary) return null
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isLinkActive ? `bg-brand-primary/10 ${activeColor}` : linkColor
                  } hover:bg-slate-100`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop Right Context */}
        <div className="hidden lg:flex items-center gap-3">
          {!isStaff && (
            <GenericDropdown label="My Journey" links={USER_LINKS} active={active} />
          )}
          {isStaff && (
            <GenericDropdown label="Staff Desk" links={staffLinks} active={active} isStaff />
          )}

          <div className="w-px h-6 bg-slate-200 mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                  {user.role === 'user' ? 'Customer' : user.agencyName || 'Staff'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/chat"
                className="flex items-center gap-2 px-5 py-2 bg-brand-gradient text-white text-sm font-bold rounded-full shadow-brand hover:shadow-brand/40 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                AI Assistant
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`lg:hidden p-2 rounded-xl transition-colors ${(!scrolled && isHeroPage) ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transition: { duration: 0.2 } }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-slate-100 overflow-y-auto max-h-[85vh] shadow-xl"
          >
            <div className="p-5 space-y-5">
              {/* Plan Section */}
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-brand-600 mb-3 px-3 font-bold">Plan Your Trip</p>
                {NAV_LINKS.map(l => {
                  const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl font-medium transition-all ${isLinkActive
                        ? 'text-brand-600 bg-brand-50 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                      <l.icon className={`w-4 h-4 ${isLinkActive ? 'text-brand-500' : 'text-slate-400'}`} />
                      {l.label}
                    </Link>
                  )
                })}
                {/* AI Assistant link for mobile */}
              </div>

              {/* My Travel (for customers) */}
              {!isStaff && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-3 px-3 font-bold">My Travel</p>
                  {USER_LINKS.map(l => {
                    const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                    return (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${isLinkActive ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <l.icon className="w-4 h-4 text-slate-400" />
                        {l.label}
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Staff Desk */}
              {isStaff && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-accent-500 mb-3 px-3 font-bold">Staff Desk</p>
                  {staffLinks.map(l => {
                    const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                    return (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${isLinkActive ? 'text-accent-600 bg-accent-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                        <l.icon className="w-4 h-4 text-slate-400" />
                        {l.label}
                      </Link>
                    )
                  })}
                </div>
              )}

              {/* Auth */}
              <div className="pt-4 border-t border-slate-100">
                {user ? (
                  <div className="space-y-3">
                    <div className="px-3 py-2 bg-slate-50 rounded-xl">
                      <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-2.5 border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-slate-50"
                    >
                      <LogIn className="w-4 h-4" /> Sign In
                    </Link>
                    <Link
                      to="/chat"
                      onClick={() => setMobileOpen(false)}
                      className="w-full py-3 bg-brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-brand"
                    >
                      <Sparkles className="w-4 h-4" /> Try AI Assistant <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
