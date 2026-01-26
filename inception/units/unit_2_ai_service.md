# Unit 2: AI Service

## Overview
Backend service that provides all AI-powered features including furniture recommendations, natural language chat, furniture detection in images, and furniture replacement rendering.

**Team Size:** 1-2 developers  
**Dependencies:** Unit 3 (Product Service)

---

## User Stories

### Budget & Preferences

#### US-3.1: Set Total Budget
**As a** user  
**I want to** specify my total budget for furniture  
**So that** AI suggests products within my price range

**Acceptance Criteria:**
- Input field for total budget amount
- Currency display based on user's region
- AI respects budget constraint in recommendations
- If recommendations exceed budget, AI auto-adjusts and notifies user of the exceeded amount

---

### AI Recommendations

#### US-3.5: Get AI-Generated Furniture Suggestions
**As a** user  
**I want to** receive AI-generated furniture suggestions based on my preferences  
**So that** I get a curated room design without manual selection

**Acceptance Criteria:**
- AI analyzes room type, dimensions, budget, and preferences
- Generates furniture grouping suggestions
- Displays suggested products with images and prices
- Products sourced from Castlery test database

#### US-3.6: Chat with AI for Refinements
**As a** user  
**I want to** interact with AI through chat  
**So that** I can refine suggestions or ask questions

**Acceptance Criteria:**
- Chat interface for natural language interaction
- AI understands requests to change, add, or remove items
- Conversation history visible during session
- Multi-language support (English, Chinese, etc.)

---

### Furniture Detection & Replacement

#### US-4.2: AI Furniture Detection
**As a** user  
**I want** AI to automatically detect existing furniture in my uploaded image  
**So that** I don't have to manually identify items to replace

**Acceptance Criteria:**
- AI identifies and highlights existing furniture pieces
- Labels detected furniture types (sofa, table, chair, etc.)
- Confidence indicator for detection accuracy

#### US-4.3: View Replacement Suggestions
**As a** user  
**I want to** see Castlery furniture suggestions to replace detected items  
**So that** I can visualize upgrades for my room

**Acceptance Criteria:**
- AI suggests matching Castlery products for each detected item
- Suggestions consider style, size, and user preferences
- Multiple alternatives offered per detected item

#### US-4.4: Apply Furniture Replacement
**As a** user  
**I want to** apply suggested replacements to my room image  
**So that** I can see how Castlery furniture looks in my actual space

**Acceptance Criteria:**
- One-click replacement application
- Realistic rendering of new furniture in the image
- Option to undo/revert changes

#### US-4.5: Add Furniture to Empty Room
**As a** user  
**I want to** add Castlery furniture directly to an empty room photo  
**So that** I can visualize how furniture would look in my unfurnished space

**Acceptance Criteria:**
- AI detects when uploaded room image contains no existing furniture
- System automatically switches to "furniture placement" mode for empty rooms
- User can select and place furniture items from AI suggestions or catalog
- Furniture is rendered with appropriate scale and perspective in the empty room
- Multiple furniture pieces can be added and positioned within the room
- Option to adjust furniture placement and orientation

---

### Error Handling

#### US-8.2: AI Service Unavailable Handling
**As a** user  
**I want to** be notified when AI services are temporarily unavailable  
**So that** I know the system status and can try again later

**Acceptance Criteria:**
- Display friendly message when AI service is unavailable
- Suggest user to try again later
- Provide alternative actions if available (e.g., browse products manually)

---

## API Endpoints (Exposed)

### Recommendation API

#### POST /api/ai/recommend
Get AI-generated furniture recommendations based on user preferences.

**Request Body:**
```json
{
  "roomType": "living_room",
  "dimensions": {
    "length": 5.0,
    "width": 4.0,
    "height": 2.8,
    "unit": "meters"
  },
  "budget": {
    "amount": 5000,
    "currency": "USD"
  },
  "preferences": {
    "productIds": ["prod_123"],
    "categoryIds": ["cat_sofa", "cat_table"],
    "collectionIds": ["col_modern"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "productId": "prod_456",
      "name": "Modern Sofa",
      "price": 1200,
      "position": { "x": 2.0, "y": 0, "z": 1.5 },
      "rotation": 0
    }
  ],
  "totalPrice": 4500,
  "budgetExceeded": false,
  "exceededAmount": 0
}
```

---

### Chat API

#### POST /api/ai/chat
Send a message to AI for refinements.

**Request Body:**
```json
{
  "sessionId": "session_abc123",
  "message": "Can you replace the sofa with something more modern?",
  "language": "en",
  "context": {
    "currentDesign": { ... }
  }
}
```

**Response:**
```json
{
  "success": true,
  "reply": "I've found a more modern sofa option for you...",
  "updatedRecommendations": [ ... ],
  "actions": [
    { "type": "replace", "oldProductId": "prod_456", "newProductId": "prod_789" }
  ]
}
```

---

### Detection API

#### POST /api/ai/detect
Detect existing furniture in an uploaded room image.

**Request Body:**
```json
{
  "imageUrl": "https://storage.example.com/room_image.jpg",
  "roomDimensions": {
    "length": 5.0,
    "width": 4.0,
    "unit": "meters"
  }
}
```

**Response:**
```json
{
  "success": true,
  "detectedItems": [
    {
      "id": "detected_1",
      "type": "sofa",
      "confidence": 0.95,
      "boundingBox": { "x": 100, "y": 200, "width": 300, "height": 150 },
      "estimatedSize": { "width": 2.0, "depth": 0.9, "height": 0.8 }
    }
  ]
}
```

---

### Replacement API

#### POST /api/ai/replace
Apply furniture replacement to the room image.

**Request Body:**
```json
{
  "imageUrl": "https://storage.example.com/room_image.jpg",
  "replacements": [
    {
      "detectedItemId": "detected_1",
      "newProductId": "prod_456"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "resultImageUrl": "https://storage.example.com/result_image.jpg",
  "appliedReplacements": [
    {
      "detectedItemId": "detected_1",
      "newProductId": "prod_456",
      "productName": "Modern Sofa"
    }
  ]
}
```

---

### Placement API

#### POST /api/ai/place
Place furniture in an empty room image.

**Request Body:**
```json
{
  "imageUrl": "https://storage.example.com/empty_room.jpg",
  "roomDimensions": {
    "length": 5.0,
    "width": 4.0,
    "unit": "meters"
  },
  "placements": [
    {
      "productId": "prod_456",
      "position": { "x": 2.0, "z": 1.5 },
      "rotation": 0
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "resultImageUrl": "https://storage.example.com/furnished_room.jpg",
  "appliedPlacements": [
    {
      "productId": "prod_456",
      "productName": "Modern Sofa",
      "position": { "x": 2.0, "z": 1.5 },
      "rotation": 0
    }
  ]
}
```

---

## API Dependencies

### From Unit 3 (Product Service)
- `GET /api/products/search` - Search products for recommendations
- `GET /api/products/categories` - Get categories for filtering
- `GET /api/products/collections` - Get collections for filtering
- `GET /api/products/{id}` - Get product details for replacement
- `GET /api/products/by-type/{type}` - Get products by furniture type
