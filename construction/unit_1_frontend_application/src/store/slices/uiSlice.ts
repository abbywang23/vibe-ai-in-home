import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface UIState {
  activePanel: 'config' | 'preferences' | 'chat' | 'cart';
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
}

const initialState: UIState = {
  activePanel: 'config',
  isLoading: false,
  error: null,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActivePanel: (
      state,
      action: PayloadAction<'config' | 'preferences' | 'chat' | 'cart'>
    ) => {
      state.activePanel = action.payload;
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const notification: Notification = {
        ...action.payload,
        id: `notif_${Date.now()}`,
      };
      state.notifications.push(notification);
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const {
  setActivePanel,
  setLoading,
  setError,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
