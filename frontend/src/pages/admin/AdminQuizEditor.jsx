import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2, ChevronUp, ChevronDown, Upload } from 'lucide-react'

const CATS = ['Rajasthan History','Indian History','Geography','Indian Polity','Economy',
  'Science & Tech','Current Affairs','Rajasthan GK','Environment','Art & Culture','Maths & Reasoning','General']
const DIFFS = ['Easy','Medium','Hard']
const LETTERS = ['A','B','C','D']

const blank = () => ({
  text:'', options:[{text:''},{text:''},{text:''},{text:''}], correctOption:0, explanation:'', difficulty:'Medium', marks:1, negativeMarks:0
})

export default function AdminQuizEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id && id !== 'new'

  const [quiz, setQuiz] = useState({
    title:'', description:'', category:'General', difficulty:'Medium',
    type:'free', price:0, duration:1800, questionTimer:30, passingScore:60,
    isPublished:false, isActive:true, isFeatured:false
  })
  const [questions, setQuestions] = useState([])
  const [newQ, setNewQ] = useState(blank())
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)
  const [bulkText, setBulkText] = useState('')
  const [showBulk, setShowBulk] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    Promise.all([
      api.get(`/admin/quizzes`).then(r => r.data.data.find(q => q._id === id)),
      api.get(`/admin/quizzes/${id}/questions`)
    ]).then(([q, qs]) => {
      if (q) setQuiz({ title:q.title, description:q.description||'', category:q.category, difficulty:q.difficulty,
        type:q.type, price:q.price, duration:q.duration, questionTimer:q.questionTimer, passingScore:q.passingScore,
        isPublished:q.isPublished, isActive:q.isActive, isFeatured:q.isFeatured||false })
      setQuestions(qs.data.data || [])
    }).finally(() => setLoading(false))
  }, [id])

  const setQ = (k, v) => setQuiz(f => ({ ...f, [k]: v }))

  const saveQuiz = async () => {
    if (!quiz.title.trim()) { toast.error('Title required.'); return }
    setSaving(true)
    try {
      let savedId = id
      if (isEdit) {
        await api.put(`/admin/quizzes/${id}`, quiz)
        toast.success('Quiz updated!')
      } else {
        const r = await api.post('/admin/quizzes', quiz)
        savedId = r.data.data._id
        toast.success('Quiz created!')
        navigate(`/admin/quizzes/${savedId}/edit`, { replace: true })
      }
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed.') }
    finally { setSaving(false) }
  }

  const addQuestion = async () => {
    if (!newQ.text.trim() || newQ.options.some(o => !o.text.trim())) {
      toast.error('Fill all fields.'); return
    }
    if (!isEdit) { toast.error('Save quiz first, then add questions.'); return }
    try {
      const r = await api.post(`/admin/quizzes/${id}/questions`, newQ)
      setQuestions(q => [...q, r.data.data])
      setNewQ(blank())
      toast.success('Question added!')
    } catch { toast.error('Failed to add question.') }
  }

  const delQuestion = async (qId) => {
    if (!confirm('Delete this question?')) return
    try {
      await api.delete(`/admin/questions/${qId}`)
      setQuestions(q => q.filter(x => x._id !== qId))
      toast.success('Question deleted.')
    } catch { toast.error('Delete failed.') }
  }

  const parseBulk = async () => {
    // Format per question: Q: ... \n A: ... \n B: ... \n C: ... \n D: ... \n ANS: A \n EXP: ...
    const blocks = bulkText.trim().split(/\n{2,}/)
    const parsed = []
    for (const block of blocks) {
      const lines = block.trim().split('\n').map(l => l.trim()).filter(Boolean)
      const get = (prefix) => lines.find(l => l.toUpperCase().startsWith(prefix))?.slice(prefix.length).trim() || ''
      const text = get('Q:') || get('QUESTION:')
      const opts = [get('A:'), get('B:'), get('C:'), get('D:')]
      const ans = get('ANS:').toUpperCase()
      const exp = get('EXP:') || get('EXPLANATION:')
      const correct = ['A','B','C','D'].indexOf(ans)
      if (text && opts.every(Boolean) && correct >= 0) {
        parsed.push({ text, options: opts.map(t => ({ text: t })), correctOption: correct, explanation: exp, difficulty: 'Medium', marks: 1, negativeMarks: 0 })
      }
    }
    if (!parsed.length) { toast.error('No valid questions parsed. Check format.'); return }
    try {
      const r = await api.post(`/admin/quizzes/${id}/bulk-upload`, { questions: parsed })
      setQuestions(q => [...q, ...r.data.data])
      setBulkText('')
      setShowBulk(false)
      toast.success(`${parsed.length} questions added!`)
    } catch { toast.error('Bulk upload failed.') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"/></div>

  const Input = ({ label, ...props }) => (
    <div>
      <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      <input className="input" {...props}/>
    </div>
  )

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl tracking-wider">{isEdit ? 'Edit Quiz' : 'New Quiz'}</h1>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/quizzes')} className="btn-ghost text-sm">Cancel</button>
          <button onClick={saveQuiz} disabled={saving} className="btn-primary">
            <Save size={15}/> {saving ? 'Saving...' : 'Save Quiz'}
          </button>
        </div>
      </div>

      {/* Quiz details */}
      <div className="card p-6 space-y-5">
        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400">Quiz Details</h3>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="lg:col-span-2">
            <Input label="Title" value={quiz.title} onChange={e => setQ('title', e.target.value)} placeholder="Quiz title"/>
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
            <textarea className="input" rows={2} value={quiz.description} onChange={e => setQ('description', e.target.value)} placeholder="Short description..."/>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
            <select className="input" value={quiz.category} onChange={e => setQ('category', e.target.value)}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Difficulty</label>
            <select className="input" value={quiz.difficulty} onChange={e => setQ('difficulty', e.target.value)}>
              {DIFFS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Type</label>
            <select className="input" value={quiz.type} onChange={e => setQ('type', e.target.value)}>
              <option value="free">Free</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          {quiz.type === 'paid' && (
            <Input label="Price (₹)" type="number" min="1" value={quiz.price} onChange={e => setQ('price', parseInt(e.target.value)||0)}/>
          )}
          <Input label="Duration (seconds)" type="number" value={quiz.duration} onChange={e => setQ('duration', parseInt(e.target.value)||1800)}/>
          <Input label="Per-Question Timer (sec, 0=no timer)" type="number" value={quiz.questionTimer} onChange={e => setQ('questionTimer', parseInt(e.target.value)||0)}/>
          <Input label="Passing Score (%)" type="number" min="1" max="100" value={quiz.passingScore} onChange={e => setQ('passingScore', parseInt(e.target.value)||60)}/>
        </div>

        <div className="flex gap-6 flex-wrap pt-2 border-t border-white/[0.06]">
          {[['isPublished','Published'],['isActive','Active'],['isFeatured','Featured']].map(([k,l]) => (
            <label key={k} className="flex items-center gap-2.5 cursor-pointer">
              <div className={`w-9 h-5 rounded-full transition-colors relative ${quiz[k] ? 'bg-brand-500' : 'bg-gray-700'}`}
                onClick={() => setQ(k, !quiz[k])}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${quiz[k] ? 'translate-x-4' : 'translate-x-0.5'}`}/>
              </div>
              <span className="text-sm">{l}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Questions section — only after quiz is saved */}
      {isEdit && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl tracking-wider">Questions ({questions.length})</h2>
            <button onClick={() => setShowBulk(s => !s)} className="btn-ghost text-sm">
              <Upload size={14}/> Bulk Upload
            </button>
          </div>

          {/* Bulk upload */}
          {showBulk && (
            <div className="card p-5 border-sky-500/20 bg-sky-500/5">
              <h4 className="font-bold text-sm mb-2 text-sky-400">Bulk Upload Format</h4>
              <pre className="text-xs text-gray-500 bg-gray-900 rounded-lg p-3 mb-3 overflow-x-auto">{`Q: Question text yahan likhо
A: Option A
B: Option B
C: Option C
D: Option D
ANS: B
EXP: Explanation (optional)

Q: Next question...`}</pre>
              <textarea className="input text-sm font-mono" rows={10} value={bulkText}
                onChange={e => setBulkText(e.target.value)} placeholder="Paste questions here..."/>
              <div className="flex gap-3 mt-3">
                <button onClick={parseBulk} className="btn-primary text-sm"><Upload size={13}/> Parse & Upload</button>
                <button onClick={() => setShowBulk(false)} className="btn-ghost text-sm">Cancel</button>
              </div>
            </div>
          )}

          {/* Existing questions */}
          {questions.length > 0 && (
            <div className="space-y-3">
              {questions.map((q, i) => (
                <div key={q._id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-gray-600 text-sm mt-0.5 flex-shrink-0">Q{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-devanagari font-medium mb-2">{q.text}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {q.options.map((o, oi) => (
                          <div key={oi} className={`text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1.5
                            ${oi === q.correctOption ? 'bg-emerald-500/15 text-emerald-300' : 'bg-gray-800/60 text-gray-400'}`}>
                            <span className="font-bold">{LETTERS[oi]}.</span> {o.text}
                          </div>
                        ))}
                      </div>
                      {q.explanation && <p className="text-xs text-gray-500 mt-2">💡 {q.explanation}</p>}
                    </div>
                    <button onClick={() => delQuestion(q._id)} className="text-gray-600 hover:text-red-400 transition-colors flex-shrink-0">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add new question */}
          <div className="card p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={16} className="text-brand-400"/> Add Question</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Question Text</label>
                <textarea className="input font-devanagari" rows={3} value={newQ.text}
                  onChange={e => setNewQ(q => ({...q, text: e.target.value}))} placeholder="Question likhо (Hindi/English)..."/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Options (A, B, C, D)</label>
                <div className="grid grid-cols-2 gap-3">
                  {newQ.options.map((o, i) => (
                    <div key={i} className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">{LETTERS[i]}.</span>
                      <input className="input pl-7 text-sm" value={o.text}
                        onChange={e => setNewQ(q => ({...q, options: q.options.map((opt,oi) => oi===i ? {text:e.target.value} : opt)}))}
                        placeholder={`Option ${LETTERS[i]}`}/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Correct Answer</label>
                  <select className="input" value={newQ.correctOption} onChange={e => setNewQ(q => ({...q, correctOption: parseInt(e.target.value)}))}>
                    {LETTERS.map((l,i) => <option key={i} value={i}>Option {l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Marks</label>
                  <input className="input" type="number" min="1" value={newQ.marks} onChange={e => setNewQ(q => ({...q, marks: parseInt(e.target.value)||1}))}/>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Neg. Marks</label>
                  <input className="input" type="number" min="0" step="0.25" value={newQ.negativeMarks} onChange={e => setNewQ(q => ({...q, negativeMarks: parseFloat(e.target.value)||0}))}/>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Explanation (Optional)</label>
                <textarea className="input font-devanagari text-sm" rows={2} value={newQ.explanation}
                  onChange={e => setNewQ(q => ({...q, explanation: e.target.value}))} placeholder="Sahi answer ka reason..."/>
              </div>
              <button onClick={addQuestion} className="btn-primary">
                <Plus size={15}/> Add Question
              </button>
            </div>
          </div>
        </>
      )}

      {!isEdit && (
        <div className="card p-6 text-center border-dashed border-gray-700">
          <p className="text-gray-400 text-sm">Quiz save karne ke baad questions add kar paoge.</p>
        </div>
      )}
    </div>
  )
}
