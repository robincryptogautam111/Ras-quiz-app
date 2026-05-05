// -- LeaderboardPage.jsx
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Trophy, Medal, Crown } from 'lucide-react'

export default function LeaderboardPage() {
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
    </div>
  )
}
