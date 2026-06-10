import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

// Pages
import Login     from './pages/Login'
import Signup    from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Rooms     from './pages/Rooms'
import Nodes     from './pages/Nodes'
import Users     from './pages/Users'
import Traffic   from './pages/Traffic'
import Requests  from './pages/Requests'

// ── Protected Route wrapper ───────────────────────────────────────────────────
// Kalau belum login → redirect ke /login
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-sm text-gray-400">Loading...</div>
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

// ── Dashboard layout wrapper ──────────────────────────────────────────────────
function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<Login  />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/rooms"     element={<DashboardLayout><Rooms     /></DashboardLayout>} />
          <Route path="/nodes"     element={<DashboardLayout><Nodes     /></DashboardLayout>} />
          <Route path="/users"     element={<DashboardLayout><Users     /></DashboardLayout>} />
          <Route path="/traffic"   element={<DashboardLayout><Traffic   /></DashboardLayout>} />
          <Route path="/requests"  element={<DashboardLayout><Requests  /></DashboardLayout>} />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
