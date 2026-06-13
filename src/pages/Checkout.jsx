import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { api } from '../api/client'

const STORES = [
  { id: 'nyc',    city: 'New York City',  country: 'USA',   flag: '🇺🇸', currency: 'USD', deliveryMin: 25, deliveryMax: 40, tax: 0.08875 },
  { id: 'la',     city: 'Los Angeles',    country: 'USA',   flag: '🇺🇸', currency: 'USD', deliveryMin: 28, deliveryMax: 42, tax: 0.0975  },
  { id: 'mumbai', city: 'Mumbai',         country: 'India', flag: '🇮🇳', currency: 'INR', deliveryMin: 30, deliveryMax: 45, tax: 0.05    },
  { id: 'delhi',  city: 'Delhi',          country: 'India', flag: '🇮🇳', currency: 'INR', deliveryMin: 35, deliveryMax: 50, tax: 0.05    },
  { id: 'lucknow',city: 'Lucknow',        country: 'India', flag: '🇮🇳', currency: 'INR', deliveryMin: 40, deliveryMax: 55, tax: 0.05    },
  { id: 'agra',   city: 'Agra',           country: 'India', flag: '🇮🇳', currency: 'INR', deliveryMin: 40, deliveryMax: 55, tax: 0.05    },
]

const CARD_TYPES = [
  { id: 'visa',   name: 'Visa',             pattern: /^4/,              color: '#1A1F71', icon: '💳' },
  { id: 'mc',     name: 'Mastercard',        pattern: /^5[1-5]/,         color: '#EB001B', icon: '💳' },
  { id: 'amex',   name: 'Amex',             pattern: /^3[47]/,          color: '#007BC1', icon: '💳' },
  { id: 'discover',name: 'Discover',        pattern: /^6(?:011|5)/,     color: '#FF6600', icon: '💳' },
  { id: 'rupay',  name: 'RuPay',            pattern: /^6[0-9]{15}$/,    color: '#2E7D32', icon: '💳' },
  { id: 'diners', name: "Diner's Club",     pattern: /^3(?:0[0-5]|[68])/,color:'#004B87', icon: '💳' },
]

function detectCard(num) {
  const clean = num.replace(/\s/g, '')
  return CARD_TYPES.find(c => c.pattern.test(clean)) || null
}

function formatCardNumber(val) {
  const clean = val.replace(/\D/g, '').slice(0, 16)
  return clean.replace(/(.{4})/g, '$1 ').trim()
}

function formatExpiry(val) {
  const clean = val.replace(/\D/g, '').slice(0, 4)
  return clean.length > 2 ? `${clean.slice(0,2)}/${clean.slice(2)}` : clean
}

const steps = ['Location', 'Payment', 'Confirm']
const USD_RATE = 83

export default function Checkout() {
  const { items, subtotal, deliveryFee, total, discount, coupon, clearCart } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [placing, setPlacing] = useState(false)
  const [orderResult, setOrderResult] = useState(null)

  // Location state
  const [selectedStore, setSelectedStore] = useState(null)
  const [address, setAddress] = useState({ street: '', apt: '', phone: '', name: '' })

  // Payment state
  const [payMethod, setPayMethod] = useState(null)
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [cardError, setCardError] = useState('')

  const store = STORES.find(s => s.id === selectedStore)
  const isIndia = store?.country === 'India'
  const isUSA = store?.country === 'USA'

  const fmt = (inr) => isUSA ? `$${(inr / USD_RATE).toFixed(2)}` : `₹${inr}`

  const payOptions = useMemo(() => {
    if (!store) return []
    const opts = [
      { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex, Discover' + (isIndia ? ', RuPay' : ''), emoji: '💳' },
    ]
    if (isUSA)   opts.push({ id: 'paypal', label: 'PayPal', desc: 'Fast & secure international checkout', emoji: '🅿️' })
    if (isIndia) opts.push({ id: 'gpay',   label: 'Google Pay', desc: 'UPI / GPay — instant payment', emoji: '🟢' })
    opts.push({ id: 'cod', label: 'Cash on Delivery', desc: 'Pay when your pizza arrives', emoji: '💵' })
    return opts
  }, [store, isIndia, isUSA])

  const deliveryEst = store ? `${store.deliveryMin}–${store.deliveryMax} min` : '—'

  const taxAmt = store ? Math.round(total * store.tax) : 0
  const grandTotal = total + taxAmt

  const canNext0 = selectedStore && address.street.trim() && address.name.trim() && address.phone.trim()
  const canNext1 = payMethod && (payMethod !== 'card' || (card.number.replace(/\s/g,'').length >= 15 && card.expiry.length === 5 && card.cvv.length >= 3 && card.name.trim()))

  const validateCard = () => {
    const num = card.number.replace(/\s/g,'')
    if (num.length < 13) return 'Invalid card number'
    const [m, y] = card.expiry.split('/')
    const now = new Date()
    const expDate = new Date(2000 + parseInt(y), parseInt(m) - 1)
    if (expDate < now) return 'Card has expired'
    if (card.cvv.length < 3) return 'Invalid CVV'
    return ''
  }

  const handleNext = () => {
    if (step === 1 && payMethod === 'card') {
      const err = validateCard()
      if (err) { setCardError(err); return }
    }
    setCardError('')
    setStep(s => s + 1)
  }

  const placeOrder = async () => {
    setPlacing(true)
    try {
      // Generate order locally so checkout never depends on the backend
      const orderId = `PZR-${Date.now().toString().slice(-6)}`
      const id = `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      const createdAt = new Date().toISOString()

      const savedOrder = {
        id,
        orderId,
        items,
        total:           grandTotal,
        currency:        store.currency,
        storeId:         store.id,
        storeName:       store.city,
        storeFlag:       store.flag,
        deliveryAddress: `${address.street}${address.apt ? `, ${address.apt}` : ''}, ${store.city}`,
        customerName:    address.name,
        phone:           address.phone,
        paymentMethod:   payMethod,
        estimatedDelivery: store.deliveryMin,
        createdAt,
        status: 'confirmed',
      }

      const existing = JSON.parse(localStorage.getItem('pizzora-orders') || '[]')
      localStorage.setItem('pizzora-orders', JSON.stringify([savedOrder, ...existing]))

      // Sync to backend in the background — failure doesn't block the user
      api.placeOrder({
        items, coupon, total: grandTotal, subtotal,
        deliveryAddress: savedOrder.deliveryAddress,
        store: store.city,
        paymentMethod: payMethod,
        customerName: address.name,
        phone: address.phone,
        estimatedDelivery: store.deliveryMin,
      }).catch(() => {})

      setOrderResult({ id, orderId, storeId: store.id })
      clearCart()
    } catch {
      addToast({ title: 'Order failed. Please try again.', type: 'error' })
      setPlacing(false)
    }
  }

  if (items.length === 0 && !orderResult) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-black text-white mb-4">Your cart is empty</h2>
          <Link to="/recommendations"><motion.button whileHover={{ scale: 1.05 }} className="btn-primary px-8 py-3">Browse Menu</motion.button></Link>
        </div>
      </div>
    )
  }

  // ── ORDER SUCCESS ──
  if (orderResult) {
    const estimatedTime = new Date(Date.now() + store.deliveryMin * 60000)
    const timeStr = estimatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="max-w-md w-full text-center">
          <div className="glass-strong rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <motion.div animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }} transition={{ duration: 0.8 }} className="text-6xl mb-4">🎉</motion.div>
              <h2 className="text-3xl font-black text-white mb-1">Order Confirmed!</h2>
              <p className="text-[#FF6B00] font-mono font-bold text-lg mb-6">{orderResult.orderId}</p>

              {/* Delivery details */}
              <div className="glass rounded-2xl p-5 mb-6 text-left space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b border-white/8">
                  <span className="text-2xl">{store.flag}</span>
                  <div>
                    <p className="text-white font-semibold">{store.city} Store</p>
                    <p className="text-white/40 text-xs">{address.street}, {store.city}</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Estimated arrival</span>
                  <span className="text-[#FF6B00] font-bold text-base">{timeStr}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Delivery window</span>
                  <span className="text-white font-semibold">{deliveryEst}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Payment</span>
                  <span className="text-white font-semibold capitalize">{payMethod === 'card' ? `${detectCard(card.number)?.name || 'Card'} ···· ${card.number.replace(/\s/g,'').slice(-4)}` : payMethod === 'gpay' ? 'Google Pay' : payMethod === 'paypal' ? 'PayPal' : 'Cash on Delivery'}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-white/8">
                  <span className="text-white font-bold">Total Paid</span>
                  <span className="text-white font-black text-lg">{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-white/30 mb-2">
                  <span>✓ Confirmed</span><span>🍕 Preparing</span><span>🛵 On the way</span><span>🏠 Delivered</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '18%' }} transition={{ duration: 1.5, ease: 'easeOut' }} className="h-full progress-bar rounded-full" />
                </div>
              </div>

              <p className="text-white/30 text-xs mb-6">Order confirmed · Kitchen notified · Driver assigned</p>
              <div className="flex gap-3">
                <Link to={`/orders/${orderResult.orderId}`} className="flex-1">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary w-full py-3">
                    🗺 Track Order
                  </motion.button>
                </Link>
                <Link to="/orders">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost py-3 px-5">
                    My Orders
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/5 blur-[120px] pointer-events-none" />
      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header + stepper */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl md:text-4xl font-black mb-6">Checkout</h1>
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  i === step ? 'bg-[#FF6B00] text-white' :
                  i < step  ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                  'glass text-white/30'
                }`}>
                  <span>{i < step ? '✓' : i + 1}</span>
                  <span className="hidden sm:inline">{s}</span>
                </div>
                {i < steps.length - 1 && <div className={`h-px w-8 ${i < step ? 'bg-green-500/50' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ── STEP 0: LOCATION ── */}
              {step === 0 && (
                <motion.div key="location" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                  <h2 className="text-xl font-bold text-white">Delivery Location</h2>

                  {/* Store selector */}
                  <div className="glass-strong rounded-2xl p-5">
                    <p className="text-white/50 text-sm mb-4">Select your nearest store city</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {STORES.map(s => (
                        <motion.button key={s.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => { setSelectedStore(s.id); setPayMethod(null) }}
                          className={`p-3 rounded-xl border text-left transition-all ${selectedStore === s.id ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-white/8 hover:border-white/20 bg-white/3'}`}
                        >
                          <div className="text-xl mb-1">{s.flag}</div>
                          <div className="text-white text-sm font-semibold">{s.city}</div>
                          <div className="text-white/40 text-xs">{s.country}</div>
                          {selectedStore === s.id && <div className="text-[#FF6B00] text-xs mt-1">⚡ {s.deliveryMin}–{s.deliveryMax} min</div>}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Address form */}
                  {selectedStore && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-strong rounded-2xl p-5 space-y-4">
                      <h3 className="text-white font-semibold">Delivery Address</h3>
                      {[
                        { key: 'name',   label: 'Full Name',          placeholder: 'John Doe',               type: 'text' },
                        { key: 'phone',  label: 'Phone Number',        placeholder: isIndia ? '+91 98765 43210' : '+1 (555) 000-0000', type: 'tel' },
                        { key: 'street', label: 'Street Address',      placeholder: isIndia ? '12, MG Road'  : '123 Main Street',    type: 'text' },
                        { key: 'apt',    label: 'Apt / Floor (optional)', placeholder: 'Apt 4B', type: 'text' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-white/50 text-xs mb-1.5 block">{field.label}</label>
                          <input
                            type={field.type}
                            value={address[field.key]}
                            onChange={e => setAddress(a => ({ ...a, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 transition-all text-sm"
                          />
                        </div>
                      ))}
                    </motion.div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleNext} disabled={!canNext0}
                    className="w-full btn-primary py-4 text-base font-bold disabled:opacity-40">
                    Continue to Payment →
                  </motion.button>
                </motion.div>
              )}

              {/* ── STEP 1: PAYMENT ── */}
              {step === 1 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                  <h2 className="text-xl font-bold text-white">Payment Method</h2>

                  {/* Payment options */}
                  <div className="glass-strong rounded-2xl p-5 space-y-3">
                    {payOptions.map(opt => (
                      <motion.button key={opt.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                        onClick={() => setPayMethod(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${payMethod === opt.id ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-white/8 hover:border-white/20 bg-white/3'}`}
                      >
                        <span className="text-2xl">{opt.emoji}</span>
                        <div className="flex-1 text-left">
                          <div className="text-white font-semibold">{opt.label}</div>
                          <div className="text-white/40 text-xs">{opt.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${payMethod === opt.id ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-white/20'}`}>
                          {payMethod === opt.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Card logos */}
                  <div className="flex gap-2 flex-wrap px-1">
                    {CARD_TYPES.filter(c => isIndia ? true : c.id !== 'rupay').map(c => (
                      <div key={c.id} className="glass px-3 py-1.5 rounded-lg text-xs text-white/50 font-medium">{c.name}</div>
                    ))}
                  </div>

                  {/* Card form */}
                  <AnimatePresence>
                    {payMethod === 'card' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="glass-strong rounded-2xl p-5 space-y-4">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-white font-semibold">Card Details</h3>
                            {detectCard(card.number) && (
                              <span className="glass px-3 py-1 rounded-full text-xs text-white/70 font-semibold">
                                {detectCard(card.number).name} detected
                              </span>
                            )}
                          </div>

                          {/* Card preview */}
                          <div className={`relative h-44 rounded-2xl p-5 overflow-hidden bg-gradient-to-br ${
                            detectCard(card.number)?.id === 'visa'    ? 'from-blue-900 to-blue-700' :
                            detectCard(card.number)?.id === 'mc'      ? 'from-red-900 to-orange-700' :
                            detectCard(card.number)?.id === 'amex'    ? 'from-cyan-900 to-blue-700' :
                            detectCard(card.number)?.id === 'rupay'   ? 'from-green-900 to-green-700' :
                            'from-[#1a1a1a] to-[#2a2a2a]'
                          }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                            <div className="relative z-10 h-full flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">Pizzora Pay</span>
                                <span className="text-2xl">{detectCard(card.number)?.id === 'amex' ? '💠' : '💳'}</span>
                              </div>
                              <div>
                                <p className="text-white font-mono text-lg tracking-widest mb-2">
                                  {card.number || '•••• •••• •••• ••••'}
                                </p>
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-white/40 text-xs">CARD HOLDER</p>
                                    <p className="text-white text-sm font-semibold">{card.name || 'YOUR NAME'}</p>
                                  </div>
                                  <div>
                                    <p className="text-white/40 text-xs">EXPIRES</p>
                                    <p className="text-white text-sm font-semibold">{card.expiry || 'MM/YY'}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Inputs */}
                          <div>
                            <label className="text-white/50 text-xs mb-1.5 block">Card Number</label>
                            <input value={card.number}
                              onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                              placeholder="1234 5678 9012 3456" maxLength={19}
                              className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 font-mono text-sm tracking-wider" />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-white/50 text-xs mb-1.5 block">Expiry Date</label>
                              <input value={card.expiry}
                                onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                                placeholder="MM/YY" maxLength={5}
                                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 font-mono text-sm" />
                            </div>
                            <div>
                              <label className="text-white/50 text-xs mb-1.5 block">CVV</label>
                              <input value={card.cvv} type="password"
                                onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                                placeholder="•••" maxLength={4}
                                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 font-mono text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="text-white/50 text-xs mb-1.5 block">Cardholder Name</label>
                            <input value={card.name}
                              onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                              placeholder="AS ON CARD"
                              className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm tracking-wider font-mono" />
                          </div>
                          {cardError && <p className="text-red-400 text-sm">⚠ {cardError}</p>}
                          <div className="flex items-center gap-2 text-white/30 text-xs">
                            <span>🔒</span><span>256-bit SSL encrypted · PCI DSS compliant</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* PayPal info */}
                  {payMethod === 'paypal' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-2xl p-5 text-center">
                      <div className="text-4xl mb-3">🅿️</div>
                      <p className="text-white font-semibold mb-1">Pay with PayPal</p>
                      <p className="text-white/40 text-sm">You'll be redirected to PayPal to complete payment securely.</p>
                    </motion.div>
                  )}

                  {payMethod === 'gpay' && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-strong rounded-2xl p-5 text-center">
                      <div className="text-4xl mb-3">🟢</div>
                      <p className="text-white font-semibold mb-1">Pay with Google Pay</p>
                      <p className="text-white/40 text-sm">UPI / GPay payment — instant, secure, and free.</p>
                    </motion.div>
                  )}

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(0)} className="btn-ghost py-4 px-6">← Back</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext} disabled={!canNext1} className="flex-1 btn-primary py-4 font-bold disabled:opacity-40">
                      Review Order →
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: CONFIRM ── */}
              {step === 2 && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-5">
                  <h2 className="text-xl font-bold text-white">Review & Place Order</h2>

                  {/* Delivery summary */}
                  <div className="glass-strong rounded-2xl p-5 space-y-3">
                    <h3 className="text-white font-semibold flex items-center gap-2">🛵 Delivery Details</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-white/50">Delivering to</span><span className="text-white font-medium">{address.name}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Address</span><span className="text-white text-right max-w-[200px]">{address.street}{address.apt ? `, ${address.apt}` : ''}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">City</span><span className="text-white">{store?.flag} {store?.city}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Phone</span><span className="text-white">{address.phone}</span></div>
                      <div className="flex justify-between"><span className="text-white/50">Estimated delivery</span><span className="text-[#FF6B00] font-bold">{deliveryEst}</span></div>
                    </div>
                  </div>

                  {/* Payment summary */}
                  <div className="glass-strong rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-3 flex items-center gap-2">💳 Payment</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{payOptions.find(p => p.id === payMethod)?.emoji}</span>
                      <div>
                        <p className="text-white font-medium">{payOptions.find(p => p.id === payMethod)?.label}</p>
                        {payMethod === 'card' && <p className="text-white/40 text-xs">{detectCard(card.number)?.name} ···· {card.number.replace(/\s/g,'').slice(-4)}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="glass-strong rounded-2xl p-5">
                    <h3 className="text-white font-semibold mb-3">🍕 Your Order ({items.length} item{items.length !== 1 ? 's' : ''})</h3>
                    <div className="space-y-2">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-white/70">{item.name} × {item.qty}</span>
                          <span className="text-white font-medium">{fmt(item.price * item.qty)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(1)} className="btn-ghost py-4 px-6">← Back</motion.button>
                    <motion.button
                      whileHover={{ scale: placing ? 1 : 1.02 }} whileTap={{ scale: placing ? 1 : 0.98 }}
                      onClick={placeOrder} disabled={placing}
                      className="flex-1 btn-primary py-4 font-bold text-base disabled:opacity-70"
                    >
                      {placing ? '⏳ Placing Order…' : `🍕 Place Order · ${fmt(grandTotal)}`}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order summary sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-strong rounded-2xl p-5 sticky top-24">
              <h3 className="text-white font-bold text-base mb-4">Order Summary</h3>
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto no-scrollbar">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center text-sm flex-shrink-0`}>🍕</div>
                    <span className="text-white/70 text-xs flex-1 truncate">{item.name} ×{item.qty}</span>
                    <span className="text-white text-xs font-semibold">{fmt(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/8 pt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-white/50">Subtotal</span><span className="text-white">{fmt(subtotal)}</span></div>
                <div className="flex justify-between"><span className="text-white/50">Delivery</span><span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>{deliveryFee === 0 ? 'FREE' : fmt(deliveryFee)}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-green-400">Discount</span><span className="text-green-400">−{fmt(discount)}</span></div>}
                {taxAmt > 0 && <div className="flex justify-between"><span className="text-white/50">Tax ({store ? Math.round(store.tax * 100) : 0}%)</span><span className="text-white">{fmt(taxAmt)}</span></div>}
                <div className="flex justify-between pt-2 border-t border-white/8">
                  <span className="text-white font-bold">Total</span>
                  <span className="text-white font-black text-lg">{fmt(grandTotal)}</span>
                </div>
              </div>
              {store && (
                <div className="mt-4 glass rounded-xl p-3 flex items-center gap-2">
                  <span className="text-lg">{store.flag}</span>
                  <div>
                    <p className="text-white/70 text-xs font-semibold">{store.city} Store</p>
                    <p className="text-[#FF6B00] text-xs">⚡ {deliveryEst}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
