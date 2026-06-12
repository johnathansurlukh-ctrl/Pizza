import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'
import RatingStars from './RatingStars'

export default function PizzaCard({ pizza, matchScore, showMatch = false, index = 0 }) {
  const { addItem, items } = useCart()
  const inCart = items.some(i => i.id === pizza.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -6 }}
      className="card group relative overflow-hidden"
    >
      {/* Pizza visual */}
      <div className={`relative h-48 bg-gradient-to-br ${pizza.gradient} flex items-center justify-center overflow-hidden`}>
        <motion.span
          className="text-7xl select-none"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {pizza.emoji}
        </motion.span>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {pizza.isVeg && (
            <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">🟢 Veg</span>
          )}
          {pizza.tags.includes('premium') && (
            <span className="badge bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">⭐ Premium</span>
          )}
        </div>

        {showMatch && matchScore && (
          <div className="absolute top-3 right-3">
            <div className="glass px-3 py-1 rounded-full text-sm font-bold text-[#FF6B00]">
              {matchScore}% Match
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="text-xs text-white/60 glass px-2 py-1 rounded-full">{pizza.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-white text-base leading-tight">{pizza.name}</h3>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <RatingStars rating={pizza.rating} size="sm" />
          <span className="text-white/40 text-xs">({pizza.reviews.toLocaleString()})</span>
        </div>

        <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-2">{pizza.description}</p>

        {/* Ingredients */}
        <div className="flex flex-wrap gap-1 mb-4">
          {pizza.ingredients.slice(0, 3).map(ing => (
            <span key={ing} className="text-xs text-white/40 bg-white/5 rounded-full px-2 py-0.5">{ing}</span>
          ))}
          {pizza.ingredients.length > 3 && (
            <span className="text-xs text-white/40 bg-white/5 rounded-full px-2 py-0.5">+{pizza.ingredients.length - 3}</span>
          )}
        </div>

        {/* Price + Calories */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-xl font-black text-white">₹{pizza.price}</span>
            {pizza.originalPrice && (
              <span className="text-white/40 text-sm line-through ml-2">₹{pizza.originalPrice}</span>
            )}
          </div>
          <span className="text-white/40 text-xs">{pizza.calories} kcal</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/recommendations?highlight=${pizza.id}`}
            className="flex-1 text-center text-sm font-medium py-2 rounded-xl glass hover:border-[#FF6B00]/30 text-white/70 hover:text-white transition-all"
          >
            View Details
          </Link>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addItem(pizza)}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              inCart
                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                : 'btn-primary'
            }`}
          >
            {inCart ? '✓ Added' : 'Add to Cart'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
