import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'
import CartItem from '../components/CartItem'

export default function Cart() {
  const { items, subtotal, deliveryFee, total, discount, coupon, applyCoupon, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [couponInput, setCouponInput] = useState('')
  const [couponStatus, setCouponStatus] = useState(null)
  const [couponMsg, setCouponMsg] = useState('')

  const handleCoupon = async () => {
    if (!couponInput.trim()) return
    try {
      const result = await api.validateCoupon(couponInput)
      applyCoupon(result.code)
      setCouponStatus('success')
      setCouponMsg(result.message)
      addToast({ title: result.message, type: 'success', emoji: '🏷️' })
    } catch {
      setCouponStatus('error')
      setCouponMsg('Invalid or expired promo code.')
      setTimeout(() => setCouponStatus(null), 3000)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-md">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-3xl font-black text-white mb-3">Your cart is empty</h2>
          <p className="text-white/40 mb-8">Looks like you haven't added any pizzas yet.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/recommendations"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-8 py-3">Browse Menu</motion.button></Link>
            <Link to="/quiz"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost px-8 py-3">Take Quiz ✨</motion.button></Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black">Your Cart</h1>
            <p className="text-white/40 mt-1">{items.length} item{items.length !== 1 ? 's' : ''} · Est. 28 min delivery</p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} onClick={clearCart} className="text-white/30 hover:text-red-400 text-sm transition-colors">Clear all</motion.button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence>{items.map(item => <CartItem key={item.id} item={item} />)}</AnimatePresence>

            {/* Coupon */}
            <div className="glass-strong rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-3">🏷️ Promo Code</h3>
              <div className="flex gap-3">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && couponInput.trim() && handleCoupon()}
                  placeholder="Enter promo code"
                  className={`flex-1 glass rounded-xl px-4 py-3 text-white placeholder:text-white/25 outline-none font-mono tracking-wider text-sm transition-all ${couponStatus === 'success' ? 'border-green-500/50' : couponStatus === 'error' ? 'border-red-500/50' : 'focus:border-[#FF6B00]/40'}`}
                />
                <motion.button whileHover={{ scale: couponInput.trim() ? 1.05 : 1 }} whileTap={{ scale: couponInput.trim() ? 0.95 : 1 }} onClick={handleCoupon} disabled={!couponInput.trim()} className="btn-primary px-5 text-sm disabled:opacity-40">Apply</motion.button>
              </div>
              <AnimatePresence>
                {couponStatus && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`text-sm mt-2 ${couponStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {couponStatus === 'success' ? '✓ ' : '✗ '}{couponMsg}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Delivery */}
            <div className="glass rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">🛵</span>
              <div className="flex-1">
                <p className="text-white font-medium text-sm">Standard Delivery</p>
                <p className="text-white/40 text-xs">25–35 minutes · Live tracking</p>
              </div>
              <span className="font-semibold text-sm">{deliveryFee === 0 ? <span className="text-green-400">FREE</span> : <span className="text-white">₹{deliveryFee}</span>}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl p-5 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-5">Order Summary</h3>
              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Subtotal ({items.reduce((s, i) => s + i.qty, 0)} items)</span><span className="text-white">₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Delivery</span><span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">−₹{discount}</span></div>}
              </div>
              <div className="border-t border-white/8 pt-4 mb-5">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">Total</span>
                  <motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }} className="text-2xl font-black text-white">₹{total}</motion.span>
                </div>
                {discount > 0 && <p className="text-green-400 text-xs mt-1 text-right">You're saving ₹{discount}!</p>}
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-4 text-base font-bold"
              >
                Proceed to Checkout · ₹{total}
              </motion.button>
              <p className="text-white/20 text-xs text-center mt-3">Secure checkout · 256-bit encrypted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
