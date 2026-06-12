import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-[#FF6B00]/6 blur-[100px] pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative z-10 max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -15, 15, -10, 10, 0], y: [0, -10, 0] }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="text-8xl mb-6 block"
        >
          🍕
        </motion.div>

        <h1 className="text-7xl font-black text-gradient mb-2">404</h1>
        <h2 className="text-2xl font-bold text-white mb-3">Pizza Not Found</h2>
        <p className="text-white/40 mb-8 leading-relaxed">
          Looks like this slice went missing. Our delivery guy might have eaten it.
          Let's get you back to something delicious.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-8 py-3">
              Back to Home
            </motion.button>
          </Link>
          <Link to="/recommendations">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost px-8 py-3">
              Browse Menu
            </motion.button>
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-center gap-6 text-white/20 text-sm">
          <Link to="/quiz" className="hover:text-[#FF6B00] transition-colors">Pizza Quiz</Link>
          <span>·</span>
          <Link to="/deals" className="hover:text-[#FF6B00] transition-colors">Deals</Link>
          <span>·</span>
          <Link to="/cart" className="hover:text-[#FF6B00] transition-colors">Cart</Link>
        </div>
      </motion.div>
    </div>
  )
}
