import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Clock, ChevronRight, BookmarkPlus, X, CheckCircle2, XCircle, SkipForward } from 'lucide-react'

// Sound effects via AudioContext
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    if (type === 'correct') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2)
    } else if (type === 'wrong') {
      osc.frequency.setValueAtTime(200, ctx.currentTime)
      osc.frequency.setValueAtTime(150, ctx.currentTime + 0.2)
    }
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
  } catch {}
}

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizAttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState([]) // [{questionId, selectedOption, timeTaken}]
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [totalTimeLeft, setTotalTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [qStartTime, setQStartTime] = useState(Date.now())

  const timerRef = useRef(null)
  const totalTimerRef = useRef(null)

  // Load quiz
  useEffect(() => {
    api.post(`/quizzes/${id}/start`)
      .then(res => {
        const data = res.data.data
        setQuiz(data)
        setTimeLeft(data.questionTimer || 30)
        setTotalTimeLeft(data.duration || 1800)
        setQStartTime(Date.now())
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load quiz.')
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id])

  // Per-question timer
  useEffect(() => {
    if (!quiz || revealed || quiz.questionTimer === 0) return
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleAutoSkip()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [currentIdx, quiz, revealed])

  // Total quiz timer
  useEffect(() => {
    if (!quiz) return
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(t => {
        if (t <= 1) {
          clearInterval(totalTimerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(totalTimerRef.current)
  }, [quiz])

  const handleAutoSkip = useCallback(() => {
    if (revealed) return
    const q = quiz.questions[currentIdx]
    const timeTaken = Math.round((Date.now() - qStartTime) / 1000)
    setAnswers(prev => [...prev, { questionId: q._id, selectedOption: -1, timeTaken }])
    setSelected(-1)
    setRevealed(true)
    playSound('wrong')
  }, [currentIdx, quiz, revealed, qStartTime])

  const handleSelect = (idx) => {
    if (revealed) return
    clearInterval(timerRef.current)
    const q = quiz.questions[currentIdx]
    const timeTaken = Math.round((Date.now() - qStartTime) / 1000)
    setSelected(idx)
    setRevealed(true)
    setAnswers(prev => [...prev, { questionId: q._id, selectedOption: idx, timeTaken }])
    playSound(idx === q.correctOption ? 'correct' : 'wrong')
  }

  const handleNext = () => {
    if (currentIdx + 1 >= quiz.questions.length) {
      handleSubmit()
      return
    }
    setCurrentIdx(i => i + 1)
    setSelected(null)
    setRevealed(false)
    setTimeLeft(quiz.questionTimer || 30)
    setQStartTime(Date.now())
  }

  const handleSubmit = async (auto = false) => {
    clearInterval(timerRef.current)
    clearInterval(totalTimerRef.current)
    setSubmitting(true)
    try {
      const totalTaken = (quiz.duration || 1800) - totalTimeLeft
      const res = await api.post(`/quizzes/${id}/submit`, {
        answers,
        timeTaken: totalTaken
      })
      navigate(`/quiz/${id}/result/${res.data.data.attemptId}`, {
        state: { result: res.data.data }
      })
    } catch (err) {
      toast.error('Submit failed. Try again.')
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const q = quiz.questions[currentIdx]
  const progress = ((currentIdx) / quiz.questions.length) * 100
  const timerPct = quiz.questionTimer > 0 ? (timeLeft / quiz.questionTimer) * 100 : 100
  const totalMins = Math.floor(totalTimeLeft / 60)
  const totalSecs = totalTimeLeft % 60
  const isUrgent = timeLeft <= 8

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top HUD */}
      <header className="sticky top-0 z-20 bg-gray-950/95 backdrop-blur border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => { if (confirm('Quiz exit karo?')) navigate(-1) }}
            className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>

          {/* Progress bar */}
          <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: progress + '%' }} />
          </div>

          <div className="text-sm font-mono text-gray-400 flex-shrink-0">
            {currentIdx + 1}/{quiz.questions.length}
          </div>

          {/* Total timer */}
          <div className="flex items-center gap-1.5 text-sm font-mono flex-shrink-0 text-gray-300">
            <Clock size={14} className="text-brand-400" />
            {String(totalMins).padStart(2,'0')}:{String(totalSecs).padStart(2,'0')}
          </div>
        </div>
      </header>

      {/* Question card */}
      <main className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-6">
        {/* Per-question timer ring */}
        {quiz.questionTimer > 0 && (
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-12 h-12 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="20" fill="none" stroke="#1f2937" strokeWidth="3" />
                <circle cx="24" cy="24" r="20" fill="none"
                  stroke={isUrgent ? '#ef4444' : '#ff4d00'} strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - timerPct / 100)}`}
                  style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }} />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold font-mono ${isUrgent ? 'text-red-400' : 'text-gray-200'}`}>
                {timeLeft}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase tracking-wide font-mono">{q.quiz || quiz.category}</div>
              <div className="text-xs text-gray-400">Time remaining this question</div>
            </div>
          </div>
        )}

        {/* Question */}
        <div className="card p-6 mb-5 animate-slide-up">
          <p className="text-xs font-mono text-brand-400 uppercase tracking-wider mb-3">
            Q{currentIdx + 1} of {quiz.questions.length}
          </p>
          <p className="text-lg lg:text-xl font-semibold leading-relaxed font-devanagari">
            {q.text}
          </p>
          {q.image && (
            <img src={q.image} alt="question" className="mt-4 rounded-xl max-h-48 object-contain" />
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let cls = 'border-white/[0.08] hover:border-brand-500/50 hover:bg-brand-500/5'
            if (revealed) {
              if (i === q.correctOption) cls = 'border-emerald-500 bg-emerald-500/10'
              else if (i === selected && i !== q.correctOption) cls = 'border-red-500 bg-red-500/8'
              else cls = 'border-white/[0.04] opacity-50'
            }

            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={revealed}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left group ${cls}`}>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all
                  ${revealed && i === q.correctOption ? 'bg-emerald-500 text-white' :
                    revealed && i === selected ? 'bg-red-500 text-white' :
                    'bg-gray-800 text-gray-400 group-hover:bg-brand-500/20 group-hover:text-brand-400'}`}>
                  {revealed && i === q.correctOption ? <CheckCircle2 size={16} /> :
                   revealed && i === selected ? <XCircle size={16} /> :
                   LETTERS[i]}
                </span>
                <span className="font-devanagari text-sm lg:text-base leading-snug">{opt.text}</span>
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {revealed && q.explanation && (
          <div className="mt-5 p-4 rounded-2xl bg-sky-500/8 border border-sky-500/20 animate-slide-up">
            <p className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1.5">💡 Explanation</p>
            <p className="text-sm text-gray-300 leading-relaxed font-devanagari">{q.explanation}</p>
          </div>
        )}

        {/* Skip/Auto-skip feedback */}
        {revealed && selected === -1 && (
          <div className="mt-3 p-3 rounded-xl bg-yellow-500/8 border border-yellow-500/20 text-sm text-yellow-400 flex items-center gap-2">
            <SkipForward size={16} /> Time out — skipped!
          </div>
        )}

        {/* Next button */}
        <div className="mt-6 flex justify-end">
          {revealed && (
            <button onClick={handleNext} disabled={submitting}
              className="btn-primary animate-bounce-sm">
              {currentIdx + 1 >= quiz.questions.length
                ? submitting ? 'Submitting...' : '📊 Submit Quiz'
                : <>Next <ChevronRight size={16} /></>}
            </button>
          )}
        </div>
      </main>
    </div>
  )
}
