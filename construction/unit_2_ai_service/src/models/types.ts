// Domain Types for AI Service

export enum RoomType {
  LIVING_ROOM = 'living_room',
  BEDROOM = 'bedroom',
  DINING_ROOM = 'dining_room',
  HOME_OFFICE = 'home_office',
}

export enum DimensionUnit {
  METERS = 'meters',
  FEET = 'feet',
  CENTIMETERS = 'centimeters',
  INCHES = 'inches',
}

export enum FurnitureType {
  SOFA = 'sofa',
  TABLE = 'table',
  CHAIR = 'chair',
  BED = 'bed',
  DESK = 'desk',
  STORAGE = 'storage',
}

// Value Objects
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

export interface FurnitureDimensions {
  width: number;
  depth: number;
  height: number;
  unit: string;
}

// Entities
export interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  category: string;
  tags: string[];
  dimensions: FurnitureDimensions;
  inStock: boolean;
  delivery: string;
  externalUrl: string;
}

export interface Recommendation {
  productId: string;
  productName: string;
  position: Position3D;
  rotation: number;
  reasoning: string;
  price: number;
}

// Request/Response Types
export interface RecommendationRequest {
  roomType: RoomType;
  dimensions: RoomDimensions;
  budget?: Money;
  preferences?: {
    selectedCategories?: string[];
    selectedCollections?: string[];
    preferredProducts?: string[];
  };
  language?: string;
}

export interface RecommendationResponse {
  success: boolean;
  recommendations: Recommendation[];
  totalPrice: number;
  budgetExceeded: boolean;
  exceededAmount?: number;
}

export interface ChatRequest {
  sessionId: string;
  message: string;
  language: 'en' | 'zh';
  context: {
    currentDesign?: any;
  };
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  updatedRecommendations?: Recommendation[];
  actions: any[];
}

export interface ProductSearchParams {
  query?: string;
  categories?: string[];
  collections?: string[];
  productIds?: string[];
  maxPrice?: number;
  limit?: number;
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

export interface ProductDetailResponse {
  success: boolean;
  product: Product;
}

// Product Data from YAML (New Format)
export interface ProductOption {
  type: string;
  values: string[];
}

export interface ProductImage {
  url: string;
}

export interface YamlProduct {
  name: string;
  url: string;
  price: string;
  original_price?: string;
  description: string;
  category: string;
  collection: string;
  tag: string;
  delivery: string;
  options: ProductOption[];
  images: ProductImage[];
}

export interface YamlCategory {
  name: string;
  url: string;
  products: YamlProduct[];
}

export interface YamlProductsConfig {
  categories: YamlCategory[];
}

// Legacy format for backward compatibility
export interface ProductData {
  index: number;
  name: string;
  url: string;
  price: string;
  original_price?: string;
  description: string;
  detailed_description?: string;
  tag?: string;
  delivery: string;
  images: Array<{
    url: string;
    local: string;
    alt: string;
  }>;
}

export interface ProductsConfig {
  products: ProductData[];
}
