# Unit 3: Product Service - Domain Model

## Bounded Context: Product Catalog Context

The Product Service manages the Castlery product catalog including products, categories, collections, and pricing information. Both demo and production environments use **in-memory storage** (JavaScript Map/Set) for fast access without external dependencies.

---

## Domain Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Product Catalog Context                        │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Product     │    │   Category    │    │  Collection   │      │
│  │  (Aggregate)  │    │  (Aggregate)  │    │  (Aggregate)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                                │
│  │    Price      │                                                │
│  │   (Entity)    │                                                │
│  └──────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Architecture for Extensibility

```
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │ProductService│  │CategoryService│ │CollectionService│         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Domain Layer                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Product    │  │  Category   │  │ Collection  │              │
│  │ Repository  │  │ Repository  │  │ Repository  │              │
│  │ (Interface) │  │ (Interface) │  │ (Interface) │              │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │
└─────────┼────────────────┼────────────────┼─────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Infrastructure Layer                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Repository Implementation                    │    │
│  │  ┌─────────────────────────────────────────────────┐     │    │
│  │  │  In-Memory Repository (Demo & Production)        │     │    │
│  │  │  • JavaScript Map/Set for fast read/write      │     │    │
│  │  │  • No external dependencies                      │     │    │
│  │  └─────────────────────────────────────────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Aggregates

### 1. Product (Aggregate Root)

**Description:** Represents a Castlery furniture product with all its details, dimensions, pricing, media assets, and customizable options.

**Responsibilities:**
- Maintain product information integrity
- Manage pricing and discount calculations
- Track stock availability
- Provide 3D model and image assets
- Define available product options (material, color, orientation, leg color, etc.)
- Validate option combinations
- Track variants based on option selections

**Invariants:**
- Product must have a unique ID
- Product must belong to exactly one category
- Product must belong to exactly one collection
- Dimensions must be positive values
- Price must be non-negative
- Stock quantity must be non-negative
- Each product option must have at least one valid option value
- Option values must be unique within their option type
- Product variants must have unique option combinations
- Product must belong to exactly one collection
- Dimensions must be positive values
- Price must be non-negative
- Stock quantity must be non-negative

---

### 2. Category (Aggregate Root)

**Description:** Represents a furniture category (e.g., Sofas, Tables, Chairs).

**Responsibilities:**
- Group related products
- Provide category metadata (icon, description)
- Track product count in category

**Invariants:**
- Category must have a unique ID
- Category name must be non-empty
- Product count must reflect actual products

---

### 3. Collection (Aggregate Root)

**Description:** Represents a Castlery design collection (e.g., Modern Living, Nordic Comfort).

**Responsibilities:**
- Group products by design style
- Provide collection branding (image, description)
- Track product count in collection

**Invariants:**
- Collection must have a unique ID
- Collection name must be non-empty
- Product count must reflect actual products

---

## Entities

### Price

**Description:** Represents pricing information for a product, including discounts.

**Attributes:**
- priceId: Unique identifier
- productId: Reference to product
- currentPrice: Current selling price
- originalPrice: Original price before discount
- currency: Currency code
- discountPercentage: Calculated discount percentage
- validFrom: Price effective date
- validUntil: Price expiration date (optional)

**Behaviors:**
- calculateDiscount(): Compute discount percentage
- isOnSale(): Check if product is discounted
- isValid(): Check if price is currently valid

---

### ProductOption

**Description:** Represents a customizable option type for a product (e.g., Material, Orientation, Leg Color). Part of Product aggregate.

**Attributes:**
- optionId: Unique identifier
- productId: Reference to parent product
- optionType: OptionType enum (MATERIAL | ORIENTATION | LEG_COLOR | SIZE | COLOR)
- displayName: User-friendly name (e.g., "Material", "Orientation")
- isRequired: Whether customer must select this option
- displayOrder: Order in which options are displayed
- createdAt: Timestamp

**Behaviors:**
- addOptionValue(value): Add a new option value
- removeOptionValue(valueId): Remove an option value
- getAvailableValues(): Get all valid option values
- isValidValue(valueId): Check if value is valid for this option

---

### ProductOptionValue

**Description:** Represents a specific value for a product option (e.g., "Pearl Beige", "Left Facing", "Walnut"). Part of Product aggregate.

**Attributes:**
- valueId: Unique identifier
- optionId: Reference to parent option
- value: Internal value identifier (e.g., "pearl_beige", "left_facing")
- displayName: User-friendly name (e.g., "Pearl Beige", "Left Facing")
- hexColor: Optional color hex code for color swatches (e.g., "#F5F5DC")
- imageUrl: Optional image URL for visual representation
- priceAdjustment: Optional price modifier (positive or negative)
- isDefault: Whether this is the default selection
- isAvailable: Whether this option is currently available
- displayOrder: Order in which values are displayed
- createdAt: Timestamp

**Behaviors:**
- applyPriceAdjustment(basePrice): Calculate adjusted price
- isInStock(): Check availability status

---

### ProductVariant

**Description:** Represents a specific combination of product options with its own SKU, price, and stock. Part of Product aggregate.

**Attributes:**
- variantId: Unique identifier
- productId: Reference to parent product
- sku: Stock keeping unit (unique identifier)
- optionSelections: Map of optionId to valueId
- price: Variant-specific price (overrides base price if set)
- stockQuantity: Available quantity for this variant
- images: Variant-specific images (if different from base product)
- isAvailable: Whether this variant is currently available
- createdAt: Timestamp
- updatedAt: Timestamp

**Behaviors:**
- matchesSelection(selections): Check if variant matches option selections
- getOptionValue(optionType): Get selected value for specific option
- updateStock(quantity): Update stock quantity
- isInStock(): Check if variant has available stock

---

## Value Objects

### ProductId

**Description:** Strongly-typed product identifier.

**Attributes:**
- value: String identifier (e.g., "prod_123")

**Behaviors:**
- validate(): Ensure valid format
- equals(other): Compare identifiers

---

### CategoryId

**Description:** Strongly-typed category identifier.

**Attributes:**
- value: String identifier (e.g., "cat_sofa")

---

### CollectionId

**Description:** Strongly-typed collection identifier.

**Attributes:**
- value: String identifier (e.g., "col_modern")

---

### ProductDimensions

**Description:** Immutable physical dimensions of a product.

**Attributes:**
- width: Width measurement
- depth: Depth measurement
- height: Height measurement
- unit: DimensionUnit (cm | inches)

**Behaviors:**
- toUnit(targetUnit): Convert to different unit
- fitsInSpace(space): Check if product fits in given space
- getVolume(): Calculate volume

---

### Money

**Description:** Immutable monetary value.

**Attributes:**
- amount: Numeric value
- currency: Currency code (USD | SGD | AUD)

**Behaviors:**
- add(other): Add two money values (same currency)
- multiply(factor): Multiply by factor
- equals(other): Compare values

---

### StockInfo

**Description:** Immutable stock availability information.

**Attributes:**
- quantity: Available quantity
- inStock: Boolean availability flag
- lowStockThreshold: Threshold for low stock warning

**Behaviors:**
- isLowStock(): Check if below threshold
- canFulfill(requestedQty): Check if quantity available

---

### ProductImages

**Description:** Immutable collection of product images.

**Attributes:**
- thumbnailUrl: Small preview image
- images: List of full-size image URLs
- model3dUrl: URL to 3D model file (GLB format)

---

### FurnitureType

**Description:** Enumeration of furniture types for AI matching.

**Values:**
- SOFA
- TABLE
- CHAIR
- BED
- DESK
- STORAGE

---

### DimensionUnit

**Description:** Enumeration of measurement units.

**Values:**
- CENTIMETERS
- INCHES

---

### Currency

**Description:** Enumeration of supported currencies.

**Values:**
- USD
- SGD
- AUD

---

### OptionType

**Description:** Enumeration of product option types.

**Values:**
- MATERIAL: Fabric or material type (e.g., "Pearl Beige", "Performance Brilliant White")
- ORIENTATION: Furniture orientation (e.g., "Left Facing", "Right Facing")
- LEG_COLOR: Leg finish color (e.g., "Walnut", "Oak", "Black")
- SIZE: Size variations (e.g., "3 Seater", "2 Seater")
- COLOR: General color options (e.g., "Caramel", "Ivory", "Chalk")
- CONFIGURATION: Configuration type (e.g., "Chaise", "Standard")

---

### OptionSelection

**Description:** Immutable representation of a customer's option selections.

**Attributes:**
- selections: Map of OptionType to selected value ID

**Behaviors:**
- addSelection(optionType, valueId): Create new selection with added option
- hasSelection(optionType): Check if option type is selected
- getSelection(optionType): Get selected value for option type
- isComplete(requiredOptions): Check if all required options are selected
- matches(variant): Check if selections match a product variant

---

## Domain Events

### ProductCreated
- Triggered when: New product is added to catalog
- Contains: productId, name, categoryId, collectionId

### ProductUpdated
- Triggered when: Product details are modified
- Contains: productId, changedFields

### ProductPriceChanged
- Triggered when: Product price is updated
- Contains: productId, oldPrice, newPrice, currency

### ProductStockUpdated
- Triggered when: Stock quantity changes
- Contains: productId, oldQuantity, newQuantity

### ProductOutOfStock
- Triggered when: Product stock reaches zero
- Contains: productId, productName

### ProductBackInStock
- Triggered when: Out-of-stock product becomes available
- Contains: productId, productName, quantity

### CategoryCreated
- Triggered when: New category is added
- Contains: categoryId, name

### CollectionCreated
- Triggered when: New collection is added
- Contains: collectionId, name

### ProductOptionAdded
- Triggered when: New option type is added to product
- Contains: productId, optionId, optionType, displayName

### ProductOptionValueAdded
- Triggered when: New option value is added to option
- Contains: productId, optionId, valueId, value, displayName

### ProductVariantCreated
- Triggered when: New product variant is created
- Contains: productId, variantId, sku, optionSelections

### ProductVariantStockUpdated
- Triggered when: Variant stock quantity changes
- Contains: variantId, oldQuantity, newQuantity

### ProductVariantOutOfStock
- Triggered when: Variant stock reaches zero
- Contains: variantId, sku, optionSelections

---

## Domain Services

### ProductSearchService

**Responsibilities:**
- Search products by name with fuzzy matching
- Filter products by various criteria
- Rank search results by relevance

**Operations:**
- search(query, limit): Search products by name
- searchByType(furnitureType, filters): Search by furniture type
- searchByCategory(categoryId, filters): Search within category
- searchByCollection(collectionId, filters): Search within collection

---

### ProductOptionService

**Responsibilities:**
- Manage product options and values
- Validate option combinations
- Find variants matching option selections
- Calculate prices with option adjustments

**Operations:**
- getAvailableOptions(productId): Get all options for product
- getOptionValues(optionId): Get all values for option
- findVariantBySelection(productId, selections): Find matching variant
- validateOptionSelection(productId, selections): Check if selection is valid
- calculatePriceWithOptions(productId, selections): Calculate price with option adjustments
- getDefaultSelections(productId): Get default option values

---

### PricingService

**Responsibilities:**
- Calculate current prices
- Apply discounts and promotions
- Calculate bulk pricing for multiple products
- Handle variant-specific pricing

**Operations:**
- getCurrentPrice(productId, variantId?): Get current price for product or variant
- getBulkPrices(productIds): Get prices for multiple products
- calculateTotal(productIds): Sum prices for product list
- applyDiscount(price, discountCode): Apply promotional discount
- getVariantPrice(variantId): Get variant-specific price

---

### StockService

**Responsibilities:**
- Check product availability
- Update stock quantities
- Generate low stock alerts
- Track variant-level stock

**Operations:**
- checkAvailability(productId, variantId?): Check if product or variant is in stock
- checkBulkAvailability(productIds): Check multiple products
- checkVariantAvailability(variantId): Check specific variant stock
- updateStock(productId, quantity): Update stock level
- updateVariantStock(variantId, quantity): Update variant stock level
- reserveStock(productId, quantity): Reserve for order
- reserveVariantStock(variantId, quantity): Reserve variant for order

---

### ProductMatchingService

**Responsibilities:**
- Find products matching furniture type
- Find similar products for alternatives
- Match products by style/collection

**Operations:**
- findByFurnitureType(type, priceMax): Find products by type
- findSimilar(productId): Find similar products
- findAlternatives(productId, maxPrice): Find cheaper alternatives

---

## Repositories

### ProductRepository (Interface)

**Operations:**
- save(product): Persist product
- findById(productId): Get product by ID
- findByIds(productIds): Get multiple products
- findByCategory(categoryId): Get products in category
- findByCollection(collectionId): Get products in collection
- findByFurnitureType(type): Get products by furniture type
- search(query, limit): Search products by name
- findAll(): Get all products
- delete(productId): Remove product

**Implementation Strategy:**
- Demo & Production: InMemoryProductRepository (JavaScript Map-based)

---

### CategoryRepository (Interface)

**Operations:**
- save(category): Persist category
- findById(categoryId): Get category by ID
- findAll(): Get all categories
- findByName(name): Find category by name
- delete(categoryId): Remove category

**Implementation Strategy:**
- Demo & Production: InMemoryCategoryRepository (JavaScript Map-based)

---

### CollectionRepository (Interface)

**Operations:**
- save(collection): Persist collection
- findById(collectionId): Get collection by ID
- findAll(): Get all collections
- findByName(name): Find collection by name
- delete(collectionId): Remove collection

**Implementation Strategy:**
- Demo & Production: InMemoryCollectionRepository (JavaScript Map-based)

---

### PriceRepository (Interface)

**Operations:**
- save(price): Persist price
- findByProductId(productId): Get current price for product
- findByProductIds(productIds): Get prices for multiple products
- findHistorical(productId, dateRange): Get price history

**Implementation Strategy:**
- Demo & Production: InMemoryPriceRepository (JavaScript Map-based)

---

## Factory

### ProductFactory

**Purpose:** Create valid Product aggregates with all required data.

**Operations:**
- createProduct(productData): Create new product with validation
- createFromDTO(dto): Create product from external data transfer object

---

### MockDataFactory

**Purpose:** Generate mock product data for demo purposes.

**Operations:**
- generateMockProducts(count): Generate random products
- generateMockCategories(): Generate standard categories
- generateMockCollections(): Generate standard collections
- seedDatabase(): Populate in-memory store with mock data

---

## Specifications (Query Objects)

### ProductSearchSpecification

**Purpose:** Encapsulate complex product search criteria.

**Criteria:**
- nameContains: Partial name match
- categoryId: Filter by category
- collectionId: Filter by collection
- furnitureType: Filter by type
- priceRange: Min/max price filter
- inStockOnly: Only available products

---

### ProductSortSpecification

**Purpose:** Define product sorting options.

**Options:**
- BY_NAME_ASC
- BY_NAME_DESC
- BY_PRICE_ASC
- BY_PRICE_DESC
- BY_RELEVANCE

---

## Data Transfer Objects (DTOs)

### ProductSummaryDTO

**Purpose:** Lightweight product representation for lists.

**Fields:**
- id, name, category, collection, thumbnailUrl, price

---

### ProductDetailDTO

**Purpose:** Full product representation for detail view.

**Fields:**
- All product fields including dimensions, images, stock

---

### CategoryDTO

**Purpose:** Category representation for API responses.

**Fields:**
- id, name, icon, productCount

---

### CollectionDTO

**Purpose:** Collection representation for API responses.

**Fields:**
- id, name, description, imageUrl, productCount

---

### PriceDTO

**Purpose:** Price information for API responses.

**Fields:**
- productId, price, currency, originalPrice, discount, inStock

---

## Context Map

```
┌─────────────────────────────────────────────────────────────────┐
│                   Product Catalog Context                        │
│                    (Product Service)                             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Exposes APIs to:
                            │
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌───────────────────┐               ┌───────────────────┐
│ Room Planning     │               │ AI Recommendation │
│ Context           │               │ Context           │
│ (Frontend)        │               │ (AI Service)      │
│                   │               │                   │
│ - Product Display │               │ - Product Search  │
│ - Pricing Info    │               │ - Type Matching   │
│ - Cart Items      │               │ - Alternatives    │
└───────────────────┘               └───────────────────┘

Relationship: Open Host Service with Published Language
- Product Service exposes well-defined REST APIs
- Consumers adapt to Product Service's data model
```

---

## Storage Strategy (Demo & Production)

Both demo and production use **in-memory storage**:

### In-Memory Store
- JavaScript `Map` for each entity (products, categories, collections, prices)
- Fast read/write for API operations
- No external dependencies (no database, no Redis)
- Data loaded on startup via MockDataFactory

### Demo vs Production
- **Demo**: InMemory repositories with mock data seeded on startup
- **Production**: Same in-memory implementation; data persists only during service runtime
- **Note**: Data is lost on service restart; suitable for stateless services or when data can be reloaded

### Configuration Example
```
# Both demo and production use in-memory storage
# No database or cache configuration needed
NODE_ENV=production
```

---

## Mock Data Seed

### Categories (6)
- Sofas, Tables, Chairs, Beds, Storage, Desks

### Collections (3)
- Modern Living, Nordic Comfort, Classic Elegance

### Products (Sample per Category)
- 5-10 products per category
- Varied price ranges ($200 - $3000)
- Mix of in-stock and low-stock items
- 3D models for key products
