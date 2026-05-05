// ProfilePage.jsx
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { User, Save, Shield, Zap } from 'lucide-react'

const RANK_META = {
  Beginner:  { color: 'text-gray-400',   next: 'Explorer',  needed: 100  },
  Explorer:  { color: 'text-green-400',  next: 'Scholar',   needed: 500  },
  Scholar:   { color: 'text-blue-400',   next: 'Expert',    needed: 1000 },
  Expert:    { color: 'text-purple-400', next: 'Master',    needed: 2000 },
  Master:    { color: 'text-yellow-400', next: 'Champion',  needed: 5000 },
  Champion:  { color: 'text-orange-400', next: 'Legend',    needed: 10000 },
  Legend:    { color: 'text-red-400',    next: null,        needed: null  },
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)

  const rankMeta = RANK_META[user?.rank] || RANK_META.Beginner
  const nextPoints = rankMeta.needed
  const progress = nextPoints ? Math.min(100, Math.round((user?.totalPoints / nextPoints) * 100)) : 100

  const save = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await api.put('/users/profile', { name })
      await refreshUser()
      toast.success('Profile updated!')
    } catch { toast.error('Update failed.') }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <h1 className="section-title">My Profile</h1>

      {/* Rank card */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none"/>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/15 flex items-center justify-center text-2xl font-bold text-brand-400">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className={`text-sm font-bold mt-1 ${rankMeta.color}`}>🏅 {user?.rank}</div>
          </div>
          {user?.isPremium && (
            <span className="ml-auto badge-gold"><Zap size={12}/> Premium</span>
          )}
        </div>

        {/* Rank progress */}
        {rankMeta.next && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>{user?.totalPoints} pts</span>
              <span>{nextPoints} pts → {rankMeta.next}</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full transition-all" style={{ width: `${progress}%` }}/>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Attempts',    value: user?.totalQuizAttempts || 0 },
          { label: 'Accuracy',    value: (user?.accuracy || 0) + '%' },
          { label: 'Points',      value: user?.totalPoints || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="stat-card">
            <div className="text-xl font-bold text-brand-400">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      <div className="card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><User size={16} className="text-brand-400"/> Edit Profile</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Display Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Email</label>
            <input className="input opacity-50 cursor-not-allowed" value={user?.email} readOnly/>
            <p className="text-xs text-gray-600 mt-1">Email change nahi ho sakta.</p>
          </div>
          <button onClick={save} disabled={saving} className="btn-primary">
            <Save size={14}/> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm"><Shield size={14} className="text-brand-400"/> Account Security</h3>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Account Status</span>
          <span className="badge-green">Active</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-3">
          <span className="text-gray-400">Member Since</span>
          <span className="text-gray-300">{new Date(user?.createdAt).toLocaleDateString('en-IN')}</span>
        </div>
      </div>
    </div>
  )
}
