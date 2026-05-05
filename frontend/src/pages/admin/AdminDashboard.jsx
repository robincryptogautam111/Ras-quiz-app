import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { Users, BookOpen, FileText, DollarSign, TrendingUp, Trophy } from 'lucide-react'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="h-24 rounded-2xl bg-gray-800/50"/>)}
      </div>
      <div className="h-48 rounded-2xl bg-gray-800/50"/>
    </div>
  )

  const { stats, recentPayments, topQuizzes } = data || {}

  return (
    <div className="space-y-7 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl tracking-wider text-white">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">RAS Arena platform overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users,     label: 'Total Users',    value: stats?.totalUsers    || 0, color: 'text-sky-400',     bg: 'bg-sky-500/10' },
          { icon: BookOpen,  label: 'Total Quizzes',  value: stats?.totalQuizzes  || 0, color: 'text-purple-400',  bg: 'bg-purple-500/10' },
          { icon: FileText,  label: 'Attempts',       value: stats?.totalAttempts || 0, color: 'text-orange-400',  bg: 'bg-orange-500/10' },
          { icon: DollarSign,label: 'Revenue',        value: `₹${stats?.totalRevenue || 0}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={20} className={color}/>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <div className="card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <DollarSign size={16} className="text-emerald-400"/> Recent Payments
          </h3>
          {!recentPayments?.length ? (
            <p className="text-gray-500 text-sm text-center py-6">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {recentPayments.map(p => (
                <div key={p._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                    {p.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.quiz?.title || 'Premium'}</p>
                  </div>
                  <span className="text-emerald-400 font-bold text-sm flex-shrink-0">₹{p.amount / 100}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top quizzes */}
        <div className="card p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Trophy size={16} className="text-yellow-400"/> Top Quizzes
          </h3>
          {!topQuizzes?.length ? (
            <p className="text-gray-500 text-sm text-center py-6">No attempts yet</p>
          ) : (
            <div className="space-y-3">
              {topQuizzes.map((q, i) => (
                <div key={q._id} className="flex items-center gap-3">
                  <span className="text-lg font-display text-gray-600 w-6 text-center flex-shrink-0">#{i+1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{q.title}</p>
                    <p className="text-xs text-gray-500">{q.category}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-brand-400">{q.totalAttempts}</p>
                    <p className="text-xs text-gray-500">attempts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
