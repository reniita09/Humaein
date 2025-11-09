// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import App from './App'
import Login from './pages/Login'
import Upload from './pages/Upload'
import Results from './pages/Results'
import Home from './pages/Home'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import Compliance from './pages/Compliance'
import ProtectedRoute from './components/common/ProtectedRoute'
import Navbar from './components/common/Navbar'
import './styles.css'

const root = createRoot(document.getElementById('root')!)

// Layout wrapper renders Navbar (except on chosen routes) and adds top padding
function LayoutWrapper() {
  const { pathname } = useLocation()
  // hide navbar on login (extend array if there are other pages that should hide it)
  const hideNavbarOn = ['/login']

  return (
    <>
      {!hideNavbarOn.includes(pathname) && <Navbar />}

      {/* 
        Important: apply top padding so fixed Navbar doesn't overlap content.
        pt-20 on small screens, md:pt-24 on medium+ screens — adjust if your navbar height changes.
      */}
      <div className={!hideNavbarOn.includes(pathname) ? 'pt-20 md:pt-24' : ''}>
        <Outlet />
      </div>
    </>
  )
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Use LayoutWrapper for all routes under "/" so Navbar + spacing is applied consistently */}
        <Route path="/" element={<LayoutWrapper />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="home" element={<Home />} />

          <Route
            path="upload"
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            }
          />

          <Route
            path="results/:jobId"
            element={
              <ProtectedRoute>
                <Results />
              </ProtectedRoute>
            }
          />

          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms-of-service" element={<TermsOfService />} />
          <Route path="compliance" element={<Compliance />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
