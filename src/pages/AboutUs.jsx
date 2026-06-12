import { motion } from 'framer-motion'

const team = [
  { name: 'Arjun Mehta',    role: 'Co-Founder & CEO',     emoji: '👨‍💼', bio: 'Pizza obsessive. Built Pizzora after ordering the wrong pizza for the 47th time.' },
  { name: 'Priya Sharma',   role: 'Co-Founder & CTO',     emoji: '👩‍💻', bio: 'Ex-Google engineer. Trained our recommendation AI on 3 million pizza orders.' },
  { name: "Liam O'Brien",   role: 'Head of Design',       emoji: '🎨', bio: 'Believes great pizza and great design share the same philosophy: simplicity.' },
  { name: 'Fatima Al-Zahra',role: 'Head of Operations',   emoji: '📦', bio: 'Runs our store network across 6 cities. Personally vetted every delivery partner.' },
  { name: 'Rohan Gupta',    role: 'Lead Engineer',        emoji: '⚙️', bio: 'Writes code faster than our ovens bake. Responsible for the builder experience.' },
  { name: 'Sara Chen',      role: 'Head of Marketing',    emoji: '📣', bio: 'Turned Pizzora from a startup into a cult. Her campaigns are as bold as our spice level.' },
]

const values = [
  { icon: '🍕', title: 'Pizza First',      desc: 'Every decision we make starts with one question: does this make the pizza experience better?' },
  { icon: '🤝', title: 'Honest Always',    desc: 'No dark patterns, no fake urgency. Just real food, real prices, real delivery times.' },
  { icon: '⚡', title: 'Move Fast',        desc: 'We ship fast, deliver fast, and iterate fast. Stale code is as bad as stale dough.' },
  { icon: '🌍', title: 'Built for Everyone', desc: 'From NYC to Agra — Pizzora works for every city, every budget, every craving.' },
]

const stats = [
  { number: '2.4M+',  label: 'Pizzas delivered' },
  { number: '6',      label: 'Cities served' },
  { number: '4.9★',  label: 'Average rating' },
  { number: '18 min', label: 'Fastest delivery' },
]

export default function AboutUs() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-[#FF6B00]/6 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-20">
          <motion.div animate={{ rotate: [0, -10, 10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-6 inline-block">🍕</motion.div>
          <h1 className="text-5xl md:text-6xl font-black mb-6">
            We're on a mission to make<br />
            <span className="text-gradient">every pizza perfect.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
            Pizzora was born in a tiny apartment in Mumbai in 2023. Two engineers, one shared love of pizza, and a frustration with getting the wrong order. We built the recommendation engine we always wished existed.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08 }}
              className="glass-strong rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-gradient mb-1">{s.number}</p>
              <p className="text-white/40 text-sm">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Story */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-strong rounded-3xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-black mb-6">Our Story</h2>
          <div className="space-y-4 text-white/60 leading-relaxed">
            <p>It started with a wrong pizza. Arjun ordered a "classic margherita" expecting something light and fresh — and got a loaded meat feast. The third time it happened, he called Priya and said <span className="text-white italic">"there has to be a better way."</span></p>
            <p>Six months later, they had a working prototype: an AI that could learn your taste from five questions and match you to the perfect pizza every time. They tested it on friends, family, and every office they could get into.</p>
            <p>Today, Pizzora serves over 2 million customers across the US and India. We've grown from two people to a team of 60 — but the mission hasn't changed. We want every pizza order to feel like it was made for you. Because it was.</p>
          </div>
        </motion.div>

        {/* Values */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-20">
          <h2 className="text-3xl font-black mb-8">What we believe</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {values.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                className="glass-strong rounded-2xl p-6 flex gap-4">
                <span className="text-3xl flex-shrink-0">{v.icon}</span>
                <div>
                  <h3 className="text-white font-bold mb-1">{v.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h2 className="text-3xl font-black mb-8">Meet the team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {team.map((member, i) => (
              <motion.div key={member.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ y: -4 }} className="glass-strong rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">{member.emoji}</div>
                <h3 className="text-white font-bold">{member.name}</h3>
                <p className="text-[#FF6B00] text-xs font-semibold mb-3">{member.role}</p>
                <p className="text-white/40 text-xs leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </div>
  )
}
