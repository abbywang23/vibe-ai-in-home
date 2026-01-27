// Domain Types based on Domain Model

// Enums
export enum RoomType {
  LIVING_ROOM = 'LIVING_ROOM',
  BEDROOM = 'BEDROOM',
  DINING_ROOM = 'DINING_ROOM',
  HOME_OFFICE = 'HOME_OFFICE',
}

export enum DimensionUnit {
  METERS = 'METERS',
  FEET = 'FEET',
  CENTIMETERS = 'CENTIMETERS',
  INCHES = 'INCHES',
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
  mode: '2D' | '3D';
  cameraAngle: CameraAngle;
  showDimensions: boolean;
  zoomLevel: number;
}

export interface CameraAngle {
  horizontalAngle: number; // 0-360
  verticalAngle: number; // -90 to 90
  preset?: 'front' | 'side' | 'corner' | 'top-down';
}

export interface DetectedFurnitureItem {
  itemId: string;
  furnitureType: string;
  boundingBox: BoundingBox;
  confidence: number;
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
  position: Position3D;
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
  price: Money;
  dimensions: FurnitureDimensions;
  category: string;
  collection: string;
  imageUrl: string;
  thumbnailUrl: string;
  isInStock: boolean;
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
