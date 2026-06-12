import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const STATUS_META = {
  confirmed:        { label: 'Confirmed',       color: 'text-blue-400',   bg: 'bg-blue-500/15',   dot: 'bg-blue-400',   icon: '✓' },
  preparing:        { label: 'Preparing',        color: 'text-yellow-400', bg: 'bg-yellow-500/15', dot: 'bg-yellow-400', icon: '🍕' },
  out_for_delivery: { label: 'Out for Delivery', color: 'text-[#FF6B00]',  bg: 'bg-[#FF6B00]/15',  dot: 'bg-[#FF6B00]',  icon: '🛵' },
  delivered:        { label: 'Delivered',        color: 'text-green-400',  bg: 'bg-green-500/15',  dot: 'bg-green-400',  icon: '✓' },
}

function computeStatus(order) {
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000 // minutes
  const est = order.estimatedDelivery || 28
  if (elapsed < 3)        return 'confirmed'
  if (elapsed < est * 0.35) return 'preparing'
  if (elapsed < est)      return 'out_for_delivery'
  return 'delivered'
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Orders() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pizzora-orders') || '[]')
      setOrders(saved)
    } catch { setOrders([]) }
  }, [])

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

                  {/* Items preview */}
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

                  {/* Actions */}
                  <div className="flex gap-2">
                    {isActive && (
                      <Link to={`/orders/${order.orderId}`} className="flex-1">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full btn-primary py-2.5 text-sm font-semibold">
                          🗺 Track Order
                        </motion.button>
                      </Link>
                    )}
                    {!isActive && (
                      <Link to={`/orders/${order.orderId}`} className="flex-1">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="w-full btn-ghost py-2.5 text-sm">
                          View Details
                        </motion.button>
                      </Link>
                    )}
                    <Link to="/recommendations">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        className="btn-ghost py-2.5 px-4 text-sm">
                        Reorder
                      </motion.button>
                    </Link>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
