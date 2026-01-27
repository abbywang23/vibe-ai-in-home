import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  PlanningSession,
  SessionStatus,
  UserPreferences,
  UserSettings,
  ChatMessage,
  DimensionUnit,
  RoomType,
  RoomDimensions,
} from '../../types/domain';

const initialState: PlanningSession = {
  sessionId: null,
  status: SessionStatus.STARTED,
  preferences: {
    budget: null,
    selectedCategories: [],
    selectedCollections: [],
    preferredProducts: [],
  },
  userSettings: {
    preferredUnit: DimensionUnit.METERS,
    language: 'en',
    hasSeenOnboarding: false,
  },
  chatHistory: [],
  roomDesignId: null,
  createdAt: null,
  updatedAt: null,
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    startSession: (state) => {
      state.sessionId = `session_${Date.now()}`;
      state.status = SessionStatus.STARTED;
      state.createdAt = new Date().toISOString();
      state.updatedAt = new Date().toISOString();
    },
    
    configureRoom: (
      state,
      _action: PayloadAction<{ roomType: RoomType; dimensions: RoomDimensions }>
    ) => {
      state.status = SessionStatus.CONFIGURING;
      state.updatedAt = new Date().toISOString();
    },
    
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.updatedAt = new Date().toISOString();
    },
    
    addChatMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.chatHistory.push(action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    updateUserSettings: (state, action: PayloadAction<Partial<UserSettings>>) => {
      state.userSettings = { ...state.userSettings, ...action.payload };
      state.updatedAt = new Date().toISOString();
    },
    
    setRoomDesignId: (state, action: PayloadAction<string>) => {
      state.roomDesignId = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    
    completeSession: (state) => {
      state.status = SessionStatus.COMPLETED;
      state.updatedAt = new Date().toISOString();
    },
    
    resetSession: () => initialState,
  },
});

export const {
  startSession,
  configureRoom,
  updatePreferences,
  addChatMessage,
  updateUserSettings,
  setRoomDesignId,
  completeSession,
  resetSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
