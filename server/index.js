require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { v4: uuidv4 } = require('uuid')
const nodemailer = require('nodemailer')
const { pizzas, deals, reviews, COUPONS, orders } = require('./data')

// ─── EMAIL TRANSPORTER ────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

// ─── PIZZAS ──────────────────────────────────────────────
app.get('/api/pizzas', (req, res) => {
  const { category, search, sort, veg, limit } = req.query
  let result = [...pizzas]

  if (category && category !== 'All') result = result.filter(p => p.category === category)
  if (veg === 'true') result = result.filter(p => p.isVeg)
  if (search) result = result.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )
  switch (sort) {
    case 'rating': result.sort((a, b) => b.rating - a.rating); break
    case 'price_asc': result.sort((a, b) => a.price - b.price); break
    case 'price_desc': result.sort((a, b) => b.price - a.price); break
    case 'popular': result.sort((a, b) => b.reviews - a.reviews); break
  }
  if (limit) result = result.slice(0, parseInt(limit))
  res.json({ success: true, data: result, count: result.length })
})

app.get('/api/pizzas/:id', (req, res) => {
  const pizza = pizzas.find(p => p.id === parseInt(req.params.id))
  if (!pizza) return res.status(404).json({ success: false, error: 'Pizza not found' })
  res.json({ success: true, data: pizza })
})

// ─── RECOMMENDATIONS ──────────────────────────────────────
app.post('/api/recommend', (req, res) => {
  const { crust, spice, preference, cheese, budget, ingredients } = req.body

  const scored = pizzas.map(p => {
    let score = 60
    if (crust && p.crust === crust) score += 10
    if (spice === 'mild' && p.spice === 'mild') score += 10
    if (spice === 'medium' && p.spice === 'medium') score += 10
    if (spice === 'spicy' && (p.spice === 'spicy' || p.spice === 'extra-spicy')) score += 10
    if (preference === 'veg' && p.isVeg) score += 12
    if (preference === 'meat' && !p.isVeg) score += 12
    if (preference === 'both') score += 5
    if (budget === 'budget' && p.price < 350) score += 8
    if (budget === 'mid' && p.price >= 350 && p.price <= 550) score += 8
    if (budget === 'premium' && p.price > 550) score += 8
    if (cheese >= 8 && (p.tags.includes('stuffed-crust') || p.category === 'Classic')) score += 5
    if (ingredients?.length) {
      const matches = p.ingredients.filter(ing =>
        ingredients.some(i => ing.toLowerCase().includes(i.toLowerCase()))
      )
      score += matches.length * 4
    }
    score += Math.round(p.rating * 2)
    return { ...p, matchScore: Math.min(99, score) }
  })

  const sorted = scored.sort((a, b) => b.matchScore - a.matchScore)
  res.json({ success: true, data: sorted, topMatch: sorted[0] })
})

// ─── DEALS ────────────────────────────────────────────────
app.get('/api/deals', (req, res) => {
  res.json({ success: true, data: deals })
})

app.post('/api/deals/validate', (req, res) => {
  const { code } = req.body
  const discount = COUPONS[code?.toUpperCase()]
  if (!discount) return res.status(400).json({ success: false, error: 'Invalid coupon code' })
  res.json({ success: true, code: code.toUpperCase(), discount, message: `₹${discount} discount applied!` })
})

// ─── REVIEWS ──────────────────────────────────────────────
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, data: reviews })
})

// ─── ORDERS ───────────────────────────────────────────────
app.post('/api/orders', (req, res) => {
  const { items, coupon, total, deliveryAddress } = req.body
  if (!items?.length) return res.status(400).json({ success: false, error: 'No items in order' })

  const order = {
    id: uuidv4(),
    orderId: `PZR-${Date.now().toString().slice(-6)}`,
    items,
    coupon: coupon || null,
    total,
    deliveryAddress: deliveryAddress || 'Default Address',
    status: 'confirmed',
    estimatedDelivery: 28,
    createdAt: new Date().toISOString(),
  }
  orders.push(order)
  res.status(201).json({ success: true, data: order, message: 'Order placed successfully!' })
})

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find(o => o.id === req.params.id || o.orderId === req.params.id)
  if (!order) return res.status(404).json({ success: false, error: 'Order not found' })
  res.json({ success: true, data: order })
})

app.get('/api/orders', (req, res) => {
  res.json({ success: true, data: orders })
})

// ─── STATS ────────────────────────────────────────────────
app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      totalPizzas: pizzas.length,
      totalOrders: orders.length + 2400000,
      avgRating: (pizzas.reduce((s, p) => s + p.rating, 0) / pizzas.length).toFixed(1),
      cities: 52,
      avgDelivery: 28,
    }
  })
})

// ─── APPLICATION EMAIL ────────────────────────────────────
app.post('/api/send-application-email', async (req, res) => {
  const { applicantEmail, applicantName, roleName, selected, letter } = req.body

  if (!applicantEmail || !applicantName || !letter) {
    return res.status(400).json({ success: false, error: 'Missing required fields.' })
  }

  const isSelected = selected === true
  const subject = isSelected
    ? `🎉 Application Update: ${roleName} — You've been shortlisted!`
    : `Your application for ${roleName} at Pizzora`

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; color: #f0f0f0; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: #141414; border-radius: 20px; overflow: hidden; border: 1px solid #2a2a2a; }
    .header { background: linear-gradient(135deg, #FF6B00, #ff8c38); padding: 32px 36px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: #fff; font-weight: 900; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; color: rgba(255,255,255,0.8); font-size: 13px; }
    .badge { display: inline-block; margin-top: 12px; background: rgba(255,255,255,0.2); color: #fff; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .body { padding: 36px; }
    .status { text-align: center; margin-bottom: 28px; }
    .status .icon { font-size: 48px; }
    .status h2 { font-size: 22px; font-weight: 800; margin: 10px 0 4px; color: ${isSelected ? '#4ade80' : '#f0f0f0'}; }
    .status p { color: #888; font-size: 14px; margin: 0; }
    .letter-box { background: #1c1c1c; border: 1px solid #2a2a2a; border-radius: 14px; padding: 24px; margin-bottom: 24px; }
    .letter-box pre { white-space: pre-wrap; font-family: inherit; font-size: 13.5px; line-height: 1.8; color: #ccc; margin: 0; }
    .footer { background: #0f0f0f; padding: 20px 36px; text-align: center; border-top: 1px solid #222; }
    .footer p { margin: 0; font-size: 11px; color: #555; }
    .footer a { color: #FF6B00; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍕 Pizzora</h1>
      <p>AI-powered pizza & people</p>
      <span class="badge">HR Department</span>
    </div>
    <div class="body">
      <div class="status">
        <div class="icon">${isSelected ? '🎉' : '💌'}</div>
        <h2>${isSelected ? 'Congratulations, you made it!' : 'Thank you for applying'}</h2>
        <p>Application for: <strong style="color:#FF6B00">${roleName}</strong></p>
      </div>
      <div class="letter-box">
        <pre>${letter}</pre>
      </div>
    </div>
    <div class="footer">
      <p>This is an automated message from Pizzora's HR system. Do not reply to this email.<br/>
      Questions? Reach us at <a href="mailto:hr@pizzora.app">hr@pizzora.app</a></p>
    </div>
  </div>
</body>
</html>`

  try {
    await transporter.sendMail({
      from: `"Pizzora HR" <${process.env.GMAIL_USER}>`,
      to: applicantEmail,
      subject,
      html: htmlBody,
      text: letter,
    })
    console.log(`📧 Application email sent to ${applicantEmail} (${isSelected ? 'SELECTED' : 'REJECTED'})`)
    res.json({ success: true, message: `Email sent to ${applicantEmail}` })
  } catch (err) {
    console.error('Email send error:', err.message)
    res.status(500).json({ success: false, error: 'Failed to send email. Check Gmail credentials in .env' })
  }
})

// ─── HEALTH ───────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`\n🍕 Pizzora API running at http://localhost:${PORT}`)
  console.log(`   GET  /api/pizzas`)
  console.log(`   GET  /api/pizzas/:id`)
  console.log(`   POST /api/recommend`)
  console.log(`   GET  /api/deals`)
  console.log(`   POST /api/deals/validate`)
  console.log(`   GET  /api/reviews`)
  console.log(`   POST /api/orders`)
  console.log(`   GET  /api/stats\n`)
})
