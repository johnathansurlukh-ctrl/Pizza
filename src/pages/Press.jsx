import { motion } from 'framer-motion'

const coverage = [
  { outlet: 'TechCrunch',      date: 'May 2026',  headline: 'Pizzora raises $12M Series A to bring AI-powered ordering to the US market', logo: '🟢', color: 'text-green-400' },
  { outlet: 'Economic Times',  date: 'Apr 2026',  headline: "How two Mumbai engineers built India's fastest-growing food-tech startup", logo: '📰', color: 'text-blue-400' },
  { outlet: 'Product Hunt',    date: 'Mar 2026',  headline: "#1 Product of the Day — Pizzora's Group Voting feature takes the internet by storm", logo: '🐱', color: 'text-orange-400' },
  { outlet: 'Forbes India',    date: 'Feb 2026',  headline: '30 Under 30: Arjun Mehta and Priya Sharma on building a ₹100 Cr food brand', logo: '📈', color: 'text-yellow-400' },
  { outlet: 'The Verge',       date: 'Jan 2026',  headline: "Pizzora's AI quiz is the most fun I've had ordering food in years", logo: '🔺', color: 'text-purple-400' },
  { outlet: 'YourStory',       date: 'Dec 2025',  headline: 'From dorm room to 6 cities: The Pizzora origin story', logo: '📖', color: 'text-pink-400' },
]

const awards = [
  { icon: '🏆', title: 'Best Food Tech Startup 2026', org: 'India Startup Awards' },
  { icon: '⭐', title: 'Product of the Year', org: 'Product Hunt Golden Kitty' },
  { icon: '🚀', title: 'Top 10 Startups to Watch', org: 'TechCrunch Disrupt 2025' },
  { icon: '🌟', title: 'Best UX in Food Delivery', org: 'Google Material Awards' },
]

const pressKit = [
  { label: 'Brand Logo Pack (SVG, PNG)',       size: '2.4 MB', icon: '🎨' },
  { label: 'Product Screenshots',              size: '8.1 MB', icon: '📱' },
  { label: 'Founder Headshots',                size: '4.7 MB', icon: '👤' },
  { label: 'Company Fact Sheet (PDF)',          size: '0.3 MB', icon: '📄' },
]

export default function Press() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="fixed top-1/3 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/8 blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
          <h1 className="text-5xl font-black mb-3">Press & Media</h1>
          <p className="text-white/50 text-lg">News, awards, and resources for journalists and media partners.</p>
          <p className="text-white/30 text-sm mt-2">
            Press inquiries: <span className="text-[#FF6B00]">press@pizzora.app</span>
          </p>
        </motion.div>

        {/* Awards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-14">
          <h2 className="text-2xl font-black mb-6">Recognition</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {awards.map((a, i) => (
              <motion.div key={a.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.07 }}
                className="glass-strong rounded-2xl p-5 flex items-center gap-4">
                <span className="text-4xl">{a.icon}</span>
                <div>
                  <h3 className="text-white font-bold text-sm">{a.title}</h3>
                  <p className="text-white/40 text-xs">{a.org}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Press coverage */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-14">
          <h2 className="text-2xl font-black mb-6">In the News</h2>
          <div className="space-y-3">
            {coverage.map((item, i) => (
              <motion.div key={item.outlet} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.07 }}
                whileHover={{ x: 4 }}
                className="glass-strong rounded-2xl p-5 flex items-start gap-4 cursor-pointer group border border-white/5 hover:border-white/10 transition-all">
                <span className="text-2xl flex-shrink-0">{item.logo}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-bold text-sm ${item.color}`}>{item.outlet}</span>
                    <span className="text-white/20 text-xs">{item.date}</span>
                  </div>
                  <p className="text-white/70 text-sm leading-snug group-hover:text-white transition-colors">{item.headline}</p>
                </div>
                <span className="text-white/20 group-hover:text-[#FF6B00] transition-colors flex-shrink-0">→</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Press kit */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-black mb-6">Press Kit</h2>
          <div className="glass-strong rounded-3xl p-6 space-y-3">
            {pressKit.map((item, i) => (
              <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.07 }}
                whileHover={{ x: 4 }}
                className="flex items-center justify-between p-4 glass rounded-xl cursor-pointer group hover:border-[#FF6B00]/30 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-white text-sm font-medium">{item.label}</p>
                    <p className="text-white/30 text-xs">{item.size}</p>
                  </div>
                </div>
                <span className="text-white/20 group-hover:text-[#FF6B00] transition-colors text-sm">↓ Download</span>
              </motion.div>
            ))}
            <p className="text-white/30 text-xs text-center pt-2">All assets are licensed for editorial use only.</p>
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-strong rounded-3xl p-8 text-center mt-10">
          <div className="text-4xl mb-3">📨</div>
          <h3 className="text-white font-black text-xl mb-2">Get in touch</h3>
          <p className="text-white/50 text-sm mb-1">For interviews, quotes, or media requests:</p>
          <p className="text-[#FF6B00] font-semibold">press@pizzora.app</p>
          <p className="text-white/30 text-xs mt-3">We typically respond within 4 hours on weekdays.</p>
        </motion.div>

      </div>
    </div>
  )
}
