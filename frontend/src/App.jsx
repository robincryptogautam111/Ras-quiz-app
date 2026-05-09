import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Layouts
import UserLayout from './components/common/UserLayout'
import AdminLayout from './components/common/AdminLayout'

// Public pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// User pages
import Dashboard from './pages/Dashboard'
import QuizzesPage from './pages/QuizzesPage'
import QuizDetailPage from './pages/QuizDetailPage'
import QuizAttemptPage from './pages/QuizAttemptPage'
import ResultPage from './pages/ResultPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import BookmarksPage from './pages/BookmarksPage'
import DailyChallengePage from './pages/DailyChallengePage'
import RevisePage from './pages/RevisePage'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminQuizzes from './pages/admin/AdminQuizzes'
import AdminQuizEditor from './pages/admin/AdminQuizEditor'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPayments from './pages/admin/AdminPayments'
import AdminAttempts from './pages/admin/AdminAttempts'

// Guards
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  return user ? children : <Navigate to="/login" replace />
}

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { user } = useAuth()
  return user ? <Navigate to="/dashboard" replace /> : children
}

const Spinner = () => (
  <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
)

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* User — protected */}
        <Route element={<ProtectedRoute><UserLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quizzes" element={<QuizzesPage />} />
          <Route path="/quizzes/:id" element={<QuizDetailPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/daily" element={<DailyChallengePage />} />
          <Route path="/revise" element={<RevisePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Route>

        {/* Quiz attempt — fullscreen, no sidebar */}
        <Route path="/quiz/:id/attempt" element={<ProtectedRoute><QuizAttemptPage /></ProtectedRoute>} />
        <Route path="/quiz/:id/result/:attemptId" element={<ProtectedRoute><ResultPage /></ProtectedRoute>} />

        {/* Admin — protected + admin only */}
        <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/quizzes" element={<AdminQuizzes />} />
          <Route path="/admin/quizzes/:id/edit" element={<AdminQuizEditor />} />
          <Route path="/admin/quizzes/new" element={<AdminQuizEditor />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/attempts" element={<AdminAttempts />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
