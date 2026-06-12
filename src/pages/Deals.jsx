import { motion } from 'framer-motion'
import { deals, combos } from '../data/deals'
import DealCard from '../components/DealCard'
import { useCart } from '../context/CartContext'
import { pizzas } from '../data/pizzas'

export default function Deals() {
  const { addItem } = useCart()

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-14">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-[#FF6B00] mb-4">
            🔥 Limited time offers — updated daily
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Today's Best Deals</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Stack discounts, grab combos, and save big on every order. Tap a code to copy it.
          </p>
        </motion.div>

        {/* Hot deal banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative glass-strong rounded-3xl p-8 mb-10 overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B00]/10 via-transparent to-[#FF6B00]/10 pointer-events-none" />
          <div className="relative z-10">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl md:text-3xl font-black mb-2">Flash Sale — Up to 45% Off</h2>
            <p className="text-white/50 mb-5">Apply code at checkout. Valid on orders above ₹499.</p>
            <div className="inline-flex items-center gap-3 glass px-6 py-3 rounded-2xl">
              <span className="text-[#FF6B00] font-mono font-black text-xl tracking-widest">PIZZORA10</span>
              <span className="text-white/40 text-sm">· Use at checkout</span>
            </div>
          </div>
        </motion.div>

        {/* Deals grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
            🏷️ Active Coupons
            <span className="badge bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 text-xs">{deals.length} live</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {deals.map((deal, i) => <DealCard key={deal.id} deal={deal} index={i} />)}
          </div>
        </div>

        {/* Combos */}
        <div className="mb-12">
          <h2 className="text-2xl font-black mb-6">🍕 Combo Meals</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {combos.map((combo, i) => (
              <motion.div
                key={combo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="card p-5"
              >
                <div className="text-4xl mb-3">{combo.emoji}</div>
                <h3 className="text-white font-bold text-lg mb-2">{combo.name}</h3>
                <ul className="space-y-1 mb-4">
                  {combo.items.map(item => (
                    <li key={item} className="text-white/50 text-sm flex items-center gap-2">
                      <span className="text-[#FF6B00] text-xs">✓</span> {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xl font-black text-white">₹{combo.price}</span>
                    <span className="text-white/40 text-sm line-through ml-2">₹{combo.originalPrice}</span>
                  </div>
                  <span className="text-green-400 text-sm font-semibold">
                    Save ₹{combo.originalPrice - combo.price}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => addItem({ ...pizzas[i], price: combo.price, name: combo.name })}
                  className="w-full btn-primary py-2.5 text-sm"
                >
                  Add Combo to Cart
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Savings calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-8"
        >
          <h2 className="text-2xl font-black mb-2">💡 How to Save More</h2>
          <p className="text-white/40 mb-6 text-sm">Stack these strategies for maximum savings on every order.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { emoji: '🎯', title: 'Use Quiz', desc: 'Take the pizza quiz to discover personalized deals and recommendations.' },
              { emoji: '🕐', title: 'Order at Lunch', desc: 'Lunch hours (12–3PM) have exclusive flash deals not available at dinner.' },
              { emoji: '👥', title: 'Group Orders', desc: 'Use Group Voting + Party Pack for the best per-pizza price when ordering together.' },
            ].map((tip, i) => (
              <motion.div key={i} whileHover={{ y: -2 }} className="glass rounded-2xl p-4 text-center">
                <div className="text-3xl mb-2">{tip.emoji}</div>
                <div className="text-white font-semibold mb-1">{tip.title}</div>
                <div className="text-white/40 text-sm">{tip.desc}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
