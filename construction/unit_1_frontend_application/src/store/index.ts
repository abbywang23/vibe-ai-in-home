import { configureStore } from '@reduxjs/toolkit';
import sessionReducer from './slices/sessionSlice';
import designReducer from './slices/designSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';
import { aiApi } from '../services/aiApi';

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    design: designReducer,
    cart: cartReducer,
    ui: uiReducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(aiApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
