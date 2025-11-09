import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, Mail, Activity } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login } from '../api/client' // ✅ Import the real login function

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/upload' // Go back to intended page or /upload

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    try {
      await login(email, password) // ✅ Calls backend & stores token
      navigate(from, { replace: true }) // ✅ Redirect to upload or previous
    } catch (err: any) {
      console.error('Login failed:', err)
      setError('Invalid credentials. Please check your email or password.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center overflow-hidden px-6">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.07] pointer-events-none" />

      {/* Brand corner logo */}
      <motion.div
        className="absolute top-6 left-6 flex items-center space-x-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Activity className="w-7 h-7 text-teal-600" strokeWidth={2.5} />
        <span className="text-xl font-bold text-gray-800">Humaein</span>
      </motion.div>

      {/* Login card */}
      <motion.div
        className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl p-8 sm:p-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center text-white shadow-md">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          Admin Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Secure access to your RCM dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-600 text-sm bg-red-50 border border-red-200 px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@humaein.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all outline-none"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-teal-600 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-60"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </motion.button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-8">
          Having trouble logging in?{' '}
          <a href="mailto:support@humaein.com" className="text-teal-600 hover:underline">
            Contact Support
          </a>
        </p>
      </motion.div>

      {/* Decorative blur orbs */}
      <div className="absolute -bottom-20 -left-10 w-72 h-72 bg-teal-200 opacity-40 blur-3xl rounded-full" />
      <div className="absolute -top-20 -right-10 w-72 h-72 bg-blue-200 opacity-40 blur-3xl rounded-full" />

      <style>{`
        .bg-grid-pattern {
          background-image: linear-gradient(#e5e7eb 1px, transparent 1px),
            linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </section>
  )
}
