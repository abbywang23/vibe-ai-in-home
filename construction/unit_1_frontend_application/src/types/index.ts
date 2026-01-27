// Domain Types for Frontend Application

export enum RoomType {
  LIVING_ROOM = 'living_room',
  BEDROOM = 'bedroom',
  DINING_ROOM = 'dining_room',
  HOME_OFFICE = 'home_office',
}

export enum DimensionUnit {
  METERS = 'meters',
  FEET = 'feet',
}

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  dimensions: {
    width: number;
    depth: number;
    height: number;
    unit: string;
  };
  inStock: boolean;
}

export interface Recommendation {
  productId: string;
  productName: string;
  position: Position3D;
  rotation: number;
  reasoning: string;
  price: number;
}

export interface RoomConfig {
  roomType: RoomType;
  dimensions: RoomDimensions;
}

export interface UserPreferences {
  budget?: Money;
  selectedCategories?: string[];
  selectedCollections?: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// API Response Types
export interface RecommendationResponse {
  success: boolean;
  recommendations: Recommendation[];
  totalPrice: number;
  budgetExceeded: boolean;
  exceededAmount?: number;
}

export interface ProductSearchResponse {
  success: boolean;
  products: Product[];
  total: number;
}

export interface CategoryResponse {
  success: boolean;
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  updatedRecommendations?: Recommendation[];
  actions: any[];
}
