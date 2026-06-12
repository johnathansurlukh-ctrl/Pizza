const BASE = 'http://localhost:3001/api'

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'API error')
  return json.data
}

export const api = {
  getPizzas: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return req(`/pizzas${qs ? `?${qs}` : ''}`)
  },
  getPizza: (id) => req(`/pizzas/${id}`),
  getRecommendations: (answers) => req('/recommend', { method: 'POST', body: JSON.stringify(answers) }),
  getDeals: () => req('/deals'),
  validateCoupon: (code) => req('/deals/validate', { method: 'POST', body: JSON.stringify({ code }) }),
  getReviews: () => req('/reviews'),
  placeOrder: (order) => req('/orders', { method: 'POST', body: JSON.stringify(order) }),
  getStats: () => req('/stats'),
}
