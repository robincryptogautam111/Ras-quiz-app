import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Phone, ArrowRight, Sparkles, ShieldCheck, Trophy } from 'lucide-react'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'

const TABS = [
  { id: 'email',  label: 'Email',  icon: Mail },
  { id: 'phone',  label: 'Mobile OTP', icon: Phone },
]

function AuthShell({ children, title, sub }) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left brand panel — desktop only */}
      <div className="hidden lg:flex relative overflow-hidden bg-navy-900 dark:bg-navy-950 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400/15 blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold-600/10 blur-3xl"/>
        </div>
        <Logo size="lg" />
        <div>
          <h2 className="font-display font-extrabold text-4xl leading-tight mb-4">
            India's smartest <span className="gold-text">quiz arena</span>.
          </h2>
          <p className="text-white/70 max-w-sm leading-relaxed">
            5 lakh+ aspirants. 12,000+ tests. Daily quizzes, AI weak-topic analysis, and a fierce leaderboard — all in one place.
          </p>
          <div className="grid grid-cols-3 gap-3 mt-8 max-w-sm">
            {[
              { icon: Sparkles,    v: 'AI-Powered',   l: 'Analytics' },
              { icon: ShieldCheck, v: 'Razorpay',     l: 'Secure UPI' },
              { icon: Trophy,      v: 'Live',         l: 'Leaderboard' },
            ].map(s => (
              <div key={s.v} className="rounded-xl bg-white/5 border border-white/10 p-3 text-center">
                <s.icon size={16} className="mx-auto mb-1 text-gold-400"/>
                <div className="text-xs font-bold">{s.v}</div>
                <div className="text-[10px] text-white/50">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-white/40">Built in India 🇮🇳 for the next generation of toppers.</p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0">
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6">
          <ThemeToggle/>
        </div>
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex justify-center"><Logo size="md"/></div>
          <h1 className="font-display font-extrabold text-3xl mb-1">{title}</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm mb-7">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

function GoogleButton() {
  return (
    <button type="button"
      onClick={() => toast('Google sign-in coming soon — use email for now.', { icon: 'ℹ️' })}
      className="btn-ghost w-full justify-center py-3 !font-semibold">
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 8 3l5.7-5.7C33.6 6.5 29 4.6 24 4.6 13.5 4.6 5 13.1 5 23.6S13.5 42.6 24 42.6 43 34.1 43 23.6c0-1-.1-2.1-.4-3.1z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 8 3l5.7-5.7C33.6 6.5 29 4.6 24 4.6 16.3 4.6 9.5 9.1 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 42.6c5 0 9.5-1.9 12.9-5l-6-4.9c-1.9 1.4-4.3 2.3-6.9 2.3-5.3 0-9.7-3.4-11.3-8L6 31.7C9.1 37.6 16 42.6 24 42.6z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2.1 3.9-3.9 5.2l6 4.9c-.4.4 6.6-4.8 6.6-14.5 0-1-.1-2.1-.4-3.1z"/>
      </svg>
      Continue with Google
    </button>
  )
}

function EmailLoginForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] block mb-1.5">Email</label>
        <input className="input" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required autoComplete="email"/>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))]">Password</label>
          <button type="button" className="text-[11px] text-gold-500 hover:underline"
            onClick={() => toast('Reset link will be emailed.', { icon: '📧' })}>Forgot?</button>
        </div>
        <div className="relative">
          <input className="input pr-11" type={show ? 'text' : 'password'} placeholder="••••••••"
            value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required autoComplete="current-password"/>
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text))]">
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
        {loading ? 'Signing in…' : <>Sign in <ArrowRight size={16}/></>}
      </button>
    </form>
  )
}

function OtpForm() {
  const [phone, setPhone] = useState('')
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])

  const send = (e) => {
    e.preventDefault()
    if (!/^\d{10}$/.test(phone)) return toast.error('Enter a valid 10-digit mobile number')
    toast.success('OTP sent! (demo — backend not wired yet)')
    setStep('otp')
  }
  const verify = (e) => {
    e.preventDefault()
    toast('Mobile OTP login is coming soon — use email for now.', { icon: 'ℹ️' })
  }

  if (step === 'phone') {
    return (
      <form onSubmit={send} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] block mb-1.5">Mobile number</label>
          <div className="flex gap-2">
            <span className="input !w-auto flex items-center font-semibold text-[rgb(var(--text-muted))]">+91</span>
            <input className="input flex-1" inputMode="numeric" maxLength={10} placeholder="98765 43210"
              value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g,''))} required/>
          </div>
        </div>
        <button type="submit" className="btn-primary w-full justify-center py-3 text-base">
          Send OTP <ArrowRight size={16}/>
        </button>
        <p className="text-[11px] text-[rgb(var(--text-muted))] text-center">By continuing you agree to our Terms & Privacy Policy.</p>
      </form>
    )
  }

  return (
    <form onSubmit={verify} className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] block mb-1.5">
          Enter the 6-digit OTP sent to +91 {phone}
        </label>
        <div className="flex gap-2 justify-between">
          {otp.map((d, i) => (
            <input key={i} className="input !w-12 text-center !px-0 !text-lg !font-bold" maxLength={1}
              value={d} onChange={e => {
                const v = e.target.value.replace(/\D/g,'')
                setOtp(prev => prev.map((x, j) => j === i ? v : x))
                if (v && i < 5) e.target.parentElement.children[i+1]?.focus()
              }}/>
          ))}
        </div>
      </div>
      <button type="submit" className="btn-primary w-full justify-center py-3">Verify & Sign in</button>
      <button type="button" onClick={() => setStep('phone')} className="text-xs text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] block mx-auto">
        Change number
      </button>
    </form>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState('email')

  const handleEmailSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const u = await login(email, password)
      toast.success(`Welcome back, ${u.name}!`)
      navigate(u.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  return (
    <AuthShell title="Welcome back" sub="Sign in to continue your prep streak.">
      <GoogleButton/>
      <div className="flex items-center gap-3 my-5">
        <div className="divider flex-1"/>
        <span className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-faint))]">or</span>
        <div className="divider flex-1"/>
      </div>

      <div role="tablist" className="flex gap-1 p-1 surface-2 rounded-xl mb-5">
        {TABS.map(t => (
          <button key={t.id} role="tab" type="button" onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all
              ${tab === t.id ? 'bg-[rgb(var(--surface))] text-[rgb(var(--text))] shadow-sm' : 'text-[rgb(var(--text-muted))]'}`}>
            <t.icon size={14}/> {t.label}
          </button>
        ))}
      </div>

      {tab === 'email' ? <EmailLoginForm onSubmit={handleEmailSubmit} loading={loading}/> : <OtpForm/>}

      <p className="text-center text-sm text-[rgb(var(--text-muted))] mt-6">
        New to RAS Arena?{' '}
        <Link to="/register" className="text-gold-500 hover:underline font-semibold">Create an account</Link>
      </p>
    </AuthShell>
  )
}
