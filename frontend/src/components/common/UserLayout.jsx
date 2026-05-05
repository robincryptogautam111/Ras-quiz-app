import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, BookOpen, Trophy, User, ShoppingBag,
  Bookmark, LogOut, Zap, Menu, X, Shield
} from 'lucide-react'
import { useState } from 'react'

const NAV = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/quizzes',     icon: BookOpen,         label: 'Quizzes' },
  { to: '/leaderboard', icon: Trophy,           label: 'Leaderboard' },
  { to: '/bookmarks',   icon: Bookmark,         label: 'Bookmarks' },
  { to: '/orders',      icon: ShoppingBag,      label: 'Orders' },
  { to: '/profile',     icon: User,             label: 'Profile' },
]

export default function UserLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Sidebar overlay on mobile */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-gray-950 border-r border-white/[0.06] z-50
        flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_8px_rgba(255,77,0,0.8)] animate-pulse" />
            <span className="font-display text-xl tracking-widest">RAS ARENA</span>
          </div>
          <button className="lg:hidden text-gray-400" onClick={() => setOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* User badge */}
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03]">
            <div className="w-9 h-9 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.rank}</p>
            </div>
            {user?.isPremium && <Zap size={14} className="text-yellow-400 flex-shrink-0" />}
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <NavLink to="/admin" className="nav-link text-purple-400 hover:text-purple-300 border border-purple-500/20 bg-purple-500/5 mt-4">
              <Shield size={17} />
              <span>Admin Panel</span>
            </NavLink>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={logout}
            className="nav-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/5">
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-gray-950 sticky top-0 z-30">
          <button onClick={() => setOpen(true)} className="text-gray-400">
            <Menu size={22} />
          </button>
          <span className="font-display text-lg tracking-widest">RAS ARENA</span>
          <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-bold">
            {user?.name?.[0]?.toUpperCase()}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
