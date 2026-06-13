import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { pizzas } from '../data/pizzas'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import RatingStars from '../components/RatingStars'

const SPICE_LABEL = { mild: '🟢 Mild', medium: '🟡 Medium', spicy: '🔴 Spicy', 'extra-spicy': '🔥 Extra Spicy' }

export default function PizzaDetail() {
  const { id } = useParams()
  const pizza = pizzas.find(p => p.id === parseInt(id))
  const { addItem, items } = useCart()
  const { addToast } = useToast()
  const navigate = useNavigate()
  const [imgError, setImgError] = useState(false)
  const inCart = items.some(i => i.id === pizza?.id)

  if (!pizza) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🍕</div>
        <h2 className="text-2xl font-black text-white mb-3">Pizza not found</h2>
        <Link to="/recommendations"><motion.button whileHover={{ scale: 1.05 }} className="btn-primary px-6 py-3">Browse Menu</motion.button></Link>
      </div>
    </div>
  )

  const handleAdd = () => {
    addItem(pizza)
    addToast({ title: `${pizza.name} added!`, subtitle: `₹${pizza.price} · ${pizza.calories} kcal`, type: 'cart', emoji: '🍕' })
  }

  const similar = pizzas.filter(p => p.category === pizza.category && p.id !== pizza.id).slice(0, 3)
  const savings = pizza.originalPrice - pizza.price

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-6 flex items-center gap-2 transition-colors">
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="rounded-3xl overflow-hidden aspect-square bg-[#111]">
              {!imgError ? (
                <img src={pizza.image} alt={pizza.name} onError={() => setImgError(true)}
                  className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full bg-gradient-to-br ${pizza.gradient} flex items-center justify-center`}>
                  <span className="text-9xl">🍕</span>
                </div>
              )}
            </div>
            {pizza.isVeg && (
              <span className="absolute top-4 left-4 badge bg-green-500/25 text-green-300 border border-green-500/40 backdrop-blur-sm">🟢 Vegetarian</span>
            )}
            {pizza.tags?.includes('premium') && (
              <span className="absolute top-4 right-4 badge bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 backdrop-blur-sm">⭐ Premium</span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex flex-col justify-center">
            <span className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">{pizza.category}</span>
            <h1 className="text-4xl font-black text-white mb-3">{pizza.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <RatingStars rating={pizza.rating} />
              <span className="text-white/40 text-sm">{pizza.reviews?.toLocaleString()} reviews</span>
            </div>

            <p className="text-white/60 text-base leading-relaxed mb-6">{pizza.description}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Calories', value: `${pizza.calories} kcal` },
                { label: 'Spice',    value: SPICE_LABEL[pizza.spice] || pizza.spice },
                { label: 'Crust',    value: pizza.crust?.charAt(0).toUpperCase() + pizza.crust?.slice(1) },
              ].map(s => (
                <div key={s.label} className="glass-strong rounded-xl p-3 text-center border border-white/8">
                  <p className="text-white/40 text-xs mb-1">{s.label}</p>
                  <p className="text-white text-sm font-semibold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Ingredients */}
            <div className="mb-6">
              <p className="text-white/50 text-sm mb-2">Ingredients</p>
              <div className="flex flex-wrap gap-2">
                {pizza.ingredients.map(ing => (
                  <span key={ing} className="glass px-3 py-1.5 rounded-full text-sm text-white/70 border border-white/8">{ing}</span>
                ))}
              </div>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">₹{pizza.price}</span>
                {pizza.originalPrice && <span className="text-white/30 text-lg line-through">₹{pizza.originalPrice}</span>}
              </div>
              {savings > 0 && <span className="bg-green-500/20 text-green-400 text-sm font-bold px-3 py-1 rounded-full border border-green-500/30">Save ₹{savings}</span>}
            </div>

            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd}
              className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${inCart ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-primary'}`}>
              {inCart ? '✓ In Cart — Add Again' : `Add to Cart · ₹${pizza.price}`}
            </motion.button>
          </motion.div>
        </div>

        {/* Similar pizzas */}
        {similar.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-white mb-6">More {pizza.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {similar.map(p => (
                <Link key={p.id} to={`/pizza/${p.id}`}>
                  <motion.div whileHover={{ y: -4 }} className="glass-strong rounded-2xl overflow-hidden border border-white/8 cursor-pointer">
                    <div className="h-36 bg-[#111]">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.style.display='none' }} />
                    </div>
                    <div className="p-3">
                      <p className="text-white font-bold text-sm">{p.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[#FF6B00] font-black">₹{p.price}</span>
                        <span className="text-white/40 text-xs">{p.rating}★</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
