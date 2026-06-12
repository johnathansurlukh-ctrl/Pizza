import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'


export default function Footer() {
  return (
    <footer className="border-t border-white/8 mt-20 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍕</span>
              <span className="text-xl font-black text-gradient">Pizzora</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              AI-powered pizza recommendations tailored to your unique taste profile.
            </p>
            <div className="flex gap-3">
              {['🐦', '📸', '💼', '📘'].map((icon, i) => (
                <motion.button key={i} whileHover={{ scale: 1.2 }} className="glass w-9 h-9 rounded-lg flex items-center justify-center text-sm">
                  {icon}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-white font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              {[['/', 'Home'], ['/quiz', 'Pizza Quiz'], ['/builder', 'Build Pizza'], ['/deals', 'Deals'], ['/vote', 'Group Vote']].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-white/50 hover:text-[#FF6B00] text-sm transition-colors duration-200">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'About Us', to: '/about'   },
                { label: 'Blog',     to: '/blog'    },
                { label: 'Careers',  to: '/careers' },
                { label: 'Press',    to: '/press'   },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-white/50 hover:text-[#FF6B00] text-sm transition-colors duration-200">{item.label}</Link>
                </li>
              ))}
              <li>
                <span className="text-white/25 text-sm cursor-default select-none">Partners</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Download App</h4>
            <div className="space-y-3">
              <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                <span className="text-2xl">📱</span>
                <div>
                  <p className="text-white/40 text-xs">Download on the</p>
                  <p className="text-white text-sm font-semibold">App Store</p>
                </div>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} className="glass rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-white/40 text-xs">Get it on</p>
                  <p className="text-white text-sm font-semibold">Google Play</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">© 2026 Pizzora Inc. All rights reserved.</p>
          <div className="flex gap-6">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <span key={item} className="text-white/30 hover:text-white/60 text-xs cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
