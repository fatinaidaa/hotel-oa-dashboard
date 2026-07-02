import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { roomsAPI } from '../services/api'

function todayValue() {
  return new Date().toISOString().slice(0, 10)
}

function generatePassword(roomId, checkIn) {
  const date = checkIn || todayValue()
  const [, month, day] = date.split('-')
  return `OA${roomId}-${month}${day}`
}

function formatDate(date) {
  if (!date) return 'Not set'

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function accessLabel(status) {
  if (status === 'active') return 'Active'
  if (status === 'upcoming') return 'Upcoming'
  if (status === 'expired') return 'Expired'
  return 'Vacant'
}

function accessClass(status) {
  if (status === 'active') return 'bg-green-50 text-green-600'
  if (status === 'upcoming') return 'bg-blue-50 text-blue-600'
  if (status === 'expired') return 'bg-red-50 text-red-600'
  return 'bg-gray-100 text-gray-400'
}

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [editingRoomId, setEditingRoomId] = useState(null)
  const [accessForm, setAccessForm] = useState({
    wifiPassword: '',
    checkIn: '',
    checkOut: ''
  })
  const [error, setError] = useState('')

  const fetchRooms = async () => {
    try {
      const res = await roomsAPI.getAll()
      setRooms(res.data)
      setError('')
    } catch (err) {
      setError('Unable to load rooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!editingRoomId) {
        fetchRooms()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [editingRoomId])

  const changeLimit = async (roomId, delta) => {
    const room = rooms.find(r => r.id === roomId)

    if (!room) return

    const newLimit = Math.max(1, room.limit + delta)

    setSaving(roomId)

    try {
      await roomsAPI.updateLimit(roomId, newLimit)
      await fetchRooms()
    } catch (err) {
      console.error(err)
      setError('Unable to update device limit.')
    } finally {
      setSaving(null)
    }
  }

  const startEditAccess = (room) => {
    setEditingRoomId(room.id)
    setAccessForm({
      wifiPassword:
        room.wifi_password ||
        generatePassword(room.id, room.check_in),
      checkIn: room.check_in || todayValue(),
      checkOut: room.check_out || ''
    })
  }

  const cancelEditAccess = () => {
    setEditingRoomId(null)
    setAccessForm({
      wifiPassword: '',
      checkIn: '',
      checkOut: ''
    })
  }

  const saveAccess = async (roomId) => {
    setSaving(roomId)

    try {
      await roomsAPI.updateAccess(roomId, {
        wifiPassword: accessForm.wifiPassword,
        checkIn: accessForm.checkIn,
        checkOut: accessForm.checkOut
      })

      cancelEditAccess()
      await fetchRooms()
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.error ||
        'Unable to update room WiFi access.'
      )
    } finally {
      setSaving(null)
    }
  }

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Room Status"
        subtitle="Manage room device limits, WiFi passwords, and guest stay dates"
        action={
          <button
            onClick={fetchRooms}
            className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
          {error}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[980px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Room
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Connected
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Device Limit
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                WiFi Password
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Stay Period
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Access
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Bandwidth
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Status
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Manage
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {rooms.map(room => {
              const isFull =
                room.status === 'limit' ||
                room.devices >= room.limit

              const isEmpty = room.devices === 0
              const isEditing = editingRoomId === room.id

              return (
                <tr
                  key={room.id}
                  className="hover:bg-gray-50 transition-colors align-top"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    Room {room.id}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={
                        isFull
                          ? 'text-amber-500 font-medium'
                          : isEmpty
                          ? 'text-gray-400'
                          : 'text-green-600 font-medium'
                      }
                    >
                      {room.devices}

                      <span className="text-gray-300 font-normal">
                        {' '} / {room.limit}
                      </span>
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changeLimit(room.id, -1)}
                        disabled={room.limit <= 1 || saving === room.id}
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-30"
                      >
                        −
                      </button>

                      <span className="w-6 text-center font-medium">
                        {saving === room.id ? '…' : room.limit}
                      </span>

                      <button
                        onClick={() => changeLimit(room.id, +1)}
                        disabled={saving === room.id}
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          className="w-36 px-2 py-1 border border-gray-200 rounded-md text-xs"
                          value={accessForm.wifiPassword}
                          onChange={e =>
                            setAccessForm(p => ({
                              ...p,
                              wifiPassword: e.target.value
                            }))
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setAccessForm(p => ({
                              ...p,
                              wifiPassword: generatePassword(room.id, p.checkIn)
                            }))
                          }
                          className="text-[11px] text-primary-600 hover:underline"
                        >
                          Generate from check-in
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-xs text-gray-700">
                        {room.wifi_password || 'Not set'}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="date"
                          className="w-36 px-2 py-1 border border-gray-200 rounded-md text-xs"
                          value={accessForm.checkIn}
                          onChange={e =>
                            setAccessForm(p => ({
                              ...p,
                              checkIn: e.target.value
                            }))
                          }
                        />

                        <input
                          type="date"
                          className="w-36 px-2 py-1 border border-gray-200 rounded-md text-xs"
                          value={accessForm.checkOut}
                          onChange={e =>
                            setAccessForm(p => ({
                              ...p,
                              checkOut: e.target.value
                            }))
                          }
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 leading-5">
                        <div>In: {formatDate(room.check_in)}</div>
                        <div>Out: {formatDate(room.check_out)}</div>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${accessClass(room.access_status)}`}
                    >
                      {accessLabel(room.access_status)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        room.bandwidth === 'Con/ling'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      {room.bandwidth}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        isFull
                          ? 'bg-amber-50 text-amber-600'
                          : isEmpty
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-green-50 text-green-600'
                      }`}
                    >
                      {isFull
                        ? 'Full'
                        : isEmpty
                        ? 'Empty'
                        : 'Active'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveAccess(room.id)}
                          disabled={saving === room.id}
                          className="px-3 py-1 rounded-md bg-primary-600 text-white text-xs disabled:opacity-50"
                        >
                          Save
                        </button>

                        <button
                          onClick={cancelEditAccess}
                          className="px-3 py-1 rounded-md border border-gray-200 text-gray-500 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEditAccess(room)}
                        className="px-3 py-1 rounded-md border border-gray-200 text-gray-600 text-xs hover:bg-gray-50"
                      >
                        Set Access
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {rooms.length === 0 && !loading && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No room in database.
          </div>
        )}
      </div>
    </div>
  )
}
