import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import PageHeader from '../components/PageHeader'
import { dummyTraffic } from '../data/dummyData'
// import { trafficAPI } from '../services/api'  // ← uncomment bila backend ready

const RANGES = ['1h', '6h', '24h']

export default function Traffic() {
  const [range, setRange] = useState('1h')
  const data = dummyTraffic  // ganti dengan useEffect + trafficAPI.getData(range)

  return (
    <div className="p-6">
      <PageHeader
        title="Traffic Monitor"
        subtitle="Network bandwidth usage over time"
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

      {/* Chart */}
      <div className="card p-4 mb-4">
        <h2 className="text-xs font-medium text-gray-400 mb-4 uppercase tracking-wide">Bandwidth (Mbps)</h2>
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
              width={30}
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
              dataKey="download"
              name="Download"
              stroke="#185FA5"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="upload"
              name="Upload"
              stroke="#3B6D11"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Peak Download', value: `${Math.max(...data.map(d => d.download)).toFixed(1)} Mbps`, color: 'text-primary-600' },
          { label: 'Peak Upload',   value: `${Math.max(...data.map(d => d.upload)).toFixed(1)} Mbps`,   color: 'text-green-600'   },
          { label: 'Avg Download',  value: `${(data.reduce((a,b) => a + b.download, 0) / data.length).toFixed(1)} Mbps`, color: 'text-gray-600' },
        ].map(stat => (
          <div key={stat.label} className="card p-3 text-center">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className={`text-base font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
