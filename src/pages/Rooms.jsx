import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { roomsAPI } from '../services/api'

export default function Rooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(null)
  const [error, setError] = useState('')

  const fetchRooms = async () => {
    try {
      const res = await roomsAPI.getAll()
      setRooms(res.data)
    } catch (err) {
      setError('Unsuccessful load rooms.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRooms()

    // Auto refresh setiap 10 saat
    const interval = setInterval(fetchRooms, 5000)

    return () => clearInterval(interval)
  }, [])

 const changeLimit = async (roomId, delta) => {

  const room = rooms.find(
    r => r.id === roomId
  )

  if (!room) return

  const newLimit = Math.max(
    1,
    room.limit + delta
  )

  setSaving(roomId)

  try {

    await roomsAPI.updateLimit(
      roomId,
      newLimit
    )

    await fetchRooms()

  } catch (err) {

    console.error(err)

    setError(
      'Unsuccessful update device limit.'
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
        subtitle="Manage device limits and monitor room activity"
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

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
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
                Bandwidth
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {rooms.map(room => {
              const isFull =
                room.status ===
                'limit' ||
                room.devices >=
                room.limit

              const isEmpty =
                room.devices === 0

              return (
                <tr
                  key={room.id}
                  className="hover:bg-gray-50 transition-colors"
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
                        {' '}
                        /{' '}
                        {
                          room.limit
                        }
                      </span>
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          changeLimit(
                            room.id,
                            -1
                          )
                        }
                        disabled={
                          room.limit <=
                            1 ||
                          saving === room.id
                        }
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-30"
                      >
                        −
                      </button>

                      <span className="w-6 text-center font-medium">
                        {saving === room.id
                          ? '…'
                          : room.limit}
                      </span>

                      <button
                        onClick={() =>
                          changeLimit(
                            room.id,
                            +1
                          )
                        }
                        disabled={
                          saving === room.id
                        }
                        className="w-6 h-6 rounded-md border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </td>

                   {/* BANDWIDTH COLUMN */}
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
                </tr>
              )
            })}
          </tbody>
        </table>

        {rooms.length === 0 &&
          !loading && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No room in database.
            </div>
          )}
      </div>
    </div>
  )
}