import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Mail, Phone, ArrowRight, Check } from 'lucide-react'
import Logo from '../components/common/Logo'
import ThemeToggle from '../components/common/ThemeToggle'

const PERKS = [
  'Free daily quiz access',
  'AI weak-topic detection',
  'Hindi + English bilingual content',
  'Live leaderboard & streaks',
]

function GoogleButton() {
  return (
    <button type="button"
      onClick={() => toast('Google sign-up coming soon — use email for now.', { icon: 'ℹ️' })}
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

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('Account created! Let\'s go 🎯')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="hidden lg:flex relative overflow-hidden bg-navy-900 dark:bg-navy-950 text-white p-12 flex-col justify-between">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold-400/15 blur-3xl"/>
          <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-gold-600/10 blur-3xl"/>
        </div>
        <Logo size="lg" />
        <div>
          <h2 className="font-display font-extrabold text-4xl leading-tight mb-4">
            Start free.<br/>Crack <span className="gold-text">your dream exam.</span>
          </h2>
          <ul className="space-y-2.5 mt-6 text-sm">
            {PERKS.map(p => (
              <li key={p} className="flex items-center gap-2.5"><Check size={16} className="text-gold-400"/>{p}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/40">Already trusted by 5L+ aspirants across India.</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12 min-h-screen lg:min-h-0 relative">
        <div className="absolute top-4 right-4 lg:top-6 lg:right-6"><ThemeToggle/></div>
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex justify-center"><Logo size="md"/></div>
          <h1 className="font-display font-extrabold text-3xl mb-1">Create your account</h1>
          <p className="text-[rgb(var(--text-muted))] text-sm mb-7">Free forever. Premium when you're ready.</p>

          <GoogleButton/>
          <div className="flex items-center gap-3 my-5">
            <div className="divider flex-1"/>
            <span className="text-[11px] uppercase tracking-wider text-[rgb(var(--text-faint))]">or sign up with email</span>
            <div className="divider flex-1"/>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] block mb-1.5">Full name</label>
              <input className="input" placeholder="Your full name" value={form.name} onChange={set('name')} required/>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[rgb(var(--text-faint))]"/>
                <input className="input pl-10" type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required/>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[rgb(var(--text-muted))] block mb-1.5">Password</label>
              <div className="relative">
                <input className="input pr-11" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.password} onChange={set('password')} required/>
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--text-faint))] hover:text-[rgb(var(--text))]">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading ? 'Creating account…' : <>Create Account <ArrowRight size={16}/></>}
            </button>
          </form>

          <p className="text-center text-sm text-[rgb(var(--text-muted))] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-gold-500 hover:underline font-semibold">Sign in</Link>
          </p>
          <p className="text-center text-[11px] text-[rgb(var(--text-faint))] mt-4">
            By creating an account you agree to the Terms & Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
