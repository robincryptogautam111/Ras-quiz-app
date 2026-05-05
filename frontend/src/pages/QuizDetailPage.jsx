import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { Clock, BookOpen, Lock, Zap, Trophy, Users, ChevronRight, Shield, CheckCircle2 } from 'lucide-react'

const DIFF_COLOR = { Easy:'badge-green', Medium:'badge-orange', Hard:'badge-red' }
const CAT_ICONS = {
  'Rajasthan History':'🏰','Indian History':'⚔️','Geography':'🗺️','Indian Polity':'⚖️',
  'Economy':'📈','Science & Tech':'🔬','Current Affairs':'📰','Rajasthan GK':'🌵',
  'Environment':'🌿','Art & Culture':'🎨','General':'📚'
}

export default function QuizDetailPage() {
  const { id } = useParams()
  const { user, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    api.get(`/quizzes/${id}`)
      .then(r => setQuiz(r.data.data))
      .catch(() => toast.error('Quiz not found'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePayment = async (purchaseType = 'quiz', premiumMonths = 1) => {
    if (!user) { navigate('/login'); return }
    setPaying(true)
    try {
      const body = purchaseType === 'quiz'
        ? { purchaseType, quizId: quiz._id }
        : { purchaseType, premiumMonths }

      const res = await api.post('/payment/create-order', body)
      const { orderId, amount, currency, keyId, userName, userEmail } = res.data.data

      const options = {
        key: keyId,
        amount, currency,
        name: 'RAS Arena',
        description: purchaseType === 'quiz' ? quiz.title : `Premium — ${premiumMonths} Month`,
        order_id: orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#FF4D00' },
        handler: async (response) => {
          try {
            await api.post('/payment/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            })
            toast.success('🎉 Payment successful! Access unlocked!')
            await refreshUser()
            setQuiz(q => ({ ...q, hasAccess: true }))
          } catch {
            toast.error('Verification failed. Contact support.')
          } finally { setPaying(false) }
        },
        modal: { ondismiss: () => { setPaying(false); toast('Payment cancelled.') } }
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', () => { toast.error('Payment failed. Try again.'); setPaying(false) })
      rzp.open()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment.')
      setPaying(false)
    }
  }

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-2xl mx-auto">
      <div className="h-44 rounded-2xl bg-gray-800/50" />
      <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i=><div key={i} className="h-20 rounded-2xl bg-gray-800/50"/>)}</div>
      <div className="h-32 rounded-2xl bg-gray-800/50" />
    </div>
  )

  if (!quiz) return (
    <div className="card p-16 text-center max-w-2xl mx-auto">
      <p className="text-gray-400 mb-4">Quiz not found.</p>
      <Link to="/quizzes" className="btn-primary">← Back to Quizzes</Link>
    </div>
  )

  const isPaid    = quiz.type === 'paid'
  const hasAccess = quiz.hasAccess || user?.role === 'admin'
  const locked    = isPaid && !hasAccess
  const mins      = Math.floor((quiz.duration || 0) / 60)

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">

      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-500 to-orange-300" />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center text-3xl flex-shrink-0">
              {CAT_ICONS[quiz.category] || '📚'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className="badge-blue">{quiz.category}</span>
                <span className={`badge ${DIFF_COLOR[quiz.difficulty] || 'badge-orange'}`}>{quiz.difficulty}</span>
                {locked && <span className="badge-red"><Lock size={10}/> Paid</span>}
                {hasAccess && isPaid && <span className="badge-green"><CheckCircle2 size={10}/> Unlocked</span>}
                {!isPaid && <span className="badge-green">Free</span>}
              </div>
              <h1 className="text-xl font-bold leading-snug">{quiz.title}</h1>
            </div>
          </div>
          {quiz.description && (
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">{quiz.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: BookOpen, label: 'Questions', value: quiz.totalQuestions },
          { icon: Clock,    label: 'Duration',  value: `${mins} min` },
          { icon: Trophy,   label: 'Pass Mark', value: `${quiz.passingScore}%` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat-card">
            <Icon size={18} className="text-brand-400 mx-auto mb-1.5" />
            <div className="font-bold">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {quiz.totalAttempts > 0 && (
        <div className="card p-4 flex items-center gap-6 text-sm text-gray-400">
          <span className="flex items-center gap-1.5"><Users size={14}/> {quiz.totalAttempts} attempts</span>
          <span className="flex items-center gap-1.5"><Trophy size={14}/> Avg {quiz.avgScore}%</span>
        </div>
      )}

      {/* Rules */}
      <div className="card p-5">
        <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
          <Shield size={15} className="text-brand-400"/> Quiz Rules
        </h3>
        <ul className="space-y-1.5 text-sm text-gray-400">
          {[
            `Har question ke liye ${quiz.questionTimer || 30}s ka timer`,
            `Total time: ${mins} minutes`,
            `Passing score: ${quiz.passingScore}%`,
            'Submit ke baad answers change nahi honge',
            'Sahi jawab pe points milenge'
          ].map(r => (
            <li key={r} className="flex items-center gap-2">
              <span className="text-brand-500 text-xs">▸</span> {r}
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="card p-6">
        {!user ? (
          <div className="text-center">
            <p className="text-gray-400 mb-4 text-sm">Quiz attempt karne ke liye login karo.</p>
            <Link to="/login" className="btn-primary">Login / Register</Link>
          </div>
        ) : locked ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock size={26} className="text-yellow-400"/>
            </div>
            <h3 className="font-bold text-lg mb-1">Premium Quiz</h3>
            <p className="text-gray-400 text-sm mb-5">
              Unlock karo sirf <span className="text-brand-400 font-bold text-base">₹{quiz.price}</span> mein
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <button onClick={() => handlePayment('quiz')} disabled={paying} className="btn-primary">
                {paying ? 'Processing...' : `🔓 Buy — ₹${quiz.price}`}
              </button>
              <button onClick={() => handlePayment('premium', 1)} disabled={paying} className="btn-ghost">
                <Zap size={14}/> Go Premium ₹99/mo
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3">Powered by Razorpay · UPI / Cards / Netbanking</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-emerald-400 text-sm mb-4 flex items-center justify-center gap-2">
              <CheckCircle2 size={16}/> Access confirmed. Shuru karo!
            </p>
            <button onClick={() => navigate(`/quiz/${quiz._id}/attempt`)} className="btn-primary text-base px-10 py-3">
              Start Quiz <ChevronRight size={18}/>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
