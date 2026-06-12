import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'

const AuthContext = createContext(null)

function uidToNum(uid) {
  return uid.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
}

function getLoginCount(uid) {
  try {
    const counts = JSON.parse(localStorage.getItem('pizzora-login-counts') || '{}')
    return counts[uid] || 0
  } catch { return 0 }
}

function incrementLoginCount(uid) {
  try {
    const counts = JSON.parse(localStorage.getItem('pizzora-login-counts') || '{}')
    counts[uid] = (counts[uid] || 0) + 1
    localStorage.setItem('pizzora-login-counts', JSON.stringify(counts))
    return counts[uid]
  } catch { return 1 }
}

function mapUser(fbUser, loginCount) {
  if (!fbUser) return null
  return {
    uid:        fbUser.uid,
    id:         uidToNum(fbUser.uid),
    name:       fbUser.displayName || fbUser.email.split('@')[0],
    email:      fbUser.email,
    photo:      fbUser.photoURL || null,
    avatar:     (fbUser.displayName || fbUser.email)[0].toUpperCase(),
    loginCount: loginCount ?? getLoginCount(fbUser.uid),
  }
}

export function parseFirebaseError(code) {
  switch (code) {
    case 'auth/email-already-in-use':   return 'An account with this email already exists.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':          return 'Invalid email or password.'
    case 'auth/weak-password':          return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':      return 'Too many attempts. Please try again later.'
    case 'auth/network-request-failed': return 'Network error. Check your connection.'
    case 'auth/popup-blocked':          return 'Popup blocked — allow popups for this site and try again.'
    default:                            return 'Something went wrong. Please try again.'
  }
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser ? mapUser(fbUser, getLoginCount(fbUser.uid)) : null)
      setLoading(false)
    })
    return unsub
  }, [])

  const signUp = async ({ name, email, password }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      const count = incrementLoginCount(cred.user.uid)
      setUser(mapUser({ ...cred.user, displayName: name }, count))
      return {}
    } catch (err) {
      return { error: parseFirebaseError(err.code) }
    }
  }

  const login = async ({ email, password }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const count = incrementLoginCount(cred.user.uid)
      setUser(mapUser(cred.user, count))
      return {}
    } catch (err) {
      return { error: parseFirebaseError(err.code) }
    }
  }

  const googleLogin = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      const count = incrementLoginCount(cred.user.uid)
      setUser(mapUser(cred.user, count))
      return {}
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return {}
      return { error: parseFirebaseError(err.code) }
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return {}
    } catch (err) {
      return { error: parseFirebaseError(err.code) }
    }
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
  }

  const isReturning = user && user.loginCount > 1

  return (
    <AuthContext.Provider value={{ user, loading, isReturning, signUp, login, googleLogin, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
