import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'

// ── EmailJS config — fill these in after setup ──
const EJS_SERVICE  = 'service_vuv2ji6'
const EJS_TEMPLATE = 'template_659m3te'
const EJS_KEY      = 'E85eUwuwo6jzxD5TH'

// Gmail validation — must be a real @gmail.com address format
const isValidGmail = (email) => /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email.trim())

// ── AI Detection ─────────────────────────────────────────
// Scores text for AI-generated content based on linguistic patterns.
// Returns { isAI: bool, confidence: 0-100, flags: string[] }
const AI_PHRASES = [
  'as an ai','i cannot','it is worth noting','it\'s worth noting','in conclusion',
  'in summary','to summarize','firstly','secondly','thirdly','furthermore','moreover',
  'additionally','it is important to note','it\'s important to note','delve','leverage',
  'leveraging','utilize','utilizing','multifaceted','comprehensive','nuanced',
  'I would like to','I am excited to','I am passionate about','i am thrilled',
  'in the realm of','when it comes to','this allows for','this enables',
  'by doing so','having said that','needless to say','as mentioned',
  'at the end of the day','moving forward','going forward','touch base',
  'circle back','synergy','paradigm','holistic approach','best practices',
  'value-added','cutting-edge','innovative solutions','robust','scalable solution',
  'seamlessly','streamline','in order to','it should be noted',
]

const AI_WORD_PATTERNS = [
  /\b(firstly|secondly|thirdly|fourthly)\b/gi,
  /\b(aforementioned|aforestated)\b/gi,
  /\b(utilize|utilization|leveraging|delve|multifaceted)\b/gi,
  /\b(comprehensive(ly)?|holistic(ally)?|nuanced)\b/gi,
  /\b(paramount|crucial(ly)?|imperative(ly)?)\b/gi,
  /\b(endeavour|endeavor|strive to)\b/gi,
  /\b(in terms of|with regards to|with respect to)\b/gi,
]

function detectAI(answers) {
  const allText = Object.values(answers).join(' ').toLowerCase()
  const flags = []
  let score = 0

  // Check for known AI phrases
  AI_PHRASES.forEach(phrase => {
    if (allText.includes(phrase.toLowerCase())) {
      score += 8
      flags.push(`AI phrase: "${phrase}"`)
    }
  })

  // Check for AI word patterns
  AI_WORD_PATTERNS.forEach(pattern => {
    const matches = allText.match(pattern)
    if (matches) {
      score += matches.length * 6
      flags.push(`AI pattern: ${matches[0]}`)
    }
  })

  // Check sentence uniformity (AI tends to write very similar length sentences)
  const sentences = allText.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length >= 4) {
    const lengths = sentences.map(s => s.trim().split(/\s+/).length)
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
    const variance = lengths.reduce((s, l) => s + Math.pow(l - avg, 2), 0) / lengths.length
    if (variance < 8) { score += 15; flags.push('Unusually uniform sentence lengths') }
  }

  // Check for lack of first-person informality (AI rarely uses contractions or informal speech)
  const contractions = (allText.match(/\b(i'm|i've|i'd|i'll|can't|won't|didn't|don't|it's|that's|here's)\b/gi) || []).length
  const wordCount = allText.split(/\s+/).length
  if (wordCount > 80 && contractions === 0) { score += 12; flags.push('No contractions in long text') }

  // Check for suspiciously perfect paragraph structure (AI loves exactly 3-sentence paragraphs)
  const paragraphs = Object.values(answers).filter(a => a.trim().length > 50)
  const perfectParas = paragraphs.filter(p => {
    const sents = p.split(/[.!?]+/).filter(s => s.trim().length > 5)
    return sents.length >= 3 && sents.length <= 4
  })
  if (perfectParas.length >= 2) { score += 10; flags.push('Suspiciously structured paragraphs') }

  // Cap at 100
  score = Math.min(score, 100)
  const isAI = score >= 35

  return { isAI, confidence: score, flags: [...new Set(flags)].slice(0, 4) }
}

// ── Offensive / Discriminatory Language Detection ────────
const OFFENSIVE_TERMS = [
  'racist','racism','sexist','sexism','nigger','nigga','faggot','retard',
  'chink','spic','kike','coon','gook','tranny','whore','slut','bitch',
  'fuck you','shit company','hate this','don\'t care','whatever','i don\'t want',
  'forced to apply','my friend made me','just testing','test application',
  'discrimination','i hate','go to hell','stupid company','waste of time',
]

function detectOffensive(answers) {
  const allText = Object.values(answers).join(' ').toLowerCase()
  const found = OFFENSIVE_TERMS.filter(term => allText.includes(term))
  return { isOffensive: found.length > 0, terms: found.slice(0, 3) }
}

// Per-role interview questions
const roleQuestions = {
  1: [ // Senior Frontend Engineer
    { id: 'exp',   label: 'How many years of experience do you have with React / frontend development?', type: 'text', placeholder: 'e.g. 4 years' },
    { id: 'proj',  label: 'Describe the most complex UI you have built. What made it challenging?', type: 'textarea' },
    { id: 'perf',  label: 'How do you approach performance optimisation in a React app?', type: 'textarea' },
    { id: 'why',   label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
  2: [ // ML Engineer
    { id: 'exp',   label: 'What ML frameworks are you proficient in? (e.g. PyTorch, TensorFlow, scikit-learn)', type: 'text', placeholder: 'e.g. PyTorch, scikit-learn' },
    { id: 'rec',   label: 'Have you built a recommendation system before? Describe it.', type: 'textarea' },
    { id: 'scale', label: 'How have you worked with large-scale datasets? Describe your data pipeline experience.', type: 'textarea' },
    { id: 'why',   label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
  3: [ // Delivery Operations Manager
    { id: 'team',  label: 'How many people have you directly managed in a previous role?', type: 'text', placeholder: 'e.g. 12 delivery staff' },
    { id: 'ops',   label: 'Describe an operations process you improved. What was the outcome?', type: 'textarea' },
    { id: 'crisis',label: 'How would you handle a major delivery failure during peak hours?', type: 'textarea' },
    { id: 'why',   label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
  4: [ // Growth Marketing Manager
    { id: 'exp',   label: 'What growth/marketing channels have you owned? (SEO, paid, social, etc.)', type: 'text', placeholder: 'e.g. Google Ads, Meta, SEO' },
    { id: 'camp',  label: 'Describe a campaign that exceeded its targets. What did you do differently?', type: 'textarea' },
    { id: 'metric',label: 'What growth metrics do you track most closely and why?', type: 'textarea' },
    { id: 'why',   label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
  5: [ // Product Designer
    { id: 'process',label: 'Walk us through your design process from brief to final delivery.', type: 'textarea' },
    { id: 'tools',  label: 'What design tools do you use? (Figma, Framer, etc.)', type: 'text', placeholder: 'e.g. Figma, Framer, Principle' },
    { id: 'proud',  label: 'Describe a design decision you are most proud of. What was the impact?', type: 'textarea' },
    { id: 'why',    label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
  0: [ // Open application
    { id: 'exp',   label: 'What role are you interested in and what relevant experience do you have?', type: 'textarea' },
    { id: 'proj',  label: 'Describe your most significant professional achievement so far.', type: 'textarea' },
    { id: 'skill', label: 'What unique skill or perspective would you bring to Pizzora?', type: 'textarea' },
    { id: 'why',   label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
  6: [ // Customer Experience Lead
    { id: 'team',  label: 'What is the largest support team you have led?', type: 'text', placeholder: 'e.g. 8 agents across 2 regions' },
    { id: 'metric',label: 'What CX metrics do you track (CSAT, NPS, FRT)? What were your scores?', type: 'textarea' },
    { id: 'esc',   label: 'How do you turn an angry customer into a loyal one? Give a real example.', type: 'textarea' },
    { id: 'why',   label: 'Why do you want to work at Pizzora specifically?', type: 'textarea' },
  ],
}

const DEGREES = ['Bachelor of Technology (B.Tech)', 'Bachelor of Engineering (B.E.)', 'Bachelor of Science (B.Sc)', 'Bachelor of Commerce (B.Com)', 'Bachelor of Arts (B.A.)', 'Bachelor of Business Administration (BBA)', 'Master of Technology (M.Tech)', 'Master of Science (M.Sc)', 'Master of Business Administration (MBA)', 'Master of Arts (M.A.)', 'PhD / Doctorate', 'Diploma', 'Other']

// Score the application and decide outcome
function evaluateApplication({ score, gpaValue, gpaType, answers, role }) {
  let total = 0

  // Education score (30 pts)
  const pct = gpaType === 'gpa4' ? (gpaValue / 4) * 100 : gpaType === 'gpa10' ? gpaValue * 10 : gpaValue
  if (pct >= 75) total += 30
  else if (pct >= 65) total += 20
  else if (pct >= 60) total += 10

  // Answer quality score (50 pts — word count as proxy)
  const roleQs = roleQuestions[role.id] || []
  const wordCounts = roleQs.map(q => (answers[q.id] || '').trim().split(/\s+/).filter(Boolean).length)
  const avgWords = wordCounts.reduce((a, b) => a + b, 0) / (wordCounts.length || 1)
  if (avgWords >= 60) total += 50
  else if (avgWords >= 35) total += 35
  else if (avgWords >= 15) total += 20
  else total += 5

  // Bonus: "why pizzora" answer quality
  const whyWords = (answers['why'] || '').toLowerCase()
  if (whyWords.includes('pizzora') && whyWords.split(/\s+/).length >= 30) total += 10
  if (whyWords.includes('mission') || whyWords.includes('team') || whyWords.includes('grow')) total += 5

  // Small random variance (±5 pts) to feel organic
  total += Math.floor((Date.now() % 11) - 5)

  const selected = total >= 55

  let rejectionReason = null
  if (!selected) {
    const pctVal = gpaType === 'gpa4' ? (gpaValue / 4) * 100 : gpaType === 'gpa10' ? gpaValue * 10 : gpaValue
    if (pctVal < 65) rejectionReason = 'below_quota'
    else if (avgWords < 15) rejectionReason = 'weak_answers'
    else if (((answers['exp'] || '') + (answers['proj'] || '') + (answers['rec'] || '')).split(/\s+/).filter(Boolean).length < 20) rejectionReason = 'insufficient_experience'
    else rejectionReason = 'not_a_fit'
  }

  return { selected, score: total, rejectionReason }
}

function generateOffensiveRejectionLetter({ name, role }) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `Dear ${name},

Thank you for your interest in the ${role.title} position at Pizzora.

Following a review of your application, we regret to inform you that we are unable to proceed with your candidacy. Your interview responses contained language that is discriminatory, offensive, or otherwise inconsistent with the values and professional standards upheld at Pizzora. We maintain a strict zero-tolerance policy toward racist, sexist, hateful, or inappropriate content across all interactions with our team and hiring process.

This application has been permanently disqualified. You will not be eligible to reapply for this or any other position at Pizzora.

Regards,
Fatima Al-Zahra
Head of People & Operations
Pizzora Inc.

Date: ${date}
Reason: Offensive or discriminatory language detected in application`
}

function generateAIRejectionLetter({ name, role }) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  return `Dear ${name},

Thank you for applying for the ${role.title} position at Pizzora.

After reviewing your application, our system has flagged your interview responses as likely generated by an AI writing tool. At Pizzora, we value authenticity — we want to understand who YOU are, in your own words.

As a result, we are unable to move forward with your application at this time. This decision is final for this application cycle.

If you believe this was an error, you are welcome to reapply and ensure your answers are entirely your own.

We appreciate your interest in Pizzora and wish you well.

Regards,
Fatima Al-Zahra
Head of People & Operations
Pizzora Inc.

Date: ${date}
Reason: AI-generated content detected in interview responses`
}

function generateLetter({ selected, name, role, score, rejectionReason }) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const ref = `PZR-${(score * 137 + 10000) % 90000 + 10000}`
  if (selected) {
    return `Dear ${name},

We are pleased to inform you that, following a thorough review of your application for the position of ${role.title} at Pizzora, our recruitment team has decided to move forward with your candidacy.

Your application stood out for the depth of your responses and the clarity of your experience. We were particularly impressed by your motivation for joining Pizzora and your relevant background.

As the next step, a member of our People team will reach out to your Gmail address within 3–5 business days to schedule a technical / competency interview with the hiring manager.

In the meantime, please feel free to explore our product at pizzora.app to get a feel for what we build.

We look forward to speaking with you.

Warm regards,
Fatima Al-Zahra
Head of People & Operations
Pizzora Inc.

Date: ${date}
Reference: ${ref}`
  }

  const reasons = {
    below_quota: {
      label: 'Academic score below minimum requirement',
      body: `After reviewing your academic credentials, our panel found that your submitted score does not meet the minimum qualification threshold required for this position. Pizzora's hiring policy mandates a minimum academic score of 60% (or GPA equivalent) as a baseline criterion. Unfortunately, your application did not satisfy this requirement.`,
    },
    weak_answers: {
      label: 'Interview responses did not meet the required standard',
      body: `After carefully evaluating your interview responses, our review panel found that the depth and detail provided did not sufficiently demonstrate the level of expertise and clarity expected for the ${role.title} role. We look for candidates who can articulate their experience with specificity and evidence-backed examples.`,
    },
    insufficient_experience: {
      label: 'Insufficient relevant experience for this role',
      body: `Upon reviewing your application, we found that your demonstrated professional experience does not yet align with the specific requirements of the ${role.title} position. The role demands hands-on, domain-specific experience that was not clearly evident from the information provided in your application.`,
    },
    not_a_fit: {
      label: 'Profile not the right fit for this role at this time',
      body: `After a thorough evaluation of your educational background, interview responses, and overall alignment with the ${role.title} role, our hiring panel determined that your profile is not the right match for this position at this stage of our growth. This was a competitive round and several strong candidates applied.`,
    },
  }

  const { label, body } = reasons[rejectionReason] || reasons.not_a_fit

  return `Dear ${name},

Thank you for taking the time to apply for the ${role.title} position at Pizzora. We genuinely appreciate your interest in joining our team and the effort you put into your application.

After carefully reviewing your submission, we regret to inform you that we will not be moving forward with your candidacy at this time.

Reason for this decision:
${body}

Please note that this decision does not reflect negatively on your character or long-term potential. We encourage you to continue building your skills and to watch for future openings that may be a stronger match for your profile.

We wish you the very best in your career journey.

Kind regards,
Fatima Al-Zahra
Head of People & Operations
Pizzora Inc.

Date: ${date}
Reason on file: ${label}`
}

const steps = ['Contact', 'Education', 'Interview', 'Result']

export default function JobApplicationModal({ role, onClose }) {
  const [step, setStep]         = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult]     = useState(null)

  // Step 0 — contact
  const [name, setName]         = useState('')
  const [gmail, setGmail]       = useState('')
  const [gmailErr, setGmailErr] = useState('')
  const [phone, setPhone]       = useState('')

  // Step 1 — education
  const [degree, setDegree]     = useState('')
  const [college, setCollege]   = useState('')
  const [gradYear, setGradYear] = useState('')
  const [gpaType, setGpaType]   = useState('percent') // percent | gpa10 | gpa4
  const [gpaValue, setGpaValue] = useState('')
  const [gpaErr, setGpaErr]     = useState('')

  // Step 2 — interview answers
  const [answers, setAnswers]   = useState({})

  const questions = roleQuestions[role.id] || []

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const validateGmail = () => {
    if (!gmail.trim()) { setGmailErr('Gmail address is required.'); return false }
    if (!isValidGmail(gmail)) { setGmailErr('Please enter a valid @gmail.com address.'); return false }
    setGmailErr(''); return true
  }

  const validateGPA = () => {
    const v = parseFloat(gpaValue)
    if (isNaN(v)) { setGpaErr('Please enter your score.'); return false }
    const pct = gpaType === 'gpa4' ? (v / 4) * 100 : gpaType === 'gpa10' ? v * 10 : v
    if (gpaType === 'percent' && (v < 0 || v > 100)) { setGpaErr('Percentage must be between 0 and 100.'); return false }
    if (gpaType === 'gpa10' && (v < 0 || v > 10))    { setGpaErr('GPA must be between 0 and 10.'); return false }
    if (gpaType === 'gpa4'  && (v < 0 || v > 4))     { setGpaErr('GPA must be between 0 and 4.'); return false }
    if (pct < 60) { setGpaErr('Minimum academic requirement is 60% (or equivalent). Applications below this threshold cannot be considered.'); return false }
    setGpaErr(''); return true
  }

  const handleNext0 = () => {
    if (!name.trim()) return
    if (!validateGmail()) return
    if (!phone.trim()) return
    setStep(1)
  }

  const handleNext1 = () => {
    if (!degree || !college.trim() || !gradYear.trim()) return
    if (!validateGPA()) return
    setStep(2)
  }

  const handleNext2 = () => {
    const allAnswered = questions.every(q => (answers[q.id] || '').trim().length >= 10)
    if (!allAnswered) return
    submitApplication()
  }

  const submitApplication = async () => {
    setStep(3)
    setAnalyzing(true)
    await new Promise(r => setTimeout(r, 3500))

    const firstName = name.split(' ')[0]
    let evaluation, letter

    // 1. Offensive / discriminatory content — highest priority denial
    const offCheck = detectOffensive(answers)
    if (offCheck.isOffensive) {
      evaluation = { selected: false, score: 0, offensiveDetected: true }
      letter = generateOffensiveRejectionLetter({ name: firstName, role })
    } else {
      // 2. AI-generated content check
      const aiCheck = detectAI(answers)
      if (aiCheck.isAI) {
        evaluation = { selected: false, score: 0, aiDetected: true, aiConfidence: aiCheck.confidence }
        letter = generateAIRejectionLetter({ name: firstName, role })
      } else {
        // 3. Normal scoring evaluation
        evaluation = evaluateApplication({ gpaValue: parseFloat(gpaValue), gpaType, answers, role })
        letter = generateLetter({ selected: evaluation.selected, name: firstName, role, score: evaluation.score, rejectionReason: evaluation.rejectionReason })
      }
    }

    // Send real email via EmailJS
    let emailStatus = 'sent'
    try {
      await emailjs.send(
        EJS_SERVICE,
        EJS_TEMPLATE,
        {
          to_email:   gmail,
          to_name:    name,
          role_name:  role.title,
          decision:   evaluation.selected ? 'Shortlisted 🎉' : 'Not selected',
          letter_body: letter,
          from_name:  'Pizzora HR',
        },
        EJS_KEY
      )
    } catch {
      emailStatus = 'failed'
    }

    setResult({ ...evaluation, letter, emailStatus })
    setAnalyzing(false)
  }

  const canNext2 = questions.every(q => (answers[q.id] || '').trim().length >= 10)

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
        onClick={(e) => e.target === e.currentTarget && onClose()}>

        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div initial={{ scale: 0.92, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto glass-strong rounded-3xl border border-white/10 shadow-2xl no-scrollbar">

          {/* Header */}
          <div className="sticky top-0 z-10 glass-strong border-b border-white/8 px-6 pt-6 pb-4 rounded-t-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[#FF6B00] text-xs font-semibold mb-1">Application for</p>
                <h2 className="text-white font-black text-lg leading-tight">{role.title}</h2>
                <p className="text-white/40 text-xs mt-0.5">📍 {role.location} · {role.type}</p>
              </div>
              <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none flex-shrink-0 mt-1">×</button>
            </div>

            {/* Step indicator */}
            {step < 3 && (
              <div className="flex items-center gap-1.5 mt-4">
                {steps.slice(0, 3).map((s, i) => (
                  <div key={s} className="flex items-center gap-1.5">
                    <div className={`text-xs px-3 py-1 rounded-full font-semibold transition-all ${
                      i === step ? 'bg-[#FF6B00] text-white' : i < step ? 'bg-green-500/20 text-green-400' : 'glass text-white/30'
                    }`}>{i < step ? '✓' : i + 1} {s}</div>
                    {i < 2 && <div className={`h-px w-4 ${i < step ? 'bg-green-500/40' : 'bg-white/10'}`} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6">
            <AnimatePresence mode="wait">

              {/* ── STEP 0: CONTACT ── */}
              {step === 0 && (
                <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <h3 className="text-white font-bold">Personal Information</h3>

                  {[{ label: 'Full Name', val: name, set: setName, placeholder: 'e.g. Priya Sharma', type: 'text' },
                    { label: 'Phone Number', val: phone, set: setPhone, placeholder: '+91 98765 43210', type: 'tel' }
                  ].map(f => (
                    <div key={f.label}>
                      <label className="text-white/50 text-xs mb-1.5 block">{f.label}</label>
                      <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                        className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm transition-all" />
                    </div>
                  ))}

                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block">Gmail Address</label>
                    <input type="email" value={gmail}
                      onChange={e => { setGmail(e.target.value); setGmailErr('') }}
                      onBlur={validateGmail}
                      placeholder="yourname@gmail.com"
                      className={`w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none text-sm transition-all ${gmailErr ? 'border-red-500/60' : gmail && isValidGmail(gmail) ? 'border-green-500/50' : 'focus:border-[#FF6B00]/50'}`} />
                    {gmailErr && <p className="text-red-400 text-xs mt-1.5">⚠ {gmailErr}</p>}
                    {gmail && isValidGmail(gmail) && !gmailErr && <p className="text-green-400 text-xs mt-1.5">✓ Valid Gmail address</p>}
                    <p className="text-white/25 text-xs mt-1">We only accept Gmail addresses. Your decision letter will be sent here.</p>
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleNext0}
                    disabled={!name.trim() || !phone.trim() || !isValidGmail(gmail)}
                    className="w-full btn-primary py-3 font-bold mt-2 disabled:opacity-40">
                    Continue to Education →
                  </motion.button>
                </motion.div>
              )}

              {/* ── STEP 1: EDUCATION ── */}
              {step === 1 && (
                <motion.div key="education" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                  <div>
                    <h3 className="text-white font-bold">Education</h3>
                    <p className="text-white/40 text-xs mt-0.5">Minimum academic requirement: 60% or equivalent</p>
                  </div>

                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block">Degree / Graduation</label>
                    <select value={degree} onChange={e => setDegree(e.target.value)}
                      className="w-full glass rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF6B00]/50 text-sm transition-all bg-transparent">
                      <option value="" className="bg-[#1a1a1a]">Select your degree</option>
                      {DEGREES.map(d => <option key={d} value={d} className="bg-[#1a1a1a]">{d}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block">College / University Name</label>
                    <input type="text" value={college} onChange={e => setCollege(e.target.value)} placeholder="e.g. IIT Bombay, Mumbai University"
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm transition-all" />
                  </div>

                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block">Graduation Year</label>
                    <input type="text" value={gradYear} onChange={e => setGradYear(e.target.value)} placeholder="e.g. 2022"
                      className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm transition-all" />
                  </div>

                  <div>
                    <label className="text-white/50 text-xs mb-1.5 block">Academic Score</label>
                    <div className="flex gap-2 mb-2">
                      {[['percent','Percentage (%)'],['gpa10','GPA / 10'],['gpa4','GPA / 4']].map(([val, lbl]) => (
                        <button key={val} onClick={() => { setGpaType(val); setGpaValue(''); setGpaErr('') }}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${gpaType === val ? 'bg-[#FF6B00] text-white' : 'glass text-white/40 hover:text-white'}`}>
                          {lbl}
                        </button>
                      ))}
                    </div>
                    <input type="number" value={gpaValue}
                      onChange={e => { setGpaValue(e.target.value); setGpaErr('') }}
                      onBlur={gpaValue ? validateGPA : undefined}
                      placeholder={gpaType === 'percent' ? 'e.g. 78' : gpaType === 'gpa10' ? 'e.g. 7.8' : 'e.g. 3.2'}
                      step="0.01"
                      className={`w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none text-sm transition-all ${gpaErr ? 'border-red-500/60' : ''}`} />
                    {gpaErr && <p className="text-red-400 text-xs mt-1.5">⚠ {gpaErr}</p>}
                    <p className="text-white/25 text-xs mt-1">Minimum required: 60% · 6.0 / 10 · 2.4 / 4</p>
                  </div>

                  <div className="flex gap-3 mt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(0)} className="btn-ghost py-3 px-5">← Back</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={handleNext1}
                      disabled={!degree || !college.trim() || !gradYear.trim() || !gpaValue}
                      className="flex-1 btn-primary py-3 font-bold disabled:opacity-40">
                      Continue to Interview →
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 2: INTERVIEW ── */}
              {step === 2 && (
                <motion.div key="interview" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h3 className="text-white font-bold">Interview Questions</h3>
                    <p className="text-white/40 text-xs mt-0.5">Answer honestly — our AI evaluates depth and authenticity, not keyword stuffing.</p>
                  </div>

                  {questions.map((q, i) => (
                    <div key={q.id}>
                      <label className="text-white/70 text-sm mb-2 block font-medium">
                        <span className="text-[#FF6B00] font-bold mr-2">{i + 1}.</span>{q.label}
                      </label>
                      {q.type === 'textarea' ? (
                        <textarea value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                          rows={4} placeholder="Write your answer here... (minimum 10 characters)"
                          className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm resize-none transition-all" />
                      ) : (
                        <input type="text" value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
                          placeholder={q.placeholder || 'Your answer'}
                          className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm transition-all" />
                      )}
                      {(answers[q.id] || '').trim().length > 0 && (answers[q.id] || '').trim().length < 10 && (
                        <p className="text-white/30 text-xs mt-1">Minimum 10 characters required</p>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3 mt-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(1)} className="btn-ghost py-3 px-5">← Back</motion.button>
                    <motion.button whileHover={{ scale: canNext2 ? 1.02 : 1 }} whileTap={{ scale: canNext2 ? 0.98 : 1 }}
                      onClick={handleNext2} disabled={!canNext2}
                      className="flex-1 btn-primary py-3 font-bold disabled:opacity-40">
                      Submit Application 🍕
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: RESULT ── */}
              {step === 3 && (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-4">
                  {analyzing ? (
                    <div className="space-y-6">
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="text-5xl inline-block">🍕</motion.div>
                      <div>
                        <h3 className="text-white font-black text-xl mb-2">Analysing your application…</h3>
                        <p className="text-white/40 text-sm">Our AI is reviewing your responses, education, and fit for the role.</p>
                      </div>
                      <div className="space-y-2 text-left">
                        {['Verifying Gmail address', 'Checking academic requirements', 'Evaluating interview responses', 'Generating personalised letter'].map((txt, i) => (
                          <motion.div key={txt} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.7 }}
                            className="flex items-center gap-3 glass rounded-xl px-4 py-3">
                            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: i * 0.3 }}
                              className="text-[#FF6B00] text-sm">⏳</motion.span>
                            <span className="text-white/60 text-sm">{txt}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ) : result && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                      className="text-center py-4">

                      {/* Animated envelope */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                        className="text-6xl mb-6 inline-block">✉️</motion.div>

                      <h3 className="text-2xl font-black text-white mb-3">Application Submitted</h3>

                      <p className="text-white/60 text-sm leading-relaxed max-w-sm mx-auto mb-6">
                        Thank you for applying to <span className="text-[#FF6B00] font-semibold">Pizzora</span>. Our team has received your application for the <span className="text-white font-semibold">{role.title}</span> position and it is currently under review.
                      </p>

                      {/* Info card */}
                      <div className="glass rounded-2xl p-5 text-left mb-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📬</span>
                          <div>
                            <p className="text-white text-sm font-semibold">Decision via Email</p>
                            <p className="text-white/40 text-xs">You will receive our official decision letter at <span className="text-[#FF6B00]">{gmail}</span></p>
                          </div>
                        </div>
                        <div className="h-px bg-white/8" />
                        <div className="flex items-center gap-3">
                          <span className="text-xl">⏱️</span>
                          <div>
                            <p className="text-white text-sm font-semibold">Expected Response Time</p>
                            <p className="text-white/40 text-xs">Within 3–5 business days</p>
                          </div>
                        </div>
                        <div className="h-px bg-white/8" />
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🔒</span>
                          <div>
                            <p className="text-white text-sm font-semibold">Confidential Review</p>
                            <p className="text-white/40 text-xs">All applications are reviewed privately by our HR team</p>
                          </div>
                        </div>
                      </div>

                      {result.emailStatus === 'sent' ? (
                        <div className="flex items-center justify-center gap-2 mb-5 glass rounded-xl px-4 py-3 border border-green-500/20">
                          <span className="text-green-400">✓</span>
                          <p className="text-green-400 text-sm font-semibold">Confirmation sent to <span className="underline">{gmail}</span></p>
                        </div>
                      ) : (
                        <div className="glass rounded-xl px-4 py-3 mb-5 border border-yellow-500/20">
                          <p className="text-yellow-400 text-xs text-center">⚠ Email delivery pending — please check your inbox shortly.</p>
                        </div>
                      )}

                      <p className="text-white/25 text-xs mb-6">
                        Please do not resubmit your application. Duplicate submissions will be disqualified.
                      </p>

                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={onClose} className="btn-primary px-10 py-3 font-bold text-base">
                        Done
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
