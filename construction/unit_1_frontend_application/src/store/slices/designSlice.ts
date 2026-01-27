import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  RoomDesign,
  RoomType,
  RoomDimensions,
  FurniturePlacement,
  RoomImage,
  ViewState,
} from '../../types/domain';

const initialViewState: ViewState = {
  mode: '2D',
  showDimensions: true,
  zoomLevel: 1.0,
};

const initialState: RoomDesign = {
  designId: null,
  roomType: null,
  roomDimensions: null,
  furniturePlacements: [],
  roomImage: null,
  viewState: initialViewState,
  createdAt: null,
  updatedAt: null,
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    setRoomConfig: (
      state,
      action: PayloadAction<{ roomType: RoomType; dimensions: RoomDimensions }>
    ) => {
      state.designId = `design_${Date.now()}`;
      state.roomType = action.payload.roomType;
      state.roomDimensions = action.payload.dimensions;
      state.createdAt = new Date().toISOString();
      state.updatedAt = new Date().toISOString();
    },
    
    placeFurniture: (state, action: PayloadAction<FurniturePlacement>) => {
      state.furniturePlacements.push(action.payload);
      state.updatedAt = new Date().toISOString();
    },
    
    setFurniturePlacements: (state, action: PayloadAction<FurniturePlacement[]>) => {
      state.furniturePlacements = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    
    moveFurniture: (
      state,
      action: PayloadAction<{ placementId: string; newPosition: any }>
    ) => {
      const placement = state.furniturePlacements.find(
        (p) => p.placementId === action.payload.placementId
      );
      if (placement) {
        placement.position = action.payload.newPosition;
        state.updatedAt = new Date().toISOString();
      }
    },
    
    rotateFurniture: (
      state,
      action: PayloadAction<{ placementId: string; rotation: number }>
    ) => {
      const placement = state.furniturePlacements.find(
        (p) => p.placementId === action.payload.placementId
      );
      if (placement) {
        placement.rotation = action.payload.rotation;
        state.updatedAt = new Date().toISOString();
      }
    },
    
    removeFurniture: (state, action: PayloadAction<string>) => {
      state.furniturePlacements = state.furniturePlacements.filter(
        (p) => p.placementId !== action.payload
      );
      state.updatedAt = new Date().toISOString();
    },
    
    switchViewMode: (state, action: PayloadAction<'2D'>) => {
      state.viewState.mode = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    
    toggleDimensions: (state) => {
      state.viewState.showDimensions = !state.viewState.showDimensions;
      state.updatedAt = new Date().toISOString();
    },
    
    setRoomImage: (state, action: PayloadAction<RoomImage>) => {
      state.roomImage = action.payload;
      state.updatedAt = new Date().toISOString();
    },
    
    resetDesign: () => initialState,
  },
});

export const {
  setRoomConfig,
  placeFurniture,
  setFurniturePlacements,
  moveFurniture,
  rotateFurniture,
  removeFurniture,
  switchViewMode,
  toggleDimensions,
  setRoomImage,
  resetDesign,
} = designSlice.actions;

export default designSlice.reducer;
