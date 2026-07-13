import { useEffect, useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import PageHeader from '../components/PageHeader'
import { trafficAPI } from '../services/api'

const RANGES = ['1h', '6h', '24h']

const average = (data, key) => {
  if (!data.length) return 0

  return data.reduce(
    (total, item) => total + (Number(item[key]) || 0),
    0
  ) / data.length
}

export default function Traffic() {
  const [range, setRange] = useState('1h')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchTraffic = async () => {
      try {
        setError('')
        setLoading(true)

        const res = await trafficAPI.getData(range)

        if (isMounted) {
          setData(Array.isArray(res.data) ? res.data : [])
        }
      } catch (err) {
        console.error(err)

        if (isMounted) {
          setError('Failed to load network performance data.')
          setData([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTraffic()

    const interval = setInterval(fetchTraffic, 10000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [range])

  const hasData = data.length > 0
  const avgLatency = average(data, 'latency')
  const avgJitter = average(data, 'jitter')
  const avgPacketLoss = average(data, 'packetLoss')
  const avgSuccessRate = average(data, 'successRate')
  const avgThroughput = average(data, 'estimatedThroughput')

  return (
    <div className="p-6">
      <PageHeader
        title="Network Performance Monitor"
        subtitle="Latency, jitter, packet loss, and success rate from ESP32 room monitor nodes"
        action={
          <div className="flex gap-1 bg-gray-100 p-0.5 rounded-lg">
            {RANGES.map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                  range === r
                    ? 'bg-white text-gray-700 font-medium shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="card p-4 mb-4">
        <h2 className="text-xs font-medium text-gray-400 mb-4 uppercase tracking-wide">
          Response Time (ms)
        </h2>

        {loading && !hasData ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
            Loading network performance data...
          </div>
        ) : !hasData ? (
          <div className="h-[260px] flex items-center justify-center text-sm text-gray-400">
            No network performance data yet. Upload the updated ESP32 room monitor nodes first.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  fontSize: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: 'none'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
              <Line
                type="monotone"
                dataKey="latency"
                name="Latency"
                stroke="#185FA5"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="jitter"
                name="Jitter"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          {
            label: 'Avg Latency',
            value: `${avgLatency.toFixed(0)} ms`,
            color: avgLatency > 200 ? 'text-red-600' : avgLatency > 100 ? 'text-amber-600' : 'text-green-600'
          },
          {
            label: 'Avg Jitter',
            value: `${avgJitter.toFixed(0)} ms`,
            color: avgJitter > 20 ? 'text-red-600' : avgJitter > 10 ? 'text-amber-600' : 'text-green-600'
          },
          {
            label: 'Packet Loss',
            value: `${avgPacketLoss.toFixed(1)}%`,
            color: avgPacketLoss > 5 ? 'text-red-600' : avgPacketLoss > 2 ? 'text-amber-600' : 'text-green-600'
          },
          {
            label: 'Success Rate',
            value: `${avgSuccessRate.toFixed(1)}%`,
            color: avgSuccessRate < 95 ? 'text-red-600' : avgSuccessRate < 98 ? 'text-amber-600' : 'text-green-600'
          },
          {
            label: 'Est. Throughput',
            value: `${avgThroughput.toFixed(1)} Mbps`,
            color: 'text-primary-600'
          },
        ].map(stat => (
          <div key={stat.label} className="card p-3 text-center">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-base font-semibold mt-1 ${stat.color}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
