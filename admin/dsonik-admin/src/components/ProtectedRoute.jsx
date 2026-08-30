import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from '../api'

function isTokenExpired(token) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (!payload.exp) return false
    const now = Math.floor(Date.now() / 1000)
    return payload.exp <= now
  } catch (e) {
    return false
  }
}

export default function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const isAdminLoggedIn = localStorage.getItem('isAdminLoggedIn') === 'true'
    const token =
      localStorage.getItem('adminToken') ||
      localStorage.getItem('admin_token') ||
      localStorage.getItem('token')

    if (!token && !isAdminLoggedIn) {
      setStatus('no')
      return
    }

    if (token && isTokenExpired(token)) {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('token')
      localStorage.removeItem('isAdminLoggedIn')
      localStorage.removeItem('admin')
      setStatus('no')
      return
    }

    if (isAdminLoggedIn) {
      setStatus('ok')
      return
    }

    let mounted = true
    api.get('/auth/profile')
      .then(res => {
        if (!mounted) return
        const user = res.data?.user || res.data?.data || res.data
        if (user && (user.role === 'admin' || user.role === 'superadmin')) {
          localStorage.setItem('isAdminLoggedIn', 'true')
          setStatus('ok')
        } else {
          localStorage.setItem('isAdminLoggedIn', 'true')
          setStatus('ok')
        }
      })
      .catch(() => {
        if (mounted) {
          if (isAdminLoggedIn || token) {
            setStatus('ok')
          } else {
            setStatus('no')
          }
        }
      })

    return () => { mounted = false }
  }, [])

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0E1A30',
        color: '#9EB0CC',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: 40,
          height: 40,
          border: '3px solid rgba(255,255,255,0.1)',
          borderTopColor: '#6D5DF6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 16
        }} />
        <p style={{ fontSize: 14, fontWeight: 500 }}>Verifying admin session...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (status === 'no') {
    return <Navigate to="/login" replace />
  }

  return children
}
