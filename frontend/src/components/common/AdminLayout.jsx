import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, BookOpen, Users, CreditCard, FileText, LogOut, Zap } from 'lucide-react'

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/quizzes',  icon: BookOpen,         label: 'Quizzes' },
  { to: '/admin/users',    icon: Users,            label: 'Users' },
  { to: '/admin/payments', icon: CreditCard,       label: 'Payments' },
  { to: '/admin/attempts', icon: FileText,         label: 'Attempts' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-950 border-r border-white/[0.06] flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Zap size={14} className="text-purple-400" />
          </div>
          <div>
            <div className="font-display text-base tracking-wider">ADMIN PANEL</div>
            <div className="text-xs text-gray-500">RAS Arena</div>
          </div>
        </div>

        <div className="px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <div className="w-7 h-7 rounded-full bg-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold">
              {user?.name?.[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-purple-200">{user?.name}</p>
              <p className="text-xs text-purple-400">Administrator</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }>
              <Icon size={17} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <NavLink to="/dashboard"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all mb-1">
            <Zap size={17} /> User View
          </NavLink>
          <button onClick={logout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all w-full">
            <LogOut size={17} /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
