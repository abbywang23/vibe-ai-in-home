import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShoppingCart, CartItem } from '../../types/domain';

const initialState: ShoppingCart = {
  cartId: null,
  sessionId: null,
  items: [],
  createdAt: null,
  updatedAt: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    initializeCart: (state, action: PayloadAction<string>) => {
      state.cartId = `cart_${Date.now()}`;
      state.sessionId = action.payload;
      state.createdAt = new Date().toISOString();
      state.updatedAt = new Date().toISOString();
    },
    
    addItem: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.productId === action.payload.productId
      );
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.updatedAt = new Date().toISOString();
    },
    
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.itemId !== action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    updateQuantity: (
      state,
      action: PayloadAction<{ itemId: string; quantity: number }>
    ) => {
      const item = state.items.find((i) => i.itemId === action.payload.itemId);
      if (item) {
        item.quantity = action.payload.quantity;
        state.updatedAt = new Date().toISOString();
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.updatedAt = new Date().toISOString();
    },
    
    resetCart: () => initialState,
  },
});

export const {
  initializeCart,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  resetCart,
} = cartSlice.actions;

export default cartSlice.reducer;
