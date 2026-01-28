// Domain Types based on Domain Model

// Enums
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

export enum SessionStatus {
  STARTED = 'STARTED',
  CONFIGURING = 'CONFIGURING',
  DESIGNING = 'DESIGNING',
  COMPLETED = 'COMPLETED',
}

export enum MessageSender {
  USER = 'USER',
  AI = 'AI',
}

// Value Objects
export interface Money {
  amount: number;
  currency: string; // USD | SGD | AUD | CNY
}

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

export interface FurnitureDimensions {
  width: number;
  depth: number;
  height: number;
  unit: string;
}

export interface Position3D {
  x: number;
  y: number;
  z: number;
}

export interface Position2D {
  x: number;
  y: number;
}

export interface UserPreferences {
  budget: Money | null;
  selectedCategories: string[];
  selectedCollections: string[];
  preferredProducts: string[];
}

export interface UserSettings {
  preferredUnit: DimensionUnit;
  language: string; // 'en' | 'zh'
  hasSeenOnboarding: boolean;
}

export interface ChatMessage {
  messageId: string;
  content: string;
  sender: MessageSender;
  timestamp: string;
  language: string;
}

export interface ViewState {
  mode: '2D';
  showDimensions: boolean;
  zoomLevel: number;
}

// 支持的家具类型（与后端 products.yaml 保持一致）
export type SupportedFurnitureType = 'sofa' | 'table' | 'chair' | 'storage' | 'bed' | 'desk';

export interface DetectedFurnitureItem {
  itemId: string;
  furnitureType: SupportedFurnitureType;
  boundingBox: BoundingBox;
  confidence: number;
  // 新增：已有家具特征（可选，向后兼容）
  style?: 'Modern' | 'Nordic' | 'Classic' | 'Minimalist' | 'Industrial' | 'Contemporary' | 'Traditional' | 'Bohemian' | null;
  material?: string | null;
  color?: string | null;
  sizeBucket?: 'small' | 'medium' | 'large' | null;
  estimatedDimensions?: {
    width: number | null;
    depth: number | null;
    height: number | null;
    unit: 'meters';
    confidence: number; // 0-100
  } | null;
  notes?: string | null;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FurnitureReplacement {
  detectedItemId: string;
  replacementProductId: string;
  replacementProductName: string;
  appliedAt: string;
}

export interface ImageFurniturePlacement {
  placementId: string;
  productId: string;
  productName: string;
  imagePosition: Position2D;
  scale: number;
  rotation: number;
  appliedAt: string;
}

export interface RoomTemplate {
  templateId: string;
  name: string;
  roomType: RoomType;
  dimensions: RoomDimensions;
  thumbnailUrl: string;
}

// Entities
export interface FurniturePlacement {
  placementId: string;
  productId: string;
  productName: string;
  productDimensions: FurnitureDimensions;
  position: Position2D;
  rotation: number;
  isFromAI: boolean;
  addedAt: string;
}

export interface CartItem {
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money;
  thumbnailUrl: string;
  isInStock: boolean;
  addedAt: string;
}

export interface RoomImage {
  imageId: string;
  originalUrl: string;
  processedUrl: string | null;
  detectedFurniture: DetectedFurnitureItem[];
  appliedReplacements: FurnitureReplacement[];
  appliedPlacements: ImageFurniturePlacement[];
  isEmpty: boolean;
  uploadedAt: string;
}

// Aggregates
export interface PlanningSession {
  sessionId: string | null;
  status: SessionStatus;
  preferences: UserPreferences;
  userSettings: UserSettings;
  chatHistory: ChatMessage[];
  roomDesignId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface RoomDesign {
  designId: string | null;
  roomType: RoomType | null;
  roomDimensions: RoomDimensions | null;
  furniturePlacements: FurniturePlacement[];
  roomImage: RoomImage | null;
  viewState: ViewState;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ShoppingCart {
  cartId: string | null;
  sessionId: string | null;
  items: CartItem[];
  createdAt: string | null;
  updatedAt: string | null;
}

// Product Types (from Product Service)
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

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}
