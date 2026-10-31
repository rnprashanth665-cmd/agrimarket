import React, { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

/**
 * AuthProvider centralizes authentication state: JWT token, role and user id.
 * State is initialized from localStorage so a page refresh keeps the user logged in.
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [role, setRole] = useState(() => localStorage.getItem('role'))
  const [userId, setUserId] = useState(() => localStorage.getItem('user_id'))
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || '')

  const login = useCallback(({ token, role, user_id, name }) => {
    localStorage.setItem('token', token)
    localStorage.setItem('role', role)
    localStorage.setItem('user_id', user_id)
    if (name) localStorage.setItem('user_name', name)
    setToken(token)
    setRole(role)
    setUserId(user_id)
    setUserName(name || '')
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_name')
    setToken(null)
    setRole(null)
    setUserId(null)
    setUserName('')
  }, [])

  const value = {
    token,
    role,
    userId,
    userName,
    isAuthenticated: !!token,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
