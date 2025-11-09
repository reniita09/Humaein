// src/components/homepage/Homepage.tsx
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import Results from './Results'
import Footer from './Footer'

export default function Homepage() {
  return (
    <div className="bg-white text-gray-900">
      <Hero />
      <HowItWorks />
      <Results />
      <Footer />
    </div>
  )
}
