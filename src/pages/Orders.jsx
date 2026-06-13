import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { loadOrdersFromFirestore } from '../lib/orders'

const STATUS_META = {
  confirmed:        { label: 'Confirmed',       color: 'text-blue-400',   bg: 'bg-blue-500/15',   dot: 'bg-blue-400',   icon: '✓' },
  preparing:        { label: 'Preparing',        color: 'text-yellow-400', bg: 'bg-yellow-500/15', dot: 'bg-yellow-400', icon: '🍕' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-[#FF6B00]',  bg: 'bg-[#FF6B00]/15',  dot: 'bg-[#FF6B00]',  icon: '🛵' },
  delivered:        { label: 'Delivered',        color: 'text-green-400',  bg: 'bg-green-500/15',  dot: 'bg-green-400',  icon: '✓' },
}

function computeStatus(order) {
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000
  const est = order.estimatedDelivery || 28
  if (elapsed < 3)           return 'confirmed'
  if (elapsed < est * 0.35)  return 'preparing'
  if (elapsed < est)         return 'out_for_delivery'
  return 'delivered'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function ReviewModal({ order, onClose, onSubmit }) {
  const [rating, setRating] = useState(0)
  const [hover, setHover]   = useState(0)
  const [comment, setComment] = useState('')

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="glass-strong rounded-3xl p-8 max-w-md w-full border border-white/10"
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🍕</div>
          <h2 className="text-2xl font-black text-white">How was your order?</h2>
          <p className="text-white/40 text-sm mt-1">{order.orderId}</p>
        </div>

        <div className="flex justify-center gap-2 mb-6">
          {[1,2,3,4,5].map(s => (
            <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)} onClick={() => setRating(s)}
              className={`text-4xl transition-transform hover:scale-110 ${s <= (hover || rating) ? 'opacity-100' : 'opacity-25'}`}>
              ⭐
            </button>
          ))}
        </div>

        <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
          placeholder="Tell us about your experience (optional)..."
          className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm resize-none mb-5" />

        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
            className="flex-1 btn-ghost py-3 text-sm">Skip</motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => onSubmit({ orderId: order.orderId, rating, comment })}
            disabled={rating === 0}
            className="flex-1 btn-primary py-3 text-sm disabled:opacity-40">Submit Review</motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const { addItem, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [orders, setOrders]         = useState([])
  const [reviewOrder, setReviewOrder] = useState(null)
  const [reviewed, setReviewed]     = useState(() => {
    try { return JSON.parse(localStorage.getItem('pizzora-reviewed') || '{}') } catch { return {} }
  })

  useEffect(() => {
    async function load() {
      // Try Firestore first if user is logged in
      if (user) {
        const cloud = await loadOrdersFromFirestore(user.uid)
        if (cloud && cloud.length > 0) { setOrders(cloud); return }
      }
      // Fall back to localStorage
      try {
        const saved = JSON.parse(localStorage.getItem('pizzora-orders') || '[]')
        setOrders(saved)
      } catch { setOrders([]) }
    }
    load()
  }, [user])

  const handleReorder = (order) => {
    clearCart()
    order.items.forEach(item => addItem(item))
    addToast({ title: `${order.items.length} item${order.items.length !== 1 ? 's' : ''} added to cart!`, type: 'cart', emoji: '🍕' })
    navigate('/cart')
  }

  const handleReviewSubmit = ({ orderId, rating, comment }) => {
    const updated = { ...reviewed, [orderId]: { rating, comment } }
    setReviewed(updated)
    localStorage.setItem('pizzora-reviewed', JSON.stringify(updated))
    setReviewOrder(null)
    addToast({ title: 'Thanks for your review!', subtitle: `${rating}★ — We appreciate the feedback`, type: 'success', emoji: '⭐' })
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="fixed bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2">My Orders</h1>
          <p className="text-white/40">Your full order history</p>
        </motion.div>

        {orders.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <div className="text-6xl mb-4">🍕</div>
            <h2 className="text-2xl font-black text-white mb-3">No orders yet</h2>
            <p className="text-white/40 mb-6">Time to fix that.</p>
            <Link to="/recommendations">
              <motion.button whileHover={{ scale: 1.05 }} className="btn-primary px-8 py-3">Browse Menu</motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => {
              const status = computeStatus(order)
              const meta = STATUS_META[status]
              const isActive = status !== 'delivered'
              const isDelivered = status === 'delivered'
              const hasReview = reviewed[order.orderId]
              const fmt = (v) => order.currency === 'USD' ? `$${(v / 83).toFixed(2)}` : `₹${v}`

              return (
                <motion.div key={order.orderId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="glass-strong rounded-2xl p-5 border border-white/8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-black font-mono">{order.orderId}</span>
                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${isActive ? 'animate-pulse' : ''}`} />
                          {meta.label}
                        </span>
                      </div>
                      <p className="text-white/40 text-xs">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-white font-black text-lg">{fmt(order.total)}</p>
                      <p className="text-white/40 text-xs">{order.storeFlag} {order.storeName}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {order.items.slice(0, 4).map((item, j) => (
                      <span key={j} className="glass text-white/60 text-xs px-2.5 py-1 rounded-full">
                        {item.name} ×{item.qty}
                      </span>
                    ))}
                    {order.items.length > 4 && (
                      <span className="glass text-white/30 text-xs px-2.5 py-1 rounded-full">+{order.items.length - 4} more</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-white/30 text-xs mb-4">
                    <span>📍</span><span className="truncate">{order.deliveryAddress}</span>
                  </div>

                  {/* Review display */}
                  {isDelivered && hasReview && (
                    <div className="flex items-center gap-2 mb-3 glass rounded-xl px-3 py-2">
                      <span className="text-yellow-400 text-sm">{'⭐'.repeat(hasReview.rating)}</span>
                      {hasReview.comment && <span className="text-white/50 text-xs truncate">{hasReview.comment}</span>}
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap">
                    {isActive && (
                      <Link to={`/orders/${order.orderId}`} className="flex-1">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full btn-primary py-2.5 text-sm font-semibold">🗺 Track Order</motion.button>
                      </Link>
                    )}
                    {isDelivered && !hasReview && (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setReviewOrder(order)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 text-sm font-semibold hover:bg-yellow-500/25 transition-all">
                        ⭐ Rate Order
                      </motion.button>
                    )}
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => handleReorder(order)}
                      className="btn-ghost py-2.5 px-4 text-sm">
                      🔄 Reorder
                    </motion.button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {reviewOrder && (
          <ReviewModal order={reviewOrder} onClose={() => setReviewOrder(null)} onSubmit={handleReviewSubmit} />
        )}
      </AnimatePresence>
    </div>
  )
}
