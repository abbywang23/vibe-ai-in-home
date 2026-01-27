# Integration Contract

## Overview
This document defines the API contracts between the three units of the Castlery Furniture Planner application.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Unit 1: Frontend Application                │
│                        (Web Client)                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                 ┌─────────────────┐
                 │  Unit 2: AI     │
                 │    Service      │
                 │ (with Products) │
                 └─────────────────┘
```

---

## Unit 2: AI Service APIs

Base URL: `/api/ai`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| POST | `/recommend` | Get furniture recommendations | RoomConfig + Preferences | ProductRecommendations |
| POST | `/chat` | Chat with AI | ChatMessage | ChatResponse |
| POST | `/detect` | Detect furniture in image | ImageUrl + Dimensions | DetectedItems |
| POST | `/replace` | Apply furniture replacement | ImageUrl + Replacements | ResultImage |
| POST | `/place` | Place furniture in empty room | ImageUrl + Placements | ResultImage |
| POST | `/upload` | Upload room image | Image file | ImageUrl |
| GET | `/products/search` | Search products | Query params | ProductList |
| GET | `/products/categories` | Get all categories | - | CategoryList |
| GET | `/products/{id}` | Get product details | Path param | ProductDetail |

### POST /api/ai/recommend

**Purpose:** Generate AI-powered furniture recommendations based on room configuration and user preferences.

**Request:**
```json
{
  "roomType": "living_room" | "bedroom" | "dining_room" | "home_office",
  "dimensions": {
    "length": number,
    "width": number,
    "height": number,
    "unit": "meters" | "feet"
  },
  "budget": {
    "amount": number,
    "currency": "USD" | "SGD" | "AUD"
  },
  "preferences": {
    "productIds": string[],
    "categoryIds": string[],
    "collectionIds": string[]
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "recommendations": [
    {
      "productId": string,
      "name": string,
      "price": number,
      "thumbnailUrl": string,
      "model3dUrl": string,
      "position": { "x": number, "y": number, "z": number },
      "rotation": number
    }
  ],
  "totalPrice": number,
  "budgetExceeded": boolean,
  "exceededAmount": number
}
```

**Error Codes:**
- `400` - Invalid request parameters
- `503` - AI service unavailable

---

### POST /api/ai/chat

**Purpose:** Natural language interaction with AI for refining recommendations.

**Request:**
```json
{
  "sessionId": string,
  "message": string,
  "language": "en" | "zh",
  "context": {
    "currentDesign": object
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "reply": string,
  "updatedRecommendations": array | null,
  "actions": [
    {
      "type": "replace" | "add" | "remove",
      "productId": string,
      "newProductId": string | null
    }
  ]
}
```

---

### POST /api/ai/detect

**Purpose:** Detect existing furniture in an uploaded room image.

**Request:**
```json
{
  "imageUrl": string,
  "roomDimensions": {
    "length": number,
    "width": number,
    "unit": "meters" | "feet"
  }
}
```

**Response:**
```json
{
  "success": boolean,
  "detectedItems": [
    {
      "id": string,
      "type": "sofa" | "table" | "chair" | "bed" | "desk" | "storage",
      "confidence": number,
      "boundingBox": {
        "x": number,
        "y": number,
        "width": number,
        "height": number
      },
      "estimatedSize": {
        "width": number,
        "depth": number,
        "height": number
      }
    }
  ]
}
```

---

### POST /api/ai/replace

**Purpose:** Apply furniture replacements to the room image.

**Request:**
```json
{
  "imageUrl": string,
  "replacements": [
    {
      "detectedItemId": string,
      "newProductId": string
    }
  ]
}
```

**Response:**
```json
{
  "success": boolean,
  "resultImageUrl": string,
  "appliedReplacements": [
    {
      "detectedItemId": string,
      "newProductId": string,
      "productName": string
    }
  ]
}
```

---

### POST /api/ai/place

**Purpose:** Place furniture items in an empty room image.

**Request:**
```json
{
  "imageUrl": string,
  "roomDimensions": {
    "length": number,
    "width": number,
    "unit": "meters" | "feet"
  },
  "placements": [
    {
      "productId": string,
      "position": { "x": number, "z": number },
      "rotation": number
    }
  ]
}
```

**Response:**
```json
{
  "success": boolean,
  "resultImageUrl": string,
  "appliedPlacements": [
    {
      "productId": string,
      "productName": string,
      "position": { "x": number, "z": number },
      "rotation": number
    }
  ]
}
```

---

### POST /api/ai/upload

**Purpose:** Upload room image to server for analysis and processing.

**Request:** Multipart form data with image file
- Content-Type: multipart/form-data
- Field name: `image`
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/webp

**Response:**
```json
{
  "success": boolean,
  "imageUrl": string,
  "imageId": string,
  "filename": string,
  "size": number,
  "dimensions": {
    "width": number,
    "height": number
  }
}
```

---

### GET /api/ai/products/search

**Purpose:** Search products from local catalog.

**Query Parameters:**
- `q` (string, optional): Search query
- `category` (string, optional): Filter by category
- `maxPrice` (number, optional): Maximum price filter
- `limit` (number, optional): Max results, default 10

**Response:**
```json
{
  "success": boolean,
  "products": [
    {
      "id": string,
      "name": string,
      "category": string,
      "price": number,
      "originalPrice": number | null,
      "images": [
        {
          "url": string,
          "alt": string
        }
      ],
      "tags": string[],
      "inStock": boolean
    }
  ],
  "total": number
}
```

---

### GET /api/ai/products/categories

**Purpose:** Get all available product categories.

**Response:**
```json
{
  "success": boolean,
  "categories": [
    {
      "id": string,
      "name": string,
      "productCount": number
    }
  ]
}
```

---

### GET /api/ai/products/{id}

**Purpose:** Get detailed product information.

**Response:**
```json
{
  "success": boolean,
  "product": {
    "id": string,
    "name": string,
    "description": string,
    "detailedDescription": string,
    "category": string,
    "price": number,
    "originalPrice": number | null,
    "currency": string,
    "images": [
      {
        "url": string,
        "alt": string
      }
    ],
    "tags": string[],
    "dimensions": {
      "width": number,
      "depth": number,
      "height": number,
      "unit": string
    },
    "inStock": boolean,
    "delivery": string,
    "externalUrl": string
  }
}
```

---

## Common Data Types

### RoomType
```typescript
type RoomType = "living_room" | "bedroom" | "dining_room" | "home_office";
```

### FurnitureType
```typescript
type FurnitureType = "sofa" | "table" | "chair" | "bed" | "desk" | "storage";
```

### DimensionUnit
```typescript
type DimensionUnit = "meters" | "feet" | "cm" | "inches";
```

### Currency
```typescript
type Currency = "USD" | "SGD" | "AUD";
```

---

## Error Response Format

All APIs return errors in the following format:

```json
{
  "success": false,
  "error": {
    "code": string,
    "message": string,
    "details": object | null
  }
}
```

### Common Error Codes
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Integration Flow Examples

### Flow 1: Get Furniture Recommendations

```
Frontend                    AI Service (with Local Products)
   │                                    │
   │ POST /api/ai/recommend             │
   │ ─────────────────────────────────▶ │
   │                                    │ (Load from local YAML)
   │ ◀─────────────────────────────────  │
   │  recommendations                   │
```

### Flow 2: Furniture Detection & Replacement

```
Frontend                    AI Service (with Local Products)
   │                                    │
   │ POST /api/ai/detect                │
   │ ─────────────────────────────────▶ │
   │ ◀─────────────────────────────────  │
   │  detectedItems                     │
   │                                    │
   │ POST /api/ai/replace               │
   │ ─────────────────────────────────▶ │
   │                                    │ (Load product from local config)
   │ ◀─────────────────────────────────  │
   │  resultImageUrl                    │
```

### Flow 3: View Product Details

```
Frontend                    AI Service (with Local Products)
   │                                    │
   │ GET /api/ai/products/{id}          │
   │ ─────────────────────────────────▶ │
   │                                    │ (Load from local YAML)
   │ ◀─────────────────────────────────  │
   │  productDetails                    │
```

### Flow 4: Search Products

```
Frontend                    AI Service (with Local Products)
   │                                    │
   │ GET /api/ai/products/search?q=sofa │
   │ ─────────────────────────────────▶ │
   │                                    │ (Search local YAML)
   │ ◀─────────────────────────────────  │
   │  productList                       │
```
