import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Flame, Trophy, Clock, Calendar, Target, Sparkles, ArrowRight, Award, Check } from 'lucide-react'

const WEEK = ['M','T','W','T','F','S','S']

export default function DailyChallengePage() {
  const { user } = useAuth()
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  // Time until midnight IST (locally — 00:00 next day)
  const next = new Date()
  next.setHours(24, 0, 0, 0)
  const diff = Math.max(0, next.getTime() - now)
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)

  const streak = user?.streak ?? 7
  const todayDone = false

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold-400/20 blur-3xl"/>
        <div className="relative grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="section-eyebrow mb-2 flex items-center gap-1.5">
              <Sparkles size={12}/> Daily Engagement
            </div>
            <h1 className="font-display font-extrabold text-3xl lg:text-4xl mb-3">
              Your <span className="gold-text">Daily Challenge</span>
            </h1>
            <p className="text-[rgb(var(--text-muted))] mb-5">
              10 handpicked questions across Current Affairs, GK, and Reasoning. Maintain your streak, earn XP, climb the leaderboard.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link to="/quizzes" className="btn-primary">
                <Flame size={16}/> Start Today's Quiz
              </Link>
              <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))]">
                <Clock size={14}/> Next reset in <span className="font-mono font-bold text-[rgb(var(--text))]">{String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}</span>
              </div>
            </div>
          </div>

          {/* Streak ring */}
          <div className="flex justify-center">
            <div className="relative w-44 h-44">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--border))" strokeWidth="8"/>
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="url(#goldgrad)" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 42}
                  strokeDashoffset={2 * Math.PI * 42 * (1 - Math.min(streak, 30) / 30)}/>
                <defs>
                  <linearGradient id="goldgrad" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0" stopColor="#ffd166"/>
                    <stop offset="1" stopColor="#f59008"/>
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <Flame className="mx-auto text-orange-500 mb-1" size={28}/>
                  <div className="font-display font-extrabold text-3xl gold-text">{streak}</div>
                  <div className="text-xs text-[rgb(var(--text-muted))] uppercase tracking-wider">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly streak strip */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2"><Calendar size={16} className="text-gold-500"/>This Week</h3>
          <span className="text-xs text-[rgb(var(--text-muted))]">5 / 7 days completed</span>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEK.map((d, i) => {
            const done = i < 5
            const isToday = i === 5
            return (
              <div key={i} className={`p-3 rounded-xl text-center border transition-all
                ${done ? 'border-gold-500/30 bg-gold-500/8' :
                  isToday ? 'border-gold-500/50 bg-gold-500/15 ring-gold' :
                  'border-[rgb(var(--border))]'}`}>
                <div className="text-[10px] uppercase tracking-wider text-[rgb(var(--text-muted))] mb-1">{d}</div>
                <div className="h-7 grid place-items-center">
                  {done ? <Check size={16} className="text-emerald-500"/> :
                   isToday ? <Flame size={16} className="text-orange-500 animate-pulse"/> :
                   <span className="text-[rgb(var(--text-faint))]">·</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Today's mini quiz cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Current Affairs',  q: 10, time: 5,  color: 'from-sky-400 to-indigo-600', icon: Target,   xp: 25 },
          { title: 'Rajasthan GK',     q: 8,  time: 4,  color: 'from-amber-400 to-orange-600', icon: Trophy, xp: 20 },
          { title: 'Reasoning Speed',  q: 12, time: 6,  color: 'from-emerald-400 to-teal-600', icon: Award,  xp: 30 },
        ].map(c => (
          <Link to="/quizzes" key={c.title} className="card-hover overflow-hidden">
            <div className={`h-24 bg-gradient-to-br ${c.color} p-4 flex items-end`}>
              <c.icon size={26} className="text-white/90"/>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-base mb-2">{c.title}</h4>
              <div className="flex items-center gap-3 text-xs text-[rgb(var(--text-muted))] mb-3">
                <span>{c.q} Q</span>
                <span>·</span>
                <span>{c.time} min</span>
                <span>·</span>
                <span className="text-gold-500 font-bold">+{c.xp} XP</span>
              </div>
              <div className="btn-soft text-xs justify-center w-full">Start Now <ArrowRight size={12}/></div>
            </div>
          </Link>
        ))}
      </div>

      {/* Motivational dashboard */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { l: 'Total XP earned',     v: user?.totalPoints ?? 1240, icon: Sparkles },
          { l: 'Longest streak',      v: '21 days', icon: Flame },
          { l: 'Daily challenges won',v: 87,        icon: Trophy },
        ].map(s => (
          <div key={s.l} className="card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 grid place-items-center text-gold-500">
              <s.icon size={20}/>
            </div>
            <div>
              <div className="text-2xl font-bold">{s.v}</div>
              <div className="text-xs text-[rgb(var(--text-muted))]">{s.l}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
