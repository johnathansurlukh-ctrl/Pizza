import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Landing from './pages/Landing'
import Quiz from './pages/Quiz'
import Recommendations from './pages/Recommendations'
import Builder from './pages/Builder'
import Deals from './pages/Deals'
import GroupVoting from './pages/GroupVoting'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import AboutUs from './pages/AboutUs'
import Blog from './pages/Blog'
import Careers from './pages/Careers'
import Press from './pages/Press'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'
import NotFound from './pages/NotFound'

export default function App() {
  const location = useLocation()
  return (
    <AuthProvider>
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
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:orderId" element={<OrderTracking />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/press" element={<Press />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </div>
    </AuthProvider>
  )
}
