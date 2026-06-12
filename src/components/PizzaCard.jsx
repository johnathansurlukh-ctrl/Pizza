import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import RatingStars from './RatingStars'

export default function PizzaCard({ pizza, matchScore, showMatch = false, index = 0 }) {
  const { addItem, items } = useCart()
  const { addToast } = useToast()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  const inCart = items.some(i => i.id === pizza.id)

  const handleAdd = () => {
    addItem(pizza)
    addToast({ title: `${pizza.name} added!`, subtitle: `₹${pizza.price} · ${pizza.calories} kcal`, type: 'cart', emoji: '🍕' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="card group relative overflow-hidden"
    >
      {/* Image area */}
      <div className="relative h-48 overflow-hidden bg-[#111]">
        {/* Skeleton shimmer while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 shimmer" />
        )}

        {/* Real image */}
        {!imgError && (
          <img
            src={pizza.image}
            alt={pizza.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Fallback gradient */}
        {imgError && (
          <div className={`absolute inset-0 bg-gradient-to-br ${pizza.gradient} flex items-center justify-center`}>
            <motion.span className="text-6xl" animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }}>
              🍕
            </motion.span>
          </div>
        )}

        {/* Always-on overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
          {pizza.isVeg && <span className="badge bg-green-500/25 text-green-300 border border-green-500/40 backdrop-blur-sm text-xs">🟢 Veg</span>}
          {pizza.tags?.includes('premium') && <span className="badge bg-yellow-500/25 text-yellow-300 border border-yellow-500/40 backdrop-blur-sm text-xs">⭐ Premium</span>}
        </div>

        {showMatch && matchScore && (
          <div className="absolute top-3 right-3 glass px-2.5 py-1 rounded-full text-xs font-bold text-[#FF6B00] backdrop-blur-sm">
            {matchScore}% Match
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="text-xs text-white/80 glass px-2 py-0.5 rounded-full backdrop-blur-sm">{pizza.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-white text-base leading-tight mb-1">{pizza.name}</h3>
        <div className="flex items-center gap-2 mb-2">
          <RatingStars rating={pizza.rating} size="sm" />
          <span className="text-white/40 text-xs">({pizza.reviews?.toLocaleString()})</span>
        </div>
        <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-2">{pizza.description}</p>

        <div className="flex flex-wrap gap-1 mb-4">
          {pizza.ingredients?.slice(0, 3).map(ing => (
            <span key={ing} className="text-xs text-white/40 bg-white/5 rounded-full px-2 py-0.5">{ing}</span>
          ))}
          {pizza.ingredients?.length > 3 && (
            <span className="text-xs text-white/40 bg-white/5 rounded-full px-2 py-0.5">+{pizza.ingredients.length - 3}</span>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-black text-white">₹{pizza.price}</span>
            {pizza.originalPrice && <span className="text-white/35 text-sm line-through ml-2">₹{pizza.originalPrice}</span>}
          </div>
          <span className="text-white/35 text-xs">{pizza.calories} kcal</span>
        </div>

        <div className="flex gap-2">
          <Link to="/recommendations" className="flex-1 text-center text-sm font-medium py-2.5 rounded-xl glass hover:border-[#FF6B00]/30 text-white/60 hover:text-white transition-all">
            Details
          </Link>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleAdd}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${inCart ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'btn-primary'}`}
          >
            {inCart ? '✓ Added' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
