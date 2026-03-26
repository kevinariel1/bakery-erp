import { createContext, useContext, useState } from 'react'
import { authApi } from '../api/index.js'

const AuthContext = createContext(null)

function getStoredUser() {
  try {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (stored && token) return JSON.parse(stored)
    return null
  } catch {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const login = async (email, password) => {
    const res = await authApi.login(email, password)
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext)
}