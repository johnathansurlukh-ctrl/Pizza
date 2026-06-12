import { createContext, useContext, useReducer } from 'react'

const CartContext = createContext(null)

const initialState = {
  items: [],
  coupon: null,
  discount: 0,
}

const COUPONS = {
  DOUBLE399: 399, LUNCH300: 300, PARTY1001: 1001,
  VEG418: 418, FIRST200: 200, NIGHT150: 150,
  PIZZORA10: 100, SAVE50: 50,
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.id === action.item.id)
      if (existing) {
        return { ...state, items: state.items.map(i => i.id === action.item.id ? { ...i, qty: i.qty + 1 } : i) }
      }
      return { ...state, items: [...state.items, { ...action.item, qty: 1 }] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.id) }
    case 'UPDATE_QTY': {
      if (action.qty <= 0) return { ...state, items: state.items.filter(i => i.id !== action.id) }
      return { ...state, items: state.items.map(i => i.id === action.id ? { ...i, qty: action.qty } : i) }
    }
    case 'APPLY_COUPON': {
      const discount = COUPONS[action.code.toUpperCase()] || 0
      return { ...state, coupon: discount ? action.code.toUpperCase() : null, discount }
    }
    case 'CLEAR_CART':
      return initialState
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const deliveryFee = subtotal > 499 ? 0 : 49
  const total = Math.max(0, subtotal + deliveryFee - state.discount)
  const itemCount = state.items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <CartContext.Provider value={{
      items: state.items,
      coupon: state.coupon,
      discount: state.discount,
      subtotal, deliveryFee, total, itemCount,
      addItem: (item) => dispatch({ type: 'ADD_ITEM', item }),
      removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', id }),
      updateQty: (id, qty) => dispatch({ type: 'UPDATE_QTY', id, qty }),
      applyCoupon: (code) => dispatch({ type: 'APPLY_COUPON', code }),
      clearCart: () => dispatch({ type: 'CLEAR_CART' }),
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
