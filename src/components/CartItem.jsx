import { motion } from 'framer-motion'
import { useCart } from '../context/CartContext'

export default function CartItem({ item }) {
  const { updateQty, removeItem } = useCart()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 p-4 glass rounded-2xl"
    >
      {/* Pizza emoji visual */}
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-2xl flex-shrink-0`}>
        {item.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-sm truncate">{item.name}</h4>
        <p className="text-white/40 text-xs mt-0.5">{item.calories} kcal · {item.category}</p>
        <p className="text-[#FF6B00] font-bold text-sm mt-1">₹{item.price}</p>
      </div>

      {/* Qty controls */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateQty(item.id, item.qty - 1)}
          className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white hover:border-[#FF6B00]/40 transition-all text-lg font-bold"
        >
          −
        </motion.button>
        <span className="w-6 text-center font-bold text-white">{item.qty}</span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => updateQty(item.id, item.qty + 1)}
          className="w-8 h-8 bg-[#FF6B00]/20 border border-[#FF6B00]/30 rounded-lg flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/30 transition-all text-lg font-bold"
        >
          +
        </motion.button>
      </div>

      {/* Total + remove */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-white text-sm">₹{item.price * item.qty}</p>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => removeItem(item.id)}
          className="text-white/30 hover:text-red-400 transition-colors text-xs mt-1"
        >
          Remove
        </motion.button>
      </div>
    </motion.div>
  )
}
