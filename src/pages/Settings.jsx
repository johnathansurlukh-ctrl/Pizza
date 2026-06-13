import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { auth } from '../lib/firebase'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'

export default function Settings() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState(user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [curPwd, setCurPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [pwdMsg, setPwdMsg]   = useState('')
  const [pwdErr, setPwdErr]   = useState('')
  const [pwdSaving, setPwdSaving] = useState(false)

  const saveName = async () => {
    if (!name.trim() || name === user?.name) return
    setSaving(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch {}
    setSaving(false)
  }

  const changePassword = async () => {
    setPwdErr(''); setPwdMsg('')
    if (!curPwd || newPwd.length < 6) { setPwdErr('Password must be at least 6 characters.'); return }
    setPwdSaving(true)
    try {
      const cred = EmailAuthProvider.credential(user.email, curPwd)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, newPwd)
      setPwdMsg('Password updated!')
      setCurPwd(''); setNewPwd('')
    } catch (e) {
      setPwdErr(e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.')
    }
    setPwdSaving(false)
  }

  const handleLogout = async () => { await logout(); navigate('/') }

  const isGoogle = auth.currentUser?.providerData?.[0]?.providerId === 'google.com'
  const avatarColors = ['bg-[#FF6B00]','bg-purple-500','bg-pink-500','bg-blue-500','bg-green-500']
  const avatarColor = avatarColors[(user?.id || 0) % 5]

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black mb-1">Settings</h1>
          <p className="text-white/40">Manage your Pizzora account</p>
        </motion.div>

        {/* Avatar + info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-strong rounded-2xl p-6 mb-4 flex items-center gap-5 border border-white/8">
          <div className={`w-16 h-16 ${avatarColor} rounded-full flex items-center justify-center text-white text-2xl font-black flex-shrink-0`}>
            {user?.avatar}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user?.name}</p>
            <p className="text-white/40 text-sm">{user?.email}</p>
            <p className="text-white/30 text-xs mt-1">{user?.loginCount} login{user?.loginCount !== 1 ? 's' : ''} · {isGoogle ? 'Google account' : 'Email account'}</p>
          </div>
        </motion.div>

        {/* Display name */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-strong rounded-2xl p-6 mb-4 border border-white/8">
          <h2 className="text-white font-bold mb-4">Display Name</h2>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 mb-3 text-sm"
            placeholder="Your name" />
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={saveName} disabled={saving || name === user?.name}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40">
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save Name'}
          </motion.button>
        </motion.div>

        {/* Change password (email accounts only) */}
        {!isGoogle && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glass-strong rounded-2xl p-6 mb-4 border border-white/8">
            <h2 className="text-white font-bold mb-4">Change Password</h2>
            <div className="space-y-3">
              <input type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm"
                placeholder="Current password" />
              <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
                className="w-full glass rounded-xl px-4 py-3 text-white placeholder:text-white/20 outline-none focus:border-[#FF6B00]/50 text-sm"
                placeholder="New password (min 6 chars)" />
              {pwdErr && <p className="text-red-400 text-sm">⚠ {pwdErr}</p>}
              {pwdMsg && <p className="text-green-400 text-sm">✓ {pwdMsg}</p>}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={changePassword} disabled={pwdSaving}
                className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40">
                {pwdSaving ? 'Updating…' : 'Update Password'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Danger zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-strong rounded-2xl p-6 border border-red-500/20">
          <h2 className="text-white font-bold mb-1">Sign Out</h2>
          <p className="text-white/40 text-sm mb-4">You'll need to log back in to place orders.</p>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout}
            className="px-6 py-2.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 text-sm font-semibold hover:bg-red-500/25 transition-all">
            🚪 Sign Out
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
