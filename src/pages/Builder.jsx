import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

const options = {
  base: [
    { id: 'thin', label: 'Thin Crust', emoji: '🪨', price: 0, cal: 0 },
    { id: 'thick', label: 'Thick Crust', emoji: '🍞', price: 30, cal: 80 },
    { id: 'stuffed', label: 'Stuffed Crust', emoji: '🧀', price: 60, cal: 140 },
  ],
  sauce: [
    { id: 'classic', label: 'Classic Tomato', emoji: '🍅', price: 0, cal: 20 },
    { id: 'spicy', label: 'Spicy Arrabbiata', emoji: '🌶️', price: 20, cal: 25 },
    { id: 'garlic', label: 'Garlic Cream', emoji: '🧄', price: 30, cal: 60 },
    { id: 'bbq', label: 'Smoky BBQ', emoji: '🍖', price: 25, cal: 45 },
  ],
  cheese: [
    { id: 'mozzarella', label: 'Mozzarella', emoji: '🧀', price: 0, cal: 80 },
    { id: 'cheddar', label: 'Cheddar', emoji: '🟡', price: 20, cal: 90 },
    { id: 'extra', label: 'Extra Cheese', emoji: '🫧', price: 40, cal: 120 },
    { id: 'four', label: 'Four Cheese', emoji: '✨', price: 60, cal: 160 },
  ],
  toppings: [
    { id: 'pepperoni', label: 'Pepperoni', emoji: '🍖', price: 50, cal: 60 },
    { id: 'chicken', label: 'Chicken', emoji: '🍗', price: 60, cal: 80 },
    { id: 'paneer', label: 'Paneer', emoji: '🧀', price: 50, cal: 70 },
    { id: 'mushroom', label: 'Mushrooms', emoji: '🍄', price: 30, cal: 15 },
    { id: 'jalapeno', label: 'Jalapeños', emoji: '🌶️', price: 20, cal: 10 },
    { id: 'olives', label: 'Olives', emoji: '🫒', price: 25, cal: 20 },
    { id: 'onion', label: 'Onions', emoji: '🧅', price: 15, cal: 10 },
    { id: 'corn', label: 'Sweet Corn', emoji: '🌽', price: 20, cal: 25 },
  ],
}

const BASE_PRICE = 299
const BASE_CAL = 600

function PizzaSVG({ build }) {
  const toppingPositions = [
    [50, 38], [30, 52], [70, 52], [50, 66], [24, 36],
    [76, 36], [34, 70], [66, 70],
  ]
  const sauceColors = { classic: '#e85d04', spicy: '#dc2626', garlic: '#fef3c7', bbq: '#7c2d12' }
  const cheeseOpacity = { mozzarella: 0.55, cheddar: 0.7, extra: 0.8, four: 0.9 }
  const activeTop = build.toppings || []

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
      <circle cx="50" cy="50" r="46"
        fill={build.base === 'stuffed' ? '#d97706' : build.base === 'thick' ? '#b45309' : '#92400e'}
        stroke="#78350f" strokeWidth="0.5" />
      {build.base === 'stuffed' && (
        <circle cx="50" cy="50" r="46" fill="none" stroke="#fbbf24" strokeWidth="3.5" opacity="0.5" strokeDasharray="6 3" />
      )}
      <circle cx="50" cy="50" r="38" fill={sauceColors[build.sauce] || '#e85d04'} opacity="0.92" />
      {build.cheese && (
        <circle cx="50" cy="50" r="36"
          fill={build.cheese === 'cheddar' ? '#fbbf24' : '#fef9e7'}
          opacity={cheeseOpacity[build.cheese] || 0.55} />
      )}
      {activeTop.slice(0, 8).map((t, i) => {
        const [x, y] = toppingPositions[i] || [50, 50]
        const opt = options.toppings.find(o => o.id === t)
        return (
          <text key={t} x={x} y={y} fontSize="9" textAnchor="middle" dominantBaseline="middle">
            {opt?.emoji || '●'}
          </text>
        )
      })}
      <ellipse cx="36" cy="33" rx="7" ry="4.5" fill="white" opacity="0.07" transform="rotate(-20 36 33)" />
    </svg>
  )
}

const steps = ['base', 'sauce', 'cheese', 'toppings']
const stepLabels = { base: 'Crust', sauce: 'Sauce', cheese: 'Cheese', toppings: 'Toppings' }
const stepEmojis = { base: '🥖', sauce: '🍅', cheese: '🧀', toppings: '✨' }

export default function Builder() {
  const [build, setBuild] = useState({ base: 'thin', sauce: 'classic', cheese: 'mozzarella', toppings: [] })
  const [activeStep, setActiveStep] = useState('base')
  const { addItem } = useCart()
  const { addToast } = useToast()

  const { totalPrice, totalCal } = useMemo(() => {
    let price = BASE_PRICE, cal = BASE_CAL
    const base = options.base.find(o => o.id === build.base)
    const sauce = options.sauce.find(o => o.id === build.sauce)
    const cheese = options.cheese.find(o => o.id === build.cheese)
    if (base) { price += base.price; cal += base.cal }
    if (sauce) { price += sauce.price; cal += sauce.cal }
    if (cheese) { price += cheese.price; cal += cheese.cal }
    build.toppings.forEach(t => {
      const top = options.toppings.find(o => o.id === t)
      if (top) { price += top.price; cal += top.cal }
    })
    return { totalPrice: price, totalCal: cal }
  }, [build])

  const toggleTopping = (id) =>
    setBuild(b => ({
      ...b,
      toppings: b.toppings.includes(id) ? b.toppings.filter(t => t !== id) : [...b.toppings, id],
    }))

  const handleAddToCart = () => {
    const selectedBase = options.base.find(o => o.id === build.base)
    addItem({
      id: `custom-${Date.now()}`,
      name: 'My Custom Pizza',
      emoji: '🍕',
      price: totalPrice,
      calories: totalCal,
      category: 'Custom',
      gradient: 'from-orange-500 to-red-600',
      ingredients: [selectedBase?.label, ...build.toppings],
      rating: 5,
    })
    addToast({ title: 'Custom pizza added!', subtitle: `₹${totalPrice} · ${totalCal} kcal`, type: 'cart', emoji: '🍕' })
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">Customize</p>
          <h1 className="text-4xl md:text-5xl font-black mb-2">Build Your Pizza</h1>
          <p className="text-white/40">Craft your dream pizza — layer by layer.</p>
        </motion.div>

        {/* Mobile: pizza preview at top */}
        <div className="lg:hidden flex justify-center mb-6">
          <div className="relative w-44 h-44">
            <motion.div animate={{ rotate: [0, 1, -1, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              <PizzaSVG build={build} />
            </motion.div>
            <div className="absolute inset-0 bg-[#FF6B00]/10 rounded-full blur-3xl -z-10 scale-75" />
          </div>
        </div>

        {/* Mobile price strip */}
        <div className="lg:hidden flex items-center justify-between glass rounded-2xl px-5 py-3 mb-6">
          <div>
            <motion.span key={totalPrice} initial={{ scale: 1.2, color: '#FF6B00' }} animate={{ scale: 1, color: '#ffffff' }} className="text-2xl font-black text-white">
              ₹{totalPrice}
            </motion.span>
            <span className="text-white/40 text-sm ml-2">{totalCal} kcal</span>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleAddToCart} className="btn-primary py-2 px-5 text-sm">
            🛒 Add to Cart
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Options column */}
          <div className="lg:col-span-1 space-y-4">
            {/* Step tabs */}
            <div className="grid grid-cols-4 gap-2">
              {steps.map(step => (
                <button
                  key={step}
                  onClick={() => setActiveStep(step)}
                  className={`py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-1 ${
                    activeStep === step ? 'bg-[#FF6B00] text-white' : 'glass text-white/50 hover:text-white'
                  }`}
                >
                  <span>{stepEmojis[step]}</span>
                  <span>{stepLabels[step]}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-strong rounded-2xl p-4 space-y-2"
              >
                <h3 className="text-white font-bold mb-3 text-sm uppercase tracking-widest">
                  {activeStep === 'toppings' ? 'Choose Toppings' : `Choose ${stepLabels[activeStep]}`}
                </h3>

                {activeStep !== 'toppings' && options[activeStep].map(opt => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setBuild(b => ({ ...b, [activeStep]: opt.id }))}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      build[activeStep] === opt.id
                        ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                        : 'border-white/8 hover:border-white/20 bg-white/3'
                    }`}
                  >
                    <span className="text-xl">{opt.emoji}</span>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">{opt.label}</div>
                      <div className="text-xs text-white/40">{opt.cal > 0 ? `+${opt.cal} kcal` : 'Base'}{opt.price > 0 ? ` · +₹${opt.price}` : ''}</div>
                    </div>
                    {build[activeStep] === opt.id && <span className="text-[#FF6B00]">✓</span>}
                  </motion.button>
                ))}

                {activeStep === 'toppings' && (
                  <div className="grid grid-cols-2 gap-2">
                    {options.toppings.map(opt => {
                      const sel = build.toppings.includes(opt.id)
                      return (
                        <motion.button
                          key={opt.id}
                          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          onClick={() => toggleTopping(opt.id)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border transition-all ${
                            sel ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-white/8 hover:border-white/20 bg-white/3'
                          }`}
                        >
                          <span>{opt.emoji}</span>
                          <div className="flex-1 text-left">
                            <div className="text-xs font-medium text-white">{opt.label}</div>
                            <div className="text-xs text-white/30">+₹{opt.price}</div>
                          </div>
                          {sel && <span className="text-[#FF6B00] text-xs">✓</span>}
                        </motion.button>
                      )
                    })}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Center: Desktop pizza preview */}
          <div className="hidden lg:flex lg:col-span-1 flex-col items-center">
            <div className="relative w-64 h-64 mx-auto mb-4">
              <motion.div animate={{ rotate: [0, 1, -1, 0] }} transition={{ duration: 4, repeat: Infinity }}>
                <PizzaSVG build={build} />
              </motion.div>
              <div className="absolute inset-0 bg-[#FF6B00]/10 rounded-full blur-3xl -z-10 scale-75" />
            </div>

            <h3 className="text-white font-bold text-lg mb-1">My Custom Pizza</h3>
            <p className="text-white/40 text-sm text-center mb-4 max-w-xs">
              {options.base.find(o => o.id === build.base)?.label} ·{' '}
              {options.sauce.find(o => o.id === build.sauce)?.label} ·{' '}
              {options.cheese.find(o => o.id === build.cheese)?.label}
              {build.toppings.length > 0 && ` · ${build.toppings.length} toppings`}
            </p>

            <div className="flex flex-wrap gap-1.5 justify-center max-w-xs">
              {[
                options.base.find(o => o.id === build.base),
                options.sauce.find(o => o.id === build.sauce),
                options.cheese.find(o => o.id === build.cheese),
                ...build.toppings.map(t => options.toppings.find(o => o.id === t)),
              ].filter(Boolean).map(opt => (
                <span key={opt.id} className="text-xs bg-white/8 text-white/60 px-2.5 py-1 rounded-full">
                  {opt.emoji} {opt.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Summary (desktop only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="glass-strong rounded-2xl p-5 sticky top-24">
              <h3 className="text-white font-bold text-lg mb-4">Order Summary</h3>
              <div className="space-y-3 mb-5 text-sm">
                {[['Base', options.base.find(o => o.id === build.base)],
                  ['Sauce', options.sauce.find(o => o.id === build.sauce)],
                  ['Cheese', options.cheese.find(o => o.id === build.cheese)]
                ].map(([label, opt]) => opt && (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-white/50">{label}</span>
                    <span className="text-white font-medium">{opt.emoji} {opt.label}</span>
                  </div>
                ))}
                {build.toppings.length > 0 && (
                  <div className="flex items-start justify-between">
                    <span className="text-white/50">Toppings</span>
                    <div className="text-right space-y-0.5">
                      {build.toppings.map(t => {
                        const opt = options.toppings.find(o => o.id === t)
                        return <div key={t} className="text-white text-xs">{opt?.emoji} {opt?.label}</div>
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-white/8 pt-4 mb-5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Calories</span>
                  <span className="text-white font-semibold">{totalCal} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50">Total</span>
                  <motion.span key={totalPrice} initial={{ scale: 1.2, color: '#FF6B00' }} animate={{ scale: 1, color: '#ffffff' }} className="text-xl font-black">
                    ₹{totalPrice}
                  </motion.span>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={handleAddToCart}
                className="w-full btn-primary py-4 font-bold text-base"
              >
                🛒 Add to Cart
              </motion.button>
              <p className="text-white/25 text-xs text-center mt-3">Estimated delivery: 25–35 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
