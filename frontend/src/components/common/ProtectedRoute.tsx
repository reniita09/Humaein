// src/components/common/ProtectedRoute.tsx
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../../api/client' // adjust path if you placed client elsewhere

type Props = {
  children: React.ReactElement
}

/**
 * Protects routes on the client. If the token is not present/expired,
 * redirect to /login. If you want to preserve the intended destination,
 * it passes the original location in state.
 */
export default function ProtectedRoute({ children }: Props) {
  const location = useLocation()
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return children
}
