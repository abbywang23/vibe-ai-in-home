# Unit 3: Product Service - Logical Design

## Overview

The Product Service is a Node.js/TypeScript backend service that manages the Castlery product catalog. It provides REST APIs for product search, category/collection browsing, and pricing information. The service is designed with the Repository Pattern to support both in-memory demo mode and production database integration.

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript 5+
- **Framework**: Express.js
- **Validation**: Zod
- **Database (Production)**: PostgreSQL with TypeORM
- **In-Memory Store (Demo)**: JavaScript Map/Set

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI
- **Database Migrations**: TypeORM migrations

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Product Service                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Layer (Express)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │ Product  │  │ Category │  │Collection│  │  Price   │   │ │
│  │  │Controller│  │Controller│  │Controller│  │Controller│   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │ Product  │  │ Category │  │Collection│  │  Price   │   │ │
│  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Domain Layer                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Models  │  │  Types   │  │Validators│  │Factories │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Infrastructure Layer                       │ │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │           Repository Implementations                  │  │ │
│  │  │  ┌───────────────┐        ┌───────────────┐          │  │ │
│  │  │  │  InMemory     │   OR   │  PostgreSQL   │          │  │ │
│  │  │  │  Repository   │        │  Repository   │          │  │ │
│  │  │  │   (Demo)      │        │ (Production)  │          │  │ │
│  │  │  └───────────────┘        └───────────────┘          │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### GET /api/products/search
**Purpose**: Search products by name

**Query Parameters**:
- `q` (string, required): Search query
- `limit` (number, optional): Max results (default: 10)

**Response**:
```typescript
interface ProductSearchResponse {
  success: boolean;
  products: ProductSummary[];
  total: number;
}
```

### GET /api/products/categories
**Purpose**: Get all product categories

**Response**:
```typescript
interface CategoryListResponse {
  success: boolean;
  categories: Category[];
}
```

### GET /api/products/collections
**Purpose**: Get all product collections

**Response**:
```typescript
interface CollectionListResponse {
  success: boolean;
  collections: Collection[];
}
```

### GET /api/products/:id
**Purpose**: Get product details by ID

**Response**:
```typescript
interface ProductDetailResponse {
  success: boolean;
  product: ProductDetail;
}
```

### GET /api/products/by-type/:type
**Purpose**: Get products by furniture type

**Path Parameters**:
- `type`: FurnitureType enum

**Query Parameters**:
- `limit` (number, optional): Max results
- `priceMax` (number, optional): Maximum price filter

**Response**:
```typescript
interface ProductListResponse {
  success: boolean;
  products: ProductSummary[];
  total: number;
}
```


### GET /api/products/:id/price
**Purpose**: Get product price information

**Query Parameters**:
- `variantId` (string, optional): Get price for specific variant

**Response**:
```typescript
interface PriceResponse {
  success: boolean;
  productId: string;
  variantId?: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
}
```

### GET /api/products/:id/options
**Purpose**: Get all available options for a product

**Response**:
```typescript
interface ProductOptionsResponse {
  success: boolean;
  productId: string;
  options: Array<{
    id: string;
    optionType: OptionType;
    displayName: string;
    isRequired: boolean;
    values: Array<{
      id: string;
      value: string;
      displayName: string;
      hexColor?: string;
      imageUrl?: string;
      priceAdjustment?: number;
      isDefault: boolean;
      isAvailable: boolean;
    }>;
  }>;
}
```

### POST /api/products/:id/find-variant
**Purpose**: Find product variant matching option selections

**Request Body**:
```typescript
interface FindVariantRequest {
  selections: Record<string, string>;  // optionId -> valueId
}
```

**Response**:
```typescript
interface FindVariantResponse {
  success: boolean;
  variant?: {
    id: string;
    sku: string;
    price: number;
    stockQuantity: number;
    images?: string[];
    isAvailable: boolean;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### GET /api/products/:id/variants
**Purpose**: Get all variants for a product

**Response**:
```typescript
interface ProductVariantsResponse {
  success: boolean;
  productId: string;
  variants: Array<{
    id: string;
    sku: string;
    optionSelections: Record<string, string>;
    price?: number;
    stockQuantity: number;
    isAvailable: boolean;
  }>;
}
```
  productId: string;
  price: number;
  currency: string;
  originalPrice?: number;
  discount?: number;
  inStock: boolean;
}
```

### POST /api/products/prices
**Purpose**: Get bulk prices for multiple products

**Request Body**:
```typescript
interface BulkPriceRequest {
  productIds: string[];
}
```

**Response**:
```typescript
interface BulkPriceResponse {
  success: boolean;
  prices: Array<{
    productId: string;
    price: number;
    inStock: boolean;
  }>;
  totalPrice: number;
}
```

---

## Domain Models

### Product

```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  collectionId: string;
  dimensions: ProductDimensions;
  furnitureType: FurnitureType;
  images: string[];
  thumbnailUrl: string;
  model3dUrl?: string;
  productPageUrl: string;
  options: ProductOption[];  // Available customization options
  variants: ProductVariant[];  // Product variants with different option combinations
  createdAt: Date;
  updatedAt: Date;
}

interface ProductOption {
  id: string;
  productId: string;
  optionType: OptionType;
  displayName: string;
  isRequired: boolean;
  displayOrder: number;
  values: ProductOptionValue[];
}

interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string;  // Internal identifier (e.g., "pearl_beige")
  displayName: string;  // User-friendly name (e.g., "Pearl Beige")
  hexColor?: string;  // For color swatches
  imageUrl?: string;  // Visual representation
  priceAdjustment?: number;  // Price modifier
  isDefault: boolean;
  isAvailable: boolean;
  displayOrder: number;
}

interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  optionSelections: Record<string, string>;  // optionId -> valueId
  price?: number;  // Variant-specific price (overrides base if set)
  stockQuantity: number;
  images?: string[];  // Variant-specific images
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum OptionType {
  MATERIAL = 'material',
  ORIENTATION = 'orientation',
  LEG_COLOR = 'leg_color',
  SIZE = 'size',
  COLOR = 'color',
  CONFIGURATION = 'configuration',
}
  productPageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductDimensions {
  width: number;
  depth: number;
  height: number;
  unit: 'cm' | 'inches';
}

enum FurnitureType {
  SOFA = 'sofa',
  TABLE = 'table',
  CHAIR = 'chair',
  BED = 'bed',
  DESK = 'desk',
  STORAGE = 'storage',
}
```

### Category

```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  productCount: number;
  createdAt: Date;
}
```

### Collection

```typescript
interface Collection {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  productCount: number;
  createdAt: Date;
}
```

### Price

```typescript
interface Price {
  id: string;
  productId: string;
  currentPrice: number;
  originalPrice?: number;
  currency: string;
  discountPercentage?: number;
  validFrom: Date;
  validUntil?: Date;
}
```

### StockInfo

```typescript
interface StockInfo {
  productId: string;
  quantity: number;
  inStock: boolean;
  lowStockThreshold: number;
}
```

---

## Repository Pattern

### Repository Interfaces

```typescript
interface IProductRepository {
  save(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findByIds(ids: string[]): Promise<Product[]>;
  findByCategory(categoryId: string): Promise<Product[]>;
  findByCollection(collectionId: string): Promise<Product[]>;
  findByFurnitureType(type: FurnitureType): Promise<Product[]>;
  search(query: string, limit: number): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  delete(id: string): Promise<void>;
}

interface ICategoryRepository {
  save(category: Category): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  findByName(name: string): Promise<Category | null>;
  delete(id: string): Promise<void>;
}

interface ICollectionRepository {
  save(collection: Collection): Promise<Collection>;
  findById(id: string): Promise<Collection | null>;
  findAll(): Promise<Collection[]>;
  findByName(name: string): Promise<Collection | null>;
  delete(id: string): Promise<void>;
}

interface IPriceRepository {
  save(price: Price): Promise<Price>;
  findByProductId(productId: string): Promise<Price | null>;
  findByProductIds(productIds: string[]): Promise<Price[]>;
  delete(id: string): Promise<void>;
}
```

### In-Memory Repository Implementation (Demo)

```typescript
class InMemoryProductRepository implements IProductRepository {
  private products: Map<string, Product> = new Map();

  async save(product: Product): Promise<Product> {
    this.products.set(product.id, product);
    return product;
  }

  async findById(id: string): Promise<Product | null> {
    return this.products.get(id) || null;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map(id => this.products.get(id))
      .filter((p): p is Product => p !== undefined);
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.categoryId === categoryId);
  }

  async findByCollection(collectionId: string): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.collectionId === collectionId);
  }

  async findByFurnitureType(type: FurnitureType): Promise<Product[]> {
    return Array.from(this.products.values())
      .filter(p => p.furnitureType === type);
  }

  async search(query: string, limit: number): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.products.values())
      .filter(p => p.name.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async delete(id: string): Promise<void> {
    this.products.delete(id);
  }
}
```

### PostgreSQL Repository Implementation (Production)

```typescript
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/ProductEntity';

class PostgresProductRepository implements IProductRepository {
  private repository: Repository<ProductEntity>;

  constructor(repository: Repository<ProductEntity>) {
    this.repository = repository;
  }

  async save(product: Product): Promise<Product> {
    const entity = this.toEntity(product);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    const entities = await this.repository.findByIds(ids);
    return entities.map(e => this.toDomain(e));
  }

  async findByCategory(categoryId: string): Promise<Product[]> {
    const entities = await this.repository.find({ where: { categoryId } });
    return entities.map(e => this.toDomain(e));
  }

  async search(query: string, limit: number): Promise<Product[]> {
    const entities = await this.repository
      .createQueryBuilder('product')
      .where('LOWER(product.name) LIKE LOWER(:query)', { query: `%${query}%` })
      .limit(limit)
      .getMany();
    return entities.map(e => this.toDomain(e));
  }

  private toEntity(product: Product): ProductEntity {
    // Map domain model to database entity
    return { ...product };
  }

  private toDomain(entity: ProductEntity): Product {
    // Map database entity to domain model
    return { ...entity };
  }
}
```

---

## Service Layer

### ProductService

```typescript
class ProductService {
  constructor(
    private productRepo: IProductRepository,
    private priceRepo: IPriceRepository
  ) {}

  async searchProducts(query: string, limit: number = 10): Promise<ProductSummary[]> {
    const products = await this.productRepo.search(query, limit);
    const prices = await this.priceRepo.findByProductIds(products.map(p => p.id));
    
    return products.map(product => {
      const price = prices.find(p => p.productId === product.id);
      return this.toSummary(product, price);
    });
  }

  async getProductById(id: string): Promise<ProductDetail | null> {
    const product = await this.productRepo.findById(id);
    if (!product) return null;

    const price = await this.priceRepo.findByProductId(id);
    return this.toDetail(product, price);
  }

  async getProductsByType(
    type: FurnitureType,
    maxPrice?: number,
    limit?: number
  ): Promise<ProductSummary[]> {
    let products = await this.productRepo.findByFurnitureType(type);
    const prices = await this.priceRepo.findByProductIds(products.map(p => p.id));

    // Filter by price if specified
    if (maxPrice) {
      products = products.filter(p => {
        const price = prices.find(pr => pr.productId === p.id);
        return price && price.currentPrice <= maxPrice;
      });
    }

    // Apply limit
    if (limit) {
      products = products.slice(0, limit);
    }

    return products.map(product => {
      const price = prices.find(p => p.productId === product.id);
      return this.toSummary(product, price);
    });
  }

  async getBulkPrices(productIds: string[]): Promise<BulkPriceResponse> {
    const prices = await this.priceRepo.findByProductIds(productIds);
    const totalPrice = prices.reduce((sum, p) => sum + p.currentPrice, 0);

    return {
      success: true,
      prices: prices.map(p => ({
        productId: p.productId,
        price: p.currentPrice,
        inStock: true, // Simplified for demo
      })),
      totalPrice,
    };
  }

  async getProductOptions(productId: string): Promise<ProductOption[]> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.options || [];
  }

  async findVariantBySelection(
    productId: string,
    selections: Record<string, string>
  ): Promise<ProductVariant | null> {
    const product = await this.productRepo.findById(productId);
    if (!product || !product.variants) {
      return null;
    }

    // Find variant that matches all selections
    const variant = product.variants.find(v => {
      return Object.entries(selections).every(
        ([optionId, valueId]) => v.optionSelections[optionId] === valueId
      );
    });

    return variant || null;
  }

  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }
    return product.variants || [];
  }

  async calculatePriceWithOptions(
    productId: string,
    selections: Record<string, string>
  ): Promise<number> {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    // Check if there's a matching variant with specific price
    const variant = await this.findVariantBySelection(productId, selections);
    if (variant && variant.price) {
      return variant.price;
    }

    // Otherwise, calculate base price + option adjustments
    const basePrice = await this.priceRepo.findByProductId(productId);
    let totalPrice = basePrice?.currentPrice || 0;

    // Add price adjustments from selected options
    for (const option of product.options || []) {
      const selectedValueId = selections[option.id];
      if (selectedValueId) {
        const value = option.values.find(v => v.id === selectedValueId);
        if (value && value.priceAdjustment) {
          totalPrice += value.priceAdjustment;
        }
      }
    }

    return totalPrice;
  }

  private toSummary(product: Product, price?: Price): ProductSummary {
    return {
      id: product.id,
      name: product.name,
      category: product.categoryId,
      collection: product.collectionId,
      thumbnailUrl: product.thumbnailUrl,
      price: price?.currentPrice || 0,
    };
  }

  private toDetail(product: Product, price?: Price): ProductDetail {
    return {
      ...product,
      options: product.options || [],
      variants: product.variants || [],
      price: price?.currentPrice || 0,
      currency: price?.currency || 'USD',
      originalPrice: price?.originalPrice,
      discount: price?.discountPercentage,
      inStock: true, // Simplified for demo
    };
  }
}
```

### CategoryService

```typescript
class CategoryService {
  constructor(
    private categoryRepo: ICategoryRepository,
    private productRepo: IProductRepository
  ) {}

  async getAllCategories(): Promise<Category[]> {
    const categories = await this.categoryRepo.findAll();
    
    // Update product counts
    for (const category of categories) {
      const products = await this.productRepo.findByCategory(category.id);
      category.productCount = products.length;
    }
    
    return categories;
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepo.findById(id);
  }
}
```

### CollectionService

```typescript
class CollectionService {
  constructor(
    private collectionRepo: ICollectionRepository,
    private productRepo: IProductRepository
  ) {}

  async getAllCollections(): Promise<Collection[]> {
    const collections = await this.collectionRepo.findAll();
    
    // Update product counts
    for (const collection of collections) {
      const products = await this.productRepo.findByCollection(collection.id);
      collection.productCount = products.length;
    }
    
    return collections;
  }

  async getCollectionById(id: string): Promise<Collection | null> {
    return this.collectionRepo.findById(id);
  }
}
```

---

## Mock Data Factory

```typescript
class MockDataFactory {
  generateMockProducts(): Product[] {
    const products: Product[] = [
      {
        id: 'prod_001',
        name: 'Owen Chaise Sectional Sofa',
        description: 'Removable Covers, Machine Washable',
        categoryId: 'cat_sofa',
        collectionId: 'col_modern',
        dimensions: { width: 220, depth: 90, height: 85, unit: 'cm' },
        furnitureType: FurnitureType.SOFA,
        images: ['/images/owen_sofa_1.jpg', '/images/owen_sofa_2.jpg'],
        thumbnailUrl: '/images/owen_sofa_thumb.jpg',
        model3dUrl: '/models/owen_sofa.glb',
        productPageUrl: 'https://castlery.com/products/owen-chaise-sectional-sofa',
        options: this.generateOptionsForOwen(),
        variants: this.generateVariantsForOwen(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // ... more products
    ];
    return products;
  }

  private generateOptionsForOwen(): ProductOption[] {
    return [
      {
        id: 'opt_001_orientation',
        productId: 'prod_001',
        optionType: OptionType.ORIENTATION,
        displayName: 'Orientation',
        isRequired: true,
        displayOrder: 1,
        values: [
          {
            id: 'val_001_left',
            optionId: 'opt_001_orientation',
            value: 'left_facing',
            displayName: 'Left Facing',
            isDefault: true,
            isAvailable: true,
            displayOrder: 1,
          },
          {
            id: 'val_001_right',
            optionId: 'opt_001_orientation',
            value: 'right_facing',
            displayName: 'Right Facing',
            isDefault: false,
            isAvailable: true,
            displayOrder: 2,
          },
        ],
      },
      {
        id: 'opt_001_material',
        productId: 'prod_001',
        optionType: OptionType.MATERIAL,
        displayName: 'Material',
        isRequired: true,
        displayOrder: 2,
        values: [
          {
            id: 'val_001_pearl',
            optionId: 'opt_001_material',
            value: 'pearl_beige',
            displayName: 'Pearl Beige',
            hexColor: '#F5F5DC',
            isDefault: true,
            isAvailable: true,
            displayOrder: 1,
          },
          {
            id: 'val_001_charcoal',
            optionId: 'opt_001_material',
            value: 'charcoal_grey',
            displayName: 'Charcoal Grey',
            hexColor: '#36454F',
            priceAdjustment: 100,
            isDefault: false,
            isAvailable: true,
            displayOrder: 2,
          },
        ],
      },
      {
        id: 'opt_001_leg',
        productId: 'prod_001',
        optionType: OptionType.LEG_COLOR,
        displayName: 'Leg Color',
        isRequired: true,
        displayOrder: 3,
        values: [
          {
            id: 'val_001_walnut',
            optionId: 'opt_001_leg',
            value: 'walnut',
            displayName: 'Walnut',
            hexColor: '#5C4033',
            isDefault: true,
            isAvailable: true,
            displayOrder: 1,
          },
          {
            id: 'val_001_oak',
            optionId: 'opt_001_leg',
            value: 'oak',
            displayName: 'Oak',
            hexColor: '#C19A6B',
            isDefault: false,
            isAvailable: true,
            displayOrder: 2,
          },
        ],
      },
    ];
  }

  private generateVariantsForOwen(): ProductVariant[] {
    return [
      {
        id: 'var_001_1',
        productId: 'prod_001',
        sku: 'OWEN-LF-PB-WN',
        optionSelections: {
          opt_001_orientation: 'val_001_left',
          opt_001_material: 'val_001_pearl',
          opt_001_leg: 'val_001_walnut',
        },
        stockQuantity: 15,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var_001_2',
        productId: 'prod_001',
        sku: 'OWEN-RF-PB-WN',
        optionSelections: {
          opt_001_orientation: 'val_001_right',
          opt_001_material: 'val_001_pearl',
          opt_001_leg: 'val_001_walnut',
        },
        stockQuantity: 12,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'var_001_3',
        productId: 'prod_001',
        sku: 'OWEN-LF-CG-WN',
        optionSelections: {
          opt_001_orientation: 'val_001_left',
          opt_001_material: 'val_001_charcoal',
          opt_001_leg: 'val_001_walnut',
        },
        price: 2099, // Base price + material adjustment
        stockQuantity: 8,
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // ... more variants
    ];
  }

  generateMockCategories(): Category[] {
    return [
      { id: 'cat_sofa', name: 'Sofas', icon: '🛋️', productCount: 0, createdAt: new Date() },
      { id: 'cat_table', name: 'Tables', icon: '🪑', productCount: 0, createdAt: new Date() },
      { id: 'cat_chair', name: 'Chairs', icon: '💺', productCount: 0, createdAt: new Date() },
      { id: 'cat_bed', name: 'Beds', icon: '🛏️', productCount: 0, createdAt: new Date() },
      { id: 'cat_storage', name: 'Storage', icon: '🗄️', productCount: 0, createdAt: new Date() },
      { id: 'cat_desk', name: 'Desks', icon: '🖥️', productCount: 0, createdAt: new Date() },
    ];
  }

  generateMockCollections(): Collection[] {
    return [
      {
        id: 'col_modern',
        name: 'Modern Living',
        description: 'Contemporary furniture with clean lines',
        imageUrl: '/images/modern_collection.jpg',
        productCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'col_nordic',
        name: 'Nordic Comfort',
        description: 'Scandinavian-inspired minimalist design',
        imageUrl: '/images/nordic_collection.jpg',
        productCount: 0,
        createdAt: new Date(),
      },
      {
        id: 'col_classic',
        name: 'Classic Elegance',
        description: 'Timeless traditional furniture',
        imageUrl: '/images/classic_collection.jpg',
        productCount: 0,
        createdAt: new Date(),
      },
    ];
  }

  generateMockPrices(products: Product[]): Price[] {
    return products.map(product => ({
      id: `price_${product.id}`,
      productId: product.id,
      currentPrice: Math.floor(Math.random() * 2000) + 500,
      originalPrice: undefined,
      currency: 'USD',
      discountPercentage: undefined,
      validFrom: new Date(),
      validUntil: undefined,
    }));
  }
}
```


---

## Dependency Injection

```typescript
// Container setup
class ServiceContainer {
  private static instance: ServiceContainer;
  
  private productRepo: IProductRepository;
  private categoryRepo: ICategoryRepository;
  private collectionRepo: ICollectionRepository;
  private priceRepo: IPriceRepository;
  
  private productService: ProductService;
  private categoryService: CategoryService;
  private collectionService: CollectionService;

  private constructor() {
    // Initialize repositories based on environment
    if (process.env.REPOSITORY_MODE === 'postgres') {
      this.initializePostgresRepositories();
    } else {
      this.initializeInMemoryRepositories();
    }
    
    // Initialize services
    this.productService = new ProductService(this.productRepo, this.priceRepo);
    this.categoryService = new CategoryService(this.categoryRepo, this.productRepo);
    this.collectionService = new CollectionService(this.collectionRepo, this.productRepo);
  }

  private initializeInMemoryRepositories() {
    this.productRepo = new InMemoryProductRepository();
    this.categoryRepo = new InMemoryCategoryRepository();
    this.collectionRepo = new InMemoryCollectionRepository();
    this.priceRepo = new InMemoryPriceRepository();
    
    // Seed with mock data
    this.seedMockData();
  }

  private initializePostgresRepositories() {
    // Initialize TypeORM repositories
    // this.productRepo = new PostgresProductRepository(...);
    // ...
  }

  private seedMockData() {
    const factory = new MockDataFactory();
    const categories = factory.generateMockCategories();
    const collections = factory.generateMockCollections();
    const products = factory.generateMockProducts();
    const prices = factory.generateMockPrices(products);

    categories.forEach(c => this.categoryRepo.save(c));
    collections.forEach(c => this.collectionRepo.save(c));
    products.forEach(p => this.productRepo.save(p));
    prices.forEach(p => this.priceRepo.save(p));
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  getProductService(): ProductService {
    return this.productService;
  }

  getCategoryService(): CategoryService {
    return this.categoryService;
  }

  getCollectionService(): CollectionService {
    return this.collectionService;
  }
}
```

---

## Controllers

### ProductController

```typescript
class ProductController {
  constructor(private productService: ProductService) {}

  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'Query parameter "q" is required' },
        });
      }

      const products = await this.productService.searchProducts(
        q,
        limit ? parseInt(limit as string) : 10
      );

      res.json({
        success: true,
        products,
        total: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await this.productService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Product not found' },
        });
      }

      res.json({
        success: true,
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params;
      const { limit, priceMax } = req.query;

      const products = await this.productService.getProductsByType(
        type as FurnitureType,
        priceMax ? parseFloat(priceMax as string) : undefined,
        limit ? parseInt(limit as string) : undefined
      );

      res.json({
        success: true,
        products,
        total: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getBulkPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const { productIds } = req.body;

      if (!Array.isArray(productIds)) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'productIds must be an array' },
        });
      }

      const result = await this.productService.getBulkPrices(productIds);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getProductOptions(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const options = await this.productService.getProductOptions(id);

      res.json({
        success: true,
        productId: id,
        options,
      });
    } catch (error) {
      next(error);
    }
  }

  async findVariant(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { selections } = req.body;

      if (!selections || typeof selections !== 'object') {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_REQUEST', message: 'selections object is required' },
        });
      }

      const variant = await this.productService.findVariantBySelection(id, selections);

      if (!variant) {
        return res.json({
          success: false,
          error: {
            code: 'VARIANT_NOT_FOUND',
            message: 'No variant matches the selected options',
          },
        });
      }

      res.json({
        success: true,
        variant: {
          id: variant.id,
          sku: variant.sku,
          price: variant.price,
          stockQuantity: variant.stockQuantity,
          images: variant.images,
          isAvailable: variant.isAvailable,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getProductVariants(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const variants = await this.productService.getProductVariants(id);

      res.json({
        success: true,
        productId: id,
        variants,
      });
    } catch (error) {
      next(error);
    }
  }
}
```

---

## Validation (Zod Schemas)

```typescript
const ProductSearchSchema = z.object({
  q: z.string().min(1),
  limit: z.string().regex(/^\d+$/).optional(),
});

const BulkPriceRequestSchema = z.object({
  productIds: z.array(z.string()).min(1).max(50),
});

const FurnitureTypeSchema = z.enum(['sofa', 'table', 'chair', 'bed', 'desk', 'storage']);
```

---

## Error Handling

```typescript
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof z.ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: 'Invalid request parameters',
        details: err.errors,
      },
    });
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
```

---

## Configuration

### Environment Variables

```env
# Server
PORT=3002
NODE_ENV=development

# Repository Mode
REPOSITORY_MODE=inmemory  # or 'postgres'

# PostgreSQL (Production)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=castlery_products
DB_USER=postgres
DB_PASSWORD=password

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
```

### TypeORM Configuration (Production)

```typescript
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/entities/*.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // Use migrations in production
  logging: process.env.NODE_ENV === 'development',
});
```

---

## Database Schema (Production)

### Products Table

```sql
CREATE TABLE products (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id VARCHAR(50) NOT NULL,
  collection_id VARCHAR(50) NOT NULL,
  furniture_type VARCHAR(50) NOT NULL,
  dimensions JSONB NOT NULL,
  images JSONB NOT NULL,
  thumbnail_url VARCHAR(500),
  model_3d_url VARCHAR(500),
  product_page_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  FOREIGN KEY (collection_id) REFERENCES collections(id)
);

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_collection ON products(collection_id);
CREATE INDEX idx_products_furniture_type ON products(furniture_type);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
```

### Categories Table

```sql
CREATE TABLE categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Collections Table

```sql
CREATE TABLE collections (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Prices Table

```sql
CREATE TABLE prices (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(3) NOT NULL,
  discount_percentage DECIMAL(5, 2),
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE INDEX idx_prices_product ON prices(product_id);
```

### Product Options Table

```sql
CREATE TABLE product_options (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  option_type VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_options_product ON product_options(product_id);
```

### Product Option Values Table

```sql
CREATE TABLE product_option_values (
  id VARCHAR(50) PRIMARY KEY,
  option_id VARCHAR(50) NOT NULL,
  value VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  hex_color VARCHAR(7),
  image_url VARCHAR(500),
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (option_id) REFERENCES product_options(id) ON DELETE CASCADE,
  UNIQUE(option_id, value)
);

CREATE INDEX idx_option_values_option ON product_option_values(option_id);
```

### Product Variants Table

```sql
CREATE TABLE product_variants (
  id VARCHAR(50) PRIMARY KEY,
  product_id VARCHAR(50) NOT NULL,
  sku VARCHAR(100) NOT NULL UNIQUE,
  option_selections JSONB NOT NULL,
  price DECIMAL(10, 2),
  stock_quantity INTEGER DEFAULT 0,
  images JSONB,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_variants_sku ON product_variants(sku);
CREATE INDEX idx_variants_selections ON product_variants USING gin(option_selections);
```

---

## Testing Strategy

### Unit Tests (Jest)

```typescript
describe('ProductService', () => {
  let service: ProductService;
  let mockProductRepo: jest.Mocked<IProductRepository>;
  let mockPriceRepo: jest.Mocked<IPriceRepository>;

  beforeEach(() => {
    mockProductRepo = {
      search: jest.fn(),
      findById: jest.fn(),
      findByFurnitureType: jest.fn(),
    } as any;
    mockPriceRepo = {
      findByProductIds: jest.fn(),
      findByProductId: jest.fn(),
    } as any;
    service = new ProductService(mockProductRepo, mockPriceRepo);
  });

  it('should search products by name', async () => {
    mockProductRepo.search.mockResolvedValue([
      { id: '1', name: 'Modern Sofa', categoryId: 'cat_sofa' } as Product,
    ]);
    mockPriceRepo.findByProductIds.mockResolvedValue([
      { productId: '1', currentPrice: 1000 } as Price,
    ]);

    const results = await service.searchProducts('sofa', 10);

    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Modern Sofa');
    expect(results[0].price).toBe(1000);
  });
});
```

### Integration Tests (Supertest)

```typescript
describe('GET /api/products/search', () => {
  it('should return products matching query', async () => {
    const response = await request(app)
      .get('/api/products/search')
      .query({ q: 'sofa', limit: 5 })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.products).toBeInstanceOf(Array);
    expect(response.body.products.length).toBeLessThanOrEqual(5);
  });

  it('should return 400 for missing query', async () => {
    const response = await request(app)
      .get('/api/products/search')
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });
});
```

---

## Deployment

### Development

```bash
npm install
npm run dev  # Starts server with nodemon on http://localhost:3002
```

### Production Build

```bash
npm run build  # Compiles TypeScript to /dist
npm run migrate  # Run database migrations (if using PostgreSQL)
npm start  # Runs compiled code
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3002

CMD ["node", "dist/index.js"]
```

---

## Performance Optimization

### Caching

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

class CachedProductService extends ProductService {
  async searchProducts(query: string, limit: number): Promise<ProductSummary[]> {
    const cacheKey = `search:${query}:${limit}`;
    const cached = cache.get<ProductSummary[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const results = await super.searchProducts(query, limit);
    cache.set(cacheKey, results);
    return results;
  }
}
```

---

## Project Structure

```
/src
  /controllers      # Request handlers
    ProductController.ts
    CategoryController.ts
    CollectionController.ts
  /services         # Business logic
    ProductService.ts
    CategoryService.ts
    CollectionService.ts
  /repositories     # Data access
    /interfaces
      IProductRepository.ts
      ICategoryRepository.ts
    /inmemory
      InMemoryProductRepository.ts
    /postgres
      PostgresProductRepository.ts
  /entities         # TypeORM entities (for PostgreSQL)
    ProductEntity.ts
    CategoryEntity.ts
  /models           # Domain models
    Product.ts
    Category.ts
    Collection.ts
  /factories        # Mock data generation
    MockDataFactory.ts
  /middleware       # Express middleware
    errorHandler.ts
    validation.ts
  /routes           # Route definitions
    index.ts
  /config           # Configuration
    database.ts
    container.ts
  index.ts          # Entry point
  app.ts            # Express app setup
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "node-cache": "^5.1.2",
    "typeorm": "^0.3.17",
    "pg": "^8.11.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/express": "^4.17.0",
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0"
  }
}
```

---

## Summary

The Product Service provides a clean, maintainable API for managing the Castlery product catalog. The Repository Pattern enables seamless switching between in-memory demo mode and production PostgreSQL database. The service is designed for scalability, with caching support, comprehensive error handling, and production-ready features.
