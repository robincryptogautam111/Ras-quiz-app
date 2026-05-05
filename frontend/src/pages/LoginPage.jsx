import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Zap } from 'lucide-react'

function AuthLayout({ children, title, sub }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_12px_rgba(255,77,0,0.8)] animate-pulse" />
            <span className="font-display text-2xl tracking-widest">RAS ARENA</span>
          </div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-400 text-sm mt-1">{sub}</p>
        </div>
        <div className="card p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name}! 🎯`)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome Back" sub="Login karke practice shuru karo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Email</label>
          <input className="input" type="email" placeholder="your@email.com"
            value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Password</label>
          <div className="relative">
            <input className="input pr-11" type={show ? 'text' : 'password'} placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
          {loading ? 'Logging in...' : 'Login →'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-5">
        Account nahi hai?{' '}
        <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold">Register karo</Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password kam se kam 6 characters ka hona chahiye.'); return }
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password)
      toast.success(`Welcome, ${user.name}! Let's crack RAS 🚀`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Join RAS Arena" sub="Free mein register karo aur shuru karo">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Full Name</label>
          <input className="input" placeholder="Apna naam likhо" value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Email</label>
          <input className="input" type="email" placeholder="your@email.com" value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Password</label>
          <div className="relative">
            <input className="input pr-11" type={show ? 'text' : 'password'} placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            <button type="button" onClick={() => setShow(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
          {loading ? 'Creating account...' : 'Create Account →'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-400 mt-5">
        Already account hai?{' '}
        <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Login karo</Link>
      </p>
    </AuthLayout>
  )
}
