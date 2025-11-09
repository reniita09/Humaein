// src/components/homepage/Hero.tsx
import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { Activity, Lock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '@/api/client' // <- ensure this path matches your project

export default function Hero() {
  const navigate = useNavigate()

  // Parallax setup
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [8, -8])
  const rotateY = useTransform(x, [-100, 100], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const { innerWidth, innerHeight } = window
    const offsetX = e.clientX - innerWidth / 2
    const offsetY = e.clientY - innerHeight / 2
    x.set(offsetX / 10)
    y.set(offsetY / 10)
  }

  const resetParallax = () => {
    x.set(0)
    y.set(0)
  }

  // ---------- auth state ----------
  const [loggedIn, setLoggedIn] = useState<boolean>(() => isAuthenticated())

  useEffect(() => {
    // update state on storage changes (covers other tabs) and custom events (same tab)
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'humaein_token' || e.key === null) {
        setLoggedIn(isAuthenticated())
      }
    }
    const onCustom = () => setLoggedIn(isAuthenticated())

    window.addEventListener('storage', onStorage)
    window.addEventListener('humaein_auth', onCustom) // optional custom event

    // cleanup
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('humaein_auth', onCustom)
    }
  }, [])

  // If you want to trigger immediate UI updates after login/logout in the same tab,
  // call: window.dispatchEvent(new Event('humaein_auth'))
  // (you can add that after setToken/clearToken in your auth flow)

  return (
    <section
      className="relative bg-gradient-to-br from-blue-50 via-white to-teal-50 overflow-hidden min-h-screen flex flex-col"
      onMouseMove={handleMouseMove}
      onMouseLeave={resetParallax}
    >
      {/* Hero Content */}
      <div className="flex-grow flex items-center">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side: intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <div className="space-y-6">
              <div className="inline-flex items-center bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-teal-600 rounded-full animate-pulse mr-2" />
                Secure Access Portal
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Welcome to Humaein Admin Portal
              </h1>

              <p className="text-lg text-gray-600 max-w-lg">
                Manage claims, review validations, and monitor RCM performance — all in one AI-powered dashboard.
              </p>

              {/* Conditional CTA */}
              {!loggedIn ? (
                <motion.button
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-8 py-4 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all hover:shadow-lg"
                >
                  <Lock className="w-5 h-5 mr-2" />
                  Login to Admin
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => navigate('/upload')}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-all hover:shadow-lg"
                >
                  <Activity className="w-5 h-5 mr-2" />
                  Go to Uploads
                </motion.button>
              )}
            </div>
          </motion.div>

          {/* Right side: floating visual */}
          <motion.div
            className="relative hidden lg:block"
            style={{ rotateX, rotateY }}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 overflow-hidden max-w-md mx-auto">
              <div className="absolute -left-20 -top-8 w-56 h-56 rounded-full bg-gradient-to-tr from-teal-200 to-blue-200 opacity-40 blur-3xl pointer-events-none" />

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">AI-Driven Insights</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Real-time analytics, clean claim tracking, and automated reconciliation tools
                  designed for healthcare financial teams.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <div className="text-sm text-gray-500">Accuracy</div>
                    <div className="font-semibold text-gray-900">98.7%</div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-center">
                    <div className="text-sm text-gray-500">Automation</div>
                    <div className="font-semibold text-teal-600">90%</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 h-1 rounded-full bg-gradient-to-r from-teal-500 to-blue-500" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-200"></footer>

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
