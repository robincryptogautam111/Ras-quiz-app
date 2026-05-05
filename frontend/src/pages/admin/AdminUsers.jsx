import { useState, useEffect } from 'react'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Search, Shield, ShieldOff, Trash2, Zap } from 'lucide-react'

const RANK_COLOR = { Beginner:'text-gray-400', Explorer:'text-green-400', Scholar:'text-blue-400', Expert:'text-purple-400', Master:'text-yellow-400', Champion:'text-orange-400', Legend:'text-red-400' }

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetch = (s, p) => {
    const params = new URLSearchParams({ page: p||page, limit: 20 })
    if (s||search) params.set('search', s||search)
    api.get(`/admin/users?${params}`).then(r => { setUsers(r.data.data); setPagination(r.data.pagination) }).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [page])
  useEffect(() => { const t = setTimeout(() => fetch(search, 1), 400); return () => clearTimeout(t) }, [search])

  const toggleBlock = async (u) => {
    try { await api.put(`/admin/users/${u._id}/toggle-block`); toast.success(`User ${u.isActive?'blocked':'unblocked'}!`); fetch() }
    catch { toast.error('Failed.') }
  }
  const del = async (id) => {
    if (!confirm('Delete user permanently?')) return
    try { await api.delete(`/admin/users/${id}`); toast.success('Deleted.'); setUsers(u => u.filter(x => x._id !== id)) }
    catch { toast.error('Failed.') }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl tracking-wider">Users</h1>
        <p className="text-gray-400 text-sm mt-1">{pagination.total||0} registered users</p>
      </div>
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"/>
        <input className="input pl-10" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}/>
      </div>
      {loading ? <div className="space-y-2">{[...Array(8)].map((_,i)=><div key={i} className="h-14 rounded-xl bg-gray-800/50 animate-pulse"/>)}</div> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-white/[0.06]">{['User','Email','Rank','Points','Attempts','Status','Actions'].map(h=><th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-white/[0.04]">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-xs font-bold text-brand-400">{u.name?.[0]?.toUpperCase()}</div>
                        <div><p className="font-medium">{u.name}</p>{u.isPremium&&<span className="text-xs text-yellow-400 flex items-center gap-0.5"><Zap size={9}/>Premium</span>}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.email}</td>
                    <td className="px-4 py-3"><span className={`text-xs font-bold ${RANK_COLOR[u.rank]||'text-gray-400'}`}>{u.rank}</span></td>
                    <td className="px-4 py-3 text-brand-400 font-bold">{u.totalPoints}</td>
                    <td className="px-4 py-3 text-gray-400">{u.totalQuizAttempts}</td>
                    <td className="px-4 py-3"><span className={`badge text-xs ${u.isActive?'badge-green':'badge-red'}`}>{u.isActive?'Active':'Blocked'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={()=>toggleBlock(u)} className={`p-1.5 rounded-lg transition-all ${u.isActive?'hover:bg-red-500/10 text-gray-400 hover:text-red-400':'hover:bg-green-500/10 text-gray-400 hover:text-green-400'}`}>{u.isActive?<ShieldOff size={14}/>:<Shield size={14}/>}</button>
                        <button onClick={()=>del(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all"><Trash2 size={14}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {pagination.pages>1&&<div className="flex justify-center gap-3"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-sm disabled:opacity-30">← Prev</button><span className="text-sm text-gray-400 self-center">{page}/{pagination.pages}</span><button onClick={()=>setPage(p=>Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next →</button></div>}
    </div>
  )
}
