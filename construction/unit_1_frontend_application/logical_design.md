# Unit 1: Frontend Application - Logical Design

## Overview

The Frontend Application is a React-based web application that provides the user interface for the Castlery Furniture Planner. It manages user interactions, room configuration, 3D/2D visualization, and integrates with AI and Product services.

---

## Technology Stack

### Core Technologies
- **Framework**: React 18+ with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **UI Components**: Material-UI (MUI) v5
- **3D Rendering**: Three.js + React Three Fiber
- **2D Canvas**: Konva.js + React Konva
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form + Zod validation
- **Internationalization**: i18next
- **Build Tool**: Vite

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library
- **Type Checking**: TypeScript 5+

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend Application                         │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Presentation Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Pages   │  │Components│  │  Layouts │  │  Hooks   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Redux   │  │RTK Query │  │ Services │  │  Utils   │   │ │
│  │  │  Store   │  │   APIs   │  │          │  │          │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Domain Layer                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Models  │  │  Types   │  │Validators│  │Constants │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Infrastructure Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │HTTP Client│  │LocalStorage│ │Analytics│  │  Logger  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │  - AI Service    │
                    │    (with Products)│
                    └──────────────────┘
```

---

## Component Architecture

### Page Components

#### 1. HomePage
- **Route**: `/`
- **Purpose**: Landing page with feature overview
- **Components**: Hero, FeatureList, CTAButton

#### 2. PlannerPage
- **Route**: `/planner`
- **Purpose**: Main planning interface
- **Components**: 
  - RoomConfigPanel
  - PreferencesPanel
  - VisualizationCanvas
  - FurnitureList
  - ChatPanel
  - ShoppingCart

#### 3. DesignViewPage
- **Route**: `/design/:linkId`
- **Purpose**: View shared design from link
- **Components**: VisualizationCanvas (read-only)

---

### Feature Components

#### RoomConfigPanel
```typescript
interface RoomConfigPanelProps {
  onConfigComplete: (config: RoomConfiguration) => void;
}
```
- Room type selector
- Dimension inputs with unit toggle
- Room image upload
- Template selector

#### PreferencesPanel
```typescript
interface PreferencesPanelProps {
  onPreferencesChange: (prefs: UserPreferences) => void;
}
```
- Budget input
- Category multi-select
- Collection multi-select
- Product search and select

#### VisualizationCanvas
```typescript
interface VisualizationCanvasProps {
  mode: '2D' | '3D';
  design: RoomDesign;
  onFurnitureSelect: (id: string) => void;
  onFurnitureMove: (id: string, position: Position3D) => void;
  onFurnitureRotate: (id: string, rotation: number) => void;
}
```
- 2D view: Konva canvas with top-down layout
- 3D view: Three.js scene with camera controls
- Furniture drag-and-drop
- Dimension labels toggle
- Camera angle presets

#### FurnitureList
```typescript
interface FurnitureListProps {
  placements: FurniturePlacement[];
  onRemove: (id: string) => void;
  onAddToCart: (id: string) => void;
}
```
- List of placed furniture
- Product thumbnails and names
- Price display
- Remove and add-to-cart actions

#### ChatPanel
```typescript
interface ChatPanelProps {
  sessionId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}
```
- Message history display
- Text input with send button
- Language toggle (EN/ZH)
- Loading indicator for AI responses

#### ShoppingCart
```typescript
interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}
```
- Cart item list
- Quantity controls
- Total price calculation
- Add all from design button
- Checkout button (demo: shows message)

---

## State Management

### Redux Store Structure

```typescript
interface RootState {
  session: SessionState;
  design: DesignState;
  cart: CartState;
  ui: UIState;
}

interface SessionState {
  // Aggregate: PlanningSession
  sessionId: string | null;
  status: SessionStatus; // STARTED | CONFIGURING | DESIGNING | COMPLETED
  preferences: UserPreferences; // Value Object (embedded)
  userSettings: UserSettings; // Value Object (unit, language, hasSeenOnboarding)
  chatHistory: ChatMessage[]; // Value Objects
  roomDesignId: string | null; // ID reference to RoomDesign
  createdAt: string | null;
  updatedAt: string | null;
}

interface UserPreferences {
  // Value Object (not separate entity)
  budget: Money | null; // { amount: number, currency: string }
  selectedCategories: string[];
  selectedCollections: string[];
  preferredProducts: string[];
}

interface UserSettings {
  // Value Object
  preferredUnit: DimensionUnit; // METERS | FEET | CENTIMETERS | INCHES
  language: string; // 'en' | 'zh'
  hasSeenOnboarding: boolean;
}

interface DesignState {
  // Aggregate: RoomDesign
  designId: string | null;
  roomType: RoomType | null; // LIVING_ROOM | BEDROOM | DINING_ROOM | HOME_OFFICE
  roomDimensions: RoomDimensions | null; // Value Object
  furniturePlacements: FurniturePlacement[]; // Entities
  roomImage: RoomImage | null; // Entity (for photo-based visualization)
  viewState: ViewState; // Value Object
  createdAt: string | null;
  updatedAt: string | null;
}

interface RoomDimensions {
  // Value Object
  length: number;
  width: number;
  height: number;
  unit: DimensionUnit;
}

interface FurniturePlacement {
  // Entity within RoomDesign
  placementId: string;
  productId: string;
  productName: string;
  productDimensions: FurnitureDimensions; // Value Object
  position: Position3D; // Value Object
  rotation: number; // 0-360 degrees
  isFromAI: boolean;
  addedAt: string;
}

interface RoomImage {
  // Entity within RoomDesign
  imageId: string;
  originalUrl: string;
  processedUrl: string | null;
  detectedFurniture: DetectedFurnitureItem[]; // Value Objects
  appliedReplacements: FurnitureReplacement[]; // Value Objects
  appliedPlacements: ImageFurniturePlacement[]; // Value Objects (for empty rooms)
  isEmpty: boolean;
  uploadedAt: string;
}

interface ViewState {
  // Value Object
  mode: '2D' | '3D';
  cameraAngle: CameraAngle; // Value Object
  showDimensions: boolean;
  zoomLevel: number; // 0.5 - 3.0
}

interface CartState {
  // Aggregate: ShoppingCart
  cartId: string | null;
  sessionId: string | null; // ID reference to PlanningSession
  items: CartItem[]; // Entities
  createdAt: string | null;
  updatedAt: string | null;
}

interface CartItem {
  // Entity within ShoppingCart
  itemId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: Money; // Value Object
  thumbnailUrl: string;
  isInStock: boolean;
  addedAt: string;
}

interface UIState {
  activePanel: 'config' | 'preferences' | 'chat' | 'cart';
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
}
```

### Redux Slices

#### sessionSlice
**Actions:**
- `startSession()`: Create new session with STARTED status
- `configureRoom(roomType, dimensions)`: Set room config and transition to CONFIGURING
- `updatePreferences(preferences)`: Update user preferences (budget, categories, collections, products)
- `addChatMessage(message, sender)`: Add message to chat history
- `updateUserSettings(settings)`: Update unit preference, language, onboarding status
- `completeSession()`: Mark session as COMPLETED

**Thunks:**
- `requestRecommendations()`: Validate prerequisites and request AI recommendations
- `sendChatMessage(message)`: Send user message to AI and receive response

**Domain Events Emitted:**
- SessionStarted
- RoomConfigured
- BudgetSet, CategoriesSelected, CollectionsSelected, ProductsPreferred
- UserSettingsUpdated
- ChatMessageSent, ChatMessageReceived
- RecommendationsRequested, RecommendationsReceived
- SessionCompleted

---

#### designSlice
**Actions:**
- `setRoomConfig(roomType, dimensions)`: Initialize room design
- `placeFurniture(placement)`: Add furniture with collision check
- `moveFurniture(placementId, newPosition)`: Update furniture position with validation
- `rotateFurniture(placementId, rotation)`: Update furniture rotation
- `removeFurniture(placementId)`: Remove furniture from design
- `switchViewMode(mode)`: Toggle between 2D and 3D
- `setCameraAngle(angle)`: Update 3D camera position
- `setPresetAngle(preset)`: Apply preset camera angle (front, side, corner, top-down)
- `toggleDimensions()`: Show/hide dimension labels
- `setRoomImage(image)`: Attach room photo to design
- `updateImagePlacement(placementId, position, rotation, scale)`: Adjust furniture in empty room image

**Thunks:**
- `uploadRoomImage(file, dimensions)`: Upload and process room photo
- `detectFurniture(imageId)`: Trigger AI furniture detection
- `applyFurnitureReplacement(detectedItemId, replacementProductId)`: Replace detected furniture
- `placeFurnitureInEmptyRoom(productId, imagePosition, rotation, scale)`: Place furniture in empty room photo
- `validateFurnitureFit(furniture, position)`: Check if furniture fits at position

**Domain Events Emitted:**
- FurniturePlaced, FurnitureRemoved, FurnitureMoved, FurnitureRotated
- FurnitureCollisionDetected
- ViewModeChanged, CameraAngleChanged, PresetAngleApplied, DimensionsToggled
- RoomImageUploaded
- FurnitureDetectionStarted, FurnitureDetected, EmptyRoomDetected
- FurnitureReplacementApplied
- FurniturePlacedInImage, ImagePlacementAdjusted, ImagePlacementRemoved

---

#### cartSlice
**Actions:**
- `addItem(product, quantity)`: Add item or increase quantity if exists, validate stock
- `removeItem(itemId)`: Remove item from cart
- `updateQuantity(itemId, quantity)`: Change item quantity (must be positive)
- `clearCart()`: Remove all items

**Thunks:**
- `addAllFromDesign(designId)`: Add all furniture from design to cart
- `validateStock()`: Check availability of all items

**Domain Events Emitted:**
- ItemAddedToCart, ItemRemovedFromCart
- CartQuantityUpdated
- AllItemsAddedToCart
- CartCleared
- OutOfStockItemDetected

---

#### uiSlice
**Actions:**
- `setActivePanel(panel)`: Switch active panel
- `setLoading(isLoading)`: Set loading state
- `setError(error)`: Set error message
- `addNotification(notification)`: Add notification
- `clearNotification(id)`: Remove notification

---

## API Integration (RTK Query)

### AI Service API (with integrated Products)

```typescript
const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/ai' }),
  endpoints: (builder) => ({
    // AI Recommendations
    getRecommendations: builder.mutation<RecommendationResponse, RecommendationRequest>({
      query: (data) => ({
        url: '/recommend',
        method: 'POST',
        body: {
          roomType: data.roomType,
          dimensions: data.dimensions,
          budget: data.budget,
          preferences: data.preferences,
          language: data.language,
        },
      }),
    }),
    
    // AI Chat
    sendChatMessage: builder.mutation<ChatResponse, ChatRequest>({
      query: (data) => ({
        url: '/chat',
        method: 'POST',
        body: {
          message: data.message,
          language: data.language,
          conversationHistory: data.conversationHistory,
          sessionContext: data.sessionContext,
        },
      }),
    }),
    
    // Image Upload
    uploadImage: builder.mutation<UploadResponse, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
    
    // Furniture Detection
    detectFurniture: builder.mutation<DetectionResponse, DetectionRequest>({
      query: (data) => ({
        url: '/detect',
        method: 'POST',
        body: {
          imageUrl: data.imageUrl,
          roomDimensions: data.roomDimensions,
        },
      }),
    }),
    
    // Furniture Replacement (for furnished rooms)
    replaceFurniture: builder.mutation<ReplacementResponse, ReplacementRequest>({
      query: (data) => ({
        url: '/replace',
        method: 'POST',
        body: {
          imageUrl: data.imageUrl,
          detectedItemId: data.detectedItemId,
          replacementProductId: data.replacementProductId,
        },
      }),
    }),
    
    // Furniture Placement (for empty rooms)
    placeFurniture: builder.mutation<PlacementResponse, PlacementRequest>({
      query: (data) => ({
        url: '/place',
        method: 'POST',
        body: {
          imageUrl: data.imageUrl,
          productId: data.productId,
          imagePosition: data.imagePosition,
          rotation: data.rotation,
          scale: data.scale,
        },
      }),
    }),
    
    // Product Search (integrated with AI Service)
    searchProducts: builder.query<ProductListResponse, SearchParams>({
      query: (params) => ({
        url: '/products/search',
        params: {
          query: params.query,
          categories: params.categories,
          collections: params.collections,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
        },
      }),
    }),
    
    // Get Product Details
    getProductById: builder.query<ProductDetailResponse, string>({
      query: (id) => `/products/${id}`,
    }),
    
    // Get Categories
    getCategories: builder.query<CategoryListResponse, void>({
      query: () => '/products/categories',
    }),
    
    // Get Collections
    getCollections: builder.query<CollectionListResponse, void>({
      query: () => '/products/collections',
    }),
    
    // Check Stock
    checkStock: builder.query<StockResponse, { productId: string; quantity: number }>({
      query: ({ productId, quantity }) => ({
        url: `/products/${productId}/stock`,
        params: { quantity },
      }),
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetRecommendationsMutation,
  useSendChatMessageMutation,
  useUploadImageMutation,
  useDetectFurnitureMutation,
  useReplaceFurnitureMutation,
  usePlaceFurnitureMutation,
  useSearchProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetCollectionsQuery,
  useCheckStockQuery,
} = aiApi;
```

### Request/Response Types

```typescript
// Recommendation
interface RecommendationRequest {
  roomType: RoomType;
  dimensions: RoomDimensions;
  budget?: Money;
  preferences: UserPreferences;
  language: string;
}

interface RecommendationResponse {
  recommendations: FurniturePlacement[];
  totalPrice: Money;
  isBudgetExceeded: boolean;
  exceededAmount?: Money;
}

// Chat
interface ChatRequest {
  message: string;
  language: string;
  conversationHistory: ChatMessage[];
  sessionContext: {
    roomType?: RoomType;
    budget?: Money;
    currentDesign?: RoomDesign;
  };
}

interface ChatResponse {
  message: ChatMessage;
  suggestedActions?: {
    type: 'add_furniture' | 'change_budget' | 'view_product';
    data: any;
  }[];
}

// Detection
interface DetectionRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
}

interface DetectionResponse {
  detectedItems: DetectedFurnitureItem[];
  isEmpty: boolean;
  estimatedRoomDimensions?: RoomDimensions;
}

// Replacement
interface ReplacementRequest {
  imageUrl: string;
  detectedItemId: string;
  replacementProductId: string;
}

interface ReplacementResponse {
  processedImageUrl: string;
  replacement: FurnitureReplacement;
}

// Placement
interface PlacementRequest {
  imageUrl: string;
  productId: string;
  imagePosition: Position2D;
  rotation: number;
  scale: number;
}

interface PlacementResponse {
  processedImageUrl: string;
  placement: ImageFurniturePlacement;
}
```

---

## Routing Configuration

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'planner', element: <PlannerPage /> },
      { path: 'design/:linkId', element: <DesignViewPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
```

---

## 3D Visualization (Three.js)

### Scene Setup

```typescript
// Scene components
- Scene: Container for all 3D objects
- Camera: PerspectiveCamera with OrbitControls
- Lights: AmbientLight + DirectionalLight
- Floor: PlaneGeometry with grid texture
- Walls: BoxGeometry for room boundaries
- Furniture: GLTFLoader for 3D models
```

### Camera Presets

```typescript
const CAMERA_PRESETS = {
  front: { position: [0, 5, 10], target: [0, 0, 0] },
  side: { position: [10, 5, 0], target: [0, 0, 0] },
  corner: { position: [7, 7, 7], target: [0, 0, 0] },
  topDown: { position: [0, 15, 0], target: [0, 0, 0] },
};
```

### Furniture Interaction

- Raycasting for click detection
- TransformControls for drag-and-drop
- Bounding box visualization for collision detection
- Rotation handles for orientation adjustment

---

## 2D Visualization (Konva)

### Canvas Layers

```typescript
- Stage: Root container
  - BackgroundLayer: Room outline and grid
  - FurnitureLayer: Furniture shapes (rectangles with images)
  - DimensionLayer: Measurement labels and lines
  - InteractionLayer: Drag handles and selection indicators
```

### Furniture Representation

- Rectangle shape with product thumbnail
- Rotation transformer
- Dimension labels (width × depth)
- Collision detection with other furniture

---

## Domain Services (Frontend Implementation)

### CollisionDetectionService

```typescript
class CollisionDetectionService {
  /**
   * Check if two furniture placements collide
   */
  checkCollision(placement1: FurniturePlacement, placement2: FurniturePlacement): boolean {
    const box1 = this.calculateBoundingBox(placement1);
    const box2 = this.calculateBoundingBox(placement2);
    return this.boxesIntersect(box1, box2);
  }
  
  /**
   * Validate if furniture can be placed at position
   */
  validatePlacement(
    design: RoomDesign,
    furniture: FurniturePlacement,
    position: Position3D
  ): { isValid: boolean; collidingIds: string[] } {
    const collidingIds: string[] = [];
    
    // Check room boundaries
    if (!this.isWithinRoomBounds(position, furniture.productDimensions, design.roomDimensions)) {
      return { isValid: false, collidingIds: [] };
    }
    
    // Check collisions with existing furniture
    for (const existing of design.furniturePlacements) {
      if (this.checkCollision(furniture, existing)) {
        collidingIds.push(existing.placementId);
      }
    }
    
    return {
      isValid: collidingIds.length === 0,
      collidingIds,
    };
  }
  
  private calculateBoundingBox(placement: FurniturePlacement): BoundingBox {
    // Calculate 3D bounding box considering rotation
    // ...implementation
  }
  
  private boxesIntersect(box1: BoundingBox, box2: BoundingBox): boolean {
    // Check if two 3D boxes intersect
    // ...implementation
  }
  
  private isWithinRoomBounds(
    position: Position3D,
    dimensions: FurnitureDimensions,
    roomDimensions: RoomDimensions
  ): boolean {
    // Check if furniture fits within room boundaries
    // ...implementation
  }
}
```

---

### BudgetValidationService

```typescript
class BudgetValidationService {
  /**
   * Validate if selections fit within budget
   */
  validateBudget(
    budget: Money | null,
    placements: FurniturePlacement[]
  ): {
    isValid: boolean;
    total: Money;
    exceededAmount?: Money;
    remainingAmount?: Money;
  } {
    if (!budget) {
      return { isValid: true, total: this.calculateTotal(placements) };
    }
    
    const total = this.calculateTotal(placements);
    const isValid = total.amount <= budget.amount;
    
    if (!isValid) {
      return {
        isValid: false,
        total,
        exceededAmount: {
          amount: total.amount - budget.amount,
          currency: budget.currency,
        },
      };
    }
    
    return {
      isValid: true,
      total,
      remainingAmount: {
        amount: budget.amount - total.amount,
        currency: budget.currency,
      },
    };
  }
  
  /**
   * Calculate total price of all placements
   */
  private calculateTotal(placements: FurniturePlacement[]): Money {
    // Sum up all furniture prices
    // ...implementation
  }
  
  /**
   * Suggest items to remove to meet budget
   */
  suggestBudgetAdjustments(
    budget: Money,
    placements: FurniturePlacement[]
  ): string[] {
    // Return placement IDs to remove
    // ...implementation
  }
}
```

---

### RoomConfigurationService

```typescript
class RoomConfigurationService {
  /**
   * Validate room dimensions
   */
  validateDimensions(
    dimensions: RoomDimensions,
    roomType: RoomType
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const area = dimensions.length * dimensions.width;
    
    // Validate based on room type
    const ranges = this.getRoomTypeRanges(roomType);
    
    if (area < ranges.minArea) {
      errors.push(`Room area too small. Minimum: ${ranges.minArea}m²`);
    }
    
    if (area > ranges.maxArea) {
      errors.push(`Room area too large. Maximum: ${ranges.maxArea}m²`);
    }
    
    if (dimensions.height < 2 || dimensions.height > 6) {
      errors.push('Room height must be between 2-6 meters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
  
  /**
   * Get room templates for room type
   */
  getTemplatesForRoomType(roomType: RoomType): RoomTemplate[] {
    // Return preset templates
    // ...implementation
  }
  
  /**
   * Convert dimensions between units
   */
  convertDimensions(
    dimensions: RoomDimensions,
    targetUnit: DimensionUnit
  ): RoomDimensions {
    // Convert using conversion factors
    // ...implementation
  }
  
  private getRoomTypeRanges(roomType: RoomType) {
    const ranges = {
      LIVING_ROOM: { minArea: 12, maxArea: 50 },
      BEDROOM: { minArea: 9, maxArea: 40 },
      DINING_ROOM: { minArea: 10, maxArea: 35 },
      HOME_OFFICE: { minArea: 6, maxArea: 25 },
    };
    return ranges[roomType];
  }
}
```

---

### ImageProcessingService

```typescript
class ImageProcessingService {
  /**
   * Validate uploaded image
   */
  validateImage(file: File): { isValid: boolean; error?: string } {
    // Check file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return {
        isValid: false,
        error: 'Only JPEG and PNG formats are supported',
      };
    }
    
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB',
      };
    }
    
    return { isValid: true };
  }
  
  /**
   * Prepare image for upload
   */
  async prepareForUpload(file: File): Promise<FormData> {
    const formData = new FormData();
    formData.append('image', file);
    return formData;
  }
  
  /**
   * Apply watermark to exported image (client-side)
   */
  async applyWatermark(imageUrl: string): Promise<string> {
    // Use canvas to add Castlery watermark
    // ...implementation
  }
}
```

---

## Data Flow Examples

### Flow 1: Get AI Recommendations

```
User Input (Room Config + Preferences)
  ↓
sessionSlice.requestRecommendations (thunk)
  ↓
aiApi.getRecommendations (RTK Query)
  ↓
HTTP POST /api/ai/recommend
  ↓
Response: recommendations[]
  ↓
designSlice.setFurniturePlacements (action)
  ↓
VisualizationCanvas re-renders with new furniture
```

### Flow 2: Upload Room Image & Detect Furniture

```
User uploads image
  ↓
designSlice.uploadRoomImage (thunk)
  ↓
Upload to server (returns imageUrl)
  ↓
aiApi.detectFurniture (RTK Query)
  ↓
HTTP POST /api/ai/detect
  ↓
Response: detectedItems[] + isEmpty flag
  ↓
If isEmpty = true:
  - Show empty room placement mode
  - Suggest furniture placements
If isEmpty = false:
  - Show detected furniture list
  - Enable replacement mode
```

### Flow 3: Place Furniture in Empty Room (Updated)

```
User selects furniture from catalog
  ↓
User clicks position in room image
  ↓
User adjusts rotation and scale (optional)
  ↓
designSlice.placeFurnitureInEmptyRoom (thunk)
  ↓
aiApi.placeFurniture (RTK Query)
  ↓
HTTP POST /api/ai/place
  Body: {
    imageUrl,
    productId,
    imagePosition: { x, y },
    rotation: 0-360,
    scale: 0.5-2.0
  }
  ↓
Response: {
  processedImageUrl,
  placement: {
    placementId,
    productId,
    productName,
    imagePosition,
    rotation,
    scale
  }
}
  ↓
Update roomImage.appliedPlacements
Update roomImage.processedUrl
  ↓
Display rendered image with furniture
  ↓
Emit FurniturePlacedInImage event
```

### Flow 4: Adjust Furniture Placement in Empty Room (New)

```
User selects placed furniture in image
  ↓
User drags to new position or rotates
  ↓
designSlice.updateImagePlacement (thunk)
  ↓
aiApi.placeFurniture (RTK Query) - re-render with new params
  ↓
HTTP POST /api/ai/place
  Body: {
    imageUrl: originalUrl,
    productId,
    imagePosition: newPosition,
    rotation: newRotation,
    scale: newScale
  }
  ↓
Response: { processedImageUrl, placement }
  ↓
Update placement in roomImage.appliedPlacements
Update roomImage.processedUrl
  ↓
Display updated image
  ↓
Emit ImagePlacementAdjusted event
```

### Flow 5: Budget Validation (New)

```
User sets budget
  ↓
sessionSlice.updatePreferences (action)
  ↓
Emit BudgetSet event
  ↓
User requests AI recommendations
  ↓
sessionSlice.requestRecommendations (thunk)
  ↓
BudgetValidationService.validateBudget (before API call)
  ↓
aiApi.getRecommendations (RTK Query)
  ↓
Response: { recommendations, totalPrice, isBudgetExceeded, exceededAmount }
  ↓
If isBudgetExceeded:
  - Emit BudgetExceeded event
  - Show warning notification
  - Display exceeded amount
  - Allow user to proceed or adjust
Else:
  - Apply recommendations
  - Show remaining budget
  ↓
Emit RecommendationsReceived event
```

### Flow 6: Collision Detection (New)

```
User drags furniture to new position
  ↓
designSlice.moveFurniture (action with validation)
  ↓
CollisionDetectionService.validatePlacement
  ↓
Check room boundaries
Check collisions with existing furniture
  ↓
If collision detected:
  - Emit FurnitureCollisionDetected event
  - Show error notification
  - Highlight colliding furniture
  - Prevent placement
  - Return furniture to original position
Else:
  - Update furniture position
  - Emit FurnitureMoved event
  - Update visualization
```

### Flow 7: Multi-Language Chat (New)

```
User changes language in settings
  ↓
sessionSlice.updateUserSettings (action)
  ↓
Update userSettings.language
  ↓
Emit UserSettingsUpdated event
  ↓
User sends chat message
  ↓
sessionSlice.sendChatMessage (thunk)
  ↓
aiApi.sendChatMessage (RTK Query)
  Body: {
    message,
    language: userSettings.language,
    conversationHistory,
    sessionContext
  }
  ↓
Response: {
    message: { content, sender: 'AI', language },
    suggestedActions: [...]
  }
  ↓
Add AI message to chatHistory
  ↓
If suggestedActions exist:
  - Parse and display action buttons
  - e.g., "Add this sofa", "View product details"
  ↓
Emit ChatMessageReceived event
```

---

## Local Storage

### Persisted Data

```typescript
interface LocalStorageData {
  // User Settings (persistent across sessions)
  userSettings: {
    preferredUnit: DimensionUnit;
    language: string;
    hasSeenOnboarding: boolean;
  };
  
  // Recent Designs (for quick access)
  recentDesigns: DesignSummary[];
  
  // Shopping Cart (persistent)
  cart: {
    cartId: string;
    items: CartItem[];
    updatedAt: string;
  };
}

interface DesignSummary {
  designId: string;
  roomType: RoomType;
  thumbnailUrl: string;
  furnitureCount: number;
  totalPrice: Money;
  createdAt: string;
}
```

### Storage Keys
- `planner_user_settings`: Unit preference, language, onboarding status
- `planner_recent_designs`: Last 5 designs (for quick access)
- `planner_cart`: Shopping cart items (persistent across sessions)

### Session Storage (Temporary)
- `planner_session_id`: Current session ID (cleared on tab close)
- `planner_current_design`: Current design state (cleared on tab close)

### Storage Utilities

```typescript
class StorageService {
  // User Settings
  saveUserSettings(settings: UserSettings): void {
    localStorage.setItem('planner_user_settings', JSON.stringify(settings));
  }
  
  loadUserSettings(): UserSettings | null {
    const data = localStorage.getItem('planner_user_settings');
    return data ? JSON.parse(data) : null;
  }
  
  // Recent Designs
  saveRecentDesign(design: DesignSummary): void {
    const recent = this.loadRecentDesigns();
    recent.unshift(design);
    const limited = recent.slice(0, 5); // Keep only last 5
    localStorage.setItem('planner_recent_designs', JSON.stringify(limited));
  }
  
  loadRecentDesigns(): DesignSummary[] {
    const data = localStorage.getItem('planner_recent_designs');
    return data ? JSON.parse(data) : [];
  }
  
  // Shopping Cart
  saveCart(cart: CartState): void {
    localStorage.setItem('planner_cart', JSON.stringify(cart));
  }
  
  loadCart(): CartState | null {
    const data = localStorage.getItem('planner_cart');
    return data ? JSON.parse(data) : null;
  }
  
  // Session (temporary)
  saveSessionId(sessionId: string): void {
    sessionStorage.setItem('planner_session_id', sessionId);
  }
  
  loadSessionId(): string | null {
    return sessionStorage.getItem('planner_session_id');
  }
  
  // Storage quota check
  checkStorageQuota(): { used: number; available: number; percentage: number } {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return navigator.storage.estimate().then(estimate => ({
        used: estimate.usage || 0,
        available: estimate.quota || 0,
        percentage: ((estimate.usage || 0) / (estimate.quota || 1)) * 100,
      }));
    }
    return { used: 0, available: 0, percentage: 0 };
  }
}
```

---

## Error Handling

### Error Boundaries

```typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <PlannerPage />
</ErrorBoundary>
```

### API Error Handling

```typescript
try {
  const result = await dispatch(requestRecommendations(config)).unwrap();
  
  // Check budget exceeded
  if (result.isBudgetExceeded) {
    dispatch(addNotification({
      type: 'warning',
      message: `Budget exceeded by ${formatMoney(result.exceededAmount)}`,
      action: {
        label: 'Adjust Budget',
        onClick: () => dispatch(setActivePanel('preferences')),
      },
    }));
  }
} catch (error) {
  // Handle different error types
  if (error.status === 503) {
    dispatch(addNotification({
      type: 'error',
      message: 'AI service temporarily unavailable. Please try again.',
      duration: 5000,
    }));
    // Emit AIServiceUnavailable event
    eventBus.emit('AIServiceUnavailable', { timestamp: Date.now() });
  } else if (error.status === 400) {
    dispatch(addNotification({
      type: 'error',
      message: 'Invalid request. Please check your input.',
    }));
  } else {
    dispatch(addNotification({
      type: 'error',
      message: 'An unexpected error occurred. Please try again.',
    }));
  }
}
```

### Collision Detection Error Handling

```typescript
try {
  const validation = collisionDetectionService.validatePlacement(
    design,
    furniture,
    position
  );
  
  if (!validation.isValid) {
    if (validation.collidingIds.length > 0) {
      // Emit collision event
      eventBus.emit('FurnitureCollisionDetected', {
        attemptedPlacement: furniture,
        collidingPlacementIds: validation.collidingIds,
      });
      
      dispatch(addNotification({
        type: 'warning',
        message: 'Furniture collides with existing items',
        action: {
          label: 'Highlight',
          onClick: () => highlightFurniture(validation.collidingIds),
        },
      }));
    } else {
      dispatch(addNotification({
        type: 'warning',
        message: 'Furniture does not fit within room boundaries',
      }));
    }
    return false;
  }
  
  return true;
} catch (error) {
  console.error('Collision detection error:', error);
  return false;
}
```

### Image Upload Error Handling

```typescript
try {
  const validation = imageProcessingService.validateImage(file);
  
  if (!validation.isValid) {
    // Emit ImageUploadFailed event
    eventBus.emit('ImageUploadFailed', {
      errorReason: validation.error,
      fileSize: file.size,
      fileType: file.type,
    });
    
    dispatch(addNotification({
      type: 'error',
      message: validation.error,
      action: {
        label: 'Try Again',
        onClick: () => openFileDialog(),
      },
    }));
    return;
  }
  
  // Proceed with upload
  const formData = await imageProcessingService.prepareForUpload(file);
  const result = await dispatch(uploadRoomImage(formData)).unwrap();
  
} catch (error) {
  eventBus.emit('ImageUploadFailed', {
    errorReason: 'Upload failed',
    fileSize: file.size,
    fileType: file.type,
  });
  
  dispatch(addNotification({
    type: 'error',
    message: 'Failed to upload image. Please try again.',
  }));
}
```

### User-Friendly Error Messages

| Error Code | User Message | Suggested Action |
|------------|--------------|------------------|
| `INVALID_REQUEST` | Please check your input and try again | Review form fields |
| `SERVICE_UNAVAILABLE` | Service temporarily unavailable. Please try again in a moment | Retry button |
| `NOT_FOUND` | The requested item was not found | Go back |
| `NETWORK_ERROR` | Network connection issue. Please check your internet | Retry button |
| `BUDGET_EXCEEDED` | Your selections exceed the budget by $XXX | Adjust budget or remove items |
| `COLLISION_DETECTED` | Furniture collides with existing items | Highlight colliding items |
| `OUT_OF_BOUNDS` | Furniture does not fit within room boundaries | Adjust position |
| `IMAGE_TOO_LARGE` | Image file size must be less than 10MB | Compress image |
| `INVALID_IMAGE_FORMAT` | Only JPEG and PNG formats are supported | Convert image |
| `OUT_OF_STOCK` | This product is currently out of stock | View alternatives |

---

## Internationalization (i18n)

### Language Files

```
/src/locales/
  en/
    common.json
    planner.json
    errors.json
  zh/
    common.json
    planner.json
    errors.json
```

### Usage Example

```typescript
import { useTranslation } from 'react-i18next';

function RoomConfigPanel() {
  const { t } = useTranslation('planner');
  
  return (
    <div>
      <h2>{t('roomConfig.title')}</h2>
      <label>{t('roomConfig.roomType')}</label>
    </div>
  );
}
```

---

## Performance Optimization

### Code Splitting

```typescript
const PlannerPage = lazy(() => import('./pages/PlannerPage'));
const DesignViewPage = lazy(() => import('./pages/DesignViewPage'));
```

### Memoization

```typescript
const MemoizedVisualizationCanvas = memo(VisualizationCanvas);
const furniturePlacements = useMemo(() => 
  design.placements.filter(p => p.isVisible), 
  [design.placements]
);
```

### Virtual Scrolling

- Use `react-window` for long furniture lists
- Lazy load product images with `react-lazy-load-image-component`

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
describe('sessionSlice', () => {
  it('should start a new session', () => {
    const state = sessionReducer(undefined, startSession());
    expect(state.sessionId).toBeDefined();
    expect(state.status).toBe('STARTED');
  });
});
```

### Component Tests (React Testing Library)

```typescript
describe('RoomConfigPanel', () => {
  it('should call onConfigComplete when form is submitted', async () => {
    const onConfigComplete = vi.fn();
    render(<RoomConfigPanel onConfigComplete={onConfigComplete} />);
    
    // Fill form and submit
    await userEvent.selectOptions(screen.getByLabelText('Room Type'), 'living_room');
    await userEvent.type(screen.getByLabelText('Length'), '5');
    await userEvent.click(screen.getByText('Continue'));
    
    expect(onConfigComplete).toHaveBeenCalledWith({
      roomType: 'living_room',
      dimensions: { length: 5, width: 0, height: 0, unit: 'meters' },
    });
  });
});
```

### E2E Tests (Playwright - Optional)

```typescript
test('complete planning flow', async ({ page }) => {
  await page.goto('/planner');
  await page.selectOption('[name="roomType"]', 'living_room');
  await page.fill('[name="length"]', '5');
  await page.fill('[name="width"]', '4');
  await page.click('button:has-text("Get Recommendations")');
  await expect(page.locator('.furniture-item')).toHaveCount(5);
});
```

---

## Build & Deployment

### Development

```bash
npm install
npm run dev  # Starts Vite dev server on http://localhost:5173
```

### Production Build

```bash
npm run build  # Outputs to /dist
npm run preview  # Preview production build
```

### Environment Variables

```env
VITE_AI_SERVICE_URL=http://localhost:3001/api/ai
VITE_IMAGE_UPLOAD_URL=http://localhost:3001/api/upload
```

### Deployment Options

#### Demo Deployment
- **Platform**: Vercel / Netlify
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment**: Set API URLs to deployed backend services

#### Production Deployment
- **Platform**: AWS S3 + CloudFront
- **CI/CD**: GitHub Actions
- **CDN**: CloudFront for static assets
- **API Proxy**: CloudFront origin for backend APIs

---

## Security Considerations

### Input Validation

- Validate all user inputs with Zod schemas
- Sanitize file uploads (image type, size limits)
- Prevent XSS with React's built-in escaping

### API Security

- Use HTTPS for all API calls
- Implement CORS policies on backend
- Rate limiting on API endpoints

### Data Privacy

- No sensitive user data stored
- Session data in memory only
- Clear session on browser close

---

## Accessibility (a11y)

### WCAG 2.1 AA Compliance

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- Focus indicators
- Color contrast ratios ≥ 4.5:1
- Alt text for images
- Screen reader announcements for dynamic content

### Example

```typescript
<button
  aria-label="Add furniture to cart"
  onClick={handleAddToCart}
>
  <ShoppingCartIcon aria-hidden="true" />
  Add to Cart
</button>
```

---

## Monitoring & Analytics

### Error Tracking (Demo)

```typescript
console.error('Error:', error);
```

### Analytics Events (Demo)

```typescript
const trackEvent = (eventName: string, properties: object) => {
  console.log('Analytics:', eventName, properties);
};

// Usage
trackEvent('furniture_placed', { productId, roomType });
```

### Production Monitoring

- Sentry for error tracking
- Google Analytics for user behavior
- Performance monitoring with Web Vitals

---

## Future Enhancements

### Phase 2 Features
- User accounts and saved designs
- Collaborative design sharing
- Mobile responsive design
- Touch gestures for 3D navigation

### Phase 3 Features
- AR view (mobile)
- VR support (WebXR)
- Real-time collaboration
- Advanced lighting simulation

---

## Dependencies

### Core Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.20.0",
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "@mui/material": "^5.15.0",
  "@emotion/react": "^11.11.0",
  "@emotion/styled": "^11.11.0",
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.92.0",
  "konva": "^9.3.0",
  "react-konva": "^18.2.0",
  "axios": "^1.6.0",
  "react-hook-form": "^7.49.0",
  "zod": "^3.22.0",
  "i18next": "^23.7.0",
  "react-i18next": "^14.0.0"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.3.0",
  "vite": "^5.0.0",
  "@vitejs/plugin-react": "^4.2.0",
  "vitest": "^1.1.0",
  "@testing-library/react": "^14.1.0",
  "@testing-library/user-event": "^14.5.0",
  "eslint": "^8.56.0",
  "prettier": "^3.1.0"
}
```

---

## Project Structure

```
/src
  /assets          # Images, fonts, icons
  /components      # Reusable UI components
    /common        # Button, Input, Modal, etc.
    /features      # RoomConfigPanel, ChatPanel, etc.
  /pages           # Page components
  /store           # Redux store and slices
  /services        # API services (RTK Query)
  /hooks           # Custom React hooks
  /utils           # Utility functions
  /types           # TypeScript type definitions
  /locales         # i18n translation files
  /constants       # App constants
  App.tsx          # Root component
  main.tsx         # Entry point
  router.tsx       # Route configuration
```

---

## Summary

The Frontend Application is built with modern React best practices, providing a responsive and intuitive user interface for furniture planning. It leverages Redux for state management, RTK Query for API integration, and Three.js/Konva for rich 2D/3D visualizations. The architecture is modular, testable, and ready for both demo and production deployment.
