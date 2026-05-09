import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/common/ThemeToggle'
import Logo from '../components/common/Logo'
import { CATEGORIES } from '../data/categories'
import {
  Zap, ArrowRight, Trophy, Flame, Target, BookOpen, Sparkles, Crown,
  Compass, MapPin, ScrollText, Globe, Landmark, Newspaper, GraduationCap,
  FileSpreadsheet, Briefcase, Award, Banknote, Train, BookMarked, Layers,
  Star, Check, ChevronRight, Users, TrendingUp, Quote, PlayCircle, Bell,
  Home as HomeIcon, LogIn,
} from 'lucide-react'

const ICONS = { Compass, Crown, MapPin, ScrollText, Globe, Landmark, Newspaper, GraduationCap, FileSpreadsheet, Briefcase, Award, Banknote, Train, Target, BookMarked, Layers }

const POPULAR_SERIES = [
  { title: 'RAS Pre 2025 — Complete Test Series', tag: 'Bestseller', tests: 60, attempts: '24K+', price: '₹499', strike: '₹1,499', color: 'from-amber-400 to-orange-600' },
  { title: 'Rajasthan GK Mastery Pack',           tag: 'New',         tests: 40, attempts: '18K+', price: '₹299', strike: '₹899',   color: 'from-rose-400 to-red-600' },
  { title: 'Current Affairs Daily Yearlong',      tag: 'Trending',    tests: 365, attempts: '52K+', price: '₹399', strike: '₹1,299', color: 'from-sky-400 to-indigo-600' },
  { title: 'REET Level 2 — Mock Test Special',    tag: 'Limited',     tests: 30, attempts: '12K+', price: '₹249', strike: '₹699',   color: 'from-emerald-400 to-teal-600' },
]

const TOPPERS = [
  { name: 'Priya Sharma',  city: 'Jaipur',   rank: 'AIR 14',  score: 98.4, color: 'bg-amber-500' },
  { name: 'Aditya Verma',  city: 'Kota',     rank: 'AIR 27',  score: 97.1, color: 'bg-rose-500' },
  { name: 'Neha Gupta',    city: 'Udaipur',  rank: 'AIR 39',  score: 96.5, color: 'bg-emerald-500' },
  { name: 'Rahul Meena',   city: 'Ajmer',    rank: 'AIR 51',  score: 95.8, color: 'bg-sky-500' },
  { name: 'Anjali Rathore',city: 'Jodhpur',  rank: 'AIR 64',  score: 95.2, color: 'bg-violet-500' },
]

const TESTIMONIALS = [
  { name: 'Manish Choudhary', city: 'Bikaner', text: 'Daily current affairs quiz aur mistake revision ne mera score 60% se 88% tak pahuncha diya. Best Indian edtech experience!', stars: 5 },
  { name: 'Pooja Singh',      city: 'Sikar',   text: 'Hindi-first interface aur Rajasthan GK ke liye perfect platform. Mock tests bilkul real exam jaise lagte hain.', stars: 5 },
  { name: 'Vikash Kumar',     city: 'Alwar',   text: 'Leaderboard ne competitive feeling di. Streak maintain karna addictive ho gaya hai. 90 days strong streak!', stars: 5 },
]

const PLANS = [
  {
    name: 'Free', price: '₹0', period: 'forever', highlight: false,
    features: ['Daily free quiz', '3 mock tests / month', 'Basic analytics', 'Leaderboard access'],
    cta: 'Start Free', href: '/register',
  },
  {
    name: 'Pro Monthly', price: '₹199', period: 'per month', highlight: true, badge: 'Most Popular',
    features: ['All test series unlocked', 'Mistake revision system', 'AI weak-topic analysis', 'PYQs + answer keys', 'Bilingual Hindi + English'],
    cta: 'Go Pro', href: '/register',
  },
  {
    name: 'Pro Yearly', price: '₹1,499', period: 'per year', highlight: false, badge: 'Save 37%',
    features: ['Everything in Pro Monthly', 'Priority doubt support', 'PDF notes download', 'Topper comparison reports', 'Early access to new tests'],
    cta: 'Go Yearly', href: '/register',
  },
]

const STATS = [
  { num: '5L+',   label: 'Active Learners' },
  { num: '12K+',  label: 'Practice Tests' },
  { num: '98%',   label: 'Avg. Satisfaction' },
  { num: '450+',  label: 'Toppers Selected' },
]

function Section({ eyebrow, title, sub, children, id }) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
      {(eyebrow || title) && (
        <div className="mb-8 lg:mb-12 flex items-end justify-between gap-4 flex-wrap">
          <div>
            {eyebrow && <div className="section-eyebrow mb-2">{eyebrow}</div>}
            {title && <h2 className="section-title text-3xl lg:text-4xl">{title}</h2>}
            {sub && <p className="text-[rgb(var(--text-muted))] mt-2 max-w-xl">{sub}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  )
}

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      {/* ============ Top Nav ============ */}
      <nav className="sticky top-0 z-40 glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Logo size="sm" />
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="#categories"  className="px-3 py-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">Categories</a>
            <a href="#popular"     className="px-3 py-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">Test Series</a>
            <a href="#toppers"     className="px-3 py-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">Toppers</a>
            <a href="#pricing"     className="px-3 py-2 text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]">Pricing</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="btn-primary text-sm">Dashboard <ArrowRight size={14}/></Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Login</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[36rem] h-[36rem] rounded-full bg-gold-400/15 blur-3xl"/>
          <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-navy-700/20 blur-3xl"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-12 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 badge-gold">
              <Sparkles size={11} /> #1 Rated by Rajasthan aspirants
            </div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mt-5">
              India's smartest{' '}
              <span className="gold-text">quiz arena</span>{' '}
              for <br className="hidden sm:block"/>
              competitive exam aspirants.
            </h1>
            <p className="mt-5 text-base lg:text-lg text-[rgb(var(--text-muted))] max-w-xl leading-relaxed">
              Daily quizzes, full-length mocks, AI-powered weak-topic detection, and a community of 5 lakh+ learners — all in one premium platform built for RAS, REET, SSC and UPSC aspirants.
            </p>
            <div className="mt-8 flex items-center gap-3 flex-wrap">
              <Link to={user ? '/dashboard' : '/register'} className="btn-primary text-base px-6 py-3">
                <PlayCircle size={18} /> Start Free Practice
              </Link>
              <Link to="#popular" className="btn-ghost text-base px-6 py-3">
                Browse test series <ChevronRight size={16}/>
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map(s => (
                <div key={s.label}>
                  <div className="font-display text-2xl lg:text-3xl font-bold gold-text">{s.num}</div>
                  <div className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero card preview */}
          <div className="relative animate-slide-up">
            <div className="absolute -inset-4 bg-gradient-to-tr from-gold-400/20 via-transparent to-navy-500/20 rounded-3xl blur-2xl -z-10"/>
            <div className="card p-5 lg:p-6 ring-gold">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="badge-gold">LIVE</span>
                  <span className="text-[rgb(var(--text-muted))]">Daily Challenge</span>
                </div>
                <div className="text-xs font-mono text-[rgb(var(--text-muted))]">⏱ 09:42</div>
              </div>
              <div className="surface-2 rounded-xl p-4">
                <div className="text-xs uppercase tracking-wide text-gold-500 font-bold mb-2">Q3 of 10 · Rajasthan GK</div>
                <p className="font-semibold leading-snug">
                  राजस्थान में 'मरुत्रिवेणी' किन तीन नदियों के संगम को कहते हैं?
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    { l: 'A', t: 'लूनी, जोजड़ी, सूकड़ी', ok: true },
                    { l: 'B', t: 'कांतली, साबी, घग्घर' },
                    { l: 'C', t: 'बनास, बेड़च, मेनाल' },
                    { l: 'D', t: 'चम्बल, बनास, माही' },
                  ].map((o, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border text-sm
                      ${o.ok
                        ? 'border-emerald-500/40 bg-emerald-500/8'
                        : 'border-[rgb(var(--border))] hover:border-gold-400/40'} transition-colors`}>
                      <span className={`w-7 h-7 rounded-md grid place-items-center text-xs font-bold
                        ${o.ok ? 'bg-emerald-500 text-white' : 'bg-[rgb(var(--surface))]'}`}>{o.l}</span>
                      <span className="font-devanagari">{o.t}</span>
                      {o.ok && <Check size={14} className="ml-auto text-emerald-500"/>}
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-gold-500/10 border border-gold-500/20">
                    <div className="text-[10px] uppercase text-gold-600 dark:text-gold-300 font-bold">Streak</div>
                    <div className="font-bold flex items-center justify-center gap-1"><Flame size={13} className="text-orange-500"/>14d</div>
                  </div>
                  <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20">
                    <div className="text-[10px] uppercase text-sky-600 dark:text-sky-300 font-bold">XP</div>
                    <div className="font-bold">+24</div>
                  </div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <div className="text-[10px] uppercase text-purple-600 dark:text-purple-300 font-bold">Rank</div>
                    <div className="font-bold">#127</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ EXAM CATEGORIES ============ */}
      <Section
        id="categories"
        eyebrow="Exam Categories"
        title="Pick your exam, master it."
        sub="From Rajasthan GK to UPSC — handpicked test series for every major Indian competitive exam."
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 lg:gap-4">
          {CATEGORIES.map(cat => {
            const Icon = ICONS[cat.icon] || BookOpen
            return (
              <Link key={cat.slug} to="/quizzes" className="card-hover p-4 group">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 shadow-glow-gold/0 group-hover:shadow-glow-gold transition-shadow`}>
                  <Icon size={20} className="text-white"/>
                </div>
                <div className="font-bold text-sm lg:text-base mb-1">{cat.name}</div>
                <div className="text-[11px] text-[rgb(var(--text-muted))] flex items-center gap-3">
                  <span className="flex items-center gap-1"><Target size={11}/>{cat.tests}</span>
                  <span className="flex items-center gap-1"><Users size={11}/>{(cat.students/1000).toFixed(1)}K</span>
                </div>
              </Link>
            )
          })}
        </div>
      </Section>

      {/* ============ POPULAR TEST SERIES ============ */}
      <Section
        id="popular"
        eyebrow="Most Loved"
        title="Popular test series"
        sub="Curated by toppers, trusted by lakhs."
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {POPULAR_SERIES.map(s => (
            <div key={s.title} className="card-hover overflow-hidden">
              <div className={`h-28 bg-gradient-to-br ${s.color} relative flex items-end p-4`}>
                <span className="absolute top-3 right-3 badge-navy bg-black/40 text-white border-white/20">{s.tag}</span>
                <Trophy size={32} className="text-white/90"/>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">{s.title}</h3>
                <div className="flex items-center gap-3 text-[11px] text-[rgb(var(--text-muted))] mb-3">
                  <span className="flex items-center gap-1"><Target size={11}/>{s.tests} tests</span>
                  <span className="flex items-center gap-1"><Users size={11}/>{s.attempts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-lg gold-text">{s.price}</span>
                    <span className="text-xs line-through text-[rgb(var(--text-faint))]">{s.strike}</span>
                  </div>
                  <Link to="/register" className="btn-soft text-xs px-3 py-1.5">Enroll <ArrowRight size={12}/></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ DAILY FREE QUIZ + LEADERBOARD ============ */}
      <Section eyebrow="Today's Spotlight" title="Daily free quiz & live leaderboard">
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Daily Quiz */}
          <div className="card p-6 lg:col-span-2 relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold-400/10 blur-2xl"/>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Bell size={14} className="text-gold-500"/>
                  <span className="section-eyebrow">Free for everyone today</span>
                </div>
                <h3 className="font-display text-2xl lg:text-3xl font-bold mb-2">
                  Daily Current Affairs Quiz
                </h3>
                <p className="text-[rgb(var(--text-muted))] mb-4 max-w-md">
                  10 questions. 5 minutes. Top 3 winners get gold coins. Maintain your streak and climb the daily leaderboard.
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={user ? '/dashboard' : '/register'} className="btn-primary">
                    <Flame size={16}/> Play Daily Quiz
                  </Link>
                  <span className="text-xs text-[rgb(var(--text-muted))]">⏱ 4h 22m left</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full sm:w-auto">
                {[
                  { v: '12.4K', l: 'Played today', icon: Users },
                  { v: '94%',   l: 'Engagement',   icon: TrendingUp },
                  { v: '+25',   l: 'XP per win',   icon: Zap },
                ].map(s => (
                  <div key={s.l} className="surface-2 rounded-xl p-3 text-center">
                    <s.icon size={14} className="mx-auto text-gold-500 mb-1"/>
                    <div className="font-bold text-sm">{s.v}</div>
                    <div className="text-[10px] text-[rgb(var(--text-muted))] uppercase tracking-wide">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Leaderboard */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold flex items-center gap-2"><Trophy size={16} className="text-gold-500"/>Today's Top 5</h4>
              <Link to="/leaderboard" className="text-xs text-gold-500 hover:underline">View all</Link>
            </div>
            <ol className="space-y-2">
              {[
                { p: 1, n: 'Priya S.',    s: 9850, c: 'JPR' },
                { p: 2, n: 'Rohit K.',    s: 9680, c: 'KOTA' },
                { p: 3, n: 'Anjali R.',   s: 9420, c: 'JDH' },
                { p: 4, n: 'Manish C.',   s: 9180, c: 'BKN' },
                { p: 5, n: 'Pooja S.',    s: 9020, c: 'AJM' },
              ].map(t => (
                <li key={t.p} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[rgb(var(--surface-2))]">
                  <span className={`w-7 h-7 grid place-items-center rounded-lg text-xs font-bold
                    ${t.p === 1 ? 'bg-gold-400/20 text-gold-600 dark:text-gold-300' :
                      t.p === 2 ? 'bg-slate-400/20 text-slate-600 dark:text-slate-300' :
                      t.p === 3 ? 'bg-orange-400/20 text-orange-600 dark:text-orange-300' :
                      'bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))]'}`}>
                    {t.p === 1 ? <Crown size={13}/> : `#${t.p}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{t.n}</div>
                    <div className="text-[10px] text-[rgb(var(--text-faint))]">{t.c}</div>
                  </div>
                  <div className="text-sm font-mono font-bold text-gold-600 dark:text-gold-300">{t.s}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      {/* ============ RECENT TOPPERS ============ */}
      <Section
        id="toppers"
        eyebrow="Hall of Fame"
        title="Recent toppers from RAS Arena"
        sub="Real aspirants. Real ranks. Trained on this very platform."
      >
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 snap-x">
          {TOPPERS.map(t => (
            <div key={t.name} className="card p-5 min-w-[240px] snap-start">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full ${t.color} text-white grid place-items-center font-bold text-lg`}>
                  {t.name[0]}
                </div>
                <div>
                  <div className="font-bold text-sm">{t.name}</div>
                  <div className="text-[11px] text-[rgb(var(--text-muted))]">{t.city} · Rajasthan</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="badge-gold">{t.rank}</span>
                <span className="font-bold text-sm">{t.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ TESTIMONIALS ============ */}
      <Section eyebrow="Student Voices" title="What learners are saying">
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card p-6 relative">
              <Quote size={22} className="text-gold-400/40 absolute top-4 right-4"/>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={14} className="fill-gold-400 text-gold-400"/>)}
              </div>
              <p className="text-sm leading-relaxed text-[rgb(var(--text))] mb-4 font-devanagari">"{t.text}"</p>
              <div className="text-sm font-bold">{t.name}</div>
              <div className="text-[11px] text-[rgb(var(--text-muted))]">{t.city} · Verified Student</div>
            </div>
          ))}
        </div>
      </Section>

      {/* ============ PRICING ============ */}
      <Section
        id="pricing"
        eyebrow="Subscription Plans"
        title="Simple, honest pricing"
        sub="Start free. Upgrade when you're ready to win."
      >
        <div className="grid md:grid-cols-3 gap-5">
          {PLANS.map(p => (
            <div key={p.name}
              className={`card p-7 relative ${p.highlight ? 'ring-gold border-gold-500/40' : ''}`}>
              {p.badge && (
                <span className={`absolute -top-3 left-6 ${p.highlight ? 'badge-gold' : 'badge-navy'}`}>{p.badge}</span>
              )}
              <div className="font-display font-bold text-2xl mb-1">{p.name}</div>
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-4xl font-extrabold gold-text">{p.price}</span>
                <span className="text-sm text-[rgb(var(--text-muted))]">/{p.period}</span>
              </div>
              <ul className="space-y-2.5 mb-7">
                {p.features.map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check size={16} className="text-emerald-500 flex-shrink-0 mt-0.5"/>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link to={p.href}
                className={`${p.highlight ? 'btn-primary' : 'btn-ghost'} w-full justify-center py-3`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-[rgb(var(--text-muted))] mt-6">
          UPI · Cards · Net Banking · Wallets — secure payments via Razorpay
        </p>
      </Section>

      {/* ============ FINAL CTA ============ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="card p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-gold-400/10 blur-3xl"/>
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-navy-700/15 blur-3xl"/>
          <div className="relative">
            <Sparkles className="mx-auto mb-3 text-gold-500" size={28}/>
            <h2 className="font-display font-extrabold text-3xl lg:text-4xl mb-3">
              Ready to <span className="gold-text">crack your exam?</span>
            </h2>
            <p className="text-[rgb(var(--text-muted))] max-w-md mx-auto mb-6">
              Join 5 lakh+ aspirants. First quiz is free, no card needed.
            </p>
            <Link to={user ? '/dashboard' : '/register'} className="btn-primary text-base px-7 py-3.5">
              Start Practicing Now <ArrowRight size={16}/>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="border-t border-[rgb(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
          <div>
            <Logo size="sm"/>
            <p className="text-[rgb(var(--text-muted))] mt-3 max-w-xs text-xs leading-relaxed">
              Built in India 🇮🇳 for the next generation of competitive exam toppers.
            </p>
          </div>
          {[
            { h: 'Exams',    items: ['RAS Pre', 'RAS Mains', 'REET', 'UPSC', 'SSC'] },
            { h: 'Platform', items: ['Daily Quiz', 'Mock Tests', 'Leaderboard', 'PYQs', 'Notes'] },
            { h: 'Company',  items: ['About', 'Contact', 'Privacy', 'Terms', 'Refund'] },
          ].map(col => (
            <div key={col.h}>
              <div className="font-bold mb-3 uppercase tracking-wider text-xs">{col.h}</div>
              <ul className="space-y-1.5 text-[rgb(var(--text-muted))]">
                {col.items.map(i => <li key={i} className="hover:text-gold-500 cursor-pointer">{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-[rgb(var(--border))] py-5 text-center text-xs text-[rgb(var(--text-muted))]">
          © {new Date().getFullYear()} RAS Arena · Crafted with ♥ for Indian aspirants
        </div>
      </footer>

      {/* ============ STICKY MOBILE NAV ============ */}
      {!user && (
        <div className="fixed bottom-0 inset-x-0 z-30 md:hidden glass border-t border-[rgb(var(--border))] pb-safe">
          <div className="flex">
            <a href="#categories" className="tab-item"><HomeIcon size={18}/><span>Home</span></a>
            <a href="#popular"    className="tab-item"><BookOpen size={18}/><span>Series</span></a>
            <Link to="/register"  className="tab-item active"><Zap size={18}/><span>Free Quiz</span></Link>
            <a href="#toppers"    className="tab-item"><Trophy size={18}/><span>Toppers</span></a>
            <Link to="/login"     className="tab-item"><LogIn size={18}/><span>Login</span></Link>
          </div>
        </div>
      )}
    </div>
  )
}
