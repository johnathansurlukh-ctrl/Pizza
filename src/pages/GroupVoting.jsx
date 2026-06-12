import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { pizzas } from '../data/pizzas'
import { useCart } from '../context/CartContext'

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

const MOCK_MEMBERS = ['You', 'Arjun', 'Priya', 'Rahul', 'Sneha']

function VotingCard({ pizza, votes, totalVotes, onVote, hasVoted, myVote }) {
  const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0
  const isMyVote = myVote === pizza.id

  return (
    <motion.div
      whileHover={{ y: isMyVote ? 0 : -4 }}
      className={`card p-4 cursor-pointer transition-all duration-200 ${isMyVote ? 'border-[#FF6B00]/60 bg-[#FF6B00]/5' : ''}`}
      onClick={() => !hasVoted && onVote(pizza.id)}
    >
      <div className={`h-24 rounded-xl bg-gradient-to-br ${pizza.gradient} flex items-center justify-center text-4xl mb-3`}>
        {pizza.emoji}
      </div>
      <h4 className="text-white font-semibold text-sm mb-1 line-clamp-1">{pizza.name}</h4>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/40 text-xs">₹{pizza.price}</span>
        <span className={`text-xs font-bold ${isMyVote ? 'text-[#FF6B00]' : 'text-white/40'}`}>
          {isMyVote ? '✓ Your vote' : `${votes} vote${votes !== 1 ? 's' : ''}`}
        </span>
      </div>
      {hasVoted && (
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full progress-bar rounded-full"
          />
        </div>
      )}
      {!hasVoted && (
        <div className="w-full py-2 rounded-lg bg-white/5 text-white/30 text-xs text-center">
          Tap to vote
        </div>
      )}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="glass px-3 py-2 rounded-xl text-sm">
        <p className="text-white font-semibold">{payload[0].payload.name}</p>
        <p className="text-[#FF6B00]">{payload[0].value} votes</p>
      </div>
    )
  }
  return null
}

export default function GroupVoting() {
  const [phase, setPhase] = useState('create') // create | vote | results
  const [roomCode, setRoomCode] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [votes, setVotes] = useState({})
  const [myVote, setMyVote] = useState(null)
  const [members] = useState(MOCK_MEMBERS)
  const { addItem } = useCart()

  const votingPizzas = pizzas.slice(0, 8)

  const createRoom = () => {
    const code = generateCode()
    setRoomCode(code)
    // Seed mock votes for demo
    const mockVotes = {}
    votingPizzas.forEach(p => { mockVotes[p.id] = Math.floor(Math.random() * 3) })
    setVotes(mockVotes)
    setPhase('vote')
  }

  const joinRoom = () => {
    if (joinCode.length >= 4) {
      setRoomCode(joinCode.toUpperCase())
      const mockVotes = {}
      votingPizzas.forEach(p => { mockVotes[p.id] = Math.floor(Math.random() * 3) })
      setVotes(mockVotes)
      setPhase('vote')
    }
  }

  const castVote = useCallback((pizzaId) => {
    setMyVote(pizzaId)
    setVotes(v => ({ ...v, [pizzaId]: (v[pizzaId] || 0) + 1 }))
  }, [])

  const showResults = () => setPhase('results')

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0)
  const sortedResults = [...votingPizzas]
    .map(p => ({ ...p, votes: votes[p.id] || 0 }))
    .sort((a, b) => b.votes - a.votes)
  const winner = sortedResults[0]

  const chartData = sortedResults.slice(0, 6).map(p => ({
    name: p.name.split(' ')[0],
    votes: p.votes,
    full: p.name,
  }))

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <p className="text-[#FF6B00] text-sm font-semibold uppercase tracking-widest mb-2">Together</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">Group Pizza Voting</h1>
          <p className="text-white/40 max-w-lg mx-auto">
            Create a room, invite friends, vote on pizzas. The AI picks the best match for everyone.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* CREATE / JOIN */}
          {phase === 'create' && (
            <motion.div key="create" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Create */}
                <motion.div whileHover={{ y: -4 }} className="card p-6 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-white font-bold text-xl mb-2">Create a Room</h3>
                  <p className="text-white/40 text-sm mb-6">Start a new voting session and share the code with friends.</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={createRoom}
                    className="btn-primary w-full py-3"
                  >
                    Create Room
                  </motion.button>
                </motion.div>

                {/* Join */}
                <motion.div whileHover={{ y: -4 }} className="card p-6 text-center">
                  <div className="text-4xl mb-3">🔗</div>
                  <h3 className="text-white font-bold text-xl mb-2">Join a Room</h3>
                  <p className="text-white/40 text-sm mb-4">Enter the room code shared by your friend.</p>
                  <input
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    maxLength={8}
                    className="w-full glass rounded-xl px-4 py-3 text-center font-mono font-bold text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/40 mb-4 tracking-widest text-lg"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={joinRoom}
                    disabled={joinCode.length < 4}
                    className="btn-ghost w-full py-3 disabled:opacity-40"
                  >
                    Join Room
                  </motion.button>
                </motion.div>
              </div>

              {/* How it works */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { emoji: '📱', step: '1', title: 'Create Room', desc: 'Generate a unique room code instantly' },
                  { emoji: '👥', step: '2', title: 'Friends Join', desc: 'Share the code — up to 10 people can join' },
                  { emoji: '🏆', step: '3', title: 'Best Match Wins', desc: 'AI calculates the crowd favourite' },
                ].map(item => (
                  <div key={item.step} className="glass rounded-2xl p-4 text-center">
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <div className="text-[#FF6B00] text-xs font-mono mb-1">Step {item.step}</div>
                    <div className="text-white font-semibold mb-1">{item.title}</div>
                    <div className="text-white/40 text-xs">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* VOTE */}
          {phase === 'vote' && (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Room info */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-strong rounded-2xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🏠</span>
                  <div>
                    <div className="text-white/40 text-xs">Room Code</div>
                    <div className="text-white font-mono font-black text-xl tracking-widest">{roomCode}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {members.map((m, i) => (
                    <div key={m} className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold text-white" style={{ marginLeft: i > 0 ? '-8px' : 0 }}>
                      {m[0]}
                    </div>
                  ))}
                  <span className="text-white/40 text-sm ml-2">{members.length} members</span>
                </div>
                <div>
                  <span className="text-white/40 text-sm">{totalVotes} votes cast</span>
                </div>
              </div>

              {/* Vote status */}
              {!myVote && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center glass rounded-2xl p-4 mb-6 border border-[#FF6B00]/20">
                  <span className="text-[#FF6B00] font-semibold">👇 Tap a pizza below to cast your vote</span>
                </motion.div>
              )}
              {myVote && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center glass rounded-2xl p-4 mb-6 border border-green-500/30 bg-green-500/5">
                  <span className="text-green-400 font-semibold">✓ Vote cast! Results are live below</span>
                </motion.div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {votingPizzas.map(pizza => (
                  <VotingCard
                    key={pizza.id}
                    pizza={pizza}
                    votes={votes[pizza.id] || 0}
                    totalVotes={totalVotes}
                    onVote={castVote}
                    hasVoted={!!myVote}
                    myVote={myVote}
                  />
                ))}
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={showResults}
                  className="btn-primary px-10 py-4 text-lg"
                >
                  🏆 See Final Results
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* RESULTS */}
          {phase === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Winner */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center glass-strong rounded-3xl p-8 mb-8 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B00]/10 to-transparent pointer-events-none" />
                <div className="relative z-10">
                  <div className="text-5xl mb-2">🏆</div>
                  <p className="text-[#FF6B00] font-semibold text-sm mb-2">The group chose...</p>
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${winner?.gradient} flex items-center justify-center text-4xl mx-auto mb-3`}>
                    {winner?.emoji}
                  </div>
                  <h2 className="text-3xl font-black text-white mb-1">{winner?.name}</h2>
                  <p className="text-white/50 mb-2">{winner?.votes} votes · ₹{winner?.price}</p>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="badge bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30">
                      {totalVotes} total votes
                    </span>
                    <span className="badge bg-green-500/20 text-green-400 border border-green-500/30">
                      {totalVotes ? Math.round((winner?.votes / totalVotes) * 100) : 0}% consensus
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => winner && addItem(winner)}
                    className="btn-primary px-8 py-3"
                  >
                    🛒 Add Winner to Cart
                  </motion.button>
                </div>
              </motion.div>

              {/* Chart */}
              <div className="glass-strong rounded-3xl p-6 mb-6">
                <h3 className="text-white font-bold text-lg mb-6">Vote Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} barSize={32}>
                    <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                    <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                      {chartData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? '#FF6B00' : 'rgba(255,107,0,0.3)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Leaderboard */}
              <div className="glass-strong rounded-3xl p-6 mb-6">
                <h3 className="text-white font-bold text-lg mb-4">Full Leaderboard</h3>
                <div className="space-y-3">
                  {sortedResults.map((pizza, i) => (
                    <div key={pizza.id} className="flex items-center gap-3">
                      <span className={`w-7 text-center font-bold text-sm ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-white/60' : i === 2 ? 'text-amber-600' : 'text-white/30'}`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>
                      <span className="text-xl w-8">{pizza.emoji}</span>
                      <span className="text-white flex-1 text-sm font-medium truncate">{pizza.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#FF6B00] rounded-full" style={{ width: `${totalVotes ? (pizza.votes / totalVotes) * 100 : 0}%` }} />
                        </div>
                        <span className="text-white/50 text-xs w-14 text-right">{pizza.votes} vote{pizza.votes !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => { setPhase('create'); setMyVote(null); setVotes({}) }}
                  className="btn-ghost px-8 py-3"
                >
                  ← Start New Vote
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
