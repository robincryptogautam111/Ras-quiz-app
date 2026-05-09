import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import {
  Trophy, Zap, Target, BookOpen, ChevronRight, Flame, Sparkles,
  RefreshCw, ArrowRight, TrendingUp, Award,
} from 'lucide-react'

const RANK_COLORS = {
  Beginner:  'text-slate-500 dark:text-slate-300',
  Explorer:  'text-emerald-500',
  Scholar:   'text-sky-500',
  Expert:    'text-violet-500',
  Master:    'text-gold-500',
  Champion:  'text-orange-500',
  Legend:    'text-rose-500',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentAttempts, setRecentAttempts] = useState([])
  const [daily, setDaily] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/stats').catch(() => ({ data: { data: null } })),
      api.get('/users/history?limit=4').catch(() => ({ data: { data: [] } })),
      api.get('/quizzes/daily-challenge').catch(() => ({ data: { data: null } })),
    ]).then(([s, h, d]) => {
      setStats(s.data.data)
      setRecentAttempts(h.data.data || [])
      setDaily(d.data.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <PageSkeleton />

  const rank = user?.rank || 'Beginner'

  return (
    <div className="space-y-6 lg:space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* ========== Hero greeting ========== */}
      <div className="card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-gold-400/15 blur-3xl"/>
        <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-navy-700/15 blur-3xl"/>
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-[rgb(var(--text-muted))] mb-1">Namaste 👋</p>
            <h1 className="font-display font-extrabold text-3xl lg:text-4xl mb-3">{user?.name}</h1>
            <div className="flex items-center flex-wrap gap-2">
              <span className={`font-bold ${RANK_COLORS[rank]}`}>
                <Award size={15} className="inline mr-1 -mt-0.5"/>{rank}
              </span>
              <span className="badge-gold">{user?.totalPoints || 0} XP</span>
              {user?.isPremium && <span className="badge-gold"><Zap size={11}/> Premium</span>}
              <span className="badge-navy"><Flame size={11} className="text-orange-500"/> {user?.streak || 0}d streak</span>
            </div>
          </div>
          <Link to="/quizzes" className="btn-primary">
            <BookOpen size={16}/> Resume Practice
          </Link>
        </div>
      </div>

      {/* ========== Stats ========== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {[
          { label: 'Tests taken',  value: stats?.totalAttempts ?? 0,             icon: BookOpen,   tone: 'text-gold-500' },
          { label: 'Accuracy',     value: (stats?.accuracy ?? 0) + '%',          icon: Target,     tone: 'text-emerald-500' },
          { label: 'Total XP',     value: stats?.totalPoints ?? user?.totalPoints ?? 0, icon: Zap, tone: 'text-amber-500' },
          { label: 'Best rank',    value: stats?.bestRank ? `#${stats.bestRank}` : '—', icon: TrendingUp, tone: 'text-sky-500' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <s.icon size={20} className={`${s.tone} mx-auto mb-2`}/>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-[11px] text-[rgb(var(--text-muted))] uppercase tracking-wide mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ========== Quick actions ========== */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/daily',       icon: Flame,     title: 'Daily Challenge', sub: '10 Q · +25 XP', color: 'from-amber-400 to-orange-600' },
          { to: '/revise',      icon: RefreshCw, title: 'Revise Mistakes',  sub: 'Beat weak topics', color: 'from-rose-400 to-red-600' },
          { to: '/leaderboard', icon: Trophy,    title: 'Leaderboard',      sub: 'Climb the ranks', color: 'from-violet-400 to-fuchsia-600' },
        ].map(a => (
          <Link key={a.to} to={a.to} className="card-hover p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${a.color} text-white grid place-items-center flex-shrink-0`}>
              <a.icon size={20}/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{a.title}</div>
              <div className="text-xs text-[rgb(var(--text-muted))]">{a.sub}</div>
            </div>
            <ArrowRight size={16} className="text-[rgb(var(--text-faint))] flex-shrink-0"/>
          </Link>
        ))}
      </div>

      {/* ========== Daily Challenge highlight ========== */}
      {daily && (
        <div className="card p-5 lg:p-6 ring-gold border-gold-500/30 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gold-400/15 blur-3xl"/>
          <div className="relative flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="badge-gold mb-2"><Sparkles size={11}/> Today's spotlight</div>
              <h3 className="font-bold text-lg mb-1">{daily.title}</h3>
              <p className="text-sm text-[rgb(var(--text-muted))]">{daily.category} · {daily.totalQuestions} questions</p>
            </div>
            <Link to={`/quizzes/${daily._id}`} className="btn-primary whitespace-nowrap">
              Attempt <ChevronRight size={15}/>
            </Link>
          </div>
        </div>
      )}

      {/* ========== Recent activity ========== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title text-xl">Recent Activity</h2>
          <Link to="/quizzes" className="text-sm text-gold-500 hover:underline flex items-center gap-1">
            All test series <ChevronRight size={14}/>
          </Link>
        </div>

        {recentAttempts.length === 0 ? (
          <div className="card p-10 text-center">
            <BookOpen size={36} className="text-[rgb(var(--text-faint))] mx-auto mb-3"/>
            <p className="text-[rgb(var(--text-muted))] mb-4">No attempts yet. Take your first quiz!</p>
            <Link to="/quizzes" className="btn-primary">Start Practicing</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAttempts.map(a => (
              <Link key={a._id} to={`/quiz/${a.quiz?._id}/result/${a._id}`}
                className="card-hover p-4 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl grid place-items-center flex-shrink-0 font-bold text-sm
                  ${a.isPassed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-300'}`}>
                  {a.percentage}%
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{a.quiz?.title}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    {a.quiz?.category} · {a.correctAnswers}/{a.answers?.length || 0} correct
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={a.isPassed ? 'badge-green' : 'badge-red'}>
                    {a.isPassed ? 'Passed' : 'Failed'}
                  </span>
                  <p className="text-[11px] text-[rgb(var(--text-muted))] mt-1">
                    {new Date(a.createdAt).toLocaleDateString('en-IN')}
                  </p>
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
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="skeleton h-36"/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="skeleton h-24"/>)}
      </div>
      <div className="skeleton h-24"/>
      <div className="skeleton h-24"/>
    </div>
  )
}
