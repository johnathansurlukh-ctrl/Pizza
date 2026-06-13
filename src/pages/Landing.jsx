import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView } from 'framer-motion'
import { useApi } from '../hooks/useApi'
import { api } from '../api/client'
import { reviews, stats } from '../data/reviews'
import { pizzas as localPizzas } from '../data/pizzas'
import PizzaCard from '../components/PizzaCard'
import RatingStars from '../components/RatingStars'

function CountUp({ target }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  const num = parseInt(target.replace(/\D/g, ''))
  const suffix = target.replace(/[0-9]/g, '')

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = num / 60
    const t = setInterval(() => {
      start += step
      if (start >= num) { setCount(num); clearInterval(t) }
      else setCount(Math.floor(start))
    }, 20)
    return () => clearInterval(t)
  }, [inView, num])

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

const floatingSlices = [
  { emoji: '🍕', size: 'text-6xl', style: { left: '6%', top: '18%' }, cls: 'float-1' },
  { emoji: '🍕', size: 'text-5xl', style: { right: '7%', top: '14%' }, cls: 'float-2' },
  { emoji: '🫙', size: 'text-4xl', style: { left: '4%', top: '62%' }, cls: 'float-3' },
  { emoji: '🌶️', size: 'text-4xl', style: { right: '5%', top: '58%' }, cls: 'float-4' },
  { emoji: '🧀', size: 'text-5xl', style: { right: '12%', bottom: '20%' }, cls: 'float-5' },
  { emoji: '🍄', size: 'text-3xl', style: { left: '14%', bottom: '22%' }, cls: 'float-1' },
]

const howItWorks = [
  {
    step: '01', emoji: '🧠', title: 'Take the Quiz',
    desc: 'Answer 6 quick questions about your taste — takes under 2 minutes.',
    color: 'from-violet-500 to-purple-600',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    step: '02', emoji: '⚡', title: 'AI Matches You',
    desc: 'Our engine scores all 20 pizzas against your taste profile instantly.',
    color: 'from-[#FF6B00] to-amber-500',
    glow: 'rgba(255,107,0,0.3)',
  },
  {
    step: '03', emoji: '🍕', title: 'Order & Enjoy',
    desc: 'Add to cart, apply a deal, and get it delivered in under 30 min.',
    color: 'from-green-500 to-emerald-600',
    glow: 'rgba(34,197,94,0.3)',
  },
]

export default function Landing() {
  const { data: featuredPizzas } = useApi(() => api.getPizzas({ limit: 4 }), [])
  const { data: topRated } = useApi(() => api.getPizzas({ sort: 'rating', limit: 4 }), [])

  const displayFeatured = featuredPizzas || localPizzas.slice(0, 4)
  const displayTopRated = topRated || [...localPizzas].sort((a, b) => b.rating - a.rating).slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#FF6B00]/7 blur-[140px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/3 w-[300px] h-[300px] rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />

        {floatingSlices.map((s, i) => (
          <div key={i} className={`absolute ${s.size} ${s.cls} pointer-events-none select-none opacity-50`} style={s.style}>
            {s.emoji}
          </div>
        ))}

        <div className="relative z-10 text-center max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-white/60 mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Recommendations · Now Live in 52 Cities
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight mb-6">
            Find Your{' '}
            <span className="text-gradient">Perfect</span>
            <br />Pizza
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/50 max-w-xl mx-auto mb-10">
            AI-powered pizza recommendations tailored to your taste.
            Your next favourite slice is one quiz away.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/quiz">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary text-lg px-10 py-4">
                ✨ Find My Pizza
              </motion.button>
            </Link>
            <Link to="/recommendations">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost text-lg px-10 py-4">
                Explore Menu →
              </motion.button>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mt-12 flex items-center justify-center gap-6 text-white/35 text-sm flex-wrap">
            <span className="flex items-center gap-1">
              {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400">★</span>)}
              <span className="ml-1">4.9/5</span>
            </span>
            <span className="hidden sm:block">·</span>
            <span>180K+ happy customers</span>
            <span className="hidden sm:block">·</span>
            <span>52+ cities</span>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, y: [0, 8, 0] }} transition={{ delay: 1.2, duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/25 text-xs flex flex-col items-center gap-2">
          <span>Scroll to explore</span>
          <span className="text-lg">↓</span>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 px-4 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-black text-gradient"><CountUp target={stat.value} /></div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">Featured</p>
              <h2 className="section-title">Most Loved Pizzas</h2>
            </div>
            <Link to="/recommendations" className="text-[#FF6B00] text-sm hover:underline hidden sm:block">View all →</Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayFeatured
              ? displayFeatured.map((pizza, i) => <PizzaCard key={pizza.id} pizza={pizza} index={i} />)
              : Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 skeleton rounded-2xl" />)
            }
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — REDESIGNED ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-black mb-4">How Pizzora Works</h2>
            <p className="text-white/40 max-w-md mx-auto">From first question to first bite — it takes less than 3 minutes.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-16 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.18, duration: 0.5 }}
                whileHover={{ y: -6 }}
                className="relative group"
              >
                <div className="glass-strong rounded-3xl p-7 text-center h-full border border-white/8 hover:border-white/15 transition-all duration-300"
                  style={{ boxShadow: `0 0 0 0 ${item.glow}` }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 40px ${item.glow}`}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  {/* Icon circle */}
                  <div className="relative mx-auto w-20 h-20 mb-6">
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-20 group-hover:opacity-35 transition-opacity duration-300`} />
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.color} opacity-10 blur-xl scale-150 group-hover:opacity-25 transition-opacity duration-300`} />
                    <div className={`relative w-full h-full rounded-2xl bg-gradient-to-br ${item.color} bg-opacity-15 flex items-center justify-center border border-white/10`}>
                      <span className="text-3xl">{item.emoji}</span>
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#0A0A0A] border border-white/15 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white/50">{item.step}</span>
                    </div>
                  </div>

                  <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>

                  {/* Arrow connector (desktop) */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden md:flex absolute -right-4 top-16 z-10 w-8 h-8 items-center justify-center">
                      <span className="text-white/20 text-lg">→</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mt-12">
            <Link to="/quiz">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary text-lg px-12 py-4">
                Start the Quiz ✨
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TOP RATED ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">Top Rated</p>
              <h2 className="section-title">Customer Favorites</h2>
            </div>
            <Link to="/recommendations" className="text-[#FF6B00] text-sm hover:underline hidden sm:block">See all →</Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayTopRated
              ? displayTopRated.map((pizza, i) => <PizzaCard key={pizza.id} pizza={pizza} index={i} />)
              : Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-80 skeleton rounded-2xl" />)
            }
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">Reviews</p>
            <h2 className="section-title">What People Are Saying</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <motion.div key={review.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="card p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.avatarColor} flex items-center justify-center font-bold text-white flex-shrink-0`}>
                    {review.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{review.name}</span>
                      {review.verified && <span className="text-xs text-blue-400">✓</span>}
                    </div>
                    <RatingStars rating={review.rating} size="sm" />
                  </div>
                  <span className="ml-auto text-white/25 text-xs">{review.date}</span>
                </div>
                <p className="text-white/55 text-sm leading-relaxed mb-3">"{review.review}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/25">Ordered: {review.pizza}</span>
                  <span className="text-xs text-white/25">👍 {review.likes}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative glass-strong rounded-3xl p-10 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 to-transparent pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">🍕</div>
              <h2 className="text-3xl md:text-5xl font-black mb-4">Hungry? Let's Find<br /><span className="text-gradient">Your Pizza.</span></h2>
              <p className="text-white/45 text-lg mb-8 max-w-lg mx-auto">Take our 2-minute quiz and discover pizzas you'll actually love.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/quiz">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary text-lg px-10 py-4">Start the Quiz</motion.button>
                </Link>
                <Link to="/builder">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-ghost text-lg px-10 py-4">Build Your Own</motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
