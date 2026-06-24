import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { sessionsAPI } from '../services/api'

export default function Users() {

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchUsers = async () => {

    try {

      const res = await sessionsAPI.getActive()
      setUsers(res.data)

    } catch (err) {

      setError('Failed to load connected users.')

    } finally {

      setLoading(false)

    }

  }

  useEffect(() => {

    fetchUsers()

    const interval = setInterval(fetchUsers, 10000)

    return () => clearInterval(interval)

  }, [])

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
        title="Connected Users"
        subtitle="Monitor currently connected devices"
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
                Device
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Phone Number
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                MAC Address
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Login Time
              </th>

              <th className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase">
                Status
              </th>

            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">

            {users.map(user => (

              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors"
              >

                <td className="px-4 py-3 font-medium text-gray-800">
                  Room {user.room_id}
                </td>

                <td className="px-4 py-3">
                  {user.device_name}
                </td>

                <td className="px-4 py-3">
                  {user.phone_number}
                </td>

                <td className="px-4 py-3 text-xs text-gray-500">
                  {user.mac_address}
                </td>

                <td className="px-4 py-3">
                  {new Date(user.login_time).toLocaleString('ms-MY')}
                </td>

                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-600">
                    Connected
                  </span>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {users.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-gray-400">
            No connected users.
          </div>
        )}

      </div>

    </div>

  )

}
