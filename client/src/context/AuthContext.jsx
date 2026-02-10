import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')
      setUser(response.data.user)
    } catch (error) {
      // 쿠키가 없거나 만료된 경우
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    const { user } = response.data
    setUser(user)
    return user
  }

  const register = async (data) => {
    const response = await api.post('/auth/register', data)
    const { user } = response.data
    setUser(user)
    return user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // 로그아웃 실패해도 클라이언트 상태는 초기화
    }
    setUser(null)
  }

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }))
  }

  const socialLogin = async (code) => {
    const response = await api.post('/auth/exchange-code', { code })
    setUser(response.data.user)
    return response.data.user
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    socialLogin,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
