import { useState, useEffect } from 'react'
import api from '../utils/api'
import { Bookmark, BookmarkX, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/bookmarks').then(r => setBookmarks(r.data.data)).finally(() => setLoading(false))
  }, [])

  const removeBookmark = async (qId) => {
    try {
      await api.post(`/users/bookmarks/${qId}`)
      setBookmarks(b => b.filter(q => q._id !== qId))
      toast.success('Bookmark removed')
    } catch { toast.error('Failed to remove bookmark') }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <h1 className="section-title">Bookmarks</h1>
        <div className="divider"/>
        <span className="badge-orange">{bookmarks.length} saved</span>
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-20 rounded-xl bg-gray-800/50 animate-pulse"/>)}</div>
      ) : bookmarks.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark size={36} className="text-gray-600 mx-auto mb-3"/>
          <p className="text-gray-400 text-sm mb-2">Koi bookmark nahi.</p>
          <p className="text-xs text-gray-600">Quiz attempt karte waqt questions bookmark kar sakte ho.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(q => (
            <div key={q._id} className="card p-4 flex items-start gap-4 group hover:border-white/10 transition-all">
              <div className="flex-1 min-w-0">
                {q.quiz && (
                  <Link to={`/quizzes/${q.quiz._id}`}
                    className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 mb-1.5">
                    {q.quiz.title} <ExternalLink size={10}/>
                  </Link>
                )}
                <p className="text-sm font-devanagari leading-snug">{q.text}</p>
                {q.explanation && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">💡 {q.explanation}</p>
                )}
              </div>
              <button onClick={() => removeBookmark(q._id)}
                className="flex-shrink-0 text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                <BookmarkX size={16}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
