// ─── DUMMY DATA ──────────────────────────────────────────────────────────────
// Guna data ni untuk develop & test UI sebelum backend/ESP32 siap.
// Bila backend dah ready, import dari services/api.js je - tak payah tukar UI.

export const dummyRooms = [
  { id: 101, connected: 0, limit: 3, bandwidth: 'Idle',  status: 'empty'  },
  { id: 102, connected: 2, limit: 3, bandwidth: '30%',   status: 'active' },
  { id: 103, connected: 1, limit: 2, bandwidth: 'Idle',  status: 'active' },
  { id: 104, connected: 3, limit: 3, bandwidth: '85%',   status: 'full'   },
  { id: 105, connected: 0, limit: 5, bandwidth: 'Idle',  status: 'empty'  },
]

export const dummyNodes = [
  { id: 'NODE-01', ip: '192.168.4.1', rssi: -42, uptime: '3h 20m', connectedDevices: 3, status: 'online',  room: 101 },
  { id: 'NODE-02', ip: '192.168.4.2', rssi: -65, uptime: '3h 18m', connectedDevices: 2, status: 'online',  room: 102 },
  { id: 'NODE-03', ip: '192.168.4.3', rssi: -78, uptime: '1h 05m', connectedDevices: 1, status: 'online',  room: 103 },
  { id: 'NODE-04', ip: '192.168.4.4', rssi: null, uptime: '-',     connectedDevices: 0, status: 'offline', room: 104 },
]

export const dummySessions = [
  { mac: 'AA:BB:CC:11:22:33', ip: '192.168.1.10', node: 'NODE-01', room: 101, connectedAt: '10:30 AM', duration: '45m', status: 'active' },
  { mac: 'AA:BB:CC:44:55:66', ip: '192.168.1.11', node: 'NODE-02', room: 102, connectedAt: '10:55 AM', duration: '20m', status: 'active' },
  { mac: 'AA:BB:CC:77:88:99', ip: '192.168.1.12', node: 'NODE-02', room: 102, connectedAt: '09:15 AM', duration: '2h', status: 'idle'   },
  { mac: 'AA:BB:CC:AA:BB:CC', ip: '192.168.1.13', node: 'NODE-03', room: 103, connectedAt: '11:00 AM', duration: '15m', status: 'active' },
]

export const dummyRequests = [
  { id: 1, phone: '+60123456789', room: 101, node: 'NODE-01', message: 'Requesting additional device connection', time: '2 mins ago' },
  { id: 2, phone: '+60198765432', room: 102, node: 'NODE-02', message: 'Requesting additional device connection', time: '5 mins ago' },
  { id: 3, phone: '+60167891234', room: 103, node: 'NODE-03', message: 'Requesting additional device connection', time: '8 mins ago' },
]

// Traffic data - setiap titik = 5 minit
export const dummyTraffic = [
  { time: '10:00', upload: 1.2, download: 3.4 },
  { time: '10:05', upload: 2.1, download: 5.6 },
  { time: '10:10', upload: 0.8, download: 2.3 },
  { time: '10:15', upload: 3.5, download: 7.8 },
  { time: '10:20', upload: 1.9, download: 4.2 },
  { time: '10:25', upload: 2.7, download: 6.1 },
  { time: '10:30', upload: 1.5, download: 3.9 },
  { time: '10:35', upload: 4.2, download: 9.3 },
  { time: '10:40', upload: 2.3, download: 5.7 },
  { time: '10:45', upload: 1.8, download: 4.5 },
]

export const dummyStats = {
  totalNodes:      4,
  onlineNodes:     3,
  connectedUsers:  4,
  totalBandwidth:  '12.4 Mbps',
  pendingRequests: 3,
}
