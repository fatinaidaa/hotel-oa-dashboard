import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wifi, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'

export default function Login() {
  const [form, setForm]               = useState({ staffId: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.staffId || !form.password) {
      setError('Please enter your Staff ID and password.')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.login({ staffId: form.staffId, password: form.password })
      login(res.data.user, res.data.token)

      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Login unsuccessful. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-3 shadow-sm">
            <Wifi size={22} className="text-white" />
          </div>
          <h1 className="text-base font-semibold text-gray-800">Mesh Monitoring</h1>
          <p className="text-xs text-gray-400">Staff Portal System</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          <h2 className="text-sm font-medium text-gray-700 text-center mb-5">Login</h2>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Staff ID */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Staff ID</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter Staff ID"
                value={form.staffId}
                onChange={e => setForm(p => ({ ...p, staffId: e.target.value }))}
              />
            </div>

            {/* Password + show/hide toggle */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-1"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            No account?{' '}
            <Link to="/signup" className="text-primary-600 hover:underline">
              Sign up here
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
