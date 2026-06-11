import axios from 'axios'

// ─── Base URL ────────────────────────────────────────────────────────────────
// Development  → http://localhost:3000/api  (Node.js backend)
// Production   → tukar ke IP gateway ESP32 atau server URL
// Semua calls guna prefix /api, Vite proxy akan forward ke backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT token setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mesh_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 - redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mesh_user')
      localStorage.removeItem('mesh_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────────
// POST /api/auth/login  → { staffId, password }
export const authAPI = {
  login:  (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  logout: ()     => api.post('/auth/logout'),
}

// ─── Rooms ────────────────────────────────────────────────────────────────────
// GET  /api/rooms           → list semua room + status
// GET  /api/rooms/:id       → single room details
// PUT  /api/rooms/:id/limit → update device limit
export const roomsAPI = {
  getAll: () => api.get('/rooms'),

  updateLimit: (roomId, newLimit) =>
    api.post('/update-limit', {
      roomId,
      newLimit
    }),
}

// ─── Nodes (ESP32) ───────────────────────────────────────────────────────────
// GET /api/nodes → list semua ESP32 mesh nodes + status
// Data yang ESP32 hantar: nodeId, ip, rssi, uptime, connectedDevices
export const nodesAPI = {
  getAll:   ()    => api.get('/nodes'),
  getById:  (id)  => api.get(`/nodes/${id}`),
  restart:  (id)  => api.post(`/nodes/${id}/restart`),
}

// ─── Sessions / Connected Users ──────────────────────────────────────────────
// GET /api/sessions/active → semua users yang sedang connected
// DELETE /api/sessions/:mac → disconnect user
export const sessionsAPI = {
  getActive:  ()    => api.get('/sessions/active'),
  disconnect: (mac) => api.delete(`/sessions/${mac}`),
}

// ─── Connection Requests ──────────────────────────────────────────────────────
// GET    /api/requests          → pending requests
// PUT    /api/requests/:id/allow  → allow request
// PUT    /api/requests/:id/reject → reject request
export const requestsAPI = {
  getPending: ()    => api.get('/requests'),
  allow:      (id)  => api.put(`/requests/${id}/allow`),
  reject:     (id)  => api.put(`/requests/${id}/reject`),
}

// ─── Traffic / Bandwidth ─────────────────────────────────────────────────────
// GET /api/traffic?range=1h|6h|24h → data untuk chart
export const trafficAPI = {
  getData: (range = '1h') => api.get(`/traffic?range=${range}`),
}

export default api
