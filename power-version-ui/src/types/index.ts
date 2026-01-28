// Room Types
export type RoomType = 'living_room' | 'bedroom' | 'dining_room' | 'office' | 'kitchen';

// Design Mode
export type DesignMode = 'replace' | 'empty';

// Furniture Category
export type FurnitureCategory = 
  | 'sofa' 
  | 'chair' 
  | 'table' 
  | 'bed' 
  | 'cabinet' 
  | 'shelf' 
  | 'desk'
  | 'lighting';

// Room Setup State
export interface RoomSetup {
  image: File | null;
  imagePreview: string | null;
  roomType: RoomType | null;
  dimensions: {
    width: number;
    height: number;
    length: number;
  };
  mode: DesignMode | null;
}

// Furniture Selection (Path A)
export interface FurnitureSelection {
  categories: FurnitureCategory[];
  budget: number;
  collections: string[];
}

// Style Preferences (Path B)
export interface StylePreferences {
  style: string;
  collections: string[];
}

// Detected Furniture
export interface DetectedFurniture {
  id: string;
  category: FurnitureCategory;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

// Product
export interface Product {
  id: string;
  name: string;
  category: FurnitureCategory;
  price: number;
  imageUrl: string;
  dimensions: {
    width: number;
    height: number;
    depth: number;
  };
  collection: string;
  description?: string;
}

// Rendering Result
export interface RenderingResult {
  imageUrl: string;
  products: Product[];
  detectedFurniture?: DetectedFurniture[];
}

// App State
export interface AppState {
  currentStep: number;
  roomSetup: RoomSetup;
  furnitureSelection: FurnitureSelection;
  stylePreferences: StylePreferences;
  detectedFurniture: DetectedFurniture[];
  renderingResult: RenderingResult | null;
  cart: Product[];
  loading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  imageUrl: string;
  filename: string;
}

export interface DetectionResponse {
  detectedFurniture: DetectedFurniture[];
  imageUrl: string;
}

export interface RenderResponse {
  renderedImageUrl: string;
  products: Product[];
}
