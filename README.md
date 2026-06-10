# Mesh Monitoring Dashboard — Staff Frontend

React + Vite dashboard untuk FYP mesh network monitoring system.

## Tech Stack
- React 18 + Vite 5
- React Router DOM v6
- Tailwind CSS v3
- Recharts (traffic graphs)
- Axios (API calls)
- Lucide React (icons)

---

## Setup & Run

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Build untuk production
npm run build
```

Akses di: http://localhost:5173

---

## Folder Structure

```
src/
├── components/
│   ├── Layout.jsx       ← Sidebar + navigation wrapper
│   ├── StatCard.jsx     ← Reusable stat card
│   └── PageHeader.jsx   ← Reusable page header
├── pages/
│   ├── Login.jsx        ← Login page
│   ├── Signup.jsx       ← Sign up page
│   ├── Dashboard.jsx    ← Overview + stat cards
│   ├── Rooms.jsx        ← Room status + device limit controls
│   ├── Nodes.jsx        ← ESP32 node status
│   ├── Users.jsx        ← Connected users/sessions
│   ├── Traffic.jsx      ← Bandwidth chart (recharts)
│   └── Requests.jsx     ← Allow/Reject connection requests
├── services/
│   └── api.js           ← SEMUA API calls ke backend (axios)
├── context/
│   └── AuthContext.jsx  ← Global auth state (login/logout)
└── data/
    └── dummyData.js     ← Dummy data untuk testing UI
```

---

## Integrate dengan Backend (Node.js)

Sekarang semua pages guna dummy data. Untuk integrate:

### Step 1: Set API URL

Buat file `.env` dalam root folder:
```
VITE_API_URL=http://localhost:3000/api
```

Atau kalau deploy ke server/Raspberry Pi:
```
VITE_API_URL=http://192.168.1.100:3000/api
```

### Step 2: Uncomment API calls dalam setiap page

Contoh dalam `Rooms.jsx`:
```jsx
// SEBELUM (dummy):
const rooms = dummyRooms

// LEPAS (real API):
const [rooms, setRooms] = useState([])
useEffect(() => {
  roomsAPI.getAll().then(res => setRooms(res.data))
}, [])
```

### Step 3: Uncomment dalam Login.jsx
```jsx
// REAL LOGIN:
const res = await authAPI.login(form)
login(res.data.user, res.data.token)
```

---

## Integrate dengan ESP32 Mesh

Data flow:
```
ESP32 Mesh Nodes
      ↓ (HTTP POST setiap 5-10 saat)
Main Gateway Node  (192.168.4.1)
      ↓
Node.js Backend API  (port 3000)
      ↓
MySQL Database
      ↓
React Dashboard  (port 5173)
```

### ESP32 hantar data (contoh payload):
```json
POST /api/nodes/update
{
  "nodeId": "NODE-01",
  "ip": "192.168.4.1",
  "rssi": -45,
  "connectedDevices": 3,
  "uptime": 7200,
  "room": 101
}
```

### Dashboard polling data (setiap 10 saat):
```jsx
useEffect(() => {
  const interval = setInterval(() => {
    nodesAPI.getAll().then(res => setNodes(res.data))
  }, 10000)
  return () => clearInterval(interval)
}, [])
```

---

## API Endpoints (Backend perlu implement)

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| POST | /api/auth/login | Staff login |
| POST | /api/auth/signup | Daftar akaun |
| GET  | /api/rooms | Semua rooms + status |
| PUT  | /api/rooms/:id/limit | Update device limit |
| GET  | /api/nodes | Semua ESP32 nodes |
| GET  | /api/sessions/active | Active user sessions |
| GET  | /api/requests | Pending requests |
| PUT  | /api/requests/:id/allow | Allow request |
| PUT  | /api/requests/:id/reject | Reject request |
| GET  | /api/traffic?range=1h | Traffic data |
