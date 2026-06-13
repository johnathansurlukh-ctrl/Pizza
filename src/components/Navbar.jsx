import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/quiz', label: 'Pizza Quiz' },
  { to: '/builder', label: 'Build Pizza' },
  { to: '/deals', label: 'Deals' },
  { to: '/vote', label: 'Group Vote' },
]

export default function Navbar() {
  const [scrolled, setScrolled]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenu, setUserMenu]     = useState(false)
  const { itemCount } = useCart()
  const { user, isReturning, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const menuRef  = useRef(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false); setUserMenu(false) }, [location])

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenu(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const handleLogout = () => { logout(); setUserMenu(false); navigate('/') }

  const avatarColor = user ? ['bg-[#FF6B00]','bg-purple-500','bg-pink-500','bg-blue-500','bg-green-500'][(user.id || 0) % 5] : ''

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass border-b border-white/8 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.span
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              🍕
            </motion.span>
            <span className="text-xl font-black text-gradient">Pizzora</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to
                    ? 'bg-[#FF6B00]/15 text-[#FF6B00]'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart"
              className="relative glass px-4 py-2 rounded-xl text-sm font-semibold text-white hover:border-[#FF6B00]/40 transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <span>🛒</span>
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <motion.span key={itemCount} initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 bg-[#FF6B00] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative" ref={menuRef}>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenu(v => !v)}
                  className="flex items-center gap-2 glass px-3 py-2 rounded-xl hover:border-[#FF6B00]/40 transition-all"
                >
                  <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-black`}>
                    {user.avatar || user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-white text-sm font-medium max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <svg className={`w-3 h-3 text-white/40 transition-transform ${userMenu ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </motion.button>

                <AnimatePresence>
                  {userMenu && (
                    <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-52 glass-strong rounded-2xl p-2 border border-white/10 shadow-2xl"
                    >
                      <div className="px-3 py-2 mb-1">
                        <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-white/40 text-xs truncate">{user.email}</p>
                        {isReturning && (
                          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="inline-block mt-1 bg-[#FF6B00]/15 text-[#FF6B00] text-xs px-2 py-0.5 rounded-full font-semibold">
                            👋 Welcome back!
                          </motion.span>
                        )}
                      </div>
                      <div className="h-px bg-white/8 mb-1" />
                      {[
                        { icon: '📦', label: 'My Orders',   to: '/orders' },
                        { icon: '⚙️', label: 'Settings',    to: '/settings' },
                      ].map(item => (
                        <Link key={item.label} to={item.to} onClick={() => setUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all">
                          <span>{item.icon}</span>{item.label}
                        </Link>
                      ))}
                      <div className="h-px bg-white/8 my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all">
                        <span>🚪</span>Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link to="/login" className="hidden md:block text-white/60 hover:text-white text-sm font-medium transition-colors px-3 py-2">
                  Sign in
                </Link>
                <Link to="/signup" className="hidden md:block btn-primary text-sm py-2">
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button onClick={() => setMobileOpen(v => !v)} className="md:hidden glass p-2 rounded-xl">
              <div className="w-5 flex flex-col gap-1">
                <span className={`h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`h-0.5 bg-white rounded transition-all duration-200 ${mobileOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Welcome back banner — shows once per session for returning users */}
      <AnimatePresence>
        {user && isReturning && (
          <WelcomeBackBanner name={user.name.split(' ')[0]} />
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-4 right-4 z-40 glass-strong rounded-2xl p-4 flex flex-col gap-1">
            {links.map(link => (
              <Link key={link.to} to={link.to}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.to ? 'bg-[#FF6B00]/15 text-[#FF6B00]' : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}>
                {link.label}
              </Link>
            ))}
            {!user ? (
              <div className="flex gap-2 mt-2">
                <Link to="/login"  className="flex-1 btn-ghost text-sm text-center py-2.5">Sign in</Link>
                <Link to="/signup" className="flex-1 btn-primary text-sm text-center py-2.5">Sign up</Link>
              </div>
            ) : (
              <div className="mt-2 pt-2 border-t border-white/8 space-y-1">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className={`w-7 h-7 ${avatarColor} rounded-full flex items-center justify-center text-white text-xs font-black`}>
                    {user.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{user.name.split(' ')[0]}</p>
                    <p className="text-white/40 text-xs">{user.email}</p>
                  </div>
                </div>
                <Link to="/orders" className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all">
                  <span>📦</span> My Orders
                </Link>
                <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/5 text-sm transition-all">
                  <span>⚙️</span> Settings
                </Link>
                <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 text-sm transition-all">
                  <span>🚪</span> Sign out
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function WelcomeBackBanner({ name }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const shown = sessionStorage.getItem('pizzora-welcome-shown')
    if (!shown) { setVisible(true); sessionStorage.setItem('pizzora-welcome-shown', '1') }
  }, [])

  return visible ? (
    <motion.div initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.5 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6B00] to-[#ff8c38] shadow-lg shadow-[#FF6B00]/20"
    >
      <span className="text-xl">👋</span>
      <span className="text-white font-semibold text-sm">Welcome back, {name}! Ready to order?</span>
      <button onClick={() => setVisible(false)} className="text-white/70 hover:text-white ml-1 text-lg leading-none">×</button>
    </motion.div>
  ) : null
}
