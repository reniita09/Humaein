// src/App.tsx
import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { BackgroundPaths } from '@/components/ui/background-paths'
import Navbar from './components/common/Navbar' 
export default function App() {
  const location = useLocation()

  // Pages that use the clean white UI
  const cleanUiPrefixes = [
    '/home',
    '/upload',
    '/login',
    '/results',
    '/privacy-policy',
    '/terms-of-service',
    '/compliance',
  ]
  const isCleanUI = cleanUiPrefixes.some(
    prefix => location.pathname === prefix || location.pathname.startsWith(`${prefix}/`)
  )

  // Hide navbar on specific routes
  const hideNavbarOn = ['/login', '/upload']
  const shouldHideNavbar = hideNavbarOn.some(path =>
    location.pathname === path || location.pathname.startsWith(`${path}/`)
  )

  return (
    <div className={isCleanUI ? 'min-h-screen bg-white' : 'min-h-screen bg-neutral-950'}>
      <div className="relative">
        {typeof BackgroundPaths !== 'undefined' && <BackgroundPaths />}

        {!shouldHideNavbar && <Navbar />}

        <main className="relative z-10 p-6 pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
