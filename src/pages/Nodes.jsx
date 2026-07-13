import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { nodesAPI } from '../services/api'
import { formatTime } from '../utils/dateTime'

const rssiStrength = (rssi) => {
if (rssi === null || rssi === undefined)
return { label: 'N/A', color: 'text-gray-400' }

if (rssi >= -50)
return { label: 'Excellent', color: 'text-green-500' }

if (rssi >= -65)
return { label: 'Good', color: 'text-blue-500' }

if (rssi >= -75)
return { label: 'Fair', color: 'text-amber-500' }

return { label: 'Weak', color: 'text-red-500' }
}

export default function Nodes() {

const [nodes, setNodes] = useState([])
const [loading, setLoading] = useState(false)

const loadNodes = async () => {


try {

  setLoading(true)

  const res = await nodesAPI.getAll()

  setNodes(res.data)

} catch (err) {

  console.error('Failed loading nodes:', err)

} finally {

  setLoading(false)

}


}

useEffect(() => {

loadNodes()

const interval = setInterval(() => {

  loadNodes()

}, 5000)

return () => clearInterval(interval)

}, [])

return ( <div className="p-6">


  <PageHeader
    title="Network Nodes"
    subtitle="Real-time ESP32 node monitoring"
    action={
      <button
        onClick={loadNodes}
        className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
      >
        <RefreshCw size={13} />
        Refresh
      </button>
    }
  />

  {loading && (
    <p className="text-sm text-gray-400 mb-4">
      Updating nodes...
    </p>
  )}

  <div className="grid gap-3 sm:grid-cols-2">

    {nodes.map((node) => {

      const isOnline = node.status === 'online'
      const signal = isOnline
        ? rssiStrength(node.rssi)
        : { label: '—', color: 'text-gray-400' }

      return (

        <div
          key={node.id}
          className="card p-4"
        >

          <div className="flex items-start justify-between mb-3">

            <div className="flex items-center gap-2.5">

              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  isOnline
                    ? 'bg-green-50'
                    : 'bg-gray-100'
                }`}
              >

                {isOnline ? (

                  <Wifi
                    size={16}
                    className="text-green-600"
                  />

                ) : (

                  <WifiOff
                    size={16}
                    className="text-gray-400"
                  />

                )}

              </div>

              <div>

                <p className="text-sm font-semibold text-gray-800">
                  {node.node_id}
                </p>

                <p className="text-xs text-gray-400">
                  {node.ip_address}
                </p>

              </div>

            </div>

            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                isOnline
                  ? 'bg-green-50 text-green-600'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {node.status}
            </span>

          </div>

          <div className="grid grid-cols-5 gap-2 text-center border-t border-gray-50 pt-3">

            <div>

              <p className="text-xs text-gray-400">
                Room
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {node.room_id}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-400">
                RSSI
              </p>

              <p
                className={`text-sm font-semibold mt-0.5 ${signal.color}`}
              >
                {isOnline
                  ? `${node.rssi} dBm`
                  : '—'}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-400">
                Uptime
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {isOnline
                  ? `${node.uptime}s`
                  : '—'}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-400">
                Latency
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {isOnline && node.latency_ms !== null
                  ? `${node.latency_ms} ms`
                  : '—'}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-400">
                Loss
              </p>

              <p className="text-sm font-semibold text-gray-700 mt-0.5">
                {isOnline && node.packet_loss !== null
                  ? `${Number(node.packet_loss).toFixed(1)}%`
                  : '—'}
              </p>

            </div>

          </div>

          <div className="mt-3 flex justify-between items-center">

            <span
              className={`text-xs font-medium ${signal.color}`}
            >
              {isOnline
                ? `Signal: ${signal.label}`
                : 'Signal: —'}
            </span>

            <span className="text-xs text-gray-400">
              Success: {isOnline && node.success_rate !== null
                ? `${Number(node.success_rate).toFixed(1)}%`
                : '—'}
            </span>

            <span className="text-xs text-gray-400">
              {formatTime(node.last_seen)}
            </span>

          </div>

        </div>

      )

    })}

  </div>

</div>
)
}
