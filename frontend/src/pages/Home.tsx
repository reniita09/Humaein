// src/pages/Home.tsx
import React, { Suspense } from 'react'

// Option A (preferred): If you already have a homepage component file, import it directly:
// import Homepage from '../components/homepage/Homepage'

// Option B: Lazy-load from a file you will create/replace:
const Homepage = React.lazy(() => import('../components/homepage/Homepage'))

export default function Home() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-white">Loading homepage…</div>}>
      <Homepage />
    </Suspense>
  )
}
