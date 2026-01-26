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
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│  Unit 2: AI     │                 │  Unit 3: Product│
│    Service      │────────────────▶│    Service      │
│                 │                 │  (In-Memory)    │
└─────────────────┘                 └─────────────────┘
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

## Unit 3: Product Service APIs

Base URL: `/api/products`

| Method | Endpoint | Description | Request | Response |
|--------|----------|-------------|---------|----------|
| GET | `/search` | Search products | Query params | ProductList |
| GET | `/categories` | Get all categories | - | CategoryList |
| GET | `/collections` | Get all collections | - | CollectionList |
| GET | `/{id}` | Get product details | Path param | ProductDetail |
| GET | `/by-type/{type}` | Get products by type | Path param | ProductList |
| GET | `/{id}/price` | Get product price | Path param | PriceInfo |
| POST | `/prices` | Get bulk prices | ProductIds | PriceList |

### GET /api/products/search

**Query Parameters:**
- `q` (string, required): Search query
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
      "collection": string,
      "thumbnailUrl": string,
      "price": number
    }
  ],
  "total": number
}
```

---

### GET /api/products/categories

**Response:**
```json
{
  "success": boolean,
  "categories": [
    {
      "id": string,
      "name": string,
      "icon": string,
      "productCount": number
    }
  ]
}
```

---

### GET /api/products/collections

**Response:**
```json
{
  "success": boolean,
  "collections": [
    {
      "id": string,
      "name": string,
      "description": string,
      "imageUrl": string,
      "productCount": number
    }
  ]
}
```

---

### GET /api/products/{id}

**Response:**
```json
{
  "success": boolean,
  "product": {
    "id": string,
    "name": string,
    "description": string,
    "category": { "id": string, "name": string },
    "collection": { "id": string, "name": string },
    "dimensions": {
      "width": number,
      "depth": number,
      "height": number,
      "unit": "cm" | "inches"
    },
    "images": string[],
    "thumbnailUrl": string,
    "model3dUrl": string,
    "price": number,
    "currency": string,
    "inStock": boolean,
    "stockQuantity": number,
    "productPageUrl": string
  }
}
```

---

### GET /api/products/by-type/{type}

**Path Parameters:**
- `type`: "sofa" | "table" | "chair" | "bed" | "desk" | "storage"

**Query Parameters:**
- `limit` (number, optional): Max results, default 10
- `priceMax` (number, optional): Maximum price filter

**Response:**
```json
{
  "success": boolean,
  "products": [
    {
      "id": string,
      "name": string,
      "dimensions": object,
      "price": number,
      "thumbnailUrl": string,
      "model3dUrl": string
    }
  ],
  "total": number
}
```

---

### GET /api/products/{id}/price

**Response:**
```json
{
  "success": boolean,
  "productId": string,
  "price": number,
  "currency": string,
  "originalPrice": number | null,
  "discount": number | null,
  "inStock": boolean
}
```

---

### POST /api/products/prices

**Request:**
```json
{
  "productIds": string[]
}
```

**Response:**
```json
{
  "success": boolean,
  "prices": [
    {
      "productId": string,
      "price": number,
      "inStock": boolean
    }
  ],
  "totalPrice": number
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
Frontend                    AI Service              Product Service
   │                            │                         │
   │ POST /api/ai/recommend     │                         │
   │ ─────────────────────────▶ │                         │
   │                            │ GET /api/products/search│
   │                            │ ───────────────────────▶│
   │                            │ ◀─────────────────────── │
   │                            │                         │
   │                            │ GET /api/products/{id}  │
   │                            │ ───────────────────────▶│
   │                            │ ◀─────────────────────── │
   │ ◀───────────────────────── │                         │
   │  recommendations           │                         │
```

### Flow 2: Furniture Detection & Replacement

```
Frontend                    AI Service              Product Service
   │                            │                         │
   │ POST /api/ai/detect        │                         │
   │ ─────────────────────────▶ │                         │
   │ ◀───────────────────────── │                         │
   │  detectedItems             │                         │
   │                            │                         │
   │ POST /api/ai/replace       │                         │
   │ ─────────────────────────▶ │                         │
   │                            │ GET /api/products/{id}  │
   │                            │ ───────────────────────▶│
   │                            │ ◀─────────────────────── │
   │ ◀───────────────────────── │                         │
   │  resultImageUrl            │                         │
```

### Flow 3: View Product Details

```
Frontend                                          Product Service
   │                                                    │
   │ GET /api/products/{id}                             │
   │ ─────────────────────────────────────────────────▶ │
   │ ◀───────────────────────────────────────────────── │
   │  productDetails                                    │
```
