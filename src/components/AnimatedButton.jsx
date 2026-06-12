import { motion } from 'framer-motion'

export default function AnimatedButton({ children, variant = 'primary', onClick, className = '', type = 'button', disabled = false }) {
  const base = 'relative font-semibold rounded-xl px-6 py-3 transition-all duration-200 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-[#FF6B00] text-white hover:bg-[#FF8C38]',
    ghost: 'glass text-white border border-white/10 hover:border-[#FF6B00]/40',
    outline: 'border border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10',
  }

  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.03 }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
      style={variant === 'primary' ? { boxShadow: '0 4px 20px rgba(255,107,0,0.35)' } : {}}
    >
      {/* Shine effect on primary */}
      {variant === 'primary' && (
        <span className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <span className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 hover:left-[100%] transition-all duration-700" />
        </span>
      )}
      {children}
    </motion.button>
  )
}
