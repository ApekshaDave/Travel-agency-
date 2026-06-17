import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plane, Building2,
  LayoutDashboard, Menu, X,
  Sparkles, RefreshCw,
  ChevronDown, ArrowRight, LogIn,
  AlertTriangle, DollarSign, Bell, LogOut, User,
  FileText, Users
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const NAV_LINKS = []

const USER_LINKS = []

const STAFF_LINKS = []

function GenericDropdown({ label, links, active, isStaff }) {
  const [open, setOpen] = useState(false)
  const hasActive = links.some(l => active === l.to || active.startsWith(l.to + '/'))

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        hasActive
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
            className={`absolute top-full right-0 mt-2 w-52 bg-white border rounded-2xl p-1.5 shadow-xl z-50 ${
              isStaff ? 'border-accent-200' : 'border-brand-100'
            }`}
          >
            {links.map(({ to, label: linkLabel, icon: Icon }) => {
              const isActive = active === to || active.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                    isActive
                      ? isStaff
                        ? 'bg-accent-50 text-accent-600 font-semibold'
                        : 'bg-brand-50 text-brand-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isStaff ? 'text-accent-500' : 'text-brand-500') : 'text-slate-400'}`} />
                  {linkLabel}
                </Link>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── User Avatar + Info pill ───────────────────────────────────────────────────
function UserPill({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const isStaff = user.role === 'agent' || user.role === 'admin' || user.role === 'finance'

  const displayName = user.user_metadata?.full_name
    || user.user_metadata?.name
    || user.name
    || user.email?.split('@')[0]
    || 'User'

  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const roleLabel = {
    agent: 'Travel Agent',
    admin: 'Admin',
    finance: 'Finance',
    user: 'Traveller',
  }[user.role] || 'Traveller'

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button className="flex items-center gap-2.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 hover:border-brand-primary/30 transition-all group">
        {/* Avatar */}
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
          isStaff
            ? 'bg-gradient-to-br from-orange-500 to-amber-400'
            : 'bg-gradient-to-br from-brand-500 to-brand-400'
        }`}>
          {initials}
        </div>
        {/* Name + role */}
        <div className="text-left hidden sm:block">
          <div className="text-slate-800 text-xs font-bold leading-tight">{displayName}</div>
          <div className={`text-[10px] font-medium leading-tight ${isStaff ? 'text-orange-500' : 'text-brand-500'}`}>
            {roleLabel}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Email header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${
                  isStaff
                    ? 'bg-gradient-to-br from-orange-500 to-amber-400'
                    : 'bg-gradient-to-br from-brand-500 to-brand-400'
                }`}>
                  {initials}
                </div>
                <div className="min-w-0">
                  <div className="text-slate-900 text-sm font-bold truncate">{displayName}</div>
                  <div className="text-slate-500 text-xs truncate">{user.email}</div>
                  <div className={`text-[10px] font-bold mt-0.5 ${isStaff ? 'text-orange-500' : 'text-brand-500'}`}>
                    {roleLabel}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick links */}
            <div className="p-1.5">
              <Link
                to={isStaff ? '/agent' : '/dashboard'}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
              >
                <User className="w-4 h-4 text-slate-400" />
                {isStaff ? 'Agent Dashboard' : 'My Trips'}
              </Link>
              {isStaff && (
                <Link
                  to="/agent/trips"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
                >
                  <Users className="w-4 h-4 text-slate-400" />
                  Trip Requests
                </Link>
              )}
            </div>

            {/* Sign out */}
            <div className="p-1.5 border-t border-slate-100">
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-all font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
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
  const isHeroPage = active === '/'

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

  const navBg = scrolled || !isHeroPage
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
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  isLinkActive ? `bg-brand-primary/10 ${activeColor}` : linkColor
                } hover:bg-slate-100`}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Desktop Right */}
        <div className="hidden lg:flex items-center gap-3">
          {user && !isStaff && (
            <GenericDropdown label="My Journey" links={USER_LINKS} active={active} />
          )}
          {isStaff && (
            <GenericDropdown label="Staff Desk" links={STAFF_LINKS} active={active} isStaff />
          )}

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {user ? (
            <UserPill user={user} onLogout={handleLogout} />
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
                AI Travel Guide
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`lg:hidden p-2 rounded-xl transition-colors ${
            (!scrolled && isHeroPage) ? 'text-white hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'
          }`}
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

              {/* My Travel (customers) - only shown when signed in as traveller */}
              {user && !isStaff && (
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wider text-slate-400 mb-3 px-3 font-bold">My Travel</p>
                  {USER_LINKS.map(l => {
                    const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                    return (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                          isLinkActive ? 'text-brand-600 bg-brand-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
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
                  <p className="text-xs uppercase tracking-wider text-orange-500 mb-3 px-3 font-bold">Staff Desk</p>
                  {STAFF_LINKS.map(l => {
                    const isLinkActive = active === l.to || active.startsWith(l.to + '/')
                    return (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-xl transition-all ${
                          isLinkActive ? 'text-orange-600 bg-orange-50 font-semibold' : 'text-slate-600 hover:bg-slate-50'
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
                    {/* User info card */}
                    <div className="px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 ${
                        isStaff
                          ? 'bg-gradient-to-br from-orange-500 to-amber-400'
                          : 'bg-gradient-to-br from-brand-500 to-brand-400'
                      }`}>
                        {(user.user_metadata?.full_name || user.name || user.email || 'U')
                          .split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user.user_metadata?.full_name || user.name || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <p className={`text-[10px] font-bold mt-0.5 ${isStaff ? 'text-orange-500' : 'text-brand-500'}`}>
                          {isStaff ? 'Travel Agent' : 'Traveller'}
                        </p>
                      </div>
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
                      <Sparkles className="w-4 h-4" /> Try AI Travel Guide <ArrowRight className="w-4 h-4" />
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