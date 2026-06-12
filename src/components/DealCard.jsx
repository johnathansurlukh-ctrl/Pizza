import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function useCountdown(hours) {
  const [timeLeft, setTimeLeft] = useState(hours * 3600)
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])
  const h = Math.floor(timeLeft / 3600)
  const m = Math.floor((timeLeft % 3600) / 60)
  const s = timeLeft % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const badgeColors = {
  HOT: 'bg-red-500/20 text-red-400 border-red-500/30',
  LIMITED: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  NEW: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  TRENDING: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  FLASH: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

export default function DealCard({ deal, index = 0 }) {
  const timer = useCountdown(deal.expiresInHours)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(deal.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const savings = Math.round(((deal.originalPrice - deal.discountedPrice) / deal.originalPrice) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="card relative overflow-hidden"
    >
      {/* Top gradient bar */}
      <div className={`h-1.5 bg-gradient-to-r ${deal.tagColor}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{deal.emoji}</span>
            <div>
              <h3 className="font-bold text-white text-lg">{deal.title}</h3>
              <span className={`badge border text-xs ${badgeColors[deal.badge]}`}>{deal.badge}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[#FF6B00] font-black text-xl">-{savings}%</div>
            <div className="text-white/40 text-xs">OFF</div>
          </div>
        </div>

        <p className="text-white/50 text-sm mb-4 leading-relaxed">{deal.description}</p>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-4">
          <span className="text-2xl font-black text-white">₹{deal.discountedPrice}</span>
          <span className="text-white/40 line-through text-base">₹{deal.originalPrice}</span>
          <span className="text-green-400 text-sm font-semibold">Save ₹{deal.savings}</span>
        </div>

        {/* Countdown */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-white/40 text-xs">⏰ Expires in:</span>
          <div className="glass px-3 py-1 rounded-lg font-mono text-sm font-bold text-[#FF6B00]">
            {timer}
          </div>
        </div>

        {/* Coupon code */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={copy}
          className="w-full border border-dashed border-[#FF6B00]/40 rounded-xl py-3 flex items-center justify-between px-4 hover:bg-[#FF6B00]/5 transition-colors"
        >
          <span className="text-[#FF6B00] font-mono font-bold tracking-widest">{deal.code}</span>
          <span className="text-white/40 text-xs">{copied ? '✓ Copied!' : 'Tap to copy'}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
