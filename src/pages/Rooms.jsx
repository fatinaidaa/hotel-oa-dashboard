import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { roomsAPI } from '../services/api'

const bwStyle = (bw) => {
  if (!bw || bw === 'Idle') return 'bg-gray-100 text-gray-400'
  const n = parseInt(bw)
  if (n >= 70) return 'bg-amber-50 text-amber-600'
  return 'bg-blue-50 text-blue-500'
}

export default function Rooms() {
  const [rooms,   setRooms]   = useState([])
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(null)
  const [error,   setError]   = useState('')

  const fetchRooms = async () => {
    try {
      const res = await roomsAPI.getAll()
      setRooms(res.data)
    } catch (err) {
      setError('Gagal load rooms. Pastikan backend running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRooms() }, [])

  const changeLimit = async (roomNum, delta) => {
    const room    = rooms.find(r => r.room_num === roomNum)
    const newLimit = Math.max(1, room.device_limit + delta)

    // Update UI dulu (optimistic update)
    setRooms(prev => prev.map(r =>
      r.room_num === roomNum ? { ...r, device_limit: newLimit } : r
    ))
    setSaving(roomNum)

    try {
      await roomsAPI.updateLimit(roomNum, newLimit)
    } catch (err) {
      // Revert kalau API fail
      setRooms(prev => prev.map(r =>
        r.room_num === roomNum ? { ...r, device_limit: room.device_limit } : r
      ))
      setError('Gagal update limit. Cuba semula.')
    } finally {
      setSaving(null)
    }
  }

  if (loading) return <div className="p-6 text-sm text-gray-400">Loading...</div>

  return (
    <div className="p-6">
      <PageHeader
        title="Room Status"
        subtitle="Manage device limits and monitor room activity"
        action={
          <button onClick={fetchRooms} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
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
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Room</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Connected</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Device Limit</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Bandwidth</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rooms.map(room => {
              const isFull   = room.current_connected >= room.device_limit
              const isEmpty  = room.current_connected === 0

              return (
                <tr key={room.room_num} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{room.room_num}</td>
                  <td className="px-4 py-3">
                    <span className={isFull ? 'text-amber-500 font-medium' : isEmpty ? 'text-gray-400' : 'text-green-600 font-medium'}>
                      {room.current_connected}
                      <span className="text-gray-300 font-normal"> / {room.device_limit}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeLimit(room.room_num, -1)}
                        disabled={room.device_limit <= 1 || saving === room.room_num}
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 disabled:opacity-30 transition-colors text-base leading-none"
                      >−</button>
                      <span className="w-6 text-center font-medium text-gray-700 tabular-nums">
                        {saving === room.room_num ? '…' : room.device_limit}
                      </span>
                      <button
                        onClick={() => changeLimit(room.room_num, +1)}
                        disabled={saving === room.room_num}
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 disabled:opacity-30 transition-colors text-base leading-none"
                      >+</button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${bwStyle(room.bandwidth)}`}>
                      {room.bandwidth ?? 'Idle'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      isFull  ? 'bg-amber-50 text-amber-600' :
                      isEmpty ? 'bg-gray-100 text-gray-400'  :
                      'bg-green-50 text-green-600'
                    }`}>
                      {isFull ? 'Full' : isEmpty ? 'Empty' : 'Active'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rooms.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            Tiada room. Insert data room dalam database dulu.
          </div>
        )}
      </div>
    </div>
  )
}
