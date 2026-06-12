import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Recommendations from './pages/Recommendations'
import Builder from './pages/Builder'
import Deals from './pages/Deals'
import GroupVoting from './pages/GroupVoting'
import Cart from './pages/Cart'

export default function App() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/builder" element={<Builder />} />
          <Route path="/deals" element={<Deals />} />
          <Route path="/vote" element={<GroupVoting />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </div>
  )
}
