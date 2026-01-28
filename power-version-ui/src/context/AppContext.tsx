import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AppState, RoomSetup, FurnitureSelection, StylePreferences, DetectedFurniture, RenderingResult, Product } from '@/types';

// Initial State
const initialState: AppState = {
  currentStep: 0,
  roomSetup: {
    image: null,
    imagePreview: null,
    roomType: null,
    dimensions: { width: 0, height: 0, length: 0 },
    mode: null,
  },
  furnitureSelection: {
    categories: [],
    budget: 0,
    collections: [],
  },
  stylePreferences: {
    style: '',
    collections: [],
  },
  detectedFurniture: [],
  renderingResult: null,
  cart: [],
  loading: false,
  error: null,
};

// Action Types
type Action =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_ROOM_SETUP'; payload: Partial<RoomSetup> }
  | { type: 'SET_FURNITURE_SELECTION'; payload: Partial<FurnitureSelection> }
  | { type: 'SET_STYLE_PREFERENCES'; payload: Partial<StylePreferences> }
  | { type: 'SET_DETECTED_FURNITURE'; payload: DetectedFurniture[] }
  | { type: 'SET_RENDERING_RESULT'; payload: RenderingResult }
  | { type: 'ADD_TO_CART'; payload: Product }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'SET_ROOM_SETUP':
      return {
        ...state,
        roomSetup: { ...state.roomSetup, ...action.payload },
      };
    
    case 'SET_FURNITURE_SELECTION':
      return {
        ...state,
        furnitureSelection: { ...state.furnitureSelection, ...action.payload },
      };
    
    case 'SET_STYLE_PREFERENCES':
      return {
        ...state,
        stylePreferences: { ...state.stylePreferences, ...action.payload },
      };
    
    case 'SET_DETECTED_FURNITURE':
      return { ...state, detectedFurniture: action.payload };
    
    case 'SET_RENDERING_RESULT':
      return { ...state, renderingResult: action.payload };
    
    case 'ADD_TO_CART':
      return {
        ...state,
        cart: [...state.cart, action.payload],
      };
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(item => item.id !== action.payload),
      };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
