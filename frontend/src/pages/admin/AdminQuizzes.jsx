import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, Lock, Unlock } from 'lucide-react'

const DIFF_BADGE = { Easy:'badge-green', Medium:'badge-orange', Hard:'badge-red' }

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch = () => {
    api.get('/admin/quizzes').then(r => setQuizzes(r.data.data)).finally(() => setLoading(false))
  }
  useEffect(fetch, [])

  const toggle = async (quiz, field) => {
    try {
      await api.put(`/admin/quizzes/${quiz._id}`, { [field]: !quiz[field] })
      toast.success(`${field === 'isPublished' ? (quiz.isPublished ? 'Unpublished' : 'Published') : (quiz.isActive ? 'Disabled' : 'Enabled')}!`)
      fetch()
    } catch { toast.error('Update failed.') }
  }

  const del = async (id) => {
    if (!confirm('Are you sure? This will delete all questions too.')) return
    try {
      await api.delete(`/admin/quizzes/${id}`)
      toast.success('Quiz deleted.')
      setQuizzes(q => q.filter(x => x._id !== id))
    } catch { toast.error('Delete failed.') }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-wider">Quizzes</h1>
          <p className="text-gray-400 text-sm mt-1">{quizzes.length} total quizzes</p>
        </div>
        <Link to="/admin/quizzes/new" className="btn-primary"><Plus size={16}/> New Quiz</Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 rounded-xl bg-gray-800/50 animate-pulse"/>)}</div>
      ) : quizzes.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={36} className="text-gray-600 mx-auto mb-3"/>
          <p className="text-gray-400 mb-4">No quizzes yet.</p>
          <Link to="/admin/quizzes/new" className="btn-primary inline-flex">+ Create First Quiz</Link>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Diff</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Qs</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {quizzes.map(q => (
                  <tr key={q._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-[220px]">{q.title}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{q.category}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${DIFF_BADGE[q.difficulty]||'badge-orange'} text-xs`}>{q.difficulty}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{q.totalQuestions}</td>
                    <td className="px-4 py-3">
                      {q.type === 'paid'
                        ? <span className="badge-red text-xs flex items-center gap-1 w-fit"><Lock size={10}/> ₹{q.price}</span>
                        : <span className="badge-green text-xs">Free</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`badge text-xs w-fit ${q.isPublished ? 'badge-green' : 'badge-red'}`}>
                          {q.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className={`badge text-xs w-fit ${q.isActive ? 'badge-green' : 'badge-red'}`}>
                          {q.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Link to={`/admin/quizzes/${q._id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all" title="Edit">
                          <Pencil size={14}/>
                        </Link>
                        <button onClick={() => toggle(q, 'isPublished')}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-sky-400 transition-all"
                          title={q.isPublished ? 'Unpublish' : 'Publish'}>
                          {q.isPublished ? <EyeOff size={14}/> : <Eye size={14}/>}
                        </button>
                        <button onClick={() => toggle(q, 'isActive')}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-all"
                          title={q.isActive ? 'Disable' : 'Enable'}>
                          {q.isActive ? <Lock size={14}/> : <Unlock size={14}/>}
                        </button>
                        <button onClick={() => del(q._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all" title="Delete">
                          <Trash2 size={14}/>
                        </button>
                      </div>
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
