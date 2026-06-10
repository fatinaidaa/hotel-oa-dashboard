import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { sessionsAPI } from '../services/api'

export default function UsersPage() {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const fetchSessions = async () => {
    try {
      const res = await sessionsAPI.getActive()
      setSessions(res.data)
    } catch (err) {
      setError('Gagal load sessions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
    const interval = setInterval(fetchSessions, 10000)
    return () => clearInterval(interval)
  }, [])

  // Format duration dari minit
  const formatDuration = (minutes) => {
    if (!minutes) return '< 1m'
    if (minutes < 60) return `${minutes}m`
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading...</div>

  return (
    <div className="p-6">
      <PageHeader
        title="Connected Users"
        subtitle="Active sessions across all rooms"
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs bg-green-50 text-green-600 border border-green-100 px-2.5 py-1 rounded-full font-medium">
              {sessions.length} Active
            </span>
            <button onClick={fetchSessions} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">MAC Address</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Room</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Connected At</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sessions.map(session => (
              <tr key={session.log_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{session.mac_address ?? '-'}</td>
                <td className="px-4 py-3 text-gray-700">Room {session.room_num}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(session.connect_time).toLocaleString('ms-MY')}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {formatDuration(session.duration_minutes)}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                    {session.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sessions.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Tiada user yang connected sekarang.
          </div>
        )}
      </div>
    </div>
  )
}
