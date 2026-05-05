import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import api from '../utils/api'
import { CheckCircle2, XCircle, SkipForward, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D']

const getGrade = (pct) => {
  if (pct >= 85) return { label: '🏆 Topper!',    color: 'text-yellow-400',  ring: '#F5C842' }
  if (pct >= 70) return { label: '🔥 Strong!',    color: 'text-emerald-400', ring: '#10b981' }
  if (pct >= 50) return { label: '📈 Average',    color: 'text-sky-400',     ring: '#38bdf8' }
  return              { label: '💪 Keep Going',   color: 'text-red-400',     ring: '#ef4444' }
}

export default function ResultPage() {
  const { id, attemptId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const [result, setResult] = useState(state?.result || null)
  const [loading, setLoading] = useState(!state?.result)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    if (!result) {
      api.get('/users/history?limit=20')
        .then(res => {
          const found = res.data.data.find(a => a._id === attemptId)
          if (found) setResult(found)
        })
        .finally(() => setLoading(false))
    }
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!result) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Result not found.</p>
        <Link to="/dashboard" className="btn-primary">Go Home</Link>
      </div>
    </div>
  )

  const pct = result.percentage || 0
  const grade = getGrade(pct)
  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - pct / 100)
  const mm = Math.floor((result.timeTaken || 0) / 60)
  const ss = (result.timeTaken || 0) % 60

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

        {/* Score card */}
        <div className="card overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-brand-500 via-yellow-400 to-emerald-400" />
          <div className="p-8 text-center">
            {/* Circular progress */}
            <div className="relative w-36 h-36 mx-auto mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#1f2937" strokeWidth="8" />
                <circle cx="60" cy="60" r="54" fill="none"
                  stroke={grade.ring} strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22,1,0.36,1)' }} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-4xl" style={{ color: grade.ring }}>{pct}%</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest">Score</span>
              </div>
            </div>

            <h2 className={`text-3xl font-bold mb-2 ${grade.color}`}>{grade.label}</h2>
            <p className="text-gray-400 text-sm mb-6">
              {result.isPassed ? '🎉 Quiz pass kar li! Badhai ho!' : 'Ek baar aur karo — RAS nahi chhodna!'}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { n: result.correctAnswers, l: 'Correct', c: 'text-emerald-400' },
                { n: result.wrongAnswers,   l: 'Wrong',   c: 'text-red-400' },
                { n: result.skipped,        l: 'Skipped', c: 'text-yellow-400' },
                { n: `${mm}m${ss}s`,        l: 'Time',    c: 'text-sky-400' },
              ].map(({ n, l, c }) => (
                <div key={l} className="bg-gray-800/50 rounded-xl p-3">
                  <div className={`text-xl font-bold ${c}`}>{n}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>

            {result.pointsEarned !== undefined && (
              <div className="badge-gold mx-auto mb-5 inline-flex">
                +{result.pointsEarned} points • Rank: {result.newRank}
              </div>
            )}

            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => navigate(`/quiz/${id}/attempt`)} className="btn-primary">
                <RotateCcw size={15} /> Try Again
              </button>
              <Link to="/dashboard" className="btn-ghost"><Home size={15} /> Dashboard</Link>
              <Link to="/quizzes" className="btn-ghost">More Quizzes</Link>
            </div>
          </div>
        </div>

        {/* Answer review */}
        {result.detailedAnswers?.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="section-title text-xl">Answer Review</h3>
              <div className="divider" />
            </div>
            <div className="space-y-3">
              {result.detailedAnswers.map((a, i) => (
                <ReviewItem key={i} item={a} idx={i}
                  isOpen={expanded === i}
                  onToggle={() => setExpanded(expanded === i ? null : i)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewItem({ item, idx, isOpen, onToggle }) {
  const isCorrect = item.isCorrect
  const isSkipped = item.selectedOption === -1

  return (
    <div className={`card border-l-4 transition-all ${
      isCorrect ? 'border-l-emerald-500' : isSkipped ? 'border-l-yellow-500' : 'border-l-red-500'
    }`}>
      <button onClick={onToggle} className="w-full flex items-start gap-3 p-4 text-left">
        <span className={`mt-0.5 flex-shrink-0 ${
          isCorrect ? 'text-emerald-400' : isSkipped ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {isCorrect ? <CheckCircle2 size={18} />
           : isSkipped ? <SkipForward size={18} />
           : <XCircle size={18} />}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 font-mono mb-0.5">Q{idx + 1}</p>
          <p className="text-sm font-medium font-devanagari leading-snug">{item.questionText}</p>
        </div>
        {isOpen
          ? <ChevronUp size={16} className="text-gray-500 mt-1 flex-shrink-0" />
          : <ChevronDown size={16} className="text-gray-500 mt-1 flex-shrink-0" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 border-t border-white/[0.06] pt-3 space-y-2 animate-fade-in">
          {item.options?.map((opt, i) => {
            let cls = 'bg-gray-800/40 text-gray-400'
            if (i === item.correctOption) cls = 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
            else if (i === item.selectedOption && i !== item.correctOption)
              cls = 'bg-red-500/15 text-red-300 border border-red-500/30'
            return (
              <div key={i} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm ${cls}`}>
                <span className="font-mono text-xs font-bold w-5 flex-shrink-0">{LETTERS[i]}</span>
                <span className="font-devanagari">{opt.text}</span>
                {i === item.correctOption && (
                  <CheckCircle2 size={13} className="ml-auto text-emerald-400 flex-shrink-0" />
                )}
              </div>
            )
          })}
          {item.explanation && (
            <div className="mt-2 text-xs text-sky-300 bg-sky-500/8 border border-sky-500/20 rounded-xl px-3 py-2.5 font-devanagari leading-relaxed">
              💡 {item.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
