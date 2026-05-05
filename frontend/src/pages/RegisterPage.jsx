import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Eye, EyeOff } from 'lucide-react'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password min 6 characters ka hona chahiye.'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      toast.success('🎉 Account create ho gaya!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(255,77,0,0.8)] animate-pulse"/>
            <span className="font-display text-2xl tracking-widest">RAS ARENA</span>
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-gray-400 text-sm mt-1">RAS Arena join karo — bilkul free!</p>
        </div>
        <div className="card p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input className="input" placeholder="Apna naam likhо" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
              <input className="input" type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <input className="input pr-10" type={showPwd ? 'text' : 'password'} placeholder="Min 6 characters"
                  value={form.password} onChange={set('password')} required />
                <button type="button" onClick={() => setShowPwd(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? 'Creating...' : 'Create Account →'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already registered?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold">Login karo</Link>
          </p>
        </div>
        <Link to="/" className="block text-center text-xs text-gray-600 hover:text-gray-400 mt-5">← Back to home</Link>
      </div>
    </div>
  )
}
