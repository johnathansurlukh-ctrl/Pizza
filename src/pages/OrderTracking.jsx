import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const CITY_COORDS = {
  'New York City': [40.7128, -74.0060],
  'Los Angeles':   [34.0522, -118.2437],
  'Mumbai':        [19.0760,  72.8777],
  'Delhi':         [28.6139,  77.2090],
  'Lucknow':       [26.8467,  80.9462],
  'Agra':          [27.1767,  78.0081],
}

function deliveryOffset(orderId) {
  const h = (orderId || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return [((h % 37) - 18) * 0.003, ((h % 43) - 21) * 0.003]
}

const STAGES = [
  { key: 'confirmed',        label: 'Order Confirmed',   icon: '✓',  desc: 'Your order has been received'  },
  { key: 'preparing',        label: 'Preparing',         icon: '🍕', desc: 'Kitchen is making your pizza'  },
  { key: 'out_for_delivery', label: 'Out for Delivery',  icon: '🛵', desc: 'Driver is on the way'          },
  { key: 'delivered',        label: 'Delivered',         icon: '🏠', desc: 'Enjoy your pizza!'             },
]

function computeStatus(order) {
  const elapsed = (Date.now() - new Date(order.createdAt).getTime()) / 60000
  const est = order.estimatedDelivery || 28
  if (elapsed < 3)            return { status: 'confirmed',        progress: elapsed / 3,                      stageIdx: 0 }
  if (elapsed < est * 0.35)   return { status: 'preparing',        progress: (elapsed - 3) / (est * 0.35 - 3), stageIdx: 1 }
  if (elapsed < est)          return { status: 'out_for_delivery', progress: (elapsed - est*0.35) / (est*0.65), stageIdx: 2 }
  return                             { status: 'delivered',        progress: 1,                                stageIdx: 3 }
}

// ── Vanilla Leaflet map component ─────────────────────────
function TrackingMap({ storeCoords, deliveryCoords, driverCoords, isDelivered }) {
  const mapRef = useRef(null)
  const instanceRef = useRef(null)
  const driverMarkerRef = useRef(null)

  useEffect(() => {
    let map, L

    async function init() {
      // Dynamic import so the module-level crash can't kill the page
      L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      if (!mapRef.current || instanceRef.current) return

      map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false })
      instanceRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map)

      const bounds = L.latLngBounds([storeCoords, deliveryCoords])
      map.fitBounds(bounds, { padding: [60, 60] })

      // Store marker
      L.marker(storeCoords, { icon: L.divIcon({ className: '', iconSize: [36,36], iconAnchor: [18,18],
        html: '<div style="width:36px;height:36px;background:#FF6B00;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(255,107,0,.6)">🍕</div>' }) })
        .addTo(map).bindPopup(`<b>Pizzora Store</b>`)

      // Delivery marker
      L.marker(deliveryCoords, { icon: L.divIcon({ className: '', iconSize: [36,36], iconAnchor: [18,18],
        html: '<div style="width:36px;height:36px;background:#22c55e;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:18px;box-shadow:0 2px 8px rgba(34,197,94,.5)">🏠</div>' }) })
        .addTo(map).bindPopup('<b>Your delivery address</b>')

      // Route line
      L.polyline([storeCoords, deliveryCoords], {
        color: '#FF6B00', weight: 3, opacity: 0.5, dashArray: '8 6',
      }).addTo(map)

      // Driver marker
      if (!isDelivered) {
        const dm = L.marker(driverCoords, { icon: L.divIcon({ className: '', iconSize: [40,40], iconAnchor: [20,20],
          html: '<div style="width:40px;height:40px;background:#3b82f6;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;font-size:20px;box-shadow:0 2px 12px rgba(59,130,246,.7)">🛵</div>' }) })
          .addTo(map).bindPopup('<b>Your driver</b>')
        driverMarkerRef.current = dm
      }
    }

    init().catch(console.error)

    return () => {
      if (instanceRef.current) {
        instanceRef.current.remove()
        instanceRef.current = null
      }
    }
  }, [])

  // Update driver position without re-creating the map
  useEffect(() => {
    if (driverMarkerRef.current && instanceRef.current) {
      driverMarkerRef.current.setLatLng(driverCoords)
    }
  }, [driverCoords[0], driverCoords[1]])

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
}

export default function OrderTracking() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    try {
      const orders = JSON.parse(localStorage.getItem('pizzora-orders') || '[]')
      setOrder(orders.find(o => o.orderId === orderId) || null)
    } catch { setOrder(null) }
  }, [orderId])

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 15000)
    return () => clearInterval(t)
  }, [])

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-2xl font-black text-white mb-3">Order not found</h2>
          <Link to="/orders"><motion.button whileHover={{ scale: 1.05 }} className="btn-primary px-6 py-3">My Orders</motion.button></Link>
        </div>
      </div>
    )
  }

  const { status, progress, stageIdx } = computeStatus(order)
  const storeCoords    = CITY_COORDS[order.storeName] || [20, 77]
  const [dLat, dLng]   = deliveryOffset(order.orderId)
  const deliveryCoords = [storeCoords[0] + dLat, storeCoords[1] + dLng]
  const isDelivered    = status === 'delivered'
  const isDelivering   = status === 'out_for_delivery'

  const driverCoords = isDelivered ? deliveryCoords : isDelivering
    ? [storeCoords[0] + (deliveryCoords[0] - storeCoords[0]) * progress,
       storeCoords[1] + (deliveryCoords[1] - storeCoords[1]) * progress]
    : storeCoords

  const fmt = (v) => order.currency === 'USD' ? `$${(v / 83).toFixed(2)}` : `₹${v}`

  const eta = (() => {
    const rem = Math.max(0, Math.ceil((new Date(order.createdAt).getTime() + order.estimatedDelivery * 60000 - Date.now()) / 60000))
    if (isDelivered) return 'Delivered'
    return rem === 0 ? 'Arriving now' : `~${rem} min`
  })()

  return (
    <div className="min-h-screen pt-20 pb-8 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link to="/orders" className="text-white/40 hover:text-white text-sm transition-colors">← My Orders</Link>
            <h1 className="text-3xl font-black mt-1">Track Order</h1>
            <p className="text-[#FF6B00] font-mono font-bold">{order.orderId}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            isDelivered ? 'bg-green-500/20 text-green-400' : 'bg-[#FF6B00]/20 text-[#FF6B00]'}`}>
            <span className={`w-2 h-2 rounded-full ${isDelivered ? 'bg-green-400' : 'bg-[#FF6B00] animate-pulse'}`} />
            {isDelivered ? 'Delivered' : `ETA: ${eta}`}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Map */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="rounded-3xl overflow-hidden border border-white/10" style={{ height: 440 }}>
              <TrackingMap
                key={order.orderId}
                storeCoords={storeCoords}
                deliveryCoords={deliveryCoords}
                driverCoords={driverCoords}
                isDelivered={isDelivered}
              />
            </div>
            <div className="flex gap-4 mt-3 px-1 text-xs text-white/40">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#FF6B00] inline-block"/>Store</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"/>Driver</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>Your door</span>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-4">

            {/* Status timeline */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
              className="glass-strong rounded-2xl p-5 border border-white/8">
              <h3 className="text-white font-bold mb-4">Order Status</h3>
              <div className="space-y-1">
                {STAGES.map((stage, i) => {
                  const done    = i < stageIdx
                  const current = i === stageIdx
                  return (
                    <div key={stage.key} className="flex gap-3 items-start">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                          done ? 'bg-green-500 text-white' : current ? 'bg-[#FF6B00] text-white' : 'bg-white/5 text-white/20'}`}>
                          {done ? '✓' : stage.icon}
                        </div>
                        {i < STAGES.length - 1 && <div className={`w-0.5 h-6 mt-1 rounded-full ${done ? 'bg-green-500/50' : 'bg-white/8'}`} />}
                      </div>
                      <div className="pt-1">
                        <p className={`text-sm font-semibold ${current ? 'text-[#FF6B00]' : done ? 'text-green-400' : 'text-white/30'}`}>{stage.label}</p>
                        {current && <p className="text-white/40 text-xs mt-0.5">{stage.desc}</p>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Order details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="glass-strong rounded-2xl p-5 border border-white/8">
              <h3 className="text-white font-bold mb-3">Order Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Delivering to</span><span className="text-white font-medium">{order.customerName}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Store</span><span className="text-white">{order.storeFlag} {order.storeName}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Payment</span>
                  <span className="text-white capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'gpay' ? 'Google Pay' : order.paymentMethod === 'paypal' ? 'PayPal' : 'Card'}</span>
                </div>
                <div className="border-t border-white/8 pt-2 flex justify-between">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-white font-black">{fmt(order.total)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 max-h-28 overflow-y-auto no-scrollbar">
                {order.items.map((item, j) => (
                  <div key={j} className="flex justify-between text-xs">
                    <span className="text-white/50">{item.name} ×{item.qty}</span>
                    <span className="text-white/70">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <Link to="/orders">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full btn-ghost py-3 text-sm">← All Orders</motion.button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
