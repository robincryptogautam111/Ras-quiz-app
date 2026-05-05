import { useState, useEffect } from 'react'
import api from '../utils/api'
import { CreditCard, CheckCircle2, XCircle, Clock, Zap, BookOpen } from 'lucide-react'

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/payment/history').then(r => setOrders(r.data.data)).finally(() => setLoading(false)) }, [])
  const STATUS_BADGE = { paid:'badge-green', failed:'badge-red', created:'badge-gold' }
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3"><h1 className="section-title">Order History</h1><div className="divider"/><span className="badge-blue">{orders.length} orders</span></div>
      {loading ? <div className="space-y-3">{[...Array(4)].map((_,i)=><div key={i} className="h-16 rounded-xl bg-gray-800/50 animate-pulse"/>)}</div>
      : orders.length === 0 ? <div className="card p-16 text-center"><CreditCard size={36} className="text-gray-600 mx-auto mb-3"/><p className="text-gray-400 text-sm">Koi purchase nahi ki abhi.</p></div>
      : <div className="space-y-3">{orders.map(o => (
          <div key={o._id} className="card px-5 py-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${o.purchaseType==='premium'?'bg-yellow-500/10':'bg-emerald-500/10'}`}>
              {o.purchaseType==='premium'?<Zap size={18} className="text-yellow-400"/>:<BookOpen size={18} className="text-emerald-400"/>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{o.purchaseType==='quiz'?(o.quiz?.title||'Quiz Purchase'):`Premium — ${o.premiumMonths} Month`}</p>
              <p className="text-xs text-gray-500 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-bold text-emerald-400 text-sm">₹{o.amount/100}</span>
              <span className={`badge ${STATUS_BADGE[o.status]||'badge-blue'}`}>{o.status}</span>
            </div>
          </div>
        ))}</div>}
    </div>
  )
}
