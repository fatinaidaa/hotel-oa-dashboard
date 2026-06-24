import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Wifi, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { authAPI } from '../services/api'

export default function Signup() {
  const [form, setForm] = useState({
    name: '', staffId: '', password: '', confirmPassword: ''
  })
  const [show, setShow] = useState({
    password: false, confirmPassword: false
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const toggleShow = (field) => setShow(v => ({ ...v, [field]: !v[field] }))

  // Password match indicator
  const passwordsMatch = form.confirmPassword.length > 0 && form.password === form.confirmPassword
  const passwordsMismatch = form.confirmPassword.length > 0 && form.password !== form.confirmPassword

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.name || !form.staffId || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    setLoading(true)
    try {
      await authAPI.signup({
        fullName: form.name,
        staffId:  form.staffId,
        password:  form.password,
      })
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1800)

    } catch (err) {
      setError(err.response?.data?.message ?? 'Registration failed. Please try again.')
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
          <p className="text-xs text-gray-400">Web Staff System</p>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-medium text-gray-700 text-center mb-5">Sign Up</h2>

          {error && (
            <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 px-3 py-2 bg-green-50 text-green-700 text-xs rounded-lg border border-green-100 flex items-center gap-2">
              <CheckCircle size={14} className="flex-shrink-0" />
              Account registered successfully! Redirecting to login...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Full Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter full name"
                value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              />
            </div>

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

            {/* Password + show/hide */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={show.password ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('password')}
                  tabIndex={-1}
                  aria-label={show.password ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {show.password ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Confirm Password + show/hide + match indicator */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Confirm Password</label>
              <div className="relative">
                <input
                  type={show.confirmPassword ? 'text' : 'password'}
                  className={`input-field pr-10 ${
                    passwordsMatch    ? 'border-green-400 focus:ring-green-300' :
                    passwordsMismatch ? 'border-red-300   focus:ring-red-200'   : ''
                  }`}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => toggleShow('confirmPassword')}
                  tabIndex={-1}
                  aria-label={show.confirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {show.confirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Match / mismatch hint */}
              {passwordsMatch && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle size={11} /> Passwords match
                </p>
              )}
              {passwordsMismatch && (
                <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || success}
              className="btn-primary w-full mt-1"
            >
              {loading ? 'Registering...' : 'Sign Up'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:underline">Login</Link>
          </p>
        </div>

      </div>
    </div>
  )
}
