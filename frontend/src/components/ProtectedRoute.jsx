import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Guards a route so only authenticated users, optionally of a specific role,
 * can access it. Unauthenticated users are sent to /login, and users with
 * the wrong role are sent to /unauthorized.
 */
export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, role } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}
