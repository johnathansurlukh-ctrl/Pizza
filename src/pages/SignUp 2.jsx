import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const SOCIAL = [
  {
    id: 'SSO', label: 'SSO',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12.65 10A6 6 0 0 0 7 6a6 6 0 0 0-6 6 6 6 0 0 0 6 6 6 6 0 0 0 5.65-4H17v4h4v-4h2v-4H12.65zM7 14a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2z"/>
      </svg>
    ),
    bg: 'bg-[#f0f0f0] hover:bg-[#e0e0e0]', text: 'text-[#333]',
  },
  {
    id: 'Apple', label: 'Apple',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
      </svg>
    ),
    bg: 'bg-[#1a1a1a] hover:bg-[#2a2a2a] border border-white/10', text: 'text-white',
  },
  {
    id: 'Google', label: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
    ),
    bg: 'bg-white hover:bg-gray-50 border border-gray-200', text: 'text-[#333]',
  },
  {
    id: 'Facebook', label: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
    bg: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/30', text: 'text-[#1877F2]',
  },
  {
    id: 'Microsoft', label: 'Microsoft',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5">
        <rect x="1"  y="1"  width="10" height="10" fill="#F25022"/>
        <rect x="13" y="1"  width="10" height="10" fill="#7FBA00"/>
        <rect x="1"  y="13" width="10" height="10" fill="#00A4EF"/>
        <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
      </svg>
    ),
    bg: 'bg-white hover:bg-gray-50 border border-gray-200', text: 'text-[#333]',
  },
]

const Blobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }} transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      className="absolute top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
    <motion.div animate={{ x: [0, 60, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      className="absolute bottom-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-[#FF6B00]/12 blur-[100px]" />
    <motion.div animate={{ x: [0, 30, 0], y: [0, -50, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-pink-500/8 blur-[60px]" />
  </div>
)

const FloatingPizzas = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden">
    {['🍕','🌶️','🫑','🧅','🫙'].map((emoji, i) => (
      <motion.span key={i}
        initial={{ y: '110vh', x: `${5 + i * 19}vw`, opacity: 0, rotate: 0 }}
        animate={{ y: '-10vh', opacity: [0, 0.1, 0.1, 0], rotate: i % 2 === 0 ? -360 : 360 }}
        transition={{ duration: 14 + i * 2, repeat: Infinity, delay: i * 2, ease: 'linear' }}
        className="absolute text-4xl"
      >{emoji}</motion.span>
    ))}
  </div>
)

function StrengthBar({ password }) {
  const score = !password ? 0 : [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length
  const colors = ['bg-transparent', 'bg-red-500', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400']
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  return password ? (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1,2,3,4].map(i => <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-white/10'}`} />)}
      </div>
      <p className={`text-xs mt-1 ${score >= 3 ? 'text-green-400' : score === 2 ? 'text-yellow-400' : 'text-red-400'}`}>{labels[score]}</p>
    </div>
  ) : null
}

export default function SignUp() {
  const { signUp, socialLogin, user } = useAuth()
  const navigate = useNavigate()

  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [agree, setAgree]       = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [socialLoading, setSocialLoading] = useState(null)

  useEffect(() => { if (user) navigate('/') }, [user])

  const handleSignUp = async (e) => {
    e.preventDefault()
    if (!name || !email || !password || !confirm) { setError('Please fill in all fields.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (!agree) { setError('Please agree to the Terms & Privacy Policy.'); return }
    setLoading(true); setError('')
    await new Promise(r => setTimeout(r, 700))
    const res = signUp({ name, email, password })
    if (res.error) { setError(res.error); setLoading(false) }
    else navigate('/')
  }

  const handleSocial = async (provider) => {
    setSocialLoading(provider); setError('')
    await new Promise(r => setTimeout(r, 800))
    socialLogin(provider)
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <Blobs />
      <FloatingPizzas />

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-5xl mb-3 inline-block">🍕</motion.div>
            <h1 className="text-3xl font-black text-white">Create account</h1>
            <p className="text-white/40 text-sm mt-1">Join Pizzora and start ordering</p>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-5 gap-2 mb-6">
            {SOCIAL.map(s => (
              <motion.button key={s.id} whileHover={{ scale: 1.08, y: -2 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleSocial(s.id)}
                disabled={!!socialLoading}
                title={s.label}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl font-semibold transition-all ${s.bg} ${s.text} disabled:opacity-50`}
              >
                {socialLoading === s.id
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                  : s.icon
                }
                <span className="text-[10px] font-medium">{s.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-xs">or sign up with email</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" autoComplete="name"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 transition-all text-sm" />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email"
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 transition-all text-sm" />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password"
                  className="w-full glass rounded-xl px-4 py-3 pr-12 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 transition-all text-sm" />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 text-lg transition-colors">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <StrengthBar password={password} />
            </div>

            <div>
              <label className="text-white/50 text-xs mb-1.5 block">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat password" autoComplete="new-password"
                className={`w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none transition-all text-sm ${confirm && confirm !== password ? 'border-red-500/50' : confirm && confirm === password ? 'border-green-500/50' : 'focus:border-[#FF6B00]/50'}`} />
              {confirm && confirm !== password && <p className="text-red-400 text-xs mt-1">Passwords don't match</p>}
              {confirm && confirm === password && <p className="text-green-400 text-xs mt-1">✓ Passwords match</p>}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${agree ? 'bg-[#FF6B00] border-[#FF6B00]' : 'border-white/20 group-hover:border-white/40'}`}
                onClick={() => setAgree(v => !v)}>
                {agree && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
              </div>
              <span className="text-white/40 text-xs leading-relaxed">
                I agree to Pizzora's <span className="text-[#FF6B00]">Terms of Service</span> and <span className="text-[#FF6B00]">Privacy Policy</span>
              </span>
            </label>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <span>⚠</span>{error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-primary py-4 font-bold text-base disabled:opacity-70"
            >
              {loading
                ? <span className="flex items-center justify-center gap-2"><motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> Creating account…</span>
                : 'Create Account 🍕'
              }
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF6B00] font-semibold hover:underline">Sign in →</Link>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-4">
          By continuing, you agree to Pizzora's Terms & Privacy Policy
        </p>
      </motion.div>
    </div>
  )
}
