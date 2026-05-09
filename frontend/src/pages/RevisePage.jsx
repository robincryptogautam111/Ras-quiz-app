import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { RefreshCw, AlertTriangle, BookOpen, ArrowRight, Target, TrendingDown, CheckCircle2, XCircle, Filter } from 'lucide-react'

// Sample structure — backend hook is best-effort; falls back to mock if 404.
const MOCK_WRONG = [
  { _id: 'm1', subject: 'Rajasthan GK',     attempts: 2, lastWrong: '2 days ago',
    text: 'राजस्थान में सर्वाधिक मेले किस जिले में आयोजित होते हैं?',
    options: ['जयपुर','उदयपुर','नागौर','जोधपुर'], correctOption: 2 },
  { _id: 'm2', subject: 'Polity',           attempts: 1, lastWrong: 'Today',
    text: 'भारत के संविधान में मूल अधिकारों को किस भाग में रखा गया है?',
    options: ['भाग II','भाग III','भाग IV','भाग V'], correctOption: 1 },
  { _id: 'm3', subject: 'Current Affairs',  attempts: 3, lastWrong: '1 week ago',
    text: 'हाल ही में \'मरुस्थल राष्ट्रीय उद्यान\' का विस्तार किस जिले तक किया गया?',
    options: ['बीकानेर','जैसलमेर','बाड़मेर','चूरू'], correctOption: 1 },
  { _id: 'm4', subject: 'History',          attempts: 2, lastWrong: '3 days ago',
    text: 'चौहान वंश की कुलदेवी मानी जाती हैं —',
    options: ['जीण माता','आशापुरा','करणी माता','शाकम्भरी'], correctOption: 3 },
  { _id: 'm5', subject: 'Geography',        attempts: 1, lastWrong: '5 days ago',
    text: 'राजस्थान का सबसे ऊँचा पर्वत शिखर कौनसा है?',
    options: ['सेर','गुरुशिखर','तारागढ़','जरगा'], correctOption: 1 },
]

const SUBJECTS = ['All', 'Rajasthan GK', 'Polity', 'History', 'Geography', 'Current Affairs']

export default function RevisePage() {
  const [wrong, setWrong] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    api.get('/users/wrong-questions')
      .then(r => setWrong(r.data?.data?.length ? r.data.data : MOCK_WRONG))
      .catch(() => setWrong(MOCK_WRONG))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'All' ? wrong : wrong.filter(q => q.subject === filter)

  // Weak topics (group by subject)
  const weakBySubject = wrong.reduce((acc, q) => {
    acc[q.subject] = (acc[q.subject] || 0) + 1
    return acc
  }, {})
  const weakSorted = Object.entries(weakBySubject).sort((a, b) => b[1] - a[1])
  const totalWrong = wrong.length

  if (loading) return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="skeleton h-24"/>)}</div>

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Hero */}
      <div className="card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-rose-500/10 blur-3xl"/>
        <div className="relative grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <div className="section-eyebrow mb-2 flex items-center gap-1.5"><AlertTriangle size={12}/> Mistake Mastery</div>
            <h1 className="font-display font-extrabold text-3xl lg:text-4xl mb-3">
              Revise <span className="gold-text">your mistakes</span>
            </h1>
            <p className="text-[rgb(var(--text-muted))] mb-5 max-w-md">
              Every wrong answer you give is auto-saved here. Convert weak topics into your strengths with personalised revision tests.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="#list" className="btn-primary">
                <RefreshCw size={16}/> Start Revision Test
              </Link>
              <button className="btn-ghost">
                <BookOpen size={16}/> Open Notes
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Stat label="Total mistakes" value={totalWrong} icon={XCircle} color="text-rose-500"/>
            <Stat label="Recovered" value={Math.max(0, totalWrong - 2)} icon={CheckCircle2} color="text-emerald-500"/>
            <Stat label="Accuracy gain" value="+12%" icon={TrendingDown} color="text-gold-500" rot/>
          </div>
        </div>
      </div>

      {/* Weak topics */}
      <div className="card p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Target size={16} className="text-gold-500"/>Weak topics dashboard</h3>
        <div className="space-y-3">
          {weakSorted.map(([sub, count]) => {
            const pct = Math.min(100, (count / Math.max(1, totalWrong)) * 100)
            return (
              <div key={sub}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-semibold">{sub}</span>
                  <span className="text-[rgb(var(--text-muted))]">{count} mistake{count > 1 ? 's' : ''}</span>
                </div>
                <div className="h-2 surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-rose-400 to-gold-500 rounded-full transition-all"
                       style={{ width: pct + '%' }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filter chips */}
      <div id="list" className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Filter size={14} className="text-[rgb(var(--text-muted))] flex-shrink-0"/>
        {SUBJECTS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors
              ${filter === s
                ? 'bg-gold-500 text-white border-gold-500'
                : 'border-[rgb(var(--border))] text-[rgb(var(--text-muted))] hover:border-gold-500/50'}`}>
            {s}
          </button>
        ))}
      </div>

      {/* Wrong questions list */}
      <div className="space-y-3">
        {filtered.map((q, i) => (
          <div key={q._id} className="card p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="badge-red"><XCircle size={11}/> Mistake</span>
                <span className="badge-navy">{q.subject}</span>
                <span className="text-xs text-[rgb(var(--text-faint))]">Last wrong: {q.lastWrong} · {q.attempts} attempts</span>
              </div>
              <button className="btn-soft text-xs px-3 py-1.5">Retry <ArrowRight size={12}/></button>
            </div>
            <p className="font-semibold leading-relaxed font-devanagari mb-3">Q{i+1}. {q.text}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {q.options.map((o, idx) => (
                <div key={idx} className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm
                  ${idx === q.correctOption
                    ? 'border-emerald-500/40 bg-emerald-500/8 text-emerald-700 dark:text-emerald-300'
                    : 'border-[rgb(var(--border))]'}`}>
                  <span className={`w-6 h-6 rounded grid place-items-center text-xs font-bold flex-shrink-0
                    ${idx === q.correctOption ? 'bg-emerald-500 text-white' : 'surface-2 text-[rgb(var(--text-muted))]'}`}>
                    {['A','B','C','D'][idx]}
                  </span>
                  <span className="font-devanagari">{o}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="card p-10 text-center">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto mb-3"/>
            <h3 className="font-bold text-lg mb-1">No mistakes here yet!</h3>
            <p className="text-sm text-[rgb(var(--text-muted))]">Take a quiz first — wrong answers will appear here for revision.</p>
            <Link to="/quizzes" className="btn-primary mt-5">Take a Quiz <ArrowRight size={14}/></Link>
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon, color, rot }) {
  return (
    <div className="surface-2 rounded-xl p-3 text-center">
      <Icon size={16} className={`mx-auto mb-1 ${color} ${rot ? 'rotate-180' : ''}`}/>
      <div className="font-bold">{value}</div>
      <div className="text-[10px] uppercase text-[rgb(var(--text-muted))] tracking-wide">{label}</div>
    </div>
  )
}
