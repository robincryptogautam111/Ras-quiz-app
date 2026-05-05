import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { Search, Clock, BookOpen, Lock, Star } from 'lucide-react'

const CATEGORIES = ['All','Rajasthan History','Indian History','Geography','Indian Polity',
  'Economy','Science & Tech','Current Affairs','Rajasthan GK','Environment','Art & Culture']
const DIFFS = ['All','Easy','Medium','Hard']
const TYPES = ['All','free','paid']
const DIFF_COLOR = { Easy:'badge-green', Medium:'badge-orange', Hard:'badge-red' }
const CAT_ICONS = {
  'Rajasthan History':'🏰','Indian History':'⚔️','Geography':'🗺️','Indian Polity':'⚖️',
  'Economy':'📈','Science & Tech':'🔬','Current Affairs':'📰','Rajasthan GK':'🌵',
  'Environment':'🌿','Art & Culture':'🎨','Maths & Reasoning':'🧮','General':'📚'
}

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [difficulty, setDifficulty] = useState('All')
  const [type, setType] = useState('All')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  const fetchQuizzes = async () => {
    setLoading(true)
    try {
      const p = new URLSearchParams({ page, limit: 12 })
      if (search) p.set('search', search)
      if (category !== 'All') p.set('category', category)
      if (difficulty !== 'All') p.set('difficulty', difficulty)
      if (type !== 'All') p.set('type', type)
      const res = await api.get(`/quizzes?${p}`)
      setQuizzes(res.data.data)
      setPagination(res.data.pagination)
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchQuizzes() }, [page, category, difficulty, type])
  useEffect(() => { const t = setTimeout(fetchQuizzes, 400); return () => clearTimeout(t) }, [search])

  const FilterBtn = ({ active, onClick, children }) => (
    <button onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        active ? 'bg-brand-500 text-white' : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
      }`}>{children}</button>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="section-title">All Quizzes</h1>
        <p className="text-sm text-gray-400 mt-1">{pagination.total || 0} quizzes available</p>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input className="input pl-10 text-sm" placeholder="Search quizzes..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(c => (
            <FilterBtn key={c} active={category === c} onClick={() => { setCategory(c); setPage(1) }}>
              {c === 'All' ? 'All Topics' : c}
            </FilterBtn>
          ))}
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex gap-1.5">
            {DIFFS.map(d => <FilterBtn key={d} active={difficulty === d} onClick={() => { setDifficulty(d); setPage(1) }}>{d}</FilterBtn>)}
          </div>
          <div className="flex gap-1.5">
            {TYPES.map(t => (
              <FilterBtn key={t} active={type === t} onClick={() => { setType(t); setPage(1) }}>
                {t === 'All' ? 'All' : t === 'free' ? 'Free' : 'Paid'}
              </FilterBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-48 rounded-2xl bg-gray-800/50 animate-pulse" />)}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Koi quiz nahi mili. Filters badlo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map(q => <QuizCard key={q._id} quiz={q} />)}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm disabled:opacity-30">← Prev</button>
          <span className="text-sm text-gray-400">{page} / {pagination.pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} className="btn-ghost text-sm disabled:opacity-30">Next →</button>
        </div>
      )}
    </div>
  )
}

function QuizCard({ quiz }) {
  const isPaid = quiz.type === 'paid'
  const locked = isPaid && !quiz.hasAccess
  const mins = Math.floor((quiz.duration || 0) / 60)
  return (
    <Link to={`/quizzes/${quiz._id}`}
      className="card-hover flex flex-col p-5 group relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl" />
      <div className="flex items-start justify-between mb-4">
        <span className="text-3xl">{CAT_ICONS[quiz.category] || '📚'}</span>
        <div className="flex flex-col items-end gap-1.5">
          {quiz.isFeatured && <span className="badge-gold text-xs">⭐ Featured</span>}
          {locked ? <span className="badge-red text-xs"><Lock size={10} /> ₹{quiz.price}</span>
            : isPaid ? <span className="badge-green text-xs">✓ Unlocked</span>
            : <span className="badge-green text-xs">Free</span>}
        </div>
      </div>
      <h3 className="font-bold text-sm leading-snug mb-1.5 flex-1 line-clamp-2">{quiz.title}</h3>
      {quiz.description && <p className="text-xs text-gray-500 line-clamp-2 mb-4">{quiz.description}</p>}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className={`badge ${DIFF_COLOR[quiz.difficulty] || 'badge-orange'} text-xs`}>{quiz.difficulty}</span>
          <span className="flex items-center gap-1"><BookOpen size={11} /> {quiz.totalQuestions}Q</span>
        </div>
        <span className="flex items-center gap-1"><Clock size={11} /> {mins}m</span>
      </div>
      {quiz.totalAttempts > 0 && (
        <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-600">
          <Star size={9} /> {quiz.totalAttempts} attempts • Avg {quiz.avgScore}%
        </div>
      )}
    </Link>
  )
}
