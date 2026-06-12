import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

// ─────────────────────────────────────────────────────────────
//  STEP: Paste your Firebase config here.
//  Go to https://console.firebase.google.com →
//    Your project → Project Settings → "Your apps" → Web app
//  Copy the firebaseConfig object and replace the values below.
// ─────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            "AIzaSyD-72WpeBccUsq5kgsybAks6zt4r_HN6iE",
  authDomain:        "verify-993dd.firebaseapp.com",
  projectId:         "verify-993dd",
  storageBucket:     "verify-993dd.firebasestorage.app",
  messagingSenderId: "892191451733",
  appId:             "1:892191451733:web:77f4080d328c2bd2ac42dc",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
