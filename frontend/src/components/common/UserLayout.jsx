import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, Trophy, User, ShoppingBag,
  Bookmark, LogOut, Zap, Menu, X, Shield, Flame, RefreshCw, Bell, Search
} from 'lucide-react'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'
import Logo from './Logo'

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quizzes',     icon: BookOpen,        label: 'Test Series' },
  { to: '/daily',       icon: Flame,           label: 'Daily Challenge' },
  { to: '/revise',      icon: RefreshCw,       label: 'Revise Mistakes' },
  { to: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
  { to: '/bookmarks',   icon: Bookmark,        label: 'Bookmarks' },
  { to: '/orders',      icon: ShoppingBag,     label: 'Orders' },
  { to: '/profile',     icon: User,            label: 'Profile' },
]

// Mobile bottom-bar — only the most-used 5
const MOBILE_TABS = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home' },
  { to: '/quizzes',     icon: BookOpen,        label: 'Tests' },
  { to: '/daily',       icon: Flame,           label: 'Daily' },
  { to: '/leaderboard', icon: Trophy,          label: 'Ranks' },
  { to: '/profile',     icon: User,            label: 'Profile' },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* ============ Mobile sidebar overlay ============ */}
      {open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
             onClick={() => setOpen(false)} />
      )}

      {/* ============ Sidebar (desktop static, mobile drawer) ============ */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
        bg-[rgb(var(--surface))] border-r border-[rgb(var(--border))]
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[rgb(var(--border))]">
          <Logo size="sm" />
          <button className="lg:hidden text-[rgb(var(--text-muted))]" onClick={() => setOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        {/* User badge */}
        <div className="px-4 py-4 border-b border-[rgb(var(--border))]">
          <div className="flex items-center gap-3 p-3 rounded-xl surface-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 grid place-items-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-[11px] text-[rgb(var(--text-muted))] truncate flex items-center gap-1.5">
                <Flame size={10} className="text-orange-500"/>
                <span>{user?.streak || 0} day streak</span>
                {user?.isPremium && <Zap size={10} className="text-gold-500"/>}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link mt-4 !text-purple-600 dark:!text-purple-300 !border !border-purple-500/20 !bg-purple-500/8">
              <Shield size={17} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[rgb(var(--border))] flex items-center gap-2">
          <ThemeToggle />
          <button onClick={logout}
            className="nav-link flex-1 !text-red-600 dark:!text-red-400 hover:!bg-red-500/8">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ============ Main column ============ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-[rgb(var(--border))] glass sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-[rgb(var(--text-muted))]" aria-label="Open menu">
            <Menu size={22} />
          </button>
          <Logo size="sm" showText={true} />
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {/* Desktop top bar */}
        <header className="hidden lg:flex h-16 items-center justify-between px-8 border-b border-[rgb(var(--border))] glass sticky top-0 z-20">
          <div className="relative w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-faint))]"/>
            <input className="input !py-2 !pl-9 text-sm" placeholder="Search test series, topics, PYQs…"/>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-lg surface-2 hover:bg-gold-500/10 grid place-items-center" aria-label="Notifications">
              <Bell size={16}/>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-gold-500"/>
            </button>
            <div className="text-sm">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-[11px] text-[rgb(var(--text-muted))]">{user?.totalPoints || 0} XP</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 grid place-items-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto pb-24 lg:pb-8">
          <Outlet />
        </main>

        {/* ============ Mobile bottom tab bar ============ */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 glass border-t border-[rgb(var(--border))] pb-safe">
          <div className="flex">
            {MOBILE_TABS.map(({ to, icon: Icon, label }) => {
              const isActive = location.pathname === to ||
                (to !== '/dashboard' && location.pathname.startsWith(to))
              return (
                <NavLink key={to} to={to}
                  className={`tab-item ${isActive ? 'active' : ''}`}>
                  <Icon size={20} />
                  <span>{label}</span>
                </NavLink>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
