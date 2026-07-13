import { useState, useEffect } from 'react'
import { Check, X, Sparkles } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { requestsAPI } from '../services/api'
import { formatDateTime } from '../utils/dateTime'

const formatRequestDate = (dateValue) => {
  return formatDateTime(dateValue)
}

const suggestionStyle = (severity) => {
  if (severity === 'critical') {
    return {
      badge: 'bg-red-50 text-red-600 border-red-100',
      icon: 'bg-red-50 text-red-600',
      border: 'border-red-100'
    }
  }

  if (severity === 'warning') {
    return {
      badge: 'bg-amber-50 text-amber-600 border-amber-100',
      icon: 'bg-amber-50 text-amber-600',
      border: 'border-amber-100'
    }
  }

  return {
    badge: 'bg-green-50 text-green-600 border-green-100',
    icon: 'bg-green-50 text-green-600',
    border: 'border-green-100'
  }
}

const numberOrNull = (value) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue)
    ? numberValue
    : null
}

const buildRoomSuggestion = (req) => {
  const currentConnections =
    numberOrNull(req.current_connections) ?? 0
  const deviceLimit =
    numberOrNull(req.device_limit) ?? 0
  const rssi =
    numberOrNull(req.rssi)
  const latency =
    numberOrNull(req.wifi_latency_ms)
  const jitter =
    numberOrNull(req.wifi_jitter_ms)
  const packetLoss =
    numberOrNull(req.wifi_packet_loss)
  const successRate =
    numberOrNull(req.wifi_success_rate)

  const reasons = []
  const warnings = []

  if (req.node_status && req.node_status !== 'online') {
    warnings.push('Room monitor node is offline, so WiFi quality cannot be verified.')
  }

  if (rssi !== null && rssi < -70) {
    reasons.push(`Weak WiFi signal (${rssi} dBm).`)
  } else if (rssi !== null && rssi < -60) {
    warnings.push(`Signal is only fair (${rssi} dBm).`)
  }

  if (latency !== null && latency > 80) {
    reasons.push(`High WiFi latency (${latency} ms).`)
  } else if (latency !== null && latency > 30) {
    warnings.push(`Latency is higher than ideal (${latency} ms).`)
  }

  if (jitter !== null && jitter > 30) {
    reasons.push(`High jitter (${jitter} ms), indicating unstable WiFi.`)
  } else if (jitter !== null && jitter > 15) {
    warnings.push(`Jitter is moderate (${jitter} ms).`)
  }

  if (packetLoss !== null && packetLoss > 5) {
    reasons.push(`High packet loss (${packetLoss}%).`)
  } else if (packetLoss !== null && packetLoss > 0) {
    warnings.push(`Minor packet loss detected (${packetLoss}%).`)
  }

  if (successRate !== null && successRate < 95) {
    reasons.push(`Low success rate (${successRate}%).`)
  } else if (successRate !== null && successRate < 99) {
    warnings.push(`Success rate is slightly reduced (${successRate}%).`)
  }

  if (
    latency === null &&
    jitter === null &&
    packetLoss === null &&
    successRate === null
  ) {
    warnings.push('No recent WiFi performance data is available for this room.')
  }

  if (reasons.length > 0) {
    return {
      decision: 'reject',
      label: 'AI suggests reject',
      severity: 'critical',
      confidence: 'High',
      summary: 'The room network condition is not suitable for an additional device right now.',
      reasons,
      currentConnections,
      deviceLimit,
      projectedLimit: deviceLimit + 1
    }
  }

  if (warnings.length > 0) {
    return {
      decision: 'review',
      label: 'AI suggests review',
      severity: 'warning',
      confidence: 'Medium',
      summary: 'The request can be considered, but staff should review the room network condition first.',
      reasons: warnings,
      currentConnections,
      deviceLimit,
      projectedLimit: deviceLimit + 1
    }
  }

  return {
    decision: 'approve',
    label: 'AI suggests approve',
    severity: 'good',
    confidence: 'High',
    summary: 'The room network is stable and can support one additional device.',
    reasons: [
      'Signal, latency, jitter, packet loss, and success rate are within acceptable range.'
    ],
    currentConnections,
    deviceLimit,
    projectedLimit: deviceLimit + 1
  }
}

export default function Requests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [error, setError] = useState('')

  const fetchRequests = async () => {
    try {
      const res = await requestsAPI.getPending()
      setRequests(res.data)
    } catch (err) {
      console.error(err)
      setError('Failed to load requests.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()

    const interval =
      setInterval(fetchRequests, 5000)

    return () =>
      clearInterval(interval)
  }, [])

  const handleAction = async (req, action) => {
    const id = req.id

    setProcessing(id)

    try {
      if (action === 'allow') {
        await requestsAPI.allow(id)
      }

      if (action === 'reject') {
        await requestsAPI.reject(id)
      }

      setRequests(prev =>
        prev.filter(r => r.id !== id)
      )

      if (window.confirm(
        `Request ${action === 'allow'
          ? 'approved'
          : 'rejected'}.\n\nNotify guest via WhatsApp?`
      )) {
        const phone =
          (req.phone_number || '')
            .replace('+', '')

        let message = ''

        if (action === 'allow') {
          message =
`Hello Guest,

Your additional device request for Room ${req.room_id} has been approved.

Please reconnect the same device to HOTEL OA WiFi and log in again using your room credentials.

Thank you.
HOTEL OA`
        } else {
          message =
`Hello Guest,

Your additional device request for Room ${req.room_id} has been rejected.

Please contact the front desk for assistance.

Thank you.
HOTEL OA`
        }

        window.open(
          `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
          '_blank'
        )
      }
    } catch (err) {
      setError(
        err.response?.data?.message ??
        'Failed to process request.'
      )
    } finally {
      setProcessing(null)
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
        title="Connection Requests"
        subtitle="Approve or reject additional device connection requests with room-based AI suggestions"
        action={
          requests.length > 0 && (
            <span className="text-xs bg-amber-50 text-amber-600 border border-amber-100 px-2.5 py-1 rounded-full font-medium">
              {requests.length} Pending
            </span>
          )
        }
      />

      {error && (
        <div className="mb-4 px-3 py-2 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-3">
            <Check
              size={20}
              className="text-green-500"
            />
          </div>

          <p className="text-sm font-medium text-gray-600">
            All caught up!
          </p>

          <p className="text-xs text-gray-400 mt-1">
            There are no new requests at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const suggestion =
              req.ai_suggestion ?? buildRoomSuggestion(req)
            const style =
              suggestionStyle(suggestion?.severity)

            return (
              <div
                key={req.id}
                className="card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                    {req.room_id}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {req.phone_number ?? 'Unknown'}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">
                          Room {req.room_id} · {req.mac_address ?? '-'}
                        </p>

                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatRequestDate(req.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            handleAction(req, 'allow')
                          }
                          disabled={
                            processing === req.id
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 text-green-600 border border-green-100 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <Check size={12} />
                          {processing === req.id
                            ? '...'
                            : 'Allow'}
                        </button>

                        <button
                          onClick={() =>
                            handleAction(req, 'reject')
                          }
                          disabled={
                            processing === req.id
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                        >
                          <X size={12} />
                          {processing === req.id
                            ? '...'
                            : 'Reject'}
                        </button>
                      </div>
                    </div>

                    {suggestion && (
                      <div className={`mt-3 rounded-xl border p-3 ${style.border}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${style.icon}`}>
                            <Sparkles size={13} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm font-semibold text-gray-800">
                                AI Room Suggestion
                              </p>

                              <span className={`text-xs border px-2 py-1 rounded-full font-medium self-start ${style.badge}`}>
                                {suggestion.label}
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 mt-1">
                              {suggestion.summary}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              <span>
                                Connected: {suggestion.currentConnections}/{suggestion.deviceLimit}
                              </span>
                              <span>
                                After approve: {suggestion.currentConnections}/{suggestion.projectedLimit}
                              </span>
                              <span>
                                Confidence: {suggestion.confidence}
                              </span>
                            </div>

                            <ul className="mt-2 space-y-1">
                              {(suggestion.reasons || []).slice(0, 3).map((reason, index) => (
                                <li
                                  key={index}
                                  className="text-xs text-gray-500"
                                >
                                  • {reason}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
