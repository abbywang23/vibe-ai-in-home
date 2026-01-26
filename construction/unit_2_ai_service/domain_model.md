# Unit 2: AI Service - Domain Model

## Bounded Context: AI Recommendation Context

The AI Service manages furniture recommendations, natural language interactions, furniture detection in images, and furniture replacement rendering.

---

## Domain Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI Recommendation Context                       │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │Recommendation │    │  ChatSession  │    │ ImageAnalysis │      │
│  │   Request     │    │  (Aggregate)  │    │  (Aggregate)  │      │
│  │  (Aggregate)  │    └──────────────┘    └──────────────┘       │
│  └──────────────┘           │                    │               │
│         │                   ▼                    ▼               │
│         ▼            ┌──────────────┐    ┌──────────────┐       │
│  ┌──────────────┐    │ ChatMessage   │    │DetectedFurniture│    │
│  │ Recommendation│   │   (Entity)    │    │   (Entity)    │      │
│  │   (Entity)    │    └──────────────┘    └──────────────┘       │
│  └──────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## External AI Model Selection

Based on the requirements, the following external AI models are recommended:

| Feature | Recommended Model | Alternative | Rationale |
|---------|------------------|-------------|-----------|
| Furniture Recommendations | **OpenAI GPT-4** | Claude 3 | Strong reasoning for room layout optimization |
| Natural Language Chat | **OpenAI GPT-4** | Claude 3 | Multi-language support, conversational ability |
| Furniture Detection | **OpenAI GPT-4V** | Google Gemini Pro Vision | Image understanding, object detection |
| Furniture Replacement | **Stability AI SDXL** | DALL-E 3 | Inpainting capability for realistic replacement |

---

## Aggregates

### 1. RecommendationRequest (Aggregate Root)

**Description:** Represents a request for AI-generated furniture recommendations based on room configuration and user preferences.

**Responsibilities:**
- Validate room configuration completeness
- Apply budget constraints to recommendations
- Optimize furniture placement for room layout
- Track recommendation history for refinements

**Invariants:**
- Room type must be specified
- Room dimensions must be valid and positive
- Budget (if specified) must be positive
- Recommendations must fit within room boundaries

---

### 2. ChatSession (Aggregate Root)

**Description:** Manages a conversational session with the AI for refining furniture recommendations.

**Responsibilities:**
- Maintain conversation history
- Process natural language requests
- Generate contextual responses
- Track design modifications from chat

**Invariants:**
- Session must have a valid session ID
- Messages must be in supported languages
- Context must include current design state for refinements

---

### 3. ImageAnalysis (Aggregate Root)

**Description:** Manages the analysis of uploaded room images for furniture detection, replacement, and placement in empty rooms. Automatically determines analysis mode based on room occupancy.

**Responsibilities:**
- Process uploaded room images
- Detect existing furniture with confidence scores
- Identify empty rooms with no furniture
- Generate replacement suggestions for existing furniture
- Generate placement suggestions for empty rooms
- Render furniture replacements and placements realistically
- Switch between replacement and placement modes automatically

**Attributes:**
- analysisId: Unique identifier
- imageUrl: URL of uploaded image
- roomDimensions: User-provided room dimensions
- analysisMode: AnalysisMode (REPLACEMENT | PLACEMENT)
- detectedFurniture: List of detected furniture items (for replacement mode)
- roomSpace: Extracted room space info (for placement mode)
- suggestedPlacements: List of placement suggestions (for placement mode)

**Invariants:**
- Image must be valid (JPEG/PNG, within size limits)
- Room dimensions must be provided for scale estimation
- Detected furniture must have confidence > threshold (for replacement mode)
- Replacement/placement products must exist in catalog
- Empty room detection must be reliable to avoid incorrect mode switching
- Analysis mode must be determined before generating suggestions

---

## Entities

### Recommendation

**Description:** A single furniture recommendation with placement information.

**Attributes:**
- recommendationId: Unique identifier
- productId: Reference to product in catalog
- productName: Product display name
- price: Product price
- position: Position3D for placement
- rotation: Rotation angle
- confidence: AI confidence score for this recommendation
- reasoning: AI explanation for this choice

---

### ChatMessage

**Description:** A single message in a chat conversation.

**Attributes:**
- messageId: Unique identifier
- role: MessageRole (user | assistant)
- content: Message text
- language: Language code
- timestamp: When message was sent
- actions: List of design actions triggered by this message

---

### DetectedFurniture

**Description:** A furniture item detected in an uploaded room image.

**Attributes:**
- detectionId: Unique identifier
- furnitureType: Type of furniture detected
- confidence: Detection confidence (0-1)
- boundingBox: BoundingBox value object
- estimatedSize: Estimated physical dimensions
- suggestedReplacements: List of matching products

---

### ReplacementResult

**Description:** The result of applying a furniture replacement to an image.

**Attributes:**
- replacementId: Unique identifier
- originalDetectionId: Reference to detected furniture
- newProductId: Product used for replacement
- resultImageUrl: URL of rendered result
- renderQuality: Quality score of the rendering

### PlacementResult

**Description:** The result of placing furniture in an empty room image.

**Attributes:**
- placementId: Unique identifier
- productId: Product used for placement
- position: Position3D where furniture was placed
- rotation: Rotation angle applied
- resultImageUrl: URL of rendered result
- renderQuality: Quality score of the rendering

---

## Value Objects

### RoomConfiguration

**Description:** Immutable configuration of the room for recommendations.

**Attributes:**
- roomType: RoomType enum
- dimensions: RoomDimensions
- existingFurniture: Optional list of furniture to keep

---

### RoomDimensions

**Description:** Immutable room size specification.

**Attributes:**
- length: Numeric value
- width: Numeric value
- height: Numeric value
- unit: DimensionUnit (meters | feet)

**Behaviors:**
- toMeters(): Convert to meters for AI processing
- validate(): Check reasonable ranges

---

### Budget

**Description:** Immutable budget constraint.

**Attributes:**
- amount: Numeric value
- currency: Currency code

**Behaviors:**
- isExceededBy(total): Check if total exceeds budget
- getExceededAmount(total): Calculate overage

---

### UserPreferences

**Description:** Immutable user preferences for recommendations.

**Attributes:**
- preferredProductIds: Specific products to include
- preferredCategoryIds: Categories to focus on
- preferredCollectionIds: Collections to prefer
- stylePreferences: Optional style keywords

---

### Position3D

**Description:** Immutable 3D position for furniture placement.

**Attributes:**
- x: X coordinate
- y: Y coordinate
- z: Z coordinate

---

### BoundingBox

**Description:** Immutable rectangle defining detected furniture location in image.

**Attributes:**
- x: Top-left X coordinate
- y: Top-left Y coordinate
- width: Box width in pixels
- height: Box height in pixels

---

### EstimatedSize

**Description:** Immutable estimated physical size of detected furniture.

**Attributes:**
- width: Estimated width
- depth: Estimated depth
- height: Estimated height
- unit: DimensionUnit

---

### DesignAction

**Description:** Immutable action to modify the design based on chat.

**Attributes:**
- actionType: ActionType (replace | add | remove | move)
- targetProductId: Product being modified
- newProductId: New product (for replace/add)
- newPosition: New position (for move)

---

### FurnitureType

**Description:** Enumeration of detectable furniture types.

**Values:**
- SOFA
- TABLE
- CHAIR
- BED
- DESK
- STORAGE
- LAMP
- RUG

---

### MessageRole

**Description:** Enumeration of chat message roles.

**Values:**
- USER
- ASSISTANT

---

### ActionType

**Description:** Enumeration of design modification actions.

**Values:**
- REPLACE
- ADD
- REMOVE
- MOVE

---

### AnalysisMode

**Description:** Enumeration of image analysis modes.

**Values:**
- REPLACEMENT (existing furniture detected, suggest replacements)
- PLACEMENT (no furniture detected, suggest placements)

---

### RoomSpace

**Description:** Immutable representation of room space extracted from image.

**Attributes:**
- roomBoundaries: BoundingBox of room in image
- estimatedDimensions: RoomDimensions estimated from image
- usableArea: Calculated usable area for furniture
- wallPositions: Positions of walls for placement constraints

**Behaviors:**
- getAvailableSpace(): Calculate available space for furniture
- canFitFurniture(furniture): Check if furniture can fit in space

---

## Domain Events

### RecommendationRequested
- Triggered when: Client requests furniture recommendations
- Contains: requestId, roomConfiguration, preferences, budget

### RecommendationsGenerated
- Triggered when: AI successfully generates recommendations
- Contains: requestId, recommendations, totalPrice, budgetStatus

### RecommendationFailed
- Triggered when: AI fails to generate recommendations
- Contains: requestId, errorCode, errorMessage

### ChatSessionStarted
- Triggered when: New chat session is initiated
- Contains: sessionId, language, initialContext

### ChatMessageReceived
- Triggered when: User sends a chat message
- Contains: sessionId, messageId, content, language

### ChatResponseGenerated
- Triggered when: AI generates a response
- Contains: sessionId, messageId, reply, actions

### ImageUploadedForAnalysis
- Triggered when: Room image is uploaded for detection
- Contains: analysisId, imageUrl, roomDimensions

### FurnitureDetected
- Triggered when: AI detects furniture in image
- Contains: analysisId, detectedItems

### DetectionFailed
- Triggered when: Furniture detection fails
- Contains: analysisId, errorCode, errorMessage

### ReplacementRequested
- Triggered when: User requests furniture replacement
- Contains: analysisId, replacements

### ReplacementRendered
- Triggered when: Replacement image is generated
- Contains: analysisId, resultImageUrl, appliedReplacements

### PlacementRequested
- Triggered when: User requests furniture placement in empty room
- Contains: analysisId, placements

### PlacementRendered
- Triggered when: Placement image is generated
- Contains: analysisId, resultImageUrl, appliedPlacements

### PlacementFailed
- Triggered when: Placement rendering fails
- Contains: analysisId, errorCode, errorMessage

### EmptyRoomDetected
- Triggered when: AI detects room has no existing furniture
- Contains: analysisId, roomDimensions

### PlacementSuggestionsGenerated
- Triggered when: AI generates placement suggestions for empty room
- Contains: analysisId, placements, totalPrice, budgetStatus

### AIServiceUnavailable
- Triggered when: External AI service is unavailable
- Contains: serviceName, errorDetails, retryAfter

---

## Domain Services

### RecommendationService

**Responsibilities:**
- Orchestrate the recommendation generation process
- Query product catalog for available products
- Invoke AI model for layout optimization
- Apply budget constraints and adjust recommendations

**Operations:**
- generateRecommendations(roomConfig, preferences, budget): Generate furniture recommendations
- adjustForBudget(recommendations, budget): Adjust recommendations to fit budget
- optimizePlacement(recommendations, roomDimensions): Optimize furniture positions

**Collaborators:**
- AIModelGateway (for AI inference)
- ProductCatalogGateway (for product data)

---

### ChatService

**Responsibilities:**
- Manage chat conversation flow
- Build context for AI from conversation history
- Parse AI responses into design actions
- Support multi-language conversations

**Operations:**
- processMessage(session, message): Process user message and generate response
- buildContext(session, currentDesign): Build AI context from history
- parseActions(aiResponse): Extract design actions from response

**Collaborators:**
- AIModelGateway (for chat completion)
- ProductCatalogGateway (for product lookups)

---

### FurnitureDetectionService

**Responsibilities:**
- Process room images for furniture detection
- Invoke vision AI model for object detection
- Estimate furniture sizes from image analysis
- Match detected furniture to catalog products

**Operations:**
- detectFurniture(imageUrl, roomDimensions): Detect furniture in image
- estimateSize(detection, roomDimensions): Estimate physical size
- findMatchingProducts(detection): Find similar products in catalog

**Collaborators:**
- AIModelGateway (for vision AI)
- ProductCatalogGateway (for product matching)

---

### FurnitureReplacementService

**Responsibilities:**
- Generate realistic furniture replacement images
- Generate furniture placement images for empty rooms
- Invoke image generation AI for inpainting and placement
- Ensure proper scale and perspective
- Manage replacement and placement image storage

**Operations:**
- applyReplacements(imageUrl, replacements): Generate replacement image
- placeFurniture(imageUrl, placements, roomDimensions): Generate placement image
- prepareInpaintingMask(boundingBox): Create mask for replacement area
- renderFurniture(product, targetArea): Render product into image

**Collaborators:**
- AIModelGateway (for image generation)
- ProductCatalogGateway (for product images/3D models)
- ImageStorageGateway (for storing results)

---

### BudgetOptimizationService

**Responsibilities:**
- Optimize recommendations to fit budget
- Find alternative products at lower price points
- Calculate budget impact of changes

**Operations:**
- optimizeForBudget(recommendations, budget): Adjust to fit budget
- findAlternatives(product, maxPrice): Find cheaper alternatives
- calculateSavings(original, optimized): Calculate price difference

---

### EmptyRoomAnalysisService

**Responsibilities:**
- Detect if uploaded room image contains no existing furniture
- Determine room boundaries and usable space from image
- Generate furniture placement suggestions for empty rooms
- Validate furniture placements fit within room space
- Switch analysis mode based on room occupancy

**Operations:**
- isEmptyRoom(imageUrl, roomDimensions): Detect if room is empty (returns boolean + confidence)
- analyzeRoomSpace(imageUrl, roomDimensions): Extract room boundaries and usable area
- suggestPlacements(emptyRoom, preferences, budget): Generate furniture placement suggestions
- validatePlacement(placement, roomSpace): Validate if placement fits within room
- determinePlacementMode(analysisResult): Determine if should use replacement or placement mode

**Placement Suggestion Algorithm:**
1. Analyze room dimensions and available space
2. Query product catalog for furniture matching preferences
3. Use AI to generate optimal placement layout
4. Consider furniture dimensions and room constraints
5. Rank placements by space efficiency and aesthetic appeal
6. Return top N placement suggestions with confidence scores

**Collaborators:**
- AIModelGateway (for empty room detection and placement generation)
- ProductCatalogGateway (for product data)
- FurnitureSpaceFittingService (for space validation)

---

## Repositories

### RecommendationRequestRepository

**Operations:**
- save(request): Persist recommendation request
- findById(requestId): Retrieve request
- findBySessionId(sessionId): Get requests for session

---

### ChatSessionRepository

**Operations:**
- save(session): Persist chat session
- findById(sessionId): Retrieve session
- addMessage(sessionId, message): Append message to session

---

### ImageAnalysisRepository

**Operations:**
- save(analysis): Persist image analysis
- findById(analysisId): Retrieve analysis
- updateWithDetections(analysisId, detections): Add detection results
- updateWithReplacement(analysisId, result): Add replacement result
- updateWithPlacements(analysisId, placements): Add placement results
- updateAnalysisMode(analysisId, mode): Update analysis mode (replacement | placement)

---

## Gateways (Anti-Corruption Layer)

### AIModelGateway

**Purpose:** Abstract external AI model interactions.

**Operations:**
- generateRecommendations(prompt, context): Call GPT-4 for recommendations
- chat(messages, context): Call GPT-4 for chat completion
- detectObjects(imageUrl, prompt): Call GPT-4V for object detection
- generateImage(prompt, mask, referenceImage): Call Stability AI for inpainting
- placeFurnitureInRoom(imageUrl, placements, roomDimensions): Call AI for furniture placement
- detectEmptyRoom(imageUrl, roomDimensions): Call GPT-4V to detect if room is empty
- analyzeRoomBoundaries(imageUrl, roomDimensions): Call GPT-4V to extract room space info

**Implementation Notes:**
- Handles API authentication and rate limiting
- Implements retry logic with exponential backoff
- Translates between domain model and AI API formats
- Caches responses where appropriate
- Empty room detection uses confidence threshold (>= 0.8) to avoid false positives

---

### ProductCatalogGateway

**Purpose:** Abstract Product Service interactions.

**Operations:**
- searchProducts(query, filters): Search product catalog
- getProductById(productId): Get product details
- getProductsByType(furnitureType): Get products by type
- getProductsByCategory(categoryId): Get products by category
- getProductsByCollection(collectionId): Get products by collection

**Implementation Notes:**
- Implements circuit breaker for resilience
- Caches product data with TTL
- Translates Product Service DTOs to domain objects

---

### ImageStorageGateway

**Purpose:** Abstract image storage operations.

**Operations:**
- uploadImage(imageData): Upload image and return URL
- getImageUrl(imageId): Get URL for stored image
- deleteImage(imageId): Remove stored image

**Implementation Notes:**
- Could use S3, CloudFront, or similar
- Handles image optimization and CDN distribution

---

## Policies

### BudgetExceededPolicy

**Trigger:** RecommendationsGenerated event where totalPrice > budget
**Action:** Invoke BudgetOptimizationService to find alternatives
**Result:** Emit RecommendationsAdjusted event with optimized list

---

### EmptyRoomDetectedPolicy

**Trigger:** EmptyRoomDetected event
**Action:** 
1. Invoke EmptyRoomAnalysisService to analyze room space
2. Generate furniture placement suggestions based on preferences and budget
3. Prepare placement mode UI context
**Result:** Emit PlacementSuggestionsGenerated event with suggested placements

---

### LowConfidenceDetectionPolicy

**Trigger:** FurnitureDetected event with any detection confidence < 0.7
**Action:** Flag low-confidence detections for user review
**Result:** Include confidence warnings in response

---

### AIServiceRetryPolicy

**Trigger:** AI service call failure
**Action:** Retry with exponential backoff (max 3 attempts)
**Result:** Emit AIServiceUnavailable if all retries fail

---

## Context Map

```
┌─────────────────────────────────────────────────────────────────┐
│                  AI Recommendation Context                       │
│                      (AI Service)                                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ External AI   │   │ Product       │   │ Image Storage │
│ Models        │   │ Catalog       │   │ Service       │
│ (Upstream)    │   │ (Upstream)    │   │ (Upstream)    │
│               │   │               │   │               │
│ - GPT-4       │   │ - Products    │   │ - S3/CDN      │
│ - GPT-4V      │   │ - Categories  │   │               │
│ - Stability AI│   │ - Collections │   │               │
└───────────────┘   └───────────────┘   └───────────────┘

Relationship: 
- External AI: Conformist (we adapt to their API)
- Product Catalog: Customer-Supplier (we are customer)
- Image Storage: Partnership (shared infrastructure)
```

---

## AI Prompt Templates

### Recommendation Prompt Structure

```
System: You are a furniture layout expert for Castlery...
Context: Room type, dimensions, budget, preferences
Available Products: [Product catalog subset]
Task: Recommend optimal furniture arrangement
Output Format: JSON with products, positions, reasoning
```

### Chat Prompt Structure

```
System: You are a helpful furniture design assistant...
Conversation History: [Previous messages]
Current Design: [Current furniture placements]
User Message: [Latest user input]
Task: Respond helpfully and suggest design changes
Output Format: Natural language + JSON actions
```

### Detection Prompt Structure

```
System: You are a furniture detection expert...
Image: [Room image URL]
Room Dimensions: [Physical dimensions for scale]
Task: Identify all furniture items with locations
Output Format: JSON with furniture types, bounding boxes, sizes
```
