# Unit 1: Frontend Application - Domain Model

## Bounded Context: Room Planning Context

The Frontend Application manages the user's room planning session, including room configuration, furniture placement, visualization state, and shopping cart interactions.

---

## Domain Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Room Planning Context                         │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ PlanningSession│   │   RoomDesign  │    │  ShoppingCart │      │
│  │  (Aggregate)  │───▶│  (Aggregate)  │    │  (Aggregate)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                    │               │
│         ▼                   ▼                    ▼               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ UserPreference│   │FurniturePlacement│ │   CartItem    │      │
│  │    (Entity)   │   │    (Entity)   │    │   (Entity)    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Aggregates

### 1. PlanningSession (Aggregate Root)

**Description:** Represents a user's furniture planning session. This is the main entry point for the planning workflow.

**Responsibilities:**
- Manage session lifecycle (start, in-progress, completed)
- Track user preferences (budget, room type, selected categories/collections)
- Coordinate with AI service for recommendations
- Maintain session state for shareable links

**Invariants:**
- Session must have a valid room configuration before requesting recommendations
- Budget amount must be positive if specified
- Only one active room design per session

---

### 2. RoomDesign (Aggregate Root)

**Description:** Represents the room being designed, including its configuration and furniture placements.

**Responsibilities:**
- Manage room dimensions and type
- Track all furniture placements with positions
- Handle visualization state (2D/3D mode, camera angle, dimension display)
- Support undo/redo operations for furniture changes

**Invariants:**
- Room dimensions must be positive and within reasonable ranges
- Furniture positions must be within room boundaries
- Each furniture placement must reference a valid product

---

### 3. ShoppingCart (Aggregate Root)

**Description:** Manages the demo shopping cart for adding furniture items.

**Responsibilities:**
- Add/remove items from cart
- Calculate total price
- Track item quantities
- Validate stock availability (demo)

**Invariants:**
- Cart items must reference valid products
- Quantities must be positive integers
- Total price must equal sum of item prices

---

## Entities

### UserPreference

**Description:** Captures user's furniture preferences within a planning session.

**Attributes:**
- preferenceId: Unique identifier
- budget: Budget value object
- selectedCategories: List of category IDs
- selectedCollections: List of collection IDs
- preferredProducts: List of specific product IDs

---

### FurniturePlacement

**Description:** Represents a single furniture item placed in the room design.

**Attributes:**
- placementId: Unique identifier
- productId: Reference to product in Product Service
- productName: Cached product name for display
- position: Position3D value object
- rotation: Rotation angle in degrees
- isFromAI: Whether this was AI-recommended or manually added

---

### CartItem

**Description:** Represents an item in the shopping cart.

**Attributes:**
- itemId: Unique identifier
- productId: Reference to product
- productName: Product display name
- quantity: Number of items
- unitPrice: Price per item
- thumbnailUrl: Product image URL

---

### RoomImage

**Description:** Represents an uploaded room photo for furniture replacement or placement.

**Attributes:**
- imageId: Unique identifier
- originalUrl: URL of uploaded image
- processedUrl: URL of image with replacements/placements applied
- detectedFurniture: List of detected furniture items
- appliedReplacements: List of replacement mappings
- appliedPlacements: List of furniture placements (for empty rooms)
- isEmpty: Boolean indicating if room has no existing furniture

---

## Value Objects

### RoomDimensions

**Description:** Immutable representation of room size.

**Attributes:**
- length: Numeric value
- width: Numeric value
- height: Numeric value
- unit: DimensionUnit (meters | feet)

**Behaviors:**
- convertTo(targetUnit): Convert dimensions to different unit
- validate(): Ensure dimensions are within reasonable ranges
- calculateArea(): Return floor area
- calculateVolume(): Return room volume

---

### Position3D

**Description:** Immutable 3D position for furniture placement.

**Attributes:**
- x: X coordinate
- y: Y coordinate (height from floor)
- z: Z coordinate

**Behaviors:**
- isWithinBounds(roomDimensions): Check if position is valid for room

---

### Budget

**Description:** Immutable representation of user's budget constraint.

**Attributes:**
- amount: Numeric value
- currency: Currency code (USD | SGD | AUD)

**Behaviors:**
- isExceededBy(totalPrice): Check if total exceeds budget
- getExceededAmount(totalPrice): Calculate how much over budget

---

### ViewState

**Description:** Immutable representation of current visualization state.

**Attributes:**
- mode: ViewMode (2D | 3D)
- cameraAngle: CameraAngle value object
- showDimensions: Boolean
- zoomLevel: Numeric value

---

### CameraAngle

**Description:** Immutable representation of 3D camera position.

**Attributes:**
- horizontalAngle: Degrees (0-360)
- verticalAngle: Degrees (-90 to 90)
- preset: Optional preset name (front | side | corner | top-down)

---

### DimensionUnit

**Description:** Enumeration of supported measurement units.

**Values:**
- METERS
- FEET
- CENTIMETERS
- INCHES

---

### RoomType

**Description:** Enumeration of supported room types.

**Values:**
- LIVING_ROOM
- BEDROOM
- DINING_ROOM
- HOME_OFFICE

---

### ShareableLink

**Description:** Immutable representation of a shareable design link.

**Attributes:**
- linkId: Unique identifier
- url: Full shareable URL
- designSnapshot: Serialized room design state
- createdAt: Timestamp

---

## Domain Events

### SessionStarted
- Triggered when: User starts a new planning session
- Contains: sessionId, timestamp

### RoomConfigured
- Triggered when: User completes room configuration (type, dimensions)
- Contains: sessionId, roomType, dimensions

### PreferencesUpdated
- Triggered when: User updates budget or product preferences
- Contains: sessionId, preferences

### RecommendationsReceived
- Triggered when: AI recommendations are received and applied
- Contains: sessionId, recommendations, totalPrice

### FurniturePlaced
- Triggered when: A furniture item is added to the design
- Contains: designId, placement

### FurnitureRemoved
- Triggered when: A furniture item is removed from the design
- Contains: designId, placementId

### FurnitureMoved
- Triggered when: A furniture item's position is changed
- Contains: designId, placementId, newPosition

### ViewModeChanged
- Triggered when: User switches between 2D and 3D view
- Contains: designId, newMode

### DesignExported
- Triggered when: User exports design as image
- Contains: designId, exportFormat, includesDimensions

### ShareableLinkGenerated
- Triggered when: User generates a shareable link
- Contains: designId, linkId, url

### ItemAddedToCart
- Triggered when: User adds item to cart
- Contains: cartId, productId, quantity

### ItemRemovedFromCart
- Triggered when: User removes item from cart
- Contains: cartId, itemId

### RoomImageUploaded
- Triggered when: User uploads a room photo
- Contains: sessionId, imageId, imageUrl

### FurnitureDetected
- Triggered when: AI detects furniture in uploaded image
- Contains: imageId, detectedItems

### FurnitureReplaced
- Triggered when: User applies furniture replacement
- Contains: imageId, replacements, resultImageUrl

### FurniturePlacedInEmptyRoom
- Triggered when: User places furniture in empty room
- Contains: imageId, placements, resultImageUrl

### EmptyRoomDetected
- Triggered when: AI detects uploaded image has no furniture
- Contains: imageId, roomDimensions

---

## Domain Services

### RoomConfigurationService

**Responsibilities:**
- Validate room dimensions against acceptable ranges
- Provide room templates for each room type
- Convert dimensions between units

**Operations:**
- validateDimensions(dimensions): Validate room size
- getTemplatesForRoomType(roomType): Get preset templates
- convertDimensions(dimensions, targetUnit): Unit conversion

---

### VisualizationService

**Responsibilities:**
- Manage 2D/3D rendering state
- Calculate camera positions for preset angles
- Generate export images with watermark

**Operations:**
- switchViewMode(currentState, newMode): Toggle 2D/3D
- setCameraAngle(currentState, angle): Update camera
- setPresetAngle(currentState, preset): Apply preset angle
- generateExportImage(design, options): Create export image

---

### ShareService

**Responsibilities:**
- Generate unique shareable links
- Serialize/deserialize design state for sharing
- Manage link persistence

**Operations:**
- generateShareableLink(design): Create shareable URL
- loadDesignFromLink(linkId): Restore design from link

---

### CartService

**Responsibilities:**
- Manage cart operations
- Calculate totals
- Validate stock availability

**Operations:**
- addToCart(cart, product, quantity): Add item
- removeFromCart(cart, itemId): Remove item
- calculateTotal(cart): Sum prices
- validateAvailability(cart): Check stock

---

## Repositories

### PlanningSessionRepository

**Operations:**
- save(session): Persist session state
- findById(sessionId): Retrieve session
- findByShareLinkId(linkId): Find session by share link

**Implementation Note:** Uses browser localStorage or sessionStorage for demo

---

### RoomDesignRepository

**Operations:**
- save(design): Persist design state
- findById(designId): Retrieve design
- findBySessionId(sessionId): Get design for session

**Implementation Note:** Uses browser localStorage for demo

---

### ShoppingCartRepository

**Operations:**
- save(cart): Persist cart state
- findById(cartId): Retrieve cart
- findBySessionId(sessionId): Get cart for session

**Implementation Note:** Uses browser localStorage for demo

---

### ShareableLinkRepository

**Operations:**
- save(link): Persist shareable link
- findById(linkId): Retrieve link by ID

**Implementation Note:** May require backend storage for permanent links

---

## Anti-Corruption Layer

### ProductServiceAdapter

**Purpose:** Translate between frontend domain model and Product Service API responses.

**Operations:**
- toFurniturePlacement(productDTO): Convert product to placement
- toCartItem(productDTO): Convert product to cart item
- fetchProductDetails(productId): Get product from API

---

### AIServiceAdapter

**Purpose:** Translate between frontend domain model and AI Service API responses.

**Operations:**
- toRecommendations(aiResponse): Convert AI response to placements
- toDetectedFurniture(detectResponse): Convert detection results
- toReplacementResult(replaceResponse): Convert replacement results
- toPlacementResult(placeResponse): Convert placement results for empty rooms

---

## Context Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    Room Planning Context                         │
│                    (Frontend Application)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│  AI Service Context │         │ Product Catalog     │
│    (Upstream)       │         │    Context          │
│                     │         │    (Upstream)       │
│ - Recommendations   │         │ - Product Details   │
│ - Chat              │         │ - Categories        │
│ - Detection         │         │ - Collections       │
│ - Replacement       │         │ - Pricing           │
└─────────────────────┘         └─────────────────────┘

Relationship: Customer-Supplier (Frontend is Customer)
Integration: Anti-Corruption Layer via Adapters
```
