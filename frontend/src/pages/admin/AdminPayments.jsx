import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { CreditCard, CheckCircle2, XCircle, Clock, Download } from 'lucide-react'

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/payments').then(r => setPayments(r.data.data)).finally(() => setLoading(false))
  }, [])

  const total = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  const STATUS_BADGE = { paid:'badge-green', failed:'badge-red', created:'badge-gold' }
  const STATUS_ICON  = { paid:<CheckCircle2 size={12} className="text-emerald-400"/>, failed:<XCircle size={12} className="text-red-400"/>, created:<Clock size={12} className="text-yellow-400"/> }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider">Payments</h1>
          <p className="text-gray-400 text-sm mt-1">Total Revenue: <span className="text-emerald-400 font-bold">₹{total/100}</span></p>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Orders',  value: payments.length,                            color:'text-sky-400' },
          { label:'Successful',    value: payments.filter(p=>p.status==='paid').length, color:'text-emerald-400' },
          { label:'Failed',        value: payments.filter(p=>p.status==='failed').length, color:'text-red-400' },
        ].map(({label,value,color}) => (
          <div key={label} className="stat-card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(6)].map((_,i)=><div key={i} className="h-14 rounded-xl bg-gray-800/50 animate-pulse"/>)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['User','Type','Item','Amount','Status','Date','Order ID'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {payments.map(p => (
                  <tr key={p._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium">{p.user?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{p.user?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-xs ${p.purchaseType==='premium'?'badge-gold':'badge-blue'}`}>
                        {p.purchaseType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs max-w-[160px] truncate">
                      {p.purchaseType==='quiz' ? p.quiz?.title||'Quiz' : `Premium ${p.premiumMonths}mo`}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400">₹{p.amount/100}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_BADGE[p.status]||'badge-blue'} flex items-center gap-1 w-fit`}>
                        {STATUS_ICON[p.status]} {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 max-w-[120px] truncate" title={p.razorpayOrderId}>
                      {p.razorpayOrderId?.slice(0,16)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
