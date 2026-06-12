import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AnimatedButton from '../components/AnimatedButton'

const questions = [
  {
    id: 1, emoji: '🥖', title: 'Choose Your Crust',
    subtitle: 'The foundation of a great pizza',
    type: 'choice',
    options: [
      { value: 'thin', label: 'Thin Crust', emoji: '🪨', desc: 'Crispy & light' },
      { value: 'thick', label: 'Thick Crust', emoji: '🍞', desc: 'Chewy & satisfying' },
      { value: 'stuffed', label: 'Stuffed Crust', emoji: '🧀', desc: 'Cheese-filled edge' },
    ],
  },
  {
    id: 2, emoji: '🌶️', title: 'Spice Level',
    subtitle: 'How adventurous is your palate?',
    type: 'choice',
    options: [
      { value: 'mild', label: 'Keep It Mild', emoji: '😌', desc: 'No heat please' },
      { value: 'medium', label: 'Medium Kick', emoji: '😄', desc: 'A little warmth' },
      { value: 'spicy', label: 'Bring the Heat', emoji: '🔥', desc: 'Spicy lover' },
    ],
  },
  {
    id: 3, emoji: '🥩', title: 'Food Preference',
    subtitle: 'What type of toppings do you prefer?',
    type: 'choice',
    options: [
      { value: 'veg', label: 'Vegetarian', emoji: '🌿', desc: 'Pure veggie goodness' },
      { value: 'meat', label: 'Meat Lover', emoji: '🥩', desc: 'Bring on the protein' },
      { value: 'both', label: 'Mix It Up', emoji: '🤌', desc: "I eat everything" },
    ],
  },
  {
    id: 4, emoji: '🧀', title: 'Cheese Level',
    subtitle: 'How much cheese do you want?',
    type: 'slider',
    min: 1, max: 10, defaultValue: 7,
    labels: ['Light', 'Normal', 'Extra', 'MAX'],
  },
  {
    id: 5, emoji: '💰', title: 'Budget Range',
    subtitle: 'What are you comfortable spending per pizza?',
    type: 'choice',
    options: [
      { value: 'budget', label: 'Under ₹350', emoji: '💵', desc: 'Value pick' },
      { value: 'mid', label: '₹350 – ₹550', emoji: '💳', desc: 'Sweet spot' },
      { value: 'premium', label: '₹550+', emoji: '💎', desc: 'Treat yourself' },
    ],
  },
  {
    id: 6, emoji: '🍕', title: 'Favourite Ingredients',
    subtitle: 'Pick all that apply',
    type: 'multi',
    options: [
      { value: 'pepperoni', label: 'Pepperoni', emoji: '🍖' },
      { value: 'mushroom', label: 'Mushrooms', emoji: '🍄' },
      { value: 'jalapeño', label: 'Jalapeños', emoji: '🌶️' },
      { value: 'olives', label: 'Olives', emoji: '🫒' },
      { value: 'paneer', label: 'Paneer', emoji: '🧀' },
      { value: 'chicken', label: 'Chicken', emoji: '🍗' },
      { value: 'onion', label: 'Onions', emoji: '🧅' },
      { value: 'pineapple', label: 'Pineapple', emoji: '🍍' },
    ],
  },
]

const loadingSteps = [
  { label: 'Analysing your taste profile…', duration: 700 },
  { label: 'Matching 20 pizzas to your preferences…', duration: 900 },
  { label: 'Calculating spice compatibility…', duration: 600 },
  { label: 'Ranking your top matches…', duration: 800 },
]

function AILoader({ onDone }) {
  const [stepIndex, setStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let total = 0
    const timers = []
    loadingSteps.forEach((step, i) => {
      timers.push(setTimeout(() => setStepIndex(i), total))
      total += step.duration
    })
    // Animate progress bar over total duration
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100 }
        return p + (100 / (total / 30))
      })
    }, 30)
    timers.push(setTimeout(onDone, total + 300))
    return () => { timers.forEach(clearTimeout); clearInterval(interval) }
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center text-center"
    >
      {/* Spinning pizza */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="text-7xl mb-8"
      >
        🍕
      </motion.div>

      <h2 className="text-2xl font-black text-white mb-2">AI is working its magic…</h2>
      <p className="text-white/40 text-sm mb-8">Finding your perfect pizza matches</p>

      {/* Progress bar */}
      <div className="w-full max-w-xs h-1.5 bg-white/8 rounded-full overflow-hidden mb-6">
        <motion.div
          className="progress-bar h-full rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2 w-full max-w-xs">
        {loadingSteps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.2 }}
            animate={{ opacity: i <= stepIndex ? 1 : 0.2 }}
            className="flex items-center gap-3 text-sm"
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 transition-all duration-300 ${
              i < stepIndex ? 'bg-green-500/20 text-green-400' :
              i === stepIndex ? 'bg-[#FF6B00]/20 text-[#FF6B00]' :
              'bg-white/5 text-white/20'
            }`}>
              {i < stepIndex ? '✓' : i === stepIndex ? '●' : '○'}
            </span>
            <span className={i <= stepIndex ? 'text-white/70' : 'text-white/20'}>{step.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const variants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
}

export default function Quiz() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [dir, setDir] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const q = questions[step]
  const progress = ((step + 1) / questions.length) * 100
  const canProceed = answers[q?.id] !== undefined && (q?.type !== 'multi' || answers[q?.id]?.length > 0)

  const next = () => {
    if (step < questions.length - 1) { setDir(1); setStep(s => s + 1) }
    else setLoading(true)
  }
  const prev = () => { setDir(-1); setStep(s => s - 1) }

  const finish = () => {
    const params = new URLSearchParams()
    Object.entries(answers).forEach(([k, v]) => params.set(k, Array.isArray(v) ? v.join(',') : v))
    navigate(`/recommendations?${params}`)
  }

  const setAnswer = (val) => setAnswers(a => ({ ...a, [q.id]: val }))
  const toggleMulti = (val) => {
    const cur = answers[q.id] || []
    setAnswers(a => ({
      ...a,
      [q.id]: cur.includes(val) ? cur.filter(v => v !== val) : [...cur, val],
    }))
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-24">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#FF6B00]/6 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass-strong rounded-3xl p-10">
              <AILoader onDone={finish} />
            </motion.div>
          ) : (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-3xl mb-2">{q.emoji}</div>
                <h1 className="text-2xl font-black text-white">Pizza Quiz</h1>
                <p className="text-white/40 text-sm mt-1">Step {step + 1} of {questions.length}</p>
              </div>

              {/* Progress */}
              <div className="w-full h-1.5 bg-white/5 rounded-full mb-8 overflow-hidden">
                <motion.div className="progress-bar h-full rounded-full" animate={{ width: `${progress}%` }} />
              </div>

              {/* Step dots */}
              <div className="flex justify-center gap-2 mb-10">
                {questions.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 h-2 bg-[#FF6B00]' :
                    i < step ? 'w-2 h-2 bg-[#FF6B00]/60' : 'w-2 h-2 bg-white/15'
                  }`} />
                ))}
              </div>

              {/* Question card */}
              <div className="glass-strong rounded-3xl p-6 md:p-8 overflow-hidden">
                <AnimatePresence mode="wait" custom={dir}>
                  <motion.div
                    key={q.id}
                    custom={dir}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <h2 className="text-2xl font-black text-white mb-1">{q.title}</h2>
                    <p className="text-white/40 text-sm mb-6">{q.subtitle}</p>

                    {q.type === 'choice' && (
                      <div className="grid grid-cols-1 gap-3">
                        {q.options.map(opt => (
                          <motion.button
                            key={opt.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setAnswer(opt.value)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 text-left ${
                              answers[q.id] === opt.value
                                ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                                : 'border-white/8 bg-white/3 hover:border-white/20'
                            }`}
                          >
                            <span className="text-3xl">{opt.emoji}</span>
                            <div>
                              <div className="font-semibold text-white">{opt.label}</div>
                              <div className="text-white/40 text-sm">{opt.desc}</div>
                            </div>
                            {answers[q.id] === opt.value && <span className="ml-auto text-[#FF6B00] text-xl">✓</span>}
                          </motion.button>
                        ))}
                      </div>
                    )}

                    {q.type === 'slider' && (
                      <div className="px-2">
                        <div className="text-center mb-6">
                          <span className="text-6xl font-black text-gradient">{answers[q.id] || q.defaultValue}</span>
                          <span className="text-white/40 text-xl">/10</span>
                        </div>
                        <input
                          type="range" min={q.min} max={q.max}
                          value={answers[q.id] || q.defaultValue}
                          onChange={e => setAnswer(parseInt(e.target.value))}
                          className="w-full mb-4"
                          style={{ background: `linear-gradient(to right, #FF6B00 ${((answers[q.id] || q.defaultValue) - 1) / 9 * 100}%, rgba(255,255,255,0.1) 0%)` }}
                        />
                        <div className="flex justify-between text-white/30 text-xs">
                          {q.labels.map(l => <span key={l}>{l}</span>)}
                        </div>
                      </div>
                    )}

                    {q.type === 'multi' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {q.options.map(opt => {
                          const sel = (answers[q.id] || []).includes(opt.value)
                          return (
                            <motion.button
                              key={opt.value}
                              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                              onClick={() => toggleMulti(opt.value)}
                              className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all duration-200 ${
                                sel ? 'border-[#FF6B00] bg-[#FF6B00]/10' : 'border-white/8 bg-white/3 hover:border-white/20'
                              }`}
                            >
                              <span className="text-2xl">{opt.emoji}</span>
                              <span className="text-xs font-medium text-white/70">{opt.label}</span>
                              {sel && <span className="text-[#FF6B00] text-xs">✓</span>}
                            </motion.button>
                          )
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation */}
              <div className="flex gap-4 mt-6">
                {step > 0 && (
                  <AnimatedButton variant="ghost" onClick={prev} className="flex-1">← Back</AnimatedButton>
                )}
                <AnimatedButton
                  variant="primary"
                  onClick={next}
                  disabled={!canProceed && q.type !== 'slider'}
                  className="flex-1"
                >
                  {step === questions.length - 1 ? '🍕 Get My Recommendations' : 'Next →'}
                </AnimatedButton>
              </div>

              <p className="text-center text-white/25 text-xs mt-4">
                {q.type === 'multi' ? 'Select one or more options' : q.type === 'slider' ? 'Drag to adjust' : 'Choose one option to continue'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
