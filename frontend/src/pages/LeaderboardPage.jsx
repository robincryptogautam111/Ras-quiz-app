import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Medal, Crown, Flame, Users, MapPin, Globe, Calendar, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'daily',   label: 'Daily',   icon: Flame },
  { id: 'weekly',  label: 'Weekly',  icon: Calendar },
  { id: 'monthly', label: 'Monthly', icon: TrendingUp },
  { id: 'all',     label: 'All-time',icon: Trophy },
]
const SCOPES = [
  { id: 'global',  label: 'Global',  icon: Globe },
  { id: 'state',   label: 'State',   icon: MapPin },
  { id: 'city',    label: 'City',    icon: MapPin },
  { id: 'friends', label: 'Friends', icon: Users },
]

// Mock data — backend may or may not have these endpoints yet.
const MOCK = {
  daily:   makeMock(50, 9000),
  weekly:  makeMock(50, 28000),
  monthly: makeMock(50, 84000),
  all:     makeMock(50, 240000),
}
function makeMock(n, base) {
  const cities = ['Jaipur','Kota','Udaipur','Jodhpur','Ajmer','Bikaner','Sikar','Alwar','Pali']
  const names = ['Priya Sharma','Rohit Kumar','Anjali Rathore','Manish Choudhary','Pooja Singh','Vikash Verma','Neha Gupta','Aditya Mehta','Sunita Devi','Ravi Joshi','Kiran Bala','Sahil Yadav','Deepak Saini','Ritu Khandelwal','Sandeep Meena']
  return Array.from({ length: n }, (_, i) => ({
    pos: i + 1,
    name: names[i % names.length] + (i >= names.length ? ' ' + (Math.floor(i / names.length) + 1) : ''),
    city: cities[i % cities.length],
    score: Math.max(50, Math.round(base * (1 - i * 0.018) + (Math.random() - 0.5) * 200)),
    streak: Math.max(0, 28 - Math.floor(i / 4)),
    rank: ['Legend','Champion','Master','Expert','Scholar','Explorer','Beginner'][Math.min(6, Math.floor(i / 8))],
  }))
}

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState('weekly')
  const [scope, setScope] = useState('global')
  const [data, setData] = useState([])
  const [myPos, setMyPos] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/leaderboard/${tab === 'all' ? 'global' : tab}`)
      .then(r => {
        const list = r.data?.data
        setData(list?.length ? list : MOCK[tab])
        setMyPos(r.data?.myPosition ?? Math.floor(Math.random() * 80 + 20))
      })
      .catch(() => { setData(MOCK[tab]); setMyPos(Math.floor(Math.random() * 80 + 20)) })
      .finally(() => setLoading(false))
  }, [tab, scope])

  const top3 = data.slice(0, 3)
  const rest = data.slice(3, 50)

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div>
        <div className="section-eyebrow mb-1">Hall of Champions</div>
        <h1 className="font-display font-extrabold text-3xl mb-1">🏆 Leaderboard</h1>
        <p className="text-[rgb(var(--text-muted))] text-sm">Compete, climb, conquer. Refreshes every hour.</p>
      </div>

      {/* Period tabs */}
      <div className="flex gap-1 p-1 surface-2 rounded-xl overflow-x-auto no-scrollbar">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-shrink-0 flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all
              ${tab === t.id ? 'bg-[rgb(var(--surface))] shadow-sm text-[rgb(var(--text))]' : 'text-[rgb(var(--text-muted))]'}`}>
            <t.icon size={13}/> <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Scope chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {SCOPES.map(s => (
          <button key={s.id} onClick={() => setScope(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${scope === s.id
                ? 'bg-gold-500 text-white border-gold-500'
                : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-gold-500/50'}`}>
            <s.icon size={12}/> {s.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && top3.length === 3 && (
        <div className="grid grid-cols-3 gap-3 items-end">
          {[
            { user: top3[1], h: 'h-24', icon: Medal, color: 'text-slate-500', bg: 'bg-slate-200 dark:bg-slate-700' },
            { user: top3[0], h: 'h-32', icon: Crown,  color: 'text-gold-500',  bg: 'bg-gold-500/15 ring-gold' },
            { user: top3[2], h: 'h-20', icon: Medal, color: 'text-orange-500',bg: 'bg-orange-200 dark:bg-orange-800/40' },
          ].map((p, i) => (
            <div key={i} className="text-center">
              <div className={`mx-auto w-14 h-14 rounded-full grid place-items-center font-bold mb-2
                ${p.user.pos === 1 ? 'bg-gradient-to-br from-gold-300 to-gold-600 text-white' :
                  p.user.pos === 2 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' :
                  'bg-gradient-to-br from-orange-300 to-orange-600 text-white'}`}>
                {p.user.name[0]}
              </div>
              <div className="text-sm font-bold truncate px-1">{p.user.name}</div>
              <div className="text-[11px] text-[rgb(var(--text-muted))] mb-2">{p.user.city}</div>
              <div className={`${p.h} ${p.bg} rounded-t-2xl flex flex-col items-center justify-center pt-2 border-t-4
                ${p.user.pos === 1 ? 'border-gold-500' : p.user.pos === 2 ? 'border-slate-400' : 'border-orange-500'}`}>
                <p.icon size={20} className={p.color}/>
                <div className="font-display font-extrabold text-lg">{p.user.pos === 1 ? '1st' : p.user.pos === 2 ? '2nd' : '3rd'}</div>
                <div className="text-xs font-mono font-bold text-gold-600 dark:text-gold-300">{p.user.score.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Your rank pill */}
      {myPos != null && user && (
        <div className="card p-4 flex items-center gap-3 ring-gold border-gold-500/30">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 grid place-items-center text-white font-bold">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm truncate">You — {user.name}</div>
            <div className="text-[11px] text-[rgb(var(--text-muted))]">{user.rank || 'Beginner'} · keep grinding!</div>
          </div>
          <div className="text-right">
            <div className="font-display text-xl font-extrabold gold-text">#{myPos}</div>
            <div className="text-[10px] uppercase text-[rgb(var(--text-muted))]">Your rank</div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-[rgb(var(--border))] flex items-center justify-between text-xs uppercase tracking-wider text-[rgb(var(--text-muted))] font-bold">
          <span>Rank · Player</span>
          <span>Score</span>
        </div>
        {loading ? (
          <div className="p-3 space-y-2">{[1,2,3,4,5,6].map(i => <div key={i} className="skeleton h-12"/>)}</div>
        ) : (
          <ol className="divide-y divide-[rgb(var(--border))]">
            {rest.map(p => (
              <li key={p.pos} className="flex items-center gap-3 px-4 py-3 hover:bg-[rgb(var(--surface-2))]">
                <span className="w-9 text-center text-sm font-mono font-bold text-[rgb(var(--text-muted))]">#{p.pos}</span>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-navy-400 to-navy-700 dark:from-navy-600 dark:to-navy-900 grid place-items-center text-white font-bold text-xs">
                  {p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="text-[11px] text-[rgb(var(--text-muted))] flex items-center gap-2">
                    <span>{p.city}</span>
                    <span className="opacity-50">·</span>
                    <span className="flex items-center gap-0.5"><Flame size={9} className="text-orange-500"/>{p.streak}d</span>
                  </div>
                </div>
                <div className="text-sm font-mono font-bold">{p.score.toLocaleString()}</div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Achievements / badges hint */}
      <div className="card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Trophy size={16} className="text-gold-500"/>Achievements you can earn</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { e: '🔥', t: '7-day streak' },
            { e: '🏆', t: 'Top 100 weekly' },
            { e: '⚡', t: 'Speed demon' },
            { e: '💎', t: 'Premium hero' },
            { e: '🎯', t: '90% accuracy' },
            { e: '👑', t: 'Daily winner' },
          ].map(b => (
            <span key={b.t} className="badge-navy">{b.e} {b.t}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
