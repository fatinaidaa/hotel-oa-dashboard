import { useState, useEffect } from 'react'
import { Radio, Users, Wifi, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import StatCard from '../components/StatCard'
import PageHeader from '../components/PageHeader'
import { nodesAPI, roomsAPI, requestsAPI, sessionsAPI } from '../services/api'

export default function Dashboard() {
  const [rooms,    setRooms]    = useState([])
  const [requests, setRequests] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)

  const fetchAll = async () => {
    try {
      const [roomsRes, requestsRes, sessionsRes] = await Promise.all([
        roomsAPI.getAll(),
        requestsAPI.getPending(),
        sessionsAPI.getActive(),
      ])
      setRooms(roomsRes.data)
      setRequests(requestsRes.data)
      setSessions(sessionsRes.data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
    // Auto-refresh setiap 15 saat
    const interval = setInterval(fetchAll, 15000)
    return () => clearInterval(interval)
  }, [])

  // Kira stats dari data sebenar
  const totalConnected  = rooms.reduce((sum, r) => sum + (r.current_connected ?? 0), 0)
  const fullRooms       = rooms.filter(r => r.current_connected >= r.device_limit).length

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <PageHeader title="Dashboard" subtitle="Mesh network overview" />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Rooms"      value={rooms.length}        icon={Radio}  color="blue"  sub={`${fullRooms} full`} />
        <StatCard label="Connected Devices" value={totalConnected}     icon={Users}  color="green" sub="Active now" />
        <StatCard label="Pending Requests" value={requests.length}     icon={Bell}   color="red"   sub="Awaiting approval" />
        <StatCard label="Active Sessions"  value={sessions.length}     icon={Wifi}   color="amber" sub="Current sessions" />
      </div>

      {/* Room Summary */}
      <div className="card mb-4">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-700">Room Status</h2>
          <Link to="/rooms" className="text-xs text-primary-600 hover:underline">Manage →</Link>
        </div>
        {rooms.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-gray-400">Tiada data room.</div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-gray-100">
            {rooms.map(room => (
              <div key={room.room_num} className="bg-white px-3 py-3 text-center">
                <p className="text-xs text-gray-400 mb-1">Room</p>
                <p className="text-base font-semibold text-gray-800">{room.room_num}</p>
                <p className="text-xs mt-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
                    room.current_connected >= room.device_limit ? 'bg-amber-400' :
                    room.current_connected > 0                  ? 'bg-green-400' : 'bg-gray-300'
                  }`} />
                  {room.current_connected}/{room.device_limit}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Requests preview */}
      {requests.length > 0 && (
        <div className="card">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Bell size={14} className="text-red-400" />
              Pending Requests
              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded-full">
                {requests.length}
              </span>
            </h2>
            <Link to="/requests" className="text-xs text-primary-600 hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {requests.slice(0, 3).map(req => (
              <div key={req.request_id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">{req.phone_num ?? 'Unknown'}</p>
                  <p className="text-xs text-gray-400">Room {req.room_num} · {new Date(req.timestamp).toLocaleTimeString()}</p>
                </div>
                <span className="text-xs bg-amber-50 text-amber-600 px-2 py-1 rounded-full">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
