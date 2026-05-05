import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { Download, CheckCircle2, XCircle } from 'lucide-react'

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [exporting, setExporting] = useState(false)

  const fetch = (p = page) => {
    api.get(`/admin/attempts?page=${p}&limit=20`).then(r => {
      setAttempts(r.data.data); setPagination(r.data.pagination)
    }).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [page])

  const exportXLSX = async () => {
    setExporting(true)
    try {
      const res = await api.get('/admin/export/attempts', { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url; a.download = 'attempts.xlsx'; a.click()
      URL.revokeObjectURL(url)
    } catch { alert('Export failed.') }
    finally { setExporting(false) }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider">Attempts</h1>
          <p className="text-gray-400 text-sm mt-1">{pagination.total||0} total attempts</p>
        </div>
        <button onClick={exportXLSX} disabled={exporting} className="btn-ghost text-sm">
          <Download size={14}/> {exporting ? 'Exporting...' : 'Export Excel'}
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_,i)=><div key={i} className="h-12 rounded-xl bg-gray-800/50 animate-pulse"/>)}</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['User','Quiz','Score','Correct','Wrong','Time','Passed','Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {attempts.map(a => {
                  const mm = Math.floor((a.timeTaken||0)/60), ss = (a.timeTaken||0)%60
                  return (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium">{a.user?.name}</p>
                        <p className="text-xs text-gray-500">{a.user?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-xs max-w-[160px]">
                        <p className="truncate">{a.quiz?.title}</p>
                        <p className="text-gray-500">{a.quiz?.category}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`font-bold ${a.percentage>=60?'text-emerald-400':'text-red-400'}`}>{a.percentage}%</span>
                      </td>
                      <td className="px-4 py-3 text-emerald-400">{a.correctAnswers}</td>
                      <td className="px-4 py-3 text-red-400">{a.wrongAnswers}</td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs">{mm}m{ss}s</td>
                      <td className="px-4 py-3">
                        {a.isPassed
                          ? <CheckCircle2 size={16} className="text-emerald-400"/>
                          : <XCircle size={16} className="text-red-400"/>}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(a.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn-ghost text-sm disabled:opacity-30">← Prev</button>
          <span className="text-sm text-gray-400 self-center">{page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages,p+1))} disabled={page===pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  )
}
