// ─── LeaderboardPage.jsx ────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Medal, Crown } from 'lucide-react'

export function LeaderboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState([])
  const [myPos, setMyPos] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leaderboard/global')
      .then(res => { setData(res.data.data); setMyPos(res.data.myPosition) })
      .finally(() => setLoading(false))
  }, [])

  const posIcon = (pos) => {
    if (pos === 1) return <Crown size={16} className="text-yellow-400" />
    if (pos === 2) return <Medal size={16} className="text-gray-300" />
    if (pos === 3) return <Medal size={16} className="text-amber-600" />
    return <span className="text-xs font-mono text-gray-500">#{pos}</span>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold mb-1">🏆 Leaderboard</h1>
        <p className="text-gray-400 text-sm">Top performers of RAS Arena</p>
      </div>

      {myPos && (
        <div className="card p-4 border-brand-500/20 bg-brand-500/5">
          <p className="text-sm text-gray-400">Tera rank: <span className="text-brand-400 font-bold text-lg">#{myPos}</span></p>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[...Array(10)].map((_,i) => <div key={i} className="h-16 rounded-xl bg-gray-800/50 animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {data.map((entry, idx) => (
            <div key={entry._id}
              className={`card p-4 flex items-center gap-4 transition-all ${
                entry.isCurrentUser ? 'border-brand-500/40 bg-brand-500/5' : ''
              } ${idx < 3 ? 'border-yellow-500/20' : ''}`}>
              <div className="w-8 flex items-center justify-center">{posIcon(entry.position)}</div>
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {entry.avatar ? <img src={entry.avatar} className="w-full h-full rounded-full object-cover" /> : entry.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">
                  {entry.name} {entry.isCurrentUser && <span className="text-brand-400">(You)</span>}
                </div>
                <div className="text-xs text-gray-500">{entry.rank} • {entry.totalAttempts} attempts</div>
              </div>
              <div className="font-bold text-brand-400 font-mono">{entry.totalPoints} pts</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default LeaderboardPage

// ─── ProfilePage.jsx ─────────────────────────────────────────────────────────
import { useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/users/stats').then(r => setStats(r.data.data))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/profile', { name })
      await refreshUser()
      toast.success('Profile updated!')
    } catch { toast.error('Update failed.') }
    finally { setSaving(false) }
  }

  const radarData = stats ? Object.entries(stats.categoryStats || {}).map(([cat, s]) => ({
    subject: cat.split(' ')[0], score: s.avgScore
  })) : []

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">My Profile</h1>

      {/* Avatar + name */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/20 flex items-center justify-center text-2xl font-bold text-brand-400">
            {user?.name?.[0]}
          </div>
          <div>
            <div className="font-bold text-lg">{user?.name}</div>
            <div className="text-sm text-gray-400">{user?.email}</div>
            <div className="badge-orange mt-1">{user?.rank}</div>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider font-semibold block mb-1.5">Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Category radar */}
      {radarData.length > 0 && (
        <div className="card p-5">
          <h3 className="font-semibold mb-4">Performance by Category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#2a2a40" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 11 }} />
              <Radar dataKey="score" stroke="#ff4d00" fill="#ff4d00" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Premium info */}
      {user?.isPremium && (
        <div className="card p-4 border-yellow-500/20 bg-yellow-500/5">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">⚡</span>
            <span className="font-semibold text-yellow-400">Premium Active</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Expires: {new Date(user.premiumExpiresAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── OrderHistoryPage.jsx ────────────────────────────────────────────────────
export function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payment/history').then(r => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Order History</h1>
      {loading ? <div className="h-40 rounded-2xl bg-gray-800/50 animate-pulse" /> :
       orders.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-400">Koi orders nahi abhi.</p>
        </div>
       ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o._id} className="card p-4 flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">
                  {o.purchaseType === 'premium' ? `⚡ Premium — ${o.premiumMonths}m` : o.quiz?.title || 'Quiz'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {o.razorpayPaymentId} • {new Date(o.createdAt).toLocaleDateString('en-IN')}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-emerald-400">₹{o.amount / 100}</div>
                <div className="badge-green text-xs mt-1">Paid</div>
              </div>
            </div>
          ))}
        </div>
       )}
    </div>
  )
}

// ─── BookmarksPage.jsx ───────────────────────────────────────────────────────
export function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/bookmarks').then(r => setBookmarks(r.data.data)).finally(() => setLoading(false))
  }, [])

  const removeBookmark = async (qId) => {
    await api.post(`/users/bookmarks/${qId}`)
    setBookmarks(b => b.filter(q => q._id !== qId))
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Bookmarks</h1>
      {loading ? <div className="h-40 rounded-2xl bg-gray-800/50 animate-pulse" /> :
       bookmarks.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-4xl mb-3">🔖</p>
          <p className="text-gray-400">Koi bookmarks nahi abhi.</p>
        </div>
       ) : (
        <div className="space-y-3">
          {bookmarks.map(q => (
            <div key={q._id} className="card p-4 flex items-start gap-3">
              <div className="flex-1">
                <p className="text-xs text-brand-400 font-semibold mb-1">{q.quiz?.title}</p>
                <p className="text-sm font-devanagari">{q.text}</p>
                <p className="text-xs text-emerald-400 mt-1.5">✓ {q.options?.[q.correctOption]?.text}</p>
              </div>
              <button onClick={() => removeBookmark(q._id)} className="text-gray-600 hover:text-red-400 text-xs mt-0.5">✕</button>
            </div>
          ))}
        </div>
       )}
    </div>
  )
}
