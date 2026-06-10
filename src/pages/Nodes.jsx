import { Radio, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { dummyNodes } from '../data/dummyData'
// import { nodesAPI } from '../services/api'  // ← uncomment bila backend ready

const rssiStrength = (rssi) => {
  if (!rssi) return { label: 'N/A', color: 'text-gray-400' }
  if (rssi >= -50) return { label: 'Excellent', color: 'text-green-500' }
  if (rssi >= -65) return { label: 'Good',      color: 'text-blue-500'  }
  if (rssi >= -75) return { label: 'Fair',       color: 'text-amber-500' }
  return { label: 'Weak', color: 'text-red-400' }
}

export default function Nodes() {
  const nodes = dummyNodes  // ganti dengan useEffect + nodesAPI.getAll()

  return (
    <div className="p-6">
      <PageHeader
        title="Mesh Nodes"
        subtitle="ESP32 mesh network node status"
        action={
          <button className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
            <RefreshCw size={13} /> Refresh
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {nodes.map(node => {
          const signal = rssiStrength(node.rssi)
          const isOnline = node.status === 'online'

          return (
            <div key={node.id} className="card p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isOnline ? 'bg-green-50' : 'bg-gray-100'}`}>
                    {isOnline
                      ? <Wifi size={16} className="text-green-600" />
                      : <WifiOff size={16} className="text-gray-400" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{node.id}</p>
                    <p className="text-xs text-gray-400">{node.ip}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  isOnline ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {node.status}
                </span>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-50 pt-3">
                <div>
                  <p className="text-xs text-gray-400">Devices</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{node.connectedDevices}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">RSSI</p>
                  <p className={`text-sm font-semibold mt-0.5 ${signal.color}`}>
                    {node.rssi ? `${node.rssi} dBm` : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Uptime</p>
                  <p className="text-sm font-semibold text-gray-700 mt-0.5">{node.uptime}</p>
                </div>
              </div>

              {/* Signal strength label */}
              {isOnline && (
                <div className="mt-2 text-right">
                  <span className={`text-xs ${signal.color}`}>Signal: {signal.label}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
