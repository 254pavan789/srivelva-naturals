import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

// Cart item shape: { id, variantId, size, name, price, imageUrl, quantity, ... }
// Unique key = productId + variantId (so same product in different sizes = separate cart lines)
const itemKey = (productId, variantId) => `${productId}_${variantId ?? 'base'}`;

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD': {
      const key    = itemKey(action.product.id, action.product.variantId);
      const exists = state.items.find(i => itemKey(i.id, i.variantId) === key);
      if (exists) {
        return {
          ...state,
          items: state.items.map(i =>
            itemKey(i.id, i.variantId) === key
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      return { ...state, items: [...state.items, { ...action.product, quantity: 1 }] };
    }
    case 'REMOVE':
      return { ...state, items: state.items.filter(
        i => itemKey(i.id, i.variantId) !== action.key
      )};
    case 'UPDATE_QTY':
      return {
        ...state,
        items: state.items.map(i =>
          itemKey(i.id, i.variantId) === action.key
            ? { ...i, quantity: Math.max(1, action.qty) }
            : i
        )
      };
    case 'CLEAR':
      return { ...state, items: [] };
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const saved = JSON.parse(localStorage.getItem('svn_cart') || '{"items":[]}');
  const [state, dispatch] = useReducer(cartReducer, saved);

  useEffect(() => {
    localStorage.setItem('svn_cart', JSON.stringify(state));
  }, [state]);

  const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = state.items.reduce((sum, i) => sum + i.quantity, 0);

  const addToCart     = (product) => dispatch({ type: 'ADD', product });
  const removeFromCart= (id, variantId) => dispatch({ type: 'REMOVE', key: itemKey(id, variantId) });
  const updateQty     = (id, variantId, qty) => dispatch({ type: 'UPDATE_QTY', key: itemKey(id, variantId), qty });
  const clearCart     = () => dispatch({ type: 'CLEAR' });

  return (
    <CartContext.Provider value={{ items: state.items, total, count, addToCart, removeFromCart, updateQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be inside CartProvider');
  return ctx;
};
