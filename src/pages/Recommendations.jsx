import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams, Link } from 'react-router-dom'
import { pizzas, categories } from '../data/pizzas'
import PizzaCard from '../components/PizzaCard'

function computeMatch(pizza, params) {
  let score = 70
  const crust = params.get('1')
  const spice = params.get('2')
  const pref = params.get('3')
  const budget = params.get('5')

  if (crust && pizza.crust === crust) score += 8
  if (spice === 'mild' && pizza.spice === 'mild') score += 8
  if (spice === 'medium' && (pizza.spice === 'medium')) score += 8
  if (spice === 'spicy' && (pizza.spice === 'spicy' || pizza.spice === 'extra-spicy')) score += 8
  if (pref === 'veg' && pizza.isVeg) score += 10
  if (pref === 'meat' && !pizza.isVeg) score += 10
  if (budget === 'budget' && pizza.price < 350) score += 6
  if (budget === 'mid' && pizza.price >= 350 && pizza.price <= 550) score += 6
  if (budget === 'premium' && pizza.price > 550) score += 6

  score += Math.round(pizza.rating * 1.5)
  return Math.min(99, score)
}

const sortOptions = ['Best Match', 'Top Rated', 'Price: Low–High', 'Price: High–Low', 'Most Popular']

export default function Recommendations() {
  const [params] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('Best Match')
  const [search, setSearch] = useState('')
  const fromQuiz = params.has('1') || params.has('2')

  const scored = useMemo(() =>
    pizzas.map(p => ({ ...p, matchScore: computeMatch(p, params) })),
    [params]
  )

  const filtered = useMemo(() => {
    let list = scored
    if (activeCategory !== 'All') list = list.filter(p => p.category === activeCategory)
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()))
    switch (sortBy) {
      case 'Top Rated': return [...list].sort((a, b) => b.rating - a.rating)
      case 'Price: Low–High': return [...list].sort((a, b) => a.price - b.price)
      case 'Price: High–Low': return [...list].sort((a, b) => b.price - a.price)
      case 'Most Popular': return [...list].sort((a, b) => b.reviews - a.reviews)
      default: return [...list].sort((a, b) => b.matchScore - a.matchScore)
    }
  }, [scored, activeCategory, sortBy, search])

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          {fromQuiz ? (
            <>
              <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-[#FF6B00] mb-4">
                ✨ AI-powered recommendations based on your quiz
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2">Your Perfect Matches</h1>
              <p className="text-white/40">Sorted by how well they match your taste profile.</p>
            </>
          ) : (
            <>
              <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">Menu</p>
              <h1 className="text-4xl md:text-5xl font-black mb-2">All Pizzas</h1>
              <p className="text-white/40">Browse our full menu of {pizzas.length} handcrafted pizzas.</p>
            </>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search pizzas..."
              className="w-full glass rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-[#FF6B00]/40 transition-all text-sm"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#FF6B00] text-white'
                    : 'glass text-white/60 hover:text-white'
                }`}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3">
            <span className="text-white/40 text-sm">Sort:</span>
            <div className="flex gap-2 flex-wrap">
              {sortOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    sortBy === opt ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-white/30 text-sm mb-6">{filtered.length} pizza{filtered.length !== 1 ? 's' : ''} found</p>

        {/* Grid */}
        <AnimatePresence mode="wait">
          {filtered.length > 0 ? (
            <motion.div
              key={`${activeCategory}-${sortBy}-${search}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filtered.map((pizza, i) => (
                <PizzaCard key={pizza.id} pizza={pizza} matchScore={pizza.matchScore} showMatch={fromQuiz} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <div className="text-5xl mb-4">🍕</div>
              <h3 className="text-white font-bold text-xl mb-2">No pizzas found</h3>
              <p className="text-white/40 mb-6">Try a different search or category</p>
              <button onClick={() => { setSearch(''); setActiveCategory('All') }} className="btn-primary">
                Clear Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quiz CTA */}
        {!fromQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 glass-strong rounded-3xl p-8 text-center"
          >
            <div className="text-4xl mb-3">🧠</div>
            <h3 className="text-2xl font-black mb-2">Not sure what to order?</h3>
            <p className="text-white/50 mb-6">Take our AI quiz and get personalized recommendations in under 2 minutes.</p>
            <Link to="/quiz">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-primary px-8 py-3">
                Take the Quiz ✨
              </motion.button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
