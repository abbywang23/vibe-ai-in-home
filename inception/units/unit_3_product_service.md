# Unit 3: Product Service (DEPRECATED - Integrated into Unit 2)

## ⚠️ DEPRECATION NOTICE

**This unit has been integrated into Unit 2 (AI Service) for simplified architecture.**

- Product data is now managed via local YAML configuration in AI Service
- All product APIs are now available at `/api/ai/products/*` endpoints
- No separate Product Service deployment is needed

## Historical Overview
Backend service that provided product data APIs including search, categories, collections, and pricing. Originally used in-memory storage with mock data for demo purposes.

**Status:** DEPRECATED - Functionality moved to AI Service  
**Migration Date:** Current  
**Replacement:** Unit 2 AI Service with integrated product management

---

## Migrated User Stories

The following user stories are now handled by Unit 2 (AI Service):

### Product Search

#### US-3.2: Specify Product Preferences by Name ✅ Migrated
**As a** user  
**I want to** search and specify products by name  
**So that** I can include specific Castlery items I already like

**New Implementation:** `GET /api/ai/products/search`

### Product Categories

#### US-3.3: Specify Product Preferences by Category ✅ Migrated
**As a** user  
**I want to** filter products by category  
**So that** I can focus on specific furniture types

**New Implementation:** `GET /api/ai/products/categories`

---

## Migration Notes

- All product data moved to `/config/products.yaml` in AI Service
- Product images moved to `/public/products/` in AI Service
- API endpoints changed from `/api/products/*` to `/api/ai/products/*`
- Frontend updated to use consolidated AI Service endpoints  
**I want to** select furniture categories I'm interested in  
**So that** AI focuses on those types of furniture

**Acceptance Criteria:**
- Display available furniture categories (sofas, tables, chairs, beds, etc.)
- Multi-select capability
- Categories pulled from Castlery database

---

### Product Collections

#### US-3.4: Specify Product Preferences by Collection
**As a** user  
**I want to** select Castlery collections I prefer  
**So that** AI suggests cohesive furniture sets

**Acceptance Criteria:**
- Display available Castlery collections
- Collection preview images
- Multi-select capability

---

### Product Details

#### US-7.1: View Product Details
**As a** user  
**I want to** view details of any furniture item in my design  
**So that** I can learn more about the product

**Acceptance Criteria:**
- Click on furniture item to see details
- Display product name, description, dimensions
- Show product image from Castlery catalog
- Link to full product page on Castlery website

---

### Product Pricing

#### US-7.2: View Product Pricing
**As a** user  
**I want to** see the price of each furniture item  
**So that** I can understand the cost breakdown

**Acceptance Criteria:**
- Display current price from Castlery database
- Show total cost of all items in design
- Price updates if items are changed

---

## API Endpoints (Exposed)

### Search API

#### GET /api/products/search
Search products by name with autocomplete support.

**Query Parameters:**
- `q` (string): Search query
- `limit` (number, optional): Max results (default: 10)

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_123",
      "name": "Modern Leather Sofa",
      "category": "sofa",
      "collection": "Modern Living",
      "thumbnailUrl": "https://cdn.castlery.com/thumb_123.jpg",
      "price": 1299
    }
  ],
  "total": 25
}
```

---

### Categories API

#### GET /api/products/categories
Get all available product categories.

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "cat_sofa",
      "name": "Sofas",
      "icon": "sofa",
      "productCount": 45
    },
    {
      "id": "cat_table",
      "name": "Tables",
      "icon": "table",
      "productCount": 32
    },
    {
      "id": "cat_chair",
      "name": "Chairs",
      "icon": "chair",
      "productCount": 28
    },
    {
      "id": "cat_bed",
      "name": "Beds",
      "icon": "bed",
      "productCount": 18
    },
    {
      "id": "cat_storage",
      "name": "Storage",
      "icon": "cabinet",
      "productCount": 22
    },
    {
      "id": "cat_desk",
      "name": "Desks",
      "icon": "desk",
      "productCount": 15
    }
  ]
}
```

---

### Collections API

#### GET /api/products/collections
Get all available product collections.

**Response:**
```json
{
  "success": true,
  "collections": [
    {
      "id": "col_modern",
      "name": "Modern Living",
      "description": "Clean lines and contemporary design",
      "imageUrl": "https://cdn.castlery.com/col_modern.jpg",
      "productCount": 35
    },
    {
      "id": "col_nordic",
      "name": "Nordic Comfort",
      "description": "Scandinavian-inspired minimalism",
      "imageUrl": "https://cdn.castlery.com/col_nordic.jpg",
      "productCount": 28
    },
    {
      "id": "col_classic",
      "name": "Classic Elegance",
      "description": "Timeless traditional styles",
      "imageUrl": "https://cdn.castlery.com/col_classic.jpg",
      "productCount": 22
    }
  ]
}
```

---

### Product Details API

#### GET /api/products/{id}
Get detailed information for a specific product.

**Path Parameters:**
- `id` (string): Product ID

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "prod_123",
    "name": "Modern Leather Sofa",
    "description": "A sleek, contemporary sofa with premium leather upholstery...",
    "category": {
      "id": "cat_sofa",
      "name": "Sofas"
    },
    "collection": {
      "id": "col_modern",
      "name": "Modern Living"
    },
    "dimensions": {
      "width": 220,
      "depth": 95,
      "height": 82,
      "unit": "cm"
    },
    "images": [
      "https://cdn.castlery.com/prod_123_1.jpg",
      "https://cdn.castlery.com/prod_123_2.jpg"
    ],
    "thumbnailUrl": "https://cdn.castlery.com/thumb_123.jpg",
    "model3dUrl": "https://cdn.castlery.com/models/prod_123.glb",
    "price": 1299,
    "currency": "USD",
    "inStock": true,
    "stockQuantity": 15,
    "productPageUrl": "https://www.castlery.com/products/modern-leather-sofa"
  }
}
```

---

### Product by Type API

#### GET /api/products/by-type/{type}
Get products filtered by furniture type (used by AI Service for replacements).

**Path Parameters:**
- `type` (string): Furniture type (sofa, table, chair, bed, desk, storage)

**Query Parameters:**
- `limit` (number, optional): Max results (default: 10)
- `priceMax` (number, optional): Maximum price filter

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod_123",
      "name": "Modern Leather Sofa",
      "dimensions": { "width": 220, "depth": 95, "height": 82, "unit": "cm" },
      "price": 1299,
      "thumbnailUrl": "https://cdn.castlery.com/thumb_123.jpg",
      "model3dUrl": "https://cdn.castlery.com/models/prod_123.glb"
    }
  ],
  "total": 45
}
```

---

### Pricing API

#### GET /api/products/{id}/price
Get current pricing for a product.

**Path Parameters:**
- `id` (string): Product ID

**Response:**
```json
{
  "success": true,
  "productId": "prod_123",
  "price": 1299,
  "currency": "USD",
  "originalPrice": 1499,
  "discount": 13,
  "inStock": true
}
```

---

### Bulk Pricing API

#### POST /api/products/prices
Get pricing for multiple products at once.

**Request Body:**
```json
{
  "productIds": ["prod_123", "prod_456", "prod_789"]
}
```

**Response:**
```json
{
  "success": true,
  "prices": [
    { "productId": "prod_123", "price": 1299, "inStock": true },
    { "productId": "prod_456", "price": 899, "inStock": true },
    { "productId": "prod_789", "price": 450, "inStock": false }
  ],
  "totalPrice": 2648
}
```

---

## Data Model (In-Memory)

### Product
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  collectionId: string;
  dimensions: {
    width: number;
    depth: number;
    height: number;
    unit: 'cm' | 'inches';
  };
  images: string[];
  thumbnailUrl: string;
  model3dUrl: string;
  price: number;
  originalPrice?: number;
  currency: string;
  inStock: boolean;
  stockQuantity: number;
  productPageUrl: string;
  furnitureType: 'sofa' | 'table' | 'chair' | 'bed' | 'desk' | 'storage';
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
}
```

### Collection
```typescript
interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}
```
