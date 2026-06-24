import { useState, useEffect } from 'react'
import { Check, X } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import { requestsAPI } from '../services/api'

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

      setError('Gagal load requests.')

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

  const handleAction = async (
    req,
    action
  ) => {

    const id = req.id

    setProcessing(id)

    try {

      if (action === 'allow') {
        await requestsAPI.allow(id)
      }

      if (action === 'reject') {
        await requestsAPI.reject(id)
      }

      // Remove dari list lepas process
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
            .replace('+', '');

        let message = '';

        if (action === 'allow') {

          message =
`Hello Guest,

Your additional device request for Room ${req.room_id} has been approved.

You may now connect your additional device.

Thank you.
HOTEL OA`;

        } else {

          message =
`Hello Guest,

Your additional device request for Room ${req.room_id} has been rejected.

Please contact the front desk for assistance.

Thank you.
HOTEL OA`;

        }

        window.open(
          `https://wa.me/${phone}?text=${encodeURIComponent(message)}`,
          '_blank'
        );
      }

    } catch (err) {

      setError(
        err.response?.data?.message ??
        'Gagal proses request.'
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
        subtitle="Approve or reject additional device connection requests"
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
            Tiada permintaan baharu buat masa ini.
          </p>

        </div>

      ) : (

        <div className="card divide-y divide-gray-50">

          {requests.map(req => (

            <div
              key={req.id}
              className="flex items-center gap-4 px-4 py-4"
            >

              {/* Room bubble */}
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary-600">
                {req.room_id}
              </div>

              {/* Request info */}
              <div className="flex-1 min-w-0">

                <p className="text-sm font-medium text-gray-800">
                  {req.phone_number ?? 'Unknown'}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Room {req.room_id} · {req.mac_address ?? '-'}
                </p>

                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(req.created_at)
                    .toLocaleString('ms-MY')}
                </p>

              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">

                <button
                  onClick={() =>
                    handleAction(
                      req,
                      'allow'
                    )
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
                    handleAction(
                      req,
                      'reject'
                    )
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

          ))}

        </div>

      )}

    </div>
  )
}
