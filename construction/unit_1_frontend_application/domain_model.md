# Unit 1: Frontend Application - Domain Model

## Bounded Context: Room Planning Context

The Frontend Application manages the user's room planning session, including room configuration, furniture placement, visualization state, and shopping cart interactions.

---

## Domain Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Room Planning Context (Frontend)                      │
│                                                                          │
│  ┌──────────────────┐         ┌──────────────────┐                      │
│  │ PlanningSession  │         │   RoomDesign     │                      │
│  │   (Aggregate)    │─ ref ──▶│   (Aggregate)    │                      │
│  └──────────────────┘         └──────────────────┘                      │
│  │ sessionId        │         │ designId         │                      │
│  │ status           │         │ roomDimensions   │                      │
│  │ preferences (VO) │         │ roomType         │                      │
│  │ chatHistory      │         │ placements[]     │                      │
│  │ roomDesignId     │         │ roomImage        │                      │
│  │ userSettings     │         │ viewState        │                      │
│  └──────────────────┘         └──────────────────┘                      │
│                                                                          │
│  ┌──────────────────┐                                                    │
│  │  ShoppingCart    │                                                    │
│  │   (Aggregate)    │                                                    │
│  └──────────────────┘                                                    │
│  │ cartId           │                                                    │
│  │ sessionId        │                                                    │
│  │ items[]          │                                                    │
│  └──────────────────┘                                                    │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Aggregates

### 1. PlanningSession (Aggregate Root)

**Description:** Represents a user's furniture planning session. This is the main entry point for the planning workflow.

**Attributes:**
- sessionId: Unique identifier
- status: SessionStatus value object (STARTED | CONFIGURING | DESIGNING | COMPLETED)
- preferences: UserPreferences value object (embedded, not separate entity)
- chatHistory: List of ChatMessage value objects
- userSettings: UserSettings value object (unit preference, language, etc.)
- roomDesignId: Reference to associated RoomDesign (ID reference, not object)
- createdAt: Timestamp
- updatedAt: Timestamp

**Responsibilities:**
- Manage session lifecycle (start, in-progress, completed)
- Track user preferences (budget, room type, selected categories/collections)
- Maintain AI chat conversation history
- Coordinate with AI service for recommendations
- Persist user settings (unit preference, language)
- Maintain session state for shareable links

**Invariants:**
- Session must have a valid room configuration before requesting recommendations
- Budget amount must be positive if specified
- Only one active room design per session
- Status transitions must follow valid flow: STARTED → CONFIGURING → DESIGNING → COMPLETED
- Chat history must be ordered chronologically

**Factory Methods:**
- `PlanningSession.start(userSettings)`: Create new session with STARTED status

**Behaviors:**
- `configureRoom(roomType, dimensions)`: Set room configuration and transition to CONFIGURING
- `updatePreferences(preferences)`: Update user preferences (budget, categories, collections, products)
- `addChatMessage(message, sender)`: Add message to chat history
- `requestRecommendations()`: Validate prerequisites and request AI recommendations
- `updateUserSettings(settings)`: Update unit preference, language, etc.
- `complete()`: Mark session as completed
- `canRequestRecommendations()`: Check if room is configured and ready

---

### 2. RoomDesign (Aggregate Root)

**Description:** Represents the room being designed, including its configuration, furniture placements, and optional room image for visualization.

**Attributes:**
- designId: Unique identifier
- roomDimensions: RoomDimensions value object
- roomType: RoomType enum (LIVING_ROOM | BEDROOM | DINING_ROOM | HOME_OFFICE)
- furniturePlacements: List of FurniturePlacement entities
- roomImage: Optional RoomImage entity (for photo-based visualization)
- viewState: ViewState value object (2D/3D mode, camera, dimensions display)
- createdAt: Timestamp
- updatedAt: Timestamp

**Responsibilities:**
- Manage room dimensions and type
- Track all furniture placements with positions and rotations
- Handle visualization state (2D/3D mode, camera angle, dimension display)
- Support undo/redo operations for furniture changes
- Manage uploaded room images for furniture detection/replacement/placement
- Validate furniture fits within room boundaries
- Detect and prevent furniture collisions

**Invariants:**
- Room dimensions must be positive and within reasonable ranges
- Furniture positions must be within room boundaries
- Each furniture placement must reference a valid product
- Furniture items cannot overlap (collision detection required)
- Furniture must be placed on the floor (y coordinate ≥ 0)
- Only one room image per design
- If room image exists and isEmpty=true, only placement mode is allowed
- If room image exists and isEmpty=false, both replacement and placement modes are allowed

**Factory Methods:**
- `RoomDesign.create(roomType, dimensions)`: Create new room design
- `RoomDesign.createFromTemplate(template)`: Create from preset template

**Behaviors:**
- `placeFurniture(product, position, rotation, isFromAI)`: Add furniture with collision check
- `moveFurniture(placementId, newPosition)`: Update furniture position with validation
- `rotateFurniture(placementId, rotation)`: Update furniture rotation
- `removeFurniture(placementId)`: Remove furniture from design
- `switchViewMode(mode)`: Toggle between 2D and 3D view
- `setCameraAngle(angle)`: Update 3D camera position
- `setPresetAngle(preset)`: Apply preset camera angle (front, side, corner, top-down)
- `toggleDimensions()`: Show/hide dimension labels
- `uploadRoomImage(image, dimensions)`: Attach room photo to design
- `detectFurnitureInImage()`: Trigger AI furniture detection
- `applyFurnitureReplacement(detectedItemId, replacementProductId)`: Replace detected furniture
- `placeFurnitureInEmptyRoom(productId, position)`: Place furniture in empty room photo
- `validateFurnitureFit(furniture, position)`: Check if furniture fits at position
- `checkCollision(placement1, placement2)`: Detect furniture overlap
- `calculateTotalPrice()`: Sum prices of all placed furniture

---

### 3. ShoppingCart (Aggregate Root)

**Description:** Manages the shopping cart for adding furniture items from the design.

**Attributes:**
- cartId: Unique identifier
- sessionId: Reference to planning session (ID reference)
- items: List of CartItem entities
- createdAt: Timestamp
- updatedAt: Timestamp

**Responsibilities:**
- Add/remove items from cart
- Calculate total price
- Track item quantities
- Validate stock availability before adding
- Prevent duplicate items (merge quantities instead)
- Integrate with Castlery website shopping cart

**Invariants:**
- Cart items must reference valid products
- Quantities must be positive integers
- Total price must equal sum of item prices (quantity × unitPrice)
- Each product can only appear once (with quantity ≥ 1)
- Cannot add out-of-stock items to cart

**Factory Methods:**
- `ShoppingCart.create(sessionId)`: Create new cart for session

**Behaviors:**
- `addItem(product, quantity)`: Add item or increase quantity if exists, validate stock
- `addAllFromDesign(design)`: Add all furniture from design to cart
- `removeItem(itemId)`: Remove item from cart
- `updateQuantity(itemId, quantity)`: Change item quantity (must be positive)
- `calculateTotal()`: Sum all item prices (quantity × unitPrice)
- `clear()`: Remove all items
- `validateStock()`: Check availability of all items
- `getItemCount()`: Return total number of items
- `hasItem(productId)`: Check if product is already in cart

---

## Entities

### FurniturePlacement

**Description:** Represents a single furniture item placed in the room design. Part of RoomDesign aggregate.

**Attributes:**
- placementId: Unique identifier
- productId: Reference to product in Product Service
- productName: Cached product name for display
- productDimensions: FurnitureDimensions value object
- position: Position3D value object
- rotation: Rotation angle in degrees (0-360)
- isFromAI: Whether this was AI-recommended or manually added
- addedAt: Timestamp

**Behaviors:**
- `moveTo(newPosition)`: Update position
- `rotateTo(angle)`: Update rotation
- `getBoundingBox()`: Calculate occupied space for collision detection

---

### CartItem

**Description:** Represents an item in the shopping cart. Part of ShoppingCart aggregate.

**Attributes:**
- itemId: Unique identifier
- productId: Reference to product
- productName: Product display name
- quantity: Number of items (positive integer)
- unitPrice: Money value object
- thumbnailUrl: Product image URL
- isInStock: Stock availability status
- addedAt: Timestamp

**Behaviors:**
- `increaseQuantity(amount)`: Add to quantity
- `decreaseQuantity(amount)`: Subtract from quantity (must remain positive)
- `getSubtotal()`: Calculate quantity × unitPrice

---

### RoomImage

**Description:** Represents an uploaded room photo for furniture replacement or placement. Part of RoomDesign aggregate.

**Attributes:**
- imageId: Unique identifier
- originalUrl: URL of uploaded image
- processedUrl: Optional URL of image with replacements/placements applied
- detectedFurniture: List of DetectedFurnitureItem value objects
- appliedReplacements: List of FurnitureReplacement value objects
- appliedPlacements: List of ImageFurniturePlacement value objects (for empty rooms)
- isEmpty: Boolean indicating if room has no existing furniture
- uploadedAt: Timestamp

**Behaviors:**
- `applyDetection(detectedItems, isEmpty)`: Store AI detection results
- `applyReplacement(detectedItemId, replacementProductId)`: Add replacement mapping
- `applyPlacement(productId, imagePosition, rotation, scale)`: Add furniture placement for empty room
- `updatePlacement(placementId, newPosition, newRotation, newScale)`: Update existing placement (for US-4.5 adjustment)
- `removePlacement(placementId)`: Remove furniture placement from empty room
- `getProcessedImage()`: Return image with replacements/placements applied
- `clearReplacements()`: Remove all replacements
- `clearPlacements()`: Remove all placements

---

## Value Objects

### UserPreferences

**Description:** Immutable representation of user's furniture preferences. Embedded in PlanningSession (not a separate entity).

**Attributes:**
- budget: Optional Money value object
- selectedCategories: List of category IDs
- selectedCollections: List of collection IDs
- preferredProducts: List of specific product IDs

**Behaviors:**
- `withBudget(budget)`: Create new preferences with updated budget
- `withCategories(categories)`: Create new preferences with categories
- `withCollections(collections)`: Create new preferences with collections
- `withProducts(products)`: Create new preferences with products
- `isEmpty()`: Check if any preferences are set
- `hasCategory(categoryId)`: Check if category is selected
- `hasCollection(collectionId)`: Check if collection is selected

---

### UserSettings

**Description:** Immutable representation of user's application settings. Embedded in PlanningSession.

**Attributes:**
- preferredUnit: DimensionUnit (METERS | FEET | CENTIMETERS | INCHES)
- language: Language code (en | zh | etc.)
- hasSeenOnboarding: Boolean

**Behaviors:**
- `withUnit(unit)`: Create new settings with updated unit
- `withLanguage(language)`: Create new settings with language
- `markOnboardingComplete()`: Set hasSeenOnboarding to true

---

### Money

**Description:** Immutable representation of monetary amount.

**Attributes:**
- amount: Numeric value (decimal, non-negative)
- currency: Currency code (USD | SGD | AUD | CNY)

**Behaviors:**
- `add(other)`: Add two money values (must be same currency)
- `subtract(other)`: Subtract money values (must be same currency)
- `multiply(factor)`: Multiply by numeric factor
- `isGreaterThan(other)`: Compare amounts
- `isLessThan(other)`: Compare amounts
- `format()`: Return formatted string (e.g., "$1,234.56", "¥1,234")

**Invariants:**
- Amount must be non-negative
- Currency must be valid ISO code
- Operations require matching currencies

---

### RoomDimensions

**Description:** Immutable representation of room size.

**Attributes:**
- length: Numeric value (positive)
- width: Numeric value (positive)
- height: Numeric value (positive)
- unit: DimensionUnit

**Behaviors:**
- `convertTo(targetUnit)`: Convert dimensions to different unit
- `validate()`: Ensure dimensions are within reasonable ranges
- `calculateArea()`: Return floor area (length × width)
- `calculateVolume()`: Return room volume (length × width × height)
- `isWithinRange(min, max)`: Check if dimensions are valid

**Validation Rules:**
- Length: 2-50 meters (6-164 feet)
- Width: 2-50 meters (6-164 feet)
- Height: 2-6 meters (6-20 feet)

---

### FurnitureDimensions

**Description:** Immutable representation of furniture size.

**Attributes:**
- length: Numeric value (positive)
- width: Numeric value (positive)
- height: Numeric value (positive)
- unit: DimensionUnit

**Behaviors:**
- `convertTo(targetUnit)`: Convert to different unit
- `getBoundingBox()`: Return 3D bounding box
- `fitsInRoom(roomDimensions)`: Check if furniture can fit in room
- `collidesWith(otherDimensions, position1, position2)`: Check collision with another furniture

---

### Position3D

**Description:** Immutable 3D position for furniture placement.

**Attributes:**
- x: X coordinate (horizontal, left-right)
- y: Y coordinate (vertical, height from floor, must be ≥ 0)
- z: Z coordinate (horizontal, front-back)

**Behaviors:**
- `isWithinBounds(roomDimensions)`: Check if position is valid for room
- `distanceTo(otherPosition)`: Calculate distance between positions
- `translate(dx, dy, dz)`: Create new position with offset

---

### Budget

**Description:** Immutable representation of user's budget constraint with comparison capabilities.

**Attributes:**
- amount: Money value object

**Behaviors:**
- `isExceededBy(totalPrice)`: Check if total exceeds budget
- `getExceededAmount(totalPrice)`: Calculate how much over budget (returns Money)
- `getRemainingAmount(totalPrice)`: Calculate remaining budget (returns Money)
- `canAfford(price)`: Check if price is within budget

---

### ViewState

**Description:** Immutable representation of current visualization state.

**Attributes:**
- mode: ViewMode enum (2D | 3D)
- cameraAngle: CameraAngle value object
- showDimensions: Boolean
- zoomLevel: Numeric value (0.5 - 3.0)

**Behaviors:**
- `switchMode()`: Toggle between 2D and 3D
- `withCameraAngle(angle)`: Create new state with updated camera
- `toggleDimensions()`: Create new state with dimensions toggled
- `zoom(factor)`: Create new state with adjusted zoom

---

### CameraAngle

**Description:** Immutable representation of 3D camera position.

**Attributes:**
- horizontalAngle: Degrees (0-360)
- verticalAngle: Degrees (-90 to 90)
- preset: Optional preset name (front | side | corner | top-down)

**Behaviors:**
- `rotate(deltaH, deltaV)`: Create new angle with rotation applied
- `applyPreset(presetName)`: Create angle from preset
- `isTopDown()`: Check if viewing from above

**Preset Angles:**
- front: (0°, 0°)
- side: (90°, 0°)
- corner: (45°, 30°)
- top-down: (0°, 90°)

---

### ChatMessage

**Description:** Immutable representation of a chat message in AI conversation.

**Attributes:**
- messageId: Unique identifier
- content: Message text
- sender: MessageSender enum (USER | AI)
- timestamp: When message was sent
- language: Language code (en | zh | etc.)

**Behaviors:**
- `isFromUser()`: Check if message is from user
- `isFromAI()`: Check if message is from AI

---

### SessionStatus

**Description:** Enumeration of session lifecycle states.

**Values:**
- STARTED: Session created, awaiting room configuration
- CONFIGURING: User is setting up room preferences
- DESIGNING: User is placing/arranging furniture
- COMPLETED: Session finished, design finalized

**Transitions:**
- STARTED → CONFIGURING (when room type/dimensions set)
- CONFIGURING → DESIGNING (when preferences submitted or AI recommendations received)
- DESIGNING → COMPLETED (when user finalizes design)

---

### DimensionUnit

**Description:** Enumeration of supported measurement units.

**Values:**
- METERS
- FEET
- CENTIMETERS
- INCHES

**Conversion Factors:**
- 1 meter = 3.28084 feet
- 1 meter = 100 centimeters
- 1 foot = 12 inches

---

### RoomType

**Description:** Enumeration of supported room types.

**Values:**
- LIVING_ROOM
- BEDROOM
- DINING_ROOM
- HOME_OFFICE

---

### MessageSender

**Description:** Enumeration of chat message senders.

**Values:**
- USER: Message from user
- AI: Message from AI assistant

---

### DetectedFurnitureItem

**Description:** Immutable representation of AI-detected furniture in uploaded image.

**Attributes:**
- itemId: Unique identifier
- furnitureType: String (e.g., "sofa", "table", "chair")
- boundingBox: BoundingBox value object
- confidence: Numeric value (0.0 - 1.0)

---

### FurnitureReplacement

**Description:** Immutable representation of furniture replacement mapping.

**Attributes:**
- detectedItemId: Reference to detected furniture
- replacementProductId: Product ID from catalog
- replacementProductName: Product name
- appliedAt: Timestamp

---

### ImageFurniturePlacement

**Description:** Immutable representation of furniture placed in empty room image.

**Attributes:**
- placementId: Unique identifier
- productId: Product ID from catalog
- productName: Product name
- imagePosition: Position2D value object (x, y coordinates in image)
- scale: Scale factor for rendering
- rotation: Rotation angle in degrees (0-360) for orientation adjustment
- appliedAt: Timestamp

**Behaviors:**
- `moveTo(newPosition)`: Create new placement with updated position
- `rotateTo(angle)`: Create new placement with updated rotation
- `scaleTo(factor)`: Create new placement with updated scale

---

### BoundingBox

**Description:** Immutable representation of rectangular area in image.

**Attributes:**
- x: X coordinate (top-left)
- y: Y coordinate (top-left)
- width: Box width
- height: Box height

**Behaviors:**
- `contains(point)`: Check if point is inside box
- `intersects(otherBox)`: Check if boxes overlap

---

### Position2D

**Description:** Immutable 2D position for image-based furniture placement.

**Attributes:**
- x: X coordinate in image
- y: Y coordinate in image

**Behaviors:**
- `translate(dx, dy)`: Create new position with offset

---

### ShareableLink

**Description:** Immutable representation of a shareable design link.

**Attributes:**
- linkId: Unique identifier (short hash)
- url: Full shareable URL
- designSnapshot: Serialized room design state
- createdAt: Timestamp
- expiresAt: Optional expiration timestamp

**Behaviors:**
- `isExpired()`: Check if link has expired
- `getFullUrl(baseUrl)`: Generate complete shareable URL

---

### RoomTemplate

**Description:** Immutable representation of a preset room template.

**Attributes:**
- templateId: Unique identifier
- name: Template name
- roomType: RoomType
- dimensions: RoomDimensions
- thumbnailUrl: Preview image URL

**Behaviors:**
- `toDimensions()`: Extract RoomDimensions from template

---

## Domain Events

### Session Lifecycle Events

#### SessionStarted
- **Triggered when:** User starts a new planning session
- **Contains:** sessionId, userSettings, timestamp

#### RoomConfigured
- **Triggered when:** User completes room configuration (type, dimensions)
- **Contains:** sessionId, roomType, dimensions, timestamp

#### SessionCompleted
- **Triggered when:** User finalizes the design session
- **Contains:** sessionId, designId, timestamp

---

### Preference Events

#### BudgetSet
- **Triggered when:** User sets or changes budget
- **Contains:** sessionId, budget (Money), timestamp

#### BudgetExceeded
- **Triggered when:** AI recommendations or user selections exceed budget
- **Contains:** sessionId, budget, totalPrice, exceededAmount, timestamp

#### CategoriesSelected
- **Triggered when:** User selects furniture categories
- **Contains:** sessionId, selectedCategories, timestamp

#### CollectionsSelected
- **Triggered when:** User selects furniture collections
- **Contains:** sessionId, selectedCollections, timestamp

#### ProductsPreferred
- **Triggered when:** User specifies preferred products by name
- **Contains:** sessionId, preferredProductIds, timestamp

#### UserSettingsUpdated
- **Triggered when:** User changes unit preference or language
- **Contains:** sessionId, oldSettings, newSettings, timestamp

---

### AI Interaction Events

#### ChatMessageSent
- **Triggered when:** User sends a message to AI
- **Contains:** sessionId, message (ChatMessage), timestamp

#### ChatMessageReceived
- **Triggered when:** AI responds to user message
- **Contains:** sessionId, message (ChatMessage), timestamp

#### RecommendationsRequested
- **Triggered when:** User requests AI recommendations
- **Contains:** sessionId, preferences, timestamp

#### RecommendationsReceived
- **Triggered when:** AI recommendations are received and applied
- **Contains:** sessionId, recommendations, totalPrice, isBudgetExceeded, timestamp

---

### Furniture Placement Events

#### FurniturePlaced
- **Triggered when:** A furniture item is added to the design
- **Contains:** designId, placement (FurniturePlacement), isFromAI, timestamp

#### FurnitureRemoved
- **Triggered when:** A furniture item is removed from the design
- **Contains:** designId, placementId, timestamp

#### FurnitureMoved
- **Triggered when:** A furniture item's position is changed
- **Contains:** designId, placementId, oldPosition, newPosition, timestamp

#### FurnitureRotated
- **Triggered when:** A furniture item's rotation is changed
- **Contains:** designId, placementId, oldRotation, newRotation, timestamp

#### FurnitureCollisionDetected
- **Triggered when:** User attempts to place furniture that collides with existing items
- **Contains:** designId, attemptedPlacement, collidingPlacementIds, timestamp

---

### Visualization Events

#### ViewModeChanged
- **Triggered when:** User switches between 2D and 3D view
- **Contains:** designId, oldMode, newMode, timestamp

#### CameraAngleChanged
- **Triggered when:** User adjusts 3D camera angle
- **Contains:** designId, newAngle, timestamp

#### PresetAngleApplied
- **Triggered when:** User selects a preset camera angle
- **Contains:** designId, presetName, timestamp

#### DimensionsToggled
- **Triggered when:** User shows/hides dimension labels
- **Contains:** designId, showDimensions, timestamp

---

### Room Image Events

#### RoomImageUploaded
- **Triggered when:** User uploads a room photo
- **Contains:** designId, imageId, imageUrl, timestamp

#### FurnitureDetectionStarted
- **Triggered when:** AI starts detecting furniture in uploaded image
- **Contains:** imageId, timestamp

#### FurnitureDetected
- **Triggered when:** AI completes furniture detection in uploaded image
- **Contains:** imageId, detectedItems, isEmpty, timestamp

#### EmptyRoomDetected
- **Triggered when:** AI detects uploaded image has no furniture
- **Contains:** imageId, estimatedRoomDimensions, timestamp

#### FurnitureReplacementApplied
- **Triggered when:** User applies furniture replacement to detected item
- **Contains:** imageId, detectedItemId, replacementProductId, processedImageUrl, timestamp

#### FurniturePlacedInImage
- **Triggered when:** User places furniture in empty room photo
- **Contains:** imageId, productId, imagePosition, rotation, scale, processedImageUrl, timestamp

#### ImagePlacementAdjusted
- **Triggered when:** User adjusts furniture placement or orientation in empty room photo (US-4.5)
- **Contains:** imageId, placementId, oldPosition, newPosition, oldRotation, newRotation, oldScale, newScale, timestamp

#### ImagePlacementRemoved
- **Triggered when:** User removes furniture placement from empty room photo
- **Contains:** imageId, placementId, timestamp

---

### Export & Sharing Events

#### DesignExported
- **Triggered when:** User exports design as image
- **Contains:** designId, exportFormat, includesDimensions, imageUrl, timestamp

#### ShareableLinkGenerated
- **Triggered when:** User generates a shareable link
- **Contains:** designId, linkId, url, timestamp

#### ShareableLinkAccessed
- **Triggered when:** Someone opens a shareable link
- **Contains:** linkId, designId, timestamp

---

### Shopping Cart Events

#### ItemAddedToCart
- **Triggered when:** User adds item to cart
- **Contains:** cartId, productId, quantity, unitPrice, timestamp

#### ItemRemovedFromCart
- **Triggered when:** User removes item from cart
- **Contains:** cartId, itemId, timestamp

#### CartQuantityUpdated
- **Triggered when:** User changes item quantity in cart
- **Contains:** cartId, itemId, oldQuantity, newQuantity, timestamp

#### AllItemsAddedToCart
- **Triggered when:** User adds all furniture from design to cart
- **Contains:** cartId, designId, itemCount, totalPrice, timestamp

#### CartCleared
- **Triggered when:** User clears all items from cart
- **Contains:** cartId, timestamp

#### OutOfStockItemDetected
- **Triggered when:** User attempts to add out-of-stock item to cart
- **Contains:** cartId, productId, productName, timestamp

---

### Error Events

#### ImageUploadFailed
- **Triggered when:** Room image upload fails
- **Contains:** sessionId, errorReason, fileSize, fileType, timestamp

#### AIServiceUnavailable
- **Triggered when:** AI service is temporarily unavailable
- **Contains:** sessionId, requestType, timestamp

#### ProductNotFound
- **Triggered when:** Referenced product is not found in catalog
- **Contains:** productId, context, timestamp

---

## Domain Services

### RoomConfigurationService

**Responsibilities:**
- Validate room dimensions against acceptable ranges
- Provide room templates for each room type
- Convert dimensions between units
- Validate room type and dimension combinations

**Operations:**
- `validateDimensions(dimensions, roomType)`: Validate room size for specific room type
- `getTemplatesForRoomType(roomType)`: Get preset templates with common dimensions
- `convertDimensions(dimensions, targetUnit)`: Unit conversion with precision handling
- `suggestDimensions(roomType)`: Suggest typical dimensions for room type

**Validation Rules by Room Type:**
- Living Room: 12-50 m² (129-538 ft²)
- Bedroom: 9-40 m² (97-431 ft²)
- Dining Room: 10-35 m² (108-377 ft²)
- Home Office: 6-25 m² (65-269 ft²)

---

### CollisionDetectionService

**Responsibilities:**
- Detect furniture collisions in room design
- Validate furniture placement positions
- Calculate occupied space
- Suggest valid placement positions

**Operations:**
- `checkCollision(placement1, placement2)`: Check if two furniture items overlap
- `validatePlacement(design, furniture, position)`: Check if placement is valid (within bounds, no collision)
- `getOccupiedSpaces(design)`: Return all occupied areas in room
- `findValidPositions(design, furniture)`: Suggest valid placement positions
- `calculateBoundingBox(placement)`: Calculate 3D bounding box for furniture

---

### BudgetValidationService

**Responsibilities:**
- Validate budget constraints
- Calculate price totals
- Check if selections exceed budget
- Suggest adjustments to meet budget

**Operations:**
- `validateBudget(budget, selections)`: Check if selections fit within budget
- `calculateTotal(placements)`: Sum prices of all furniture
- `getExceededAmount(budget, total)`: Calculate budget overage
- `suggestBudgetAdjustments(budget, selections)`: Recommend items to remove to meet budget

---

### VisualizationService

**Responsibilities:**
- Manage 2D/3D rendering state
- Calculate camera positions for preset angles
- Handle view transformations
- Manage dimension display

**Operations:**
- `switchViewMode(currentState, newMode)`: Toggle 2D/3D and return new state
- `setCameraAngle(currentState, angle)`: Update camera and return new state
- `setPresetAngle(currentState, preset)`: Apply preset angle (front, side, corner, top-down)
- `calculateZoom(currentState, zoomFactor)`: Calculate new zoom level
- `toggleDimensions(currentState)`: Show/hide dimension labels

---

### ShareService

**Responsibilities:**
- Generate unique shareable links
- Serialize/deserialize design state for sharing
- Manage link persistence
- Validate link expiration

**Operations:**
- `generateShareableLink(design)`: Create shareable URL with unique ID
- `loadDesignFromLink(linkId)`: Restore design from link
- `serializeDesign(design)`: Convert design to shareable format
- `deserializeDesign(snapshot)`: Restore design from snapshot
- `validateLink(linkId)`: Check if link is valid and not expired

---

### CartService

**Responsibilities:**
- Manage cart operations
- Calculate totals
- Validate stock availability
- Handle quantity updates

**Operations:**
- `addToCart(cart, product, quantity)`: Add item or merge if exists
- `addAllFromDesign(cart, design)`: Add all furniture from design
- `removeFromCart(cart, itemId)`: Remove item
- `updateQuantity(cart, itemId, quantity)`: Change quantity
- `calculateTotal(cart)`: Sum all item prices
- `validateAvailability(cart)`: Check stock for all items
- `validateStock(productId, quantity)`: Check if product is available

---

### ChatService

**Responsibilities:**
- Manage AI chat conversation
- Format messages for AI service
- Parse AI responses
- Maintain conversation context

**Operations:**
- `sendMessage(session, message)`: Send user message to AI
- `receiveMessage(session, aiResponse)`: Process AI response
- `formatConversationHistory(chatHistory)`: Format for AI context
- `parseAICommand(message)`: Extract actionable commands from AI response (e.g., "add sofa", "change budget")

---

### ImageProcessingService

**Responsibilities:**
- Validate uploaded images
- Prepare images for AI processing
- Handle image transformations
- Manage processed image results

**Operations:**
- `validateImage(file)`: Check file type, size, format
- `prepareForDetection(image)`: Prepare image for AI furniture detection
- `prepareForReplacement(image, detectedItem)`: Prepare for furniture replacement
- `prepareForPlacement(image, product, position)`: Prepare for furniture placement in empty room
- `applyWatermark(image)`: Add Castlery watermark to exported image

---

## Repositories

### PlanningSessionRepository

**Operations:**
- `save(session)`: Persist session state
- `findById(sessionId)`: Retrieve session
- `findByShareLinkId(linkId)`: Find session by share link
- `delete(sessionId)`: Remove session

**Storage Strategy:**
- **sessionStorage**: Current active session (cleared on tab close)
- **localStorage**: User settings (unit preference, language) for persistence across sessions

---

### RoomDesignRepository

**Operations:**
- `save(design)`: Persist design state
- `findById(designId)`: Retrieve design
- `findBySessionId(sessionId)`: Get design for session
- `delete(designId)`: Remove design

**Storage Strategy:**
- **localStorage**: Saved designs for persistence across browser sessions
- Designs can be loaded from shareable links

---

### ShoppingCartRepository

**Operations:**
- `save(cart)`: Persist cart state
- `findById(cartId)`: Retrieve cart
- `findBySessionId(sessionId)`: Get cart for session
- `clear(cartId)`: Remove all items from cart
- `delete(cartId)`: Remove cart

**Storage Strategy:**
- **localStorage**: Cart persists across browser sessions
- Syncs with Castlery website shopping cart when items are added

---

### ShareableLinkRepository

**Operations:**
- `save(link)`: Persist shareable link
- `findById(linkId)`: Retrieve link by ID
- `delete(linkId)`: Remove link (if expiration implemented)

**Storage Strategy:**
- **Backend API**: Permanent storage for shareable links
- Links must be accessible across devices and browsers
- May implement expiration policy (e.g., links valid for 1 year)

---

### RoomImageRepository

**Operations:**
- `save(image)`: Persist uploaded room image
- `findById(imageId)`: Retrieve image
- `findByDesignId(designId)`: Get image for design
- `delete(imageId)`: Remove image

**Storage Strategy:**
- **Temporary Storage**: Original uploaded images (may use blob URLs)
- **Backend API**: Processed images with furniture replacements/placements
- Images may be cleaned up after session ends or after certain period

---

## Anti-Corruption Layer

### ProductServiceAdapter

**Purpose:** Translate between frontend domain model and Product Service API responses.

**Operations:**
- `toFurniturePlacement(productDTO)`: Convert product DTO to FurniturePlacement entity
- `toCartItem(productDTO, quantity)`: Convert product DTO to CartItem entity
- `toFurnitureDimensions(productDTO)`: Extract dimensions from product
- `toMoney(priceDTO)`: Convert price to Money value object
- `fetchProductDetails(productId)`: Get product from API
- `searchProducts(query)`: Search products by name (for US-3.2)
- `getCategories()`: Fetch available categories (for US-3.3)
- `getCollections()`: Fetch available collections (for US-3.4)
- `checkStock(productId, quantity)`: Validate product availability (for US-7.3)

**Error Handling:**
- Handle product not found errors
- Handle API unavailability
- Provide fallback data when possible

---

### AIServiceAdapter

**Purpose:** Translate between frontend domain model and AI Service API responses.

**Operations:**
- `toRecommendations(aiResponse)`: Convert AI response to list of FurniturePlacement entities
- `toDetectedFurniture(detectResponse)`: Convert detection results to DetectedFurnitureItem list
- `toReplacementResult(replaceResponse)`: Convert replacement results with processed image URL
- `toPlacementResult(placeResponse)`: Convert placement results for empty rooms with processed image URL
- `toChatMessage(aiResponse)`: Convert AI response to ChatMessage value object
- `formatChatRequest(message, conversationHistory)`: Format chat request for AI service
- `formatRecommendationRequest(preferences, roomConfig)`: Format recommendation request
- `formatDetectionRequest(imageUrl, roomDimensions)`: Format furniture detection request
- `formatReplacementRequest(imageUrl, detectedItemId, productId)`: Format replacement request
- `formatPlacementRequest(imageUrl, productId, position)`: Format placement request for empty room

**Error Handling:**
- Handle AI service unavailability (US-8.2)
- Handle timeout errors
- Provide user-friendly error messages
- Support retry logic

---

### CastleryCartAdapter

**Purpose:** Integrate with Castlery website shopping cart.

**Operations:**
- `addToWebsiteCart(cartItems)`: Send cart items to Castlery website cart
- `syncCartCount()`: Update cart icon count
- `getCartUrl()`: Get URL to Castlery cart page

**Integration Strategy:**
- Use postMessage API for cross-origin communication (if embedded)
- Use REST API if available
- Handle authentication if required

---

## Context Map

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Room Planning Context                                 │
│                    (Frontend Application)                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                  Anti-Corruption Layer                        │       │
│  │                                                               │       │
│  │  ┌────────────────────┐  ┌────────────────────┐              │       │
│  │  │ ProductService     │  │  AIServiceAdapter  │              │       │
│  │  │    Adapter         │  │                    │              │       │
│  │  ├────────────────────┤  ├────────────────────┤              │       │
│  │  │ • toFurniture      │  │ • toRecommendations│              │       │
│  │  │   Placement()      │  │ • toDetected       │              │       │
│  │  │ • toCartItem()     │  │   Furniture()      │              │       │
│  │  │ • fetchProduct     │  │ • toReplacement    │              │       │
│  │  │   Details()        │  │   Result()         │              │       │
│  │  │ • searchProducts() │  │ • toChatMessage()  │              │       │
│  │  │ • getCategories()  │  │ • formatChat       │              │       │
│  │  │ • getCollections() │  │   Request()        │              │       │
│  │  │ • checkStock()     │  │                    │              │       │
│  │  └────────────────────┘  └────────────────────┘              │       │
│  │                                                               │       │
│  │  ┌────────────────────┐                                      │       │
│  │  │ CastleryCart       │                                      │       │
│  │  │    Adapter         │                                      │       │
│  │  ├────────────────────┤                                      │       │
│  │  │ • addToWebsiteCart()│                                     │       │
│  │  │ • syncCartCount()  │                                      │       │
│  │  │ • getCartUrl()     │                                      │       │
│  │  └────────────────────┘                                      │       │
│  └──────────────┬───────────────────────┬──────────┬────────────┘       │
│                 │                       │          │                     │
└─────────────────┼───────────────────────┼──────────┼─────────────────────┘
                  │                       │          │
                  │ REST API              │ REST API │ postMessage/API
                  │                       │          │
         ┌────────▼────────┐     ┌────────▼────────┐ ┌────────▼────────┐
         │ Product Catalog │     │   AI Service    │ │ Castlery Website│
         │    Context      │     │    Context      │ │  Shopping Cart  │
         │   (Upstream)    │     │   (Upstream)    │ │   (Upstream)    │
         ├─────────────────┤     ├─────────────────┤ ├─────────────────┤
         │ • Products      │     │ • Recommendations│ │ • Cart Items    │
         │ • Categories    │     │ • Chat (US-3.6) │ │ • Checkout      │
         │ • Collections   │     │ • Detection     │ │                 │
         │ • Pricing       │     │ • Replacement   │ │                 │
         │ • Stock         │     │ • Placement     │ │                 │
         │ • Dimensions    │     │   (Empty Room)  │ │                 │
         └─────────────────┘     └─────────────────┘ └─────────────────┘

Relationship: Customer-Supplier (Frontend is Customer)
Integration Pattern: Anti-Corruption Layer via Adapters
Communication: Asynchronous REST API calls, postMessage for cart integration
Error Handling: Graceful degradation, retry logic, user-friendly error messages
```

---

## User Story Coverage

This domain model supports all user stories from the inception document:

### Epic 1: User Entry & Access
- **US-1.1, US-1.2**: Supported by `PlanningSession.start()` and `UserSettings.hasSeenOnboarding`

### Epic 2: Room Preferences & Configuration
- **US-2.1**: `RoomType` enum (LIVING_ROOM, BEDROOM, DINING_ROOM, HOME_OFFICE)
- **US-2.2**: `RoomTemplate` value object and `RoomConfigurationService.getTemplatesForRoomType()`
- **US-2.3**: `RoomDimensions` value object with validation
- **US-2.4**: `DimensionUnit` enum and `UserSettings.preferredUnit` with conversion
- **US-2.5**: `RoomImage` entity and `RoomDesign.uploadRoomImage()`

### Epic 3: AI Interaction & Product Recommendations
- **US-3.1**: `Budget` value object and `BudgetValidationService`
- **US-3.2**: `UserPreferences.preferredProducts` and `ProductServiceAdapter.searchProducts()`
- **US-3.3**: `UserPreferences.selectedCategories` and `ProductServiceAdapter.getCategories()`
- **US-3.4**: `UserPreferences.selectedCollections` and `ProductServiceAdapter.getCollections()`
- **US-3.5**: `AIServiceAdapter.toRecommendations()` and `RecommendationsReceived` event
- **US-3.6**: `ChatMessage` value object, `ChatService`, and chat-related events

### Epic 4: Room Image Upload & Furniture Replacement
- **US-4.1**: `RoomImage` entity and `ImageProcessingService.validateImage()`
- **US-4.2**: `DetectedFurnitureItem` value object and `FurnitureDetected` event
- **US-4.3**: `AIServiceAdapter.toReplacementResult()` with multiple alternatives
- **US-4.4**: `RoomImage.applyReplacement()` and `FurnitureReplacementApplied` event
- **US-4.5**: `RoomImage.isEmpty`, `ImageFurniturePlacement` with rotation/scale, `RoomImage.updatePlacement()` for adjustments, and `ImagePlacementAdjusted` event

### Epic 5: Room Visualization
- **US-5.1, US-5.2**: `ViewState.mode` (2D | 3D)
- **US-5.3**: `CameraAngle` with 360° rotation and zoom
- **US-5.4**: `ViewState.showDimensions` toggle
- **US-5.5**: `CameraAngle.preset` (front, side, corner, top-down)

### Epic 6: Export & Sharing
- **US-6.1**: `DesignExported` event and `ImageProcessingService.applyWatermark()`
- **US-6.2**: `ShareableLink` value object and `ShareService`

### Epic 7: Purchase Integration
- **US-7.1**: `FurniturePlacement` with product details
- **US-7.2**: `Money` value object and `RoomDesign.calculateTotalPrice()`
- **US-7.3**: `ShoppingCart` aggregate, `CartService`, and `CastleryCartAdapter`

### Epic 8: Error Handling
- **US-8.1**: `ImageUploadFailed` event and `ImageProcessingService.validateImage()`
- **US-8.2**: `AIServiceUnavailable` event and error handling in `AIServiceAdapter`

---

## Implementation Notes

### Storage Strategy Summary

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Current Session | sessionStorage | Temporary, cleared on tab close |
| User Settings | localStorage | Persist unit preference, language |
| Saved Designs | localStorage | Persist across browser sessions |
| Shopping Cart | localStorage | Persist across sessions |
| Shareable Links | Backend API | Cross-device access |
| Room Images | Temporary/Backend | Original: temporary, Processed: backend |

### Key Design Decisions

1. **UserPreferences as Value Object**: Not a separate entity, embedded in PlanningSession for simplicity
2. **ID References Between Aggregates**: PlanningSession references RoomDesign by ID, not object
3. **Rich Domain Model**: Aggregates have behaviors, not just data (e.g., `placeFurniture()`, `validateFurnitureFit()`)
4. **Fine-Grained Events**: Separate events for budget, categories, collections for better tracking
5. **Collision Detection**: Domain service to validate furniture placement
6. **Budget Validation**: Separate service to check budget constraints and suggest adjustments
7. **Chat History**: Maintained in PlanningSession for AI conversation context
8. **Multi-Language Support**: UserSettings includes language preference for US-3.6
9. **Stock Validation**: Checked before adding to cart (US-7.3)
10. **Empty Room Detection**: Special handling for rooms without existing furniture (US-4.5)
