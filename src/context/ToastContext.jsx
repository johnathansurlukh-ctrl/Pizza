import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ToastContext = createContext(null)

const icons = { success: '✓', error: '✕', info: 'ℹ', cart: '🛒' }
const colors = {
  success: 'border-green-500/40 bg-green-500/10',
  error: 'border-red-500/40 bg-red-500/10',
  info: 'border-[#FF6B00]/40 bg-[#FF6B00]/10',
  cart: 'border-[#FF6B00]/40 bg-[#FF6B00]/10',
}
const iconColors = {
  success: 'text-green-400 bg-green-500/20',
  error: 'text-red-400 bg-red-500/20',
  info: 'text-[#FF6B00] bg-[#FF6B00]/20',
  cart: 'text-[#FF6B00] bg-[#FF6B00]/20',
}

function ToastItem({ toast, onRemove }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex items-center gap-3 glass-strong border rounded-2xl px-4 py-3 min-w-[260px] max-w-[320px] cursor-pointer shadow-2xl ${colors[toast.type]}`}
      onClick={() => onRemove(toast.id)}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${iconColors[toast.type]}`}>
        {toast.emoji || icons[toast.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">{toast.title}</p>
        {toast.subtitle && <p className="text-white/50 text-xs mt-0.5 truncate">{toast.subtitle}</p>}
      </div>
    </motion.div>
  )
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback(({ title, subtitle, type = 'info', emoji, duration = 3000 }) => {
    const id = Date.now()
    setToasts(t => [...t, { id, title, subtitle, type, emoji }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration)
  }, [])

  const remove = useCallback((id) => setToasts(t => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-6 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <div key={toast.id} className="pointer-events-auto">
              <ToastItem toast={toast} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
