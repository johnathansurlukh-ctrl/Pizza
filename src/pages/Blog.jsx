import { useState } from 'react'
import { motion } from 'framer-motion'

const posts = [
  {
    id: 1, category: 'Food Science', readTime: '5 min read', date: 'Jun 10, 2026',
    title: "Why Thin Crust Always Tastes Better When It's Hot",
    excerpt: 'The science behind crust texture, moisture loss, and why timing your first bite matters more than you think.',
    emoji: '🔬', gradient: 'from-blue-500/20 to-purple-500/20',
  },
  {
    id: 2, category: 'Company News', readTime: '3 min read', date: 'Jun 7, 2026',
    title: 'Pizzora Expands to Lucknow and Agra',
    excerpt: "We're thrilled to announce our newest stores in two of India's most culturally rich cities. Here's what's coming.",
    emoji: '📍', gradient: 'from-[#FF6B00]/20 to-orange-500/20',
  },
  {
    id: 3, category: 'AI & Tech', readTime: '8 min read', date: 'Jun 3, 2026',
    title: 'How Our AI Learned to Predict Your Perfect Pizza',
    excerpt: 'A deep dive into the recommendation engine powering Pizzora — from training data to the quiz you take at signup.',
    emoji: '🤖', gradient: 'from-green-500/20 to-teal-500/20',
  },
  {
    id: 4, category: 'Recipe', readTime: '6 min read', date: 'May 28, 2026',
    title: 'The Secret to a Perfect Paneer Tikka Base',
    excerpt: 'Our Mumbai kitchen team breaks down the exact spice ratios, marinade time, and oven temperature behind our bestseller.',
    emoji: '🧑‍🍳', gradient: 'from-amber-500/20 to-orange-500/20',
  },
  {
    id: 5, category: 'Culture', readTime: '4 min read', date: 'May 22, 2026',
    title: 'Pizza in New York vs. Pizza in Mumbai: A Honest Comparison',
    excerpt: 'We sent our team to both cities with the same brief. The results were surprising, delicious, and occasionally spicy.',
    emoji: '🌍', gradient: 'from-pink-500/20 to-rose-500/20',
  },
  {
    id: 6, category: 'AI & Tech', readTime: '7 min read', date: 'May 15, 2026',
    title: 'Building a Real-Time Group Voting Feature in 48 Hours',
    excerpt: 'Our engineering team shares the story of building Group Vote — from hackathon idea to production feature.',
    emoji: '⚡', gradient: 'from-yellow-500/20 to-amber-500/20',
  },
]

const categories = ['All', 'Company News', 'Food Science', 'AI & Tech', 'Recipe', 'Culture']

export default function Blog() {
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? posts : posts.filter(p => p.category === active)
  const [featured, ...rest] = filtered

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="fixed top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-600/6 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-3">Pizzora Blog</h1>
          <p className="text-white/40 text-lg">Stories, science, and secrets from the Pizzora kitchen.</p>
        </motion.div>

        {/* Category filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 mb-10">
          {categories.map(cat => (
            <motion.button key={cat} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${active === cat ? 'bg-[#FF6B00] text-white' : 'glass text-white/50 hover:text-white'}`}>
              {cat}
            </motion.button>
          ))}
        </motion.div>

        {filtered.length > 0 && (
          <>
            {/* Featured post */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              whileHover={{ y: -4 }}
              className={`glass-strong rounded-3xl p-8 mb-6 cursor-pointer bg-gradient-to-br ${featured.gradient} border border-white/8`}>
              <div className="flex items-start gap-6">
                <div className="text-6xl">{featured.emoji}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-[#FF6B00]/20 text-[#FF6B00] text-xs font-semibold px-3 py-1 rounded-full">{featured.category}</span>
                    <span className="text-white/30 text-xs">{featured.readTime} · {featured.date}</span>
                  </div>
                  <h2 className="text-2xl font-black text-white mb-3">{featured.title}</h2>
                  <p className="text-white/50 leading-relaxed">{featured.excerpt}</p>
                  <span className="inline-block mt-4 text-[#FF6B00] text-sm font-semibold">Read more →</span>
                </div>
              </div>
            </motion.div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {rest.map((post, i) => (
                <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                  whileHover={{ y: -4 }}
                  className={`glass-strong rounded-2xl p-6 cursor-pointer bg-gradient-to-br ${post.gradient} border border-white/8`}>
                  <div className="text-4xl mb-4">{post.emoji}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-white/40 text-xs">{post.category}</span>
                    <span className="text-white/20 text-xs">·</span>
                    <span className="text-white/40 text-xs">{post.readTime}</span>
                  </div>
                  <h3 className="text-white font-bold mb-2 leading-snug">{post.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <span className="inline-block mt-3 text-[#FF6B00] text-xs font-semibold">Read more →</span>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
