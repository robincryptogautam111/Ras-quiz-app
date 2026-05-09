import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'
import {
  Clock, ChevronLeft, ChevronRight, X, CheckCircle2, XCircle,
  Bookmark, BookmarkCheck, Maximize2, Minimize2, Send, Grid3x3,
  Languages, AlertTriangle,
} from 'lucide-react'

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// ============ Sound effects (optional, soft) ============
const playSound = (type) => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    if (type === 'tick')   osc.frequency.setValueAtTime(880, ctx.currentTime)
    if (type === 'submit') {
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.12)
    }
    gain.gain.setValueAtTime(0.07, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    osc.start(); osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

// status: 'unseen' | 'visited' | 'answered' | 'review' | 'review-answered'
function paletteClass(status, isCurrent) {
  const base = 'w-9 h-9 rounded-lg text-xs font-bold grid place-items-center transition-all border'
  const ring = isCurrent ? ' ring-2 ring-offset-2 ring-gold-500 ring-offset-[rgb(var(--surface))]' : ''
  switch (status) {
    case 'answered':         return base + ' bg-emerald-500 text-white border-emerald-500' + ring
    case 'review':           return base + ' bg-purple-500 text-white border-purple-500' + ring
    case 'review-answered':  return base + ' bg-purple-500 text-white border-2 border-emerald-400' + ring
    case 'visited':          return base + ' bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/40' + ring
    default:                 return base + ' bg-[rgb(var(--surface-2))] text-[rgb(var(--text-muted))] border-[rgb(var(--border))]' + ring
  }
}

export default function QuizAttemptPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState({})         // { qId: optionIdx }
  const [marks, setMarks] = useState({})             // { qId: true }
  const [visited, setVisited] = useState({})         // { qId: true }
  const [bookmarks, setBookmarks] = useState({})     // { qId: true }
  const [totalTimeLeft, setTotalTimeLeft] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [confirmSubmit, setConfirmSubmit] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [lang, setLang] = useState('en')             // 'en' | 'hi'
  const [isFs, setIsFs] = useState(false)
  const totalTimerRef = useRef(null)
  const startedAtRef = useRef(Date.now())

  // ============ Load quiz ============
  useEffect(() => {
    api.post(`/quizzes/${id}/start`)
      .then(res => {
        const data = res.data.data
        setQuiz(data)
        setTotalTimeLeft(data.duration || 1800)
        setVisited({ [data.questions[0]._id]: true })
        // Try to restore from auto-save
        try {
          const saved = JSON.parse(localStorage.getItem(`quiz_attempt_${id}`) || 'null')
          if (saved && saved.answers) {
            setAnswers(saved.answers); setMarks(saved.marks || {}); setVisited(saved.visited || {})
            setCurrentIdx(saved.currentIdx ?? 0); setTotalTimeLeft(saved.totalTimeLeft ?? data.duration)
            toast('Resumed your previous progress', { icon: '⏪' })
          }
        } catch {}
      })
      .catch(err => {
        toast.error(err.response?.data?.message || 'Failed to load quiz.')
        navigate(-1)
      })
      .finally(() => setLoading(false))
  }, [id])

  // ============ Total timer ============
  useEffect(() => {
    if (!quiz) return
    totalTimerRef.current = setInterval(() => {
      setTotalTimeLeft(t => {
        if (t <= 1) { clearInterval(totalTimerRef.current); handleSubmit(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(totalTimerRef.current)
  }, [quiz])

  // ============ Auto-save every 5s ============
  useEffect(() => {
    if (!quiz) return
    const t = setInterval(() => {
      localStorage.setItem(`quiz_attempt_${id}`, JSON.stringify({
        answers, marks, visited, currentIdx, totalTimeLeft, savedAt: Date.now()
      }))
    }, 5000)
    return () => clearInterval(t)
  }, [quiz, answers, marks, visited, currentIdx, totalTimeLeft, id])

  // ============ Fullscreen ============
  const toggleFs = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFs(true)).catch(() => {})
    } else {
      document.exitFullscreen?.().then(() => setIsFs(false)).catch(() => {})
    }
  }, [])
  useEffect(() => {
    const onFs = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // ============ Mark visited on idx change ============
  useEffect(() => {
    if (!quiz) return
    const q = quiz.questions[currentIdx]
    if (q) setVisited(v => ({ ...v, [q._id]: true }))
  }, [currentIdx, quiz])

  // ============ Handlers ============
  const select = (optIdx) => {
    const q = quiz.questions[currentIdx]
    setAnswers(a => ({ ...a, [q._id]: optIdx }))
    playSound('tick')
  }
  const clearAnswer = () => {
    const q = quiz.questions[currentIdx]
    setAnswers(a => { const n = { ...a }; delete n[q._id]; return n })
  }
  const toggleMark = () => {
    const q = quiz.questions[currentIdx]
    setMarks(m => ({ ...m, [q._id]: !m[q._id] }))
  }
  const toggleBookmark = () => {
    const q = quiz.questions[currentIdx]
    setBookmarks(b => ({ ...b, [q._id]: !b[q._id] }))
    api.post(`/quizzes/bookmark/${q._id}`).catch(() => {})
  }
  const goTo = (i) => {
    if (i < 0 || i >= quiz.questions.length) return
    setCurrentIdx(i); setPaletteOpen(false)
  }

  const handleSubmit = async (auto = false) => {
    if (!quiz) return
    clearInterval(totalTimerRef.current)
    setSubmitting(true)
    try {
      const arr = quiz.questions.map(q => ({
        questionId: q._id,
        selectedOption: answers[q._id] != null ? answers[q._id] : -1,
        timeTaken: 0,
      }))
      const totalTaken = (quiz.duration || 1800) - totalTimeLeft
      const res = await api.post(`/quizzes/${id}/submit`, { answers: arr, timeTaken: totalTaken })
      localStorage.removeItem(`quiz_attempt_${id}`)
      playSound('submit')
      navigate(`/quiz/${id}/result/${res.data.data.attemptId}`, { state: { result: res.data.data } })
    } catch {
      toast.error('Submit failed. Try again.')
      setSubmitting(false)
    }
  }

  // ============ Rendering helpers ============
  if (loading) return (
    <div className="min-h-screen grid place-items-center">
      <div className="w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const total = quiz.questions.length
  const q = quiz.questions[currentIdx]
  const totalMins = Math.floor(totalTimeLeft / 60)
  const totalSecs = totalTimeLeft % 60
  const urgent = totalTimeLeft < 60
  const answered = Object.keys(answers).length
  const reviewed = Object.values(marks).filter(Boolean).length
  const visitedCount = Object.keys(visited).length
  const unseen = total - visitedCount

  const statusFor = (qid) => {
    const ans = answers[qid] != null
    const mark = marks[qid]
    if (mark && ans) return 'review-answered'
    if (mark) return 'review'
    if (ans) return 'answered'
    if (visited[qid]) return 'visited'
    return 'unseen'
  }

  const text = (lang === 'hi' && q.textHi) ? q.textHi : q.text
  const opts = q.options.map(o => (lang === 'hi' && o.textHi) ? o.textHi : o.text)

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'rgb(var(--bg))' }}>
      {/* ============ Top HUD ============ */}
      <header className="sticky top-0 z-30 glass border-b border-[rgb(var(--border))]">
        <div className="max-w-5xl mx-auto px-3 sm:px-5 h-14 flex items-center gap-2 sm:gap-4">
          <button onClick={() => setConfirmExit(true)}
            className="text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))] flex-shrink-0" aria-label="Exit">
            <X size={20}/>
          </button>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{quiz.title}</div>
            <div className="h-1 bg-[rgb(var(--border))] rounded-full overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full transition-all"
                style={{ width: ((currentIdx + 1) / total) * 100 + '%' }}/>
            </div>
          </div>

          <button onClick={() => setLang(l => l === 'en' ? 'hi' : 'en')}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md surface-2 text-xs font-bold uppercase">
            <Languages size={12}/>{lang === 'en' ? 'हिं' : 'EN'}
          </button>

          <div className={`flex items-center gap-1.5 font-mono font-bold text-sm px-2.5 py-1 rounded-md flex-shrink-0
            ${urgent ? 'bg-rose-500/12 text-rose-600 dark:text-rose-300 animate-pulse' : 'surface-2'}`}>
            <Clock size={13}/> {String(totalMins).padStart(2,'0')}:{String(totalSecs).padStart(2,'0')}
          </div>

          <button onClick={toggleFs} className="hidden sm:block text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text))]" aria-label="Fullscreen">
            {isFs ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
          </button>

          <button onClick={() => setPaletteOpen(true)}
            className="lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-md surface-2 text-xs font-bold">
            <Grid3x3 size={13}/>{currentIdx + 1}/{total}
          </button>
        </div>
      </header>

      {/* ============ Body ============ */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid lg:grid-cols-[1fr_18rem] gap-6 px-4 lg:px-6 py-5 pb-32">
        {/* Question pane */}
        <main>
          {/* Question card */}
          <div className="card p-5 lg:p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-3 gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="badge-gold">Q{currentIdx + 1} / {total}</span>
                {q.category && <span className="badge-navy">{q.category}</span>}
                {q.marks && <span className="badge-blue">+{q.marks} marks</span>}
                {q.negativeMarks > 0 && <span className="badge-red">-{q.negativeMarks}</span>}
              </div>
              <button onClick={toggleBookmark}
                className="text-[rgb(var(--text-muted))] hover:text-gold-500" aria-label="Bookmark">
                {bookmarks[q._id] ? <BookmarkCheck size={18} className="text-gold-500"/> : <Bookmark size={18}/>}
              </button>
            </div>
            <p className="text-base lg:text-lg font-semibold leading-relaxed font-devanagari mb-4">
              {text}
            </p>
            {q.image && <img src={q.image} alt="question" className="rounded-xl max-h-72 object-contain mb-4"/>}

            {/* Options */}
            <div className="space-y-2.5">
              {opts.map((opt, i) => {
                const isSel = answers[q._id] === i
                return (
                  <button key={i} onClick={() => select(i)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all
                      ${isSel
                        ? 'border-gold-500 bg-gold-500/10 ring-gold'
                        : 'border-[rgb(var(--border))] hover:border-gold-500/40 hover:bg-gold-500/5'}`}>
                    <span className={`w-9 h-9 rounded-lg flex-shrink-0 grid place-items-center text-sm font-bold
                      ${isSel ? 'bg-gold-500 text-white' : 'surface-2 text-[rgb(var(--text-muted))]'}`}>
                      {LETTERS[i]}
                    </span>
                    <span className="font-devanagari text-sm lg:text-base leading-snug">{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action bar */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button onClick={clearAnswer} className="btn-ghost !py-2 text-xs"
                    disabled={answers[q._id] == null}>
              Clear answer
            </button>
            <button onClick={toggleMark}
              className={`btn !py-2 text-xs border ${marks[q._id]
                ? 'bg-purple-500 text-white border-purple-500'
                : 'border-[rgb(var(--border-strong))] text-[rgb(var(--text))] hover:border-purple-400'}`}>
              {marks[q._id] ? 'Unmark for review' : 'Mark for review'}
            </button>

            <div className="flex-1"/>

            <button onClick={() => goTo(currentIdx - 1)} disabled={currentIdx === 0}
                    className="btn-ghost !py-2 text-xs"><ChevronLeft size={14}/> Previous</button>
            {currentIdx + 1 < total ? (
              <button onClick={() => goTo(currentIdx + 1)} className="btn-primary !py-2 text-xs">
                Save & Next <ChevronRight size={14}/>
              </button>
            ) : (
              <button onClick={() => setConfirmSubmit(true)} className="btn-primary !py-2 text-xs">
                Submit Test <Send size={14}/>
              </button>
            )}
          </div>
        </main>

        {/* ============ Palette (desktop) ============ */}
        <aside className="hidden lg:block">
          <Palette
            quiz={quiz} currentIdx={currentIdx} statusFor={statusFor} goTo={goTo}
            answered={answered} reviewed={reviewed} visitedCount={visitedCount} unseen={unseen}
            onSubmit={() => setConfirmSubmit(true)}
          />
        </aside>
      </div>

      {/* ============ Mobile palette drawer ============ */}
      {paletteOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
               onClick={() => setPaletteOpen(false)}/>
          <div className="absolute right-0 top-0 bottom-0 w-[88%] max-w-sm overflow-y-auto bg-[rgb(var(--surface))] p-5 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2"><Grid3x3 size={16}/>Question Palette</h3>
              <button onClick={() => setPaletteOpen(false)} className="text-[rgb(var(--text-muted))]">
                <X size={18}/>
              </button>
            </div>
            <Palette
              quiz={quiz} currentIdx={currentIdx} statusFor={statusFor} goTo={goTo}
              answered={answered} reviewed={reviewed} visitedCount={visitedCount} unseen={unseen}
              onSubmit={() => { setPaletteOpen(false); setConfirmSubmit(true) }}
            />
          </div>
        </div>
      )}

      {/* ============ Confirm submit modal ============ */}
      {confirmSubmit && (
        <Modal onClose={() => setConfirmSubmit(false)}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gold-500/15 grid place-items-center mx-auto mb-3">
              <Send size={20} className="text-gold-500"/>
            </div>
            <h3 className="font-display font-extrabold text-2xl mb-1">Submit your test?</h3>
            <p className="text-[rgb(var(--text-muted))] text-sm mb-5">
              Once submitted you can't change your answers.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm">
              <div className="surface-2 rounded-lg p-3">
                <div className="text-2xl font-bold text-emerald-500">{answered}</div>
                <div className="text-xs text-[rgb(var(--text-muted))]">Answered</div>
              </div>
              <div className="surface-2 rounded-lg p-3">
                <div className="text-2xl font-bold text-rose-500">{total - answered}</div>
                <div className="text-xs text-[rgb(var(--text-muted))]">Unanswered</div>
              </div>
              <div className="surface-2 rounded-lg p-3">
                <div className="text-2xl font-bold text-purple-500">{reviewed}</div>
                <div className="text-xs text-[rgb(var(--text-muted))]">For review</div>
              </div>
              <div className="surface-2 rounded-lg p-3">
                <div className="text-2xl font-bold">{unseen}</div>
                <div className="text-xs text-[rgb(var(--text-muted))]">Unseen</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setConfirmSubmit(false)} className="btn-ghost flex-1 justify-center">Continue Test</button>
              <button onClick={() => handleSubmit()} disabled={submitting}
                      className="btn-primary flex-1 justify-center">
                {submitting ? 'Submitting…' : 'Submit Now'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ============ Confirm exit modal ============ */}
      {confirmExit && (
        <Modal onClose={() => setConfirmExit(false)}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/15 grid place-items-center mx-auto mb-3">
              <AlertTriangle size={20} className="text-rose-500"/>
            </div>
            <h3 className="font-display font-extrabold text-2xl mb-1">Exit the test?</h3>
            <p className="text-[rgb(var(--text-muted))] text-sm mb-5">
              Your progress is auto-saved. You can resume from where you left off.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmExit(false)} className="btn-ghost flex-1 justify-center">Stay</button>
              <button onClick={() => navigate(-1)} className="btn-primary flex-1 justify-center !bg-rose-500 hover:!bg-rose-600 !shadow-none">
                Exit anyway
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ============ Sub-components ============
function Palette({ quiz, currentIdx, statusFor, goTo, answered, reviewed, visitedCount, unseen, onSubmit }) {
  const total = quiz.questions.length
  return (
    <div className="card p-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div className="grid grid-cols-2 gap-2 mb-4 text-[11px]">
        <div className="surface-2 rounded-md p-2 flex items-center justify-between">
          <span className="text-[rgb(var(--text-muted))]">Answered</span>
          <span className="font-bold text-emerald-500">{answered}</span>
        </div>
        <div className="surface-2 rounded-md p-2 flex items-center justify-between">
          <span className="text-[rgb(var(--text-muted))]">For review</span>
          <span className="font-bold text-purple-500">{reviewed}</span>
        </div>
        <div className="surface-2 rounded-md p-2 flex items-center justify-between">
          <span className="text-[rgb(var(--text-muted))]">Visited</span>
          <span className="font-bold">{visitedCount}</span>
        </div>
        <div className="surface-2 rounded-md p-2 flex items-center justify-between">
          <span className="text-[rgb(var(--text-muted))]">Unseen</span>
          <span className="font-bold">{unseen}</span>
        </div>
      </div>

      <div className="text-[11px] uppercase font-bold tracking-wider text-[rgb(var(--text-muted))] mb-2">Question Palette</div>
      <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5 mb-4">
        {quiz.questions.map((qq, i) => (
          <button key={qq._id} onClick={() => goTo(i)} className={paletteClass(statusFor(qq._id), i === currentIdx)}>
            {i + 1}
          </button>
        ))}
      </div>

      <div className="space-y-1.5 text-[11px]">
        <Legend cls="bg-emerald-500" label="Answered"/>
        <Legend cls="bg-rose-500/40" label="Visited, not answered"/>
        <Legend cls="bg-purple-500" label="Marked for review"/>
        <Legend cls="bg-purple-500 border-2 border-emerald-400" label="Marked + answered"/>
        <Legend cls="bg-[rgb(var(--surface-2))] border border-[rgb(var(--border))]" label="Not visited"/>
      </div>

      <button onClick={onSubmit} className="btn-primary w-full justify-center mt-4 !py-2.5">
        <Send size={14}/> Submit Test
      </button>
    </div>
  )
}

function Legend({ cls, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded ${cls}`}/>
      <span className="text-[rgb(var(--text-muted))]">{label}</span>
    </div>
  )
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={onClose}/>
      <div className="relative card p-6 max-w-sm w-full animate-slide-up">{children}</div>
    </div>
  )
}
