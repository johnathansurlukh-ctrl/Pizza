import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import JobApplicationModal from '../components/JobApplicationModal'

const openRoles = [
  { id: 1, title: 'Senior Frontend Engineer',   dept: 'Engineering',  location: 'Remote / Mumbai',    type: 'Full-time', desc: 'Own the customer-facing React app. Work directly with the founders on new features.' },
  { id: 2, title: 'ML Engineer — Recommendations', dept: 'Engineering', location: 'Remote / Bangalore', type: 'Full-time', desc: "Improve our pizza taste-matching AI. You'll work with real order data at scale." },
  { id: 3, title: 'Delivery Operations Manager', dept: 'Operations',  location: 'New York City',      type: 'Full-time', desc: 'Oversee our NYC delivery network. Hire, train, and optimise for speed and quality.' },
  { id: 4, title: 'Growth Marketing Manager',    dept: 'Marketing',   location: 'Remote',             type: 'Full-time', desc: 'Drive customer acquisition across India and the US. Own performance and brand campaigns.' },
  { id: 5, title: 'Product Designer',            dept: 'Design',      location: 'Remote / Mumbai',    type: 'Full-time', desc: 'Shape how millions of people discover and order pizza. Obsessed with detail? Apply.' },
  { id: 6, title: 'Customer Experience Lead',    dept: 'Operations',  location: 'Delhi / Remote',     type: 'Full-time', desc: 'Build and run our support team. Make every unhappy customer into a loyal one.' },
]

const perks = [
  { icon: '🍕', title: 'Free Pizza Fridays',        desc: 'Every Friday, the whole team orders whatever they want. On us.' },
  { icon: '🌍', title: 'Remote-first',              desc: 'Work from anywhere. We care about results, not your location.' },
  { icon: '📈', title: 'Equity for everyone',       desc: 'Every full-time employee gets meaningful equity from day one.' },
  { icon: '🏥', title: 'Full health coverage',      desc: 'Medical, dental, and vision — for you and your family.' },
  { icon: '📚', title: 'Learning budget',           desc: '₹50,000 / $600 per year for courses, books, or conferences.' },
  { icon: '🧘', title: 'Wellness stipend',          desc: 'Monthly allowance for gym, therapy, or whatever keeps you sharp.' },
]

const depts = ['All', 'Engineering', 'Design', 'Marketing', 'Operations']

export default function Careers() {
  const [activeDept, setActiveDept] = useState('All')
  const [expanded, setExpanded]     = useState(null)
  const [applyRole, setApplyRole]   = useState(null)

  const filtered = activeDept === 'All' ? openRoles : openRoles.filter(r => r.dept === activeDept)

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="fixed bottom-0 left-1/3 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/6 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-16 text-center">
          <h1 className="text-5xl font-black mb-4">Join Pizzora</h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">We're a small, fast-moving team building something people use every single day. Come work on problems that actually matter.</p>
          <div className="flex justify-center gap-6 mt-8 text-sm text-white/40">
            <span>🌍 Remote-first</span>
            <span>⚡ Series A funded</span>
            <span>👥 60 people</span>
          </div>
        </motion.div>

        {/* Perks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <h2 className="text-2xl font-black mb-6">Why Pizzora?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {perks.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}
                className="glass-strong rounded-2xl p-5">
                <div className="text-3xl mb-3">{p.icon}</div>
                <h3 className="text-white font-semibold mb-1">{p.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Open roles */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-black">Open Roles <span className="text-[#FF6B00]">({filtered.length})</span></h2>
            <div className="flex gap-2 flex-wrap">
              {depts.map(d => (
                <button key={d} onClick={() => setActiveDept(d)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeDept === d ? 'bg-[#FF6B00] text-white' : 'glass text-white/40 hover:text-white'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filtered.map((role, i) => (
              <motion.div key={role.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="glass-strong rounded-2xl overflow-hidden">
                <button onClick={() => setExpanded(expanded === role.id ? null : role.id)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-white/2 transition-all">
                  <div>
                    <h3 className="text-white font-bold">{role.title}</h3>
                    <div className="flex gap-3 mt-1 flex-wrap">
                      <span className="text-[#FF6B00] text-xs font-semibold">{role.dept}</span>
                      <span className="text-white/40 text-xs">📍 {role.location}</span>
                      <span className="text-white/40 text-xs">🕐 {role.type}</span>
                    </div>
                  </div>
                  <motion.span animate={{ rotate: expanded === role.id ? 180 : 0 }} transition={{ duration: 0.2 }}
                    className="text-white/30 text-lg flex-shrink-0 ml-4">
                    ↓
                  </motion.span>
                </button>

                <AnimatePresence>
                  {expanded === role.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-5 pb-5 border-t border-white/8 pt-4">
                        <p className="text-white/60 text-sm leading-relaxed mb-4">{role.desc}</p>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => setApplyRole(role)}
                          className="btn-primary text-sm py-2.5 px-6">
                          Apply for this role →
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16 text-white/30">
              <div className="text-4xl mb-3">🔍</div>
              <p>No open roles in this department right now.</p>
              <p className="text-sm mt-1">Check back soon or try another filter.</p>
            </div>
          )}
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass-strong rounded-3xl p-8 text-center mt-12">
          <div className="text-4xl mb-3">📬</div>
          <h3 className="text-white font-black text-xl mb-2">Don't see your role?</h3>
          <p className="text-white/50 text-sm mb-5">We hire great people regardless of whether there's an open position. Send us your CV and tell us why you'd make Pizzora better.</p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setApplyRole({ id: 0, title: 'Open Application', location: 'Remote / Any', type: 'Full-time', dept: 'General' })}
            className="btn-primary px-8 py-3">
            Send an open application
          </motion.button>
        </motion.div>

      </div>

      {/* Application modal */}
      <AnimatePresence>
        {applyRole && <JobApplicationModal role={applyRole} onClose={() => setApplyRole(null)} />}
      </AnimatePresence>
    </div>
  )
}
