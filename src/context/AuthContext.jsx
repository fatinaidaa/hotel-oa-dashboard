import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check kalau ada saved session masa app start
  useEffect(() => {
    const savedUser = localStorage.getItem('mesh_user')
    const savedToken = localStorage.getItem('mesh_token')
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    localStorage.setItem('mesh_user', JSON.stringify(userData))
    localStorage.setItem('mesh_token', token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mesh_user')
    localStorage.removeItem('mesh_token')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
