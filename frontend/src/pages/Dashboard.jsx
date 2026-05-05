import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Trophy, Zap, Target, BookOpen, Clock, TrendingUp, ChevronRight, Flame } from 'lucide-react'

const RANK_COLORS = {
  Beginner: 'text-gray-400', Explorer: 'text-green-400', Scholar: 'text-blue-400',
  Expert: 'text-purple-400', Master: 'text-yellow-400', Champion: 'text-orange-400', Legend: 'text-red-400'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentAttempts, setRecentAttempts] = useState([])
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/users/history?limit=4'),
      api.get('/quizzes/daily-challenge')
    ]).then(([s, h, d]) => {
      setStats(s.data.data)
      setRecentAttempts(h.data.data)
      setDaily(d.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton />

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div className="relative overflow-hidden card p-6 lg:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
          <p className="text-sm text-gray-400 mb-1">Namaste 👋</p>
          <h1 className="text-2xl lg:text-3xl font-bold mb-3">{user?.name}</h1>
          <div className="flex items-center flex-wrap gap-3">
            <span className={`font-bold text-lg ${RANK_COLORS[user?.rank]}`}>
              🏅 {user?.rank}
            </span>
            <span className="badge-orange">{user?.totalPoints} pts</span>
            {user?.isPremium && <span className="badge-gold">⚡ Premium</span>}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: stats?.totalAttempts || 0, icon: BookOpen, color: 'text-brand-400' },
          { label: 'Accuracy', value: (stats?.accuracy || 0) + '%', icon: Target, color: 'text-emerald-400' },
          { label: 'Total Points', value: stats?.totalPoints || 0, icon: Zap, color: 'text-yellow-400' },
          { label: 'Streak', value: (stats?.currentStreak || 0) + ' 🔥', icon: Flame, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card">
            <Icon size={22} className={`${color} mx-auto mb-2`} />
            <div className={`text-2xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Daily Challenge */}
      {daily && (
        <div className="card p-5 border-yellow-500/20 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <div className="badge-gold mb-2">🌟 Daily Challenge</div>
              <h3 className="font-bold text-lg mb-1">{daily.title}</h3>
              <p className="text-sm text-gray-400">{daily.category} • {daily.totalQuestions} Questions</p>
            </div>
            <Link to={`/quizzes/${daily._id}`}
              className="btn-primary text-sm whitespace-nowrap">
              Attempt <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="section-title">Recent Activity</div>
          <Link to="/quizzes" className="text-sm text-brand-400 hover:text-brand-300 flex items-center gap-1">
            All Quizzes <ChevronRight size={14} />
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Abhi koi quiz attempt nahi ki.</p>
            <Link to="/quizzes" className="btn-primary mt-4 inline-flex">Start Practicing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map(a => (
              <Link key={a._id} to={`/quiz/${a.quiz?._id}/result/${a._id}`}
                className="card p-4 flex items-center gap-4 hover:border-white/10 transition-all block group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm
                  ${a.isPassed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {a.percentage}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.quiz?.title}</p>
                  <p className="text-xs text-gray-500">{a.quiz?.category} • {a.correctAnswers}/{a.answers?.length} correct</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className={`badge text-xs ${a.isPassed ? 'badge-green' : 'badge-red'}`}>
                    {a.isPassed ? 'Passed' : 'Failed'}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{new Date(a.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-2xl bg-gray-800/50" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-2xl bg-gray-800/50" />)}
      </div>
      <div className="h-20 rounded-2xl bg-gray-800/50" />
    </div>
  )
}
