import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Zap, Trophy, Shield, BookOpen, ChevronRight, Check } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(255,77,0,0.8)] animate-pulse" />
          <span className="font-display text-xl tracking-widest">RAS ARENA</span>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <Link to="/dashboard" className="btn-primary">Dashboard →</Link>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 badge-orange mb-6 text-xs">
          <Zap size={11} /> RAS Exam 2025 Preparation Platform
        </div>
        <h1 className="font-display text-6xl lg:text-8xl leading-none tracking-wide mb-6">
          CRACK<br />
          <span className="[-webkit-text-stroke:2px_#ff4d00] text-transparent">RAS</span>{' '}
          WITH SMART<br />PRACTICE
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Daily quizzes, instant feedback, leaderboard rankings — aur UPI se premium content unlock karo.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary text-base px-8 py-3.5">
            Free mein shuru karo <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="btn-ghost text-base px-6 py-3.5">Login →</Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <h2 className="font-display text-4xl tracking-wider text-center mb-12">FEATURES</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Smart Quizzes', desc: 'MCQ quizzes with instant feedback, timers, and explanations. Hindi + English both.', color: 'text-brand-400' },
            { icon: Trophy,   title: 'Leaderboard',  desc: 'Rank system — Beginner se Legend tak. Daily challenges aur streaks.', color: 'text-yellow-400' },
            { icon: Shield,   title: 'UPI Payments', desc: 'Secure Razorpay integration. Individual quiz ya full premium access kharido.', color: 'text-emerald-400' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card-hover p-6">
              <Icon size={28} className={`${color} mb-4`} />
              <h3 className="font-bold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-4xl mx-auto px-6 py-20 border-t border-white/[0.06]">
        <h2 className="font-display text-4xl tracking-wider text-center mb-4">PRICING</h2>
        <p className="text-gray-400 text-center mb-12">Shuru karo free mein, upgrade karo jab chaaho</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              name: 'Free', price: '₹0', period: 'forever',
              features: ['All free quizzes', 'Basic progress tracking', 'Leaderboard access', 'Daily challenge'],
              cta: 'Start Free', href: '/register', highlight: false
            },
            {
              name: 'Premium', price: '₹99', period: 'per month',
              features: ['All paid quizzes unlocked', 'Advanced analytics', 'Bookmarks', 'Priority support', 'Bulk question access'],
              cta: 'Go Premium', href: '/register', highlight: true
            }
          ].map(plan => (
            <div key={plan.name} className={`card p-7 ${plan.highlight ? 'border-brand-500/40 bg-brand-500/5' : ''}`}>
              {plan.highlight && <div className="badge-orange mb-3">Most Popular</div>}
              <div className="font-display text-3xl tracking-wider mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl font-bold text-brand-400">{plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-8">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-gray-300">
                    <Check size={15} className="text-emerald-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link to={plan.href}
                className={plan.highlight ? 'btn-primary w-full justify-center' : 'btn-ghost w-full justify-center'}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 text-center text-gray-600 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
          <span className="font-display tracking-widest text-gray-500">RAS ARENA</span>
        </div>
        <p>Built for RAS aspirants of Rajasthan 🇮🇳</p>
      </footer>
    </div>
  )
}
