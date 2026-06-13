import { db } from './firebase'
import { collection, addDoc, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore'

const col = (uid) => collection(db, 'users', uid, 'orders')

export async function saveOrderToFirestore(uid, order) {
  try {
    await setDoc(doc(db, 'users', uid, 'orders', order.orderId), order)
  } catch {}
}

export async function loadOrdersFromFirestore(uid) {
  try {
    const q = query(col(uid), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map(d => d.data())
  } catch { return null }
}
