// src/components/common/Navbar.tsx
import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Activity, LogOut } from 'lucide-react'
import { isAuthenticated, clearToken } from '../../api/client'

export default function Navbar(): JSX.Element {
  const location = useLocation()
  const navigate = useNavigate()
  const loggedIn = isAuthenticated()

  const handleLogout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  const navLinkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path ? 'text-teal-600 font-semibold' : 'text-gray-700 hover:text-teal-600'
    }`

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-gray-200 rounded-full px-6 py-3 shadow-sm flex items-center justify-between w-[90%] max-w-3xl">
      {/* Brand */}
      <div className="flex items-center space-x-2">
        <Activity className="w-6 h-6 text-teal-600" strokeWidth={2.5} />
        <span className="text-lg font-bold text-gray-900">Humaein</span>
      </div>

      {/* Links & actions */}
      <div className="flex items-center space-x-4">
        <Link to="/home" className={navLinkClass('/home')}>
          Home
        </Link>

        {!loggedIn ? (
          <Link to="/login" className="px-4 py-1.5 rounded-full bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition">
            Login
          </Link>
        ) : (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium rounded-full hover:bg-gray-200 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
