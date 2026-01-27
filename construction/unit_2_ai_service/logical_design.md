# Unit 2: AI Service - Logical Design

## Overview

The AI Service is a Node.js/TypeScript backend service that provides AI-powered furniture recommendations, natural language chat interactions, furniture detection in images, and furniture replacement/placement rendering. It integrates with external AI models (OpenAI GPT-4/GPT-4V, Replicate) and local product configuration.

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 20+ LTS
- **Language**: TypeScript 5+
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Validation**: Zod
- **Image Processing**: Sharp
- **File Upload**: Multer
- **Environment**: dotenv

### External AI Services
- **OpenAI GPT-4**: Furniture recommendations, chat
- **OpenAI GPT-4V**: Image analysis, furniture detection
- **Replicate (SDXL)**: Image generation, inpainting (running Stable Diffusion XL via Replicate)

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Service                               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Layer (Express)                     │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │Recommend │  │   Chat   │  │  Detect  │  │ Replace  │    │ │
│  │  │Controller│  │Controller│  │Controller│  │Controller│    │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                       │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │ │
│  │  │Recommendation│  │     Chat     │  │    Image     │      │ │
│  │  │   Service    │  │   Service    │  │   Service    │      │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Domain Layer                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Models  │  │  Types   │  │Validators│  │  Utils   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘│
│                              │                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │                  Infrastructure Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  OpenAI  │  │Replicate │  │ Product  │  │  Image   │   │ │
│  │  │  Client  │  │  Client  │  │  Client  │  │ Storage  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │  - OpenAI API    │
                    │  - Replicate API │
                    └──────────────────┘
```

---

## API Endpoints

### POST /api/ai/recommend
**Purpose**: Generate furniture recommendations

**Request Body**:
```typescript
interface RecommendationRequest {
  roomType: RoomType;
  dimensions: RoomDimensions;
  budget?: Budget;
  preferences?: UserPreferences;
}
```

**Response**:
```typescript
interface RecommendationResponse {
  success: boolean;
  recommendations: Recommendation[];
  totalPrice: number;
  budgetExceeded: boolean;
  exceededAmount?: number;
}
```


### POST /api/ai/chat
**Purpose**: Natural language chat for design refinement

**Request Body**:
```typescript
interface ChatRequest {
  sessionId: string;
  message: string;
  language: 'en' | 'zh';
  context: {
    currentDesign: RoomDesign;
  };
}
```

**Response**:
```typescript
interface ChatResponse {
  success: boolean;
  reply: string;
  updatedRecommendations?: Recommendation[];
  actions: DesignAction[];
}
```

### POST /api/ai/detect
**Purpose**: Detect furniture in uploaded room image

**Request Body**:
```typescript
interface DetectionRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
}
```

**Response**:
```typescript
interface DetectionResponse {
  success: boolean;
  isEmpty: boolean;
  detectedItems: DetectedFurniture[];
  roomSpace?: RoomSpace;
}
```

### POST /api/ai/replace
**Purpose**: Apply furniture replacements to image

**Request Body**:
```typescript
interface ReplacementRequest {
  imageUrl: string;
  replacements: Array<{
    detectedItemId: string;
    newProductId: string;
  }>;
}
```

**Response**:
```typescript
interface ReplacementResponse {
  success: boolean;
  resultImageUrl: string;
  appliedReplacements: AppliedReplacement[];
}
```

### POST /api/ai/place
**Purpose**: Place furniture in empty room image

**Request Body**:
```typescript
interface PlacementRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
  placements: Array<{
    productId: string;
    position: Position3D;
    rotation: number;
  }>;
}
```

**Response**:
```typescript
interface PlacementResponse {
  success: boolean;
  resultImageUrl: string;
  appliedPlacements: AppliedPlacement[];
}
```

### POST /api/upload
**Purpose**: Upload room image to server local storage

**Request**: Multipart form data with image file
- Content-Type: multipart/form-data
- Field name: `image`
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/webp

**Response**:
```typescript
interface UploadResponse {
  success: boolean;
  imageUrl: string;      // Local server URL, e.g., /uploads/abc123.jpg
  imageId: string;       // Unique image identifier
  filename: string;      // Original filename
  size: number;          // File size in bytes
  dimensions: {          // Image dimensions
    width: number;
    height: number;
  };
}
```

**Implementation Notes**:
- Frontend uploads image via FormData
- Backend receives file using Multer
- File is saved to server's local `./uploads` directory
- Returns local access path (not cloud storage URL)

---

## Service Layer

### RecommendationService

**Responsibilities**:
- Generate furniture recommendations using GPT-4
- Load available products from local configuration
- Optimize furniture placement for room layout
- Apply budget constraints

**Key Methods**:

```typescript
class RecommendationService {
  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    // 1. Load available products from local configuration
    const products = await this.productClient.searchProducts({
      categories: request.preferences?.selectedCategories,
      collections: request.preferences?.selectedCollections,
      maxPrice: request.budget?.amount,
    });

    // 2. Build AI prompt with room config and products
    const prompt = this.buildRecommendationPrompt(request, products);

    // 3. Call OpenAI GPT-4
    const aiResponse = await this.openAIClient.chat({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    // 4. Parse AI response into recommendations
    const recommendations = this.parseRecommendations(aiResponse);

    // 5. Validate and optimize placements
    return this.optimizePlacements(recommendations, request.dimensions);
  }

  private buildRecommendationPrompt(
    request: RecommendationRequest,
    products: Product[]
  ): string {
    return `
      Room Type: ${request.roomType}
      Dimensions: ${request.dimensions.length}m × ${request.dimensions.width}m
      Budget: ${request.budget?.amount} ${request.budget?.currency}
      
      Available Products:
      ${products.map(p => `- ${p.name} (${p.dimensions.width}×${p.dimensions.depth}m, $${p.price})`).join('\n')}
      
      Task: Recommend optimal furniture arrangement with positions and rotations.
      Output Format: JSON array with productId, position {x, y, z}, rotation, reasoning.
    `;
  }
}
```


### ChatService

**Responsibilities**:
- Manage conversational AI interactions
- Maintain chat context and history
- Parse design actions from AI responses
- Support multi-language conversations

**Key Methods**:

```typescript
class ChatService {
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    // 1. Build conversation context
    const messages = this.buildChatContext(request);

    // 2. Call OpenAI GPT-4
    const aiResponse = await this.openAIClient.chat({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
    });

    // 3. Parse response for design actions
    const actions = this.parseDesignActions(aiResponse);

    // 4. If actions exist, generate updated recommendations
    let updatedRecommendations;
    if (actions.length > 0) {
      updatedRecommendations = await this.applyActions(
        request.context.currentDesign,
        actions
      );
    }

    return {
      success: true,
      reply: aiResponse.content,
      updatedRecommendations,
      actions,
    };
  }

  private buildChatContext(request: ChatRequest): ChatMessage[] {
    return [
      {
        role: 'system',
        content: `You are a helpful furniture design assistant. 
                  Current room: ${request.context.currentDesign.roomType}
                  Current furniture: ${request.context.currentDesign.furniturePlacements.length} items
                  Language: ${request.language}`,
      },
      { role: 'user', content: request.message },
    ];
  }
}
```

### ImageService

**Responsibilities**:
- Detect furniture in uploaded images using GPT-4V
- Determine if room is empty or has existing furniture
- Generate furniture replacement images using Replicate (SDXL)
- Generate furniture placement images for empty rooms
- Enrich rooms with appliances and decorative elements

**Key Methods**:

```typescript
class ImageService {
  async detectFurniture(request: DetectionRequest): Promise<DetectionResponse> {
    // 1. Call GPT-4V for furniture detection
    const visionResponse = await this.openAIClient.vision({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: DETECTION_PROMPT },
            { type: 'image_url', image_url: { url: request.imageUrl } },
          ],
        },
      ],
    });

    // 2. Parse detection results
    const detections = this.parseDetections(visionResponse);

    // 3. Determine if room is empty
    const isEmpty = detections.length === 0 || 
                    detections.every(d => d.confidence < 0.3);

    // 4. If empty, analyze room space
    let roomSpace;
    if (isEmpty) {
      roomSpace = await this.analyzeRoomSpace(request.imageUrl, request.roomDimensions);
    }

    return {
      success: true,
      isEmpty,
      detectedItems: detections,
      roomSpace,
    };
  }

  async applyReplacements(request: ReplacementRequest): Promise<ReplacementResponse> {
    // 1. Get product images from local configuration
    const products = await this.productClient.getProductsByIds(
      request.replacements.map(r => r.newProductId)
    );

    // 2. For each replacement, generate inpainting mask
    const results = [];
    for (const replacement of request.replacements) {
      const detection = await this.getDetection(replacement.detectedItemId);
      const product = products.find(p => p.id === replacement.newProductId);

      // 3. Call Replicate for inpainting
      const resultImage = await this.replicateClient.inpaint({
        image: request.imageUrl,
        mask: this.createMask(detection.boundingBox),
        prompt: `${product.name}, realistic furniture, professional interior photo`,
        negativePrompt: 'blurry, distorted, unrealistic',
      });

      results.push({
        detectedItemId: replacement.detectedItemId,
        newProductId: replacement.newProductId,
        productName: product.name,
        resultImageUrl: resultImage.url,
      });
    }

    // 4. Composite all replacements into final image
    const finalImageUrl = await this.compositeImages(request.imageUrl, results);

    return {
      success: true,
      resultImageUrl: finalImageUrl,
      appliedReplacements: results,
    };
  }

  async placeFurniture(request: PlacementRequest): Promise<PlacementResponse> {
    // 1. Get product images
    const products = await this.productClient.getProductsByIds(
      request.placements.map(p => p.productId)
    );

    // 2. Generate placement prompt
    const prompt = this.buildPlacementPrompt(request, products);

    // 3. Call Replicate for image generation
    const resultImage = await this.replicateClient.imageToImage({
      image: request.imageUrl,
      prompt,
      strength: 0.6, // Preserve room structure
    });

    return {
      success: true,
      resultImageUrl: resultImage.url,
      appliedPlacements: request.placements.map((p, i) => ({
        productId: p.productId,
        productName: products[i].name,
        position: p.position,
        rotation: p.rotation,
      })),
    };
  }

  private buildPlacementPrompt(
    request: PlacementRequest,
    products: Product[]
  ): string {
    const furnitureDescriptions = products.map((p, i) => {
      const placement = request.placements[i];
      return `${p.name} at position (${placement.position.x}, ${placement.position.z})`;
    }).join(', ');

    return `
      Empty room interior with ${furnitureDescriptions}.
      Realistic furniture placement, professional interior photography,
      proper scale and perspective, natural lighting.
    `;
  }
}
```


---

## Infrastructure Layer

### OpenAI Client

```typescript
class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async chat(params: ChatParams): Promise<ChatResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: params.model,
        messages: params.messages,
        temperature: params.temperature,
        max_tokens: 2000,
      });

      return {
        content: response.choices[0].message.content,
        usage: response.usage,
      };
    } catch (error) {
      throw new AIServiceError('OpenAI chat failed', error);
    }
  }

  async vision(params: VisionParams): Promise<VisionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: params.model,
        messages: params.messages,
        max_tokens: 1000,
      });

      return {
        content: response.choices[0].message.content,
        usage: response.usage,
      };
    } catch (error) {
      throw new AIServiceError('OpenAI vision failed', error);
    }
  }
}
```

### Replicate Client

```typescript
import Replicate from 'replicate';

class ReplicateClient {
  private client: Replicate;

  constructor() {
    this.client = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });
  }

  async inpaint(params: InpaintParams): Promise<ImageResult> {
    try {
      // Use SDXL Inpainting model
      const output = await this.client.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            image: params.image,
            mask: params.mask,
            prompt: params.prompt,
            negative_prompt: params.negativePrompt,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
          },
        }
      );

      // output is an array of image URLs
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      // Download and re-upload to local storage
      const localUrl = await this.downloadAndStore(imageUrl);

      return { url: localUrl };
    } catch (error) {
      throw new AIServiceError('Replicate inpaint failed', error);
    }
  }

  async imageToImage(params: ImageToImageParams): Promise<ImageResult> {
    try {
      // Use SDXL Image-to-Image model
      const output = await this.client.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            image: params.image,
            prompt: params.prompt,
            strength: params.strength,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
          },
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      const localUrl = await this.downloadAndStore(imageUrl);

      return { url: localUrl };
    } catch (error) {
      throw new AIServiceError('Replicate image-to-image failed', error);
    }
  }

  async textToImage(params: TextToImageParams): Promise<ImageResult> {
    try {
      const output = await this.client.run(
        'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        {
          input: {
            prompt: params.prompt,
            negative_prompt: params.negativePrompt,
            width: params.width || 1024,
            height: params.height || 1024,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 30,
          },
        }
      );

      const imageUrl = Array.isArray(output) ? output[0] : output;
      const localUrl = await this.downloadAndStore(imageUrl);

      return { url: localUrl };
    } catch (error) {
      throw new AIServiceError('Replicate text-to-image failed', error);
    }
  }

  private async downloadAndStore(imageUrl: string): Promise<string> {
    // Download image from Replicate
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // Upload to local storage
    const storageService = new ImageStorageService();
    return await storageService.uploadImage(buffer);
  }
}
```

### Product Service Client (Local Configuration)

```typescript
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

interface ProductData {
  index: number;
  name: string;
  url: string;
  price: string;
  original_price?: string;
  description: string;
  detailed_description?: string;
  tag?: string;
  delivery: string;
  images: Array<{
    url: string;
    local: string;
    alt: string;
  }>;
}

interface ProductsConfig {
  products: ProductData[];
}

class ProductServiceClient {
  private products: Map<string, Product>;
  private productsArray: Product[];

  constructor() {
    this.products = new Map();
    this.productsArray = [];
    this.loadProducts();
  }

  /**
   * Load product data from local YAML file
   */
  private loadProducts(): void {
    try {
      const configPath = process.env.PRODUCTS_CONFIG_PATH || './config/products.yaml';
      const fileContents = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(fileContents) as ProductsConfig;

      // Convert to internal Product format
      config.products.forEach((productData) => {
        const product: Product = {
          id: `product-${productData.index}`,
          name: productData.name,
          description: productData.description,
          detailedDescription: productData.detailed_description,
          price: this.parsePrice(productData.price),
          originalPrice: productData.original_price 
            ? this.parsePrice(productData.original_price) 
            : undefined,
          currency: 'SGD',
          images: productData.images.map(img => ({
            url: `/products/${img.local}`,
            alt: img.alt,
          })),
          category: this.inferCategory(productData.name),
          tags: productData.tag ? [productData.tag] : [],
          dimensions: this.inferDimensions(productData.name),
          inStock: true,
          delivery: productData.delivery,
          externalUrl: productData.url,
        };

        this.products.set(product.id, product);
        this.productsArray.push(product);
      });

      logger.info(`Loaded ${this.products.size} products from ${configPath}`);
    } catch (error) {
      logger.error('Failed to load products configuration', { error });
      throw new Error('Failed to initialize product catalog');
    }
  }

  /**
   * Parse price string (e.g., "$1,999") to number
   */
  private parsePrice(priceStr: string): number {
    return parseFloat(priceStr.replace(/[$,]/g, ''));
  }

  /**
   * Infer category from product name
   */
  private inferCategory(name: string): string {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('sofa') || lowerName.includes('sectional')) {
      return 'sofa';
    }
    if (lowerName.includes('chair')) {
      return 'chair';
    }
    if (lowerName.includes('table')) {
      return 'table';
    }
    return 'furniture';
  }

  /**
   * Infer dimensions from product name (simplified)
   */
  private inferDimensions(name: string): Dimensions {
    // Return typical dimensions based on product type
    if (name.includes('Sectional')) {
      return { width: 2.5, depth: 1.8, height: 0.85, unit: 'meters' };
    }
    if (name.includes('3 Seater')) {
      return { width: 2.0, depth: 0.9, height: 0.85, unit: 'meters' };
    }
    return { width: 1.5, depth: 0.8, height: 0.85, unit: 'meters' };
  }

  /**
   * Search products
   */
  async searchProducts(params: SearchParams): Promise<Product[]> {
    let results = [...this.productsArray];

    // Filter by category
    if (params.categories && params.categories.length > 0) {
      results = results.filter(p => 
        params.categories!.includes(p.category)
      );
    }

    // Filter by tags
    if (params.collections && params.collections.length > 0) {
      results = results.filter(p =>
        p.tags.some(tag => params.collections!.includes(tag))
      );
    }

    // Filter by price
    if (params.maxPrice) {
      results = results.filter(p => p.price <= params.maxPrice!);
    }

    return results;
  }

  /**
   * Get products by IDs
   */
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map(id => this.products.get(id))
      .filter((p): p is Product => p !== undefined);
  }

  /**
   * Get products by type
   */
  async getProductsByType(type: FurnitureType, maxPrice?: number): Promise<Product[]> {
    let results = this.productsArray.filter(p => p.category === type);

    if (maxPrice) {
      results = results.filter(p => p.price <= maxPrice);
    }

    return results;
  }

  /**
   * Get all products
   */
  async getAllProducts(): Promise<Product[]> {
    return [...this.productsArray];
  }

  /**
   * Reload product configuration (for hot reload)
   */
  async reloadProducts(): Promise<void> {
    this.products.clear();
    this.productsArray = [];
    this.loadProducts();
  }
}

// Product type definitions
interface Product {
  id: string;
  name: string;
  description: string;
  detailedDescription?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: Array<{
    url: string;
    alt: string;
  }>;
  category: string;
  tags: string[];
  dimensions: Dimensions;
  inStock: boolean;
  delivery: string;
  externalUrl: string;
}

interface Dimensions {
  width: number;
  depth: number;
  height: number;
  unit: string;
}
```

### Image Storage Service (Local Storage)

```typescript
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

class ImageStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.baseUrl = process.env.IMAGE_BASE_URL || 'http://localhost:3001';
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Save uploaded image to local storage
   * @param buffer Image buffer
   * @param originalFilename Original filename (optional)
   * @returns Local access URL
   */
  async uploadImage(buffer: Buffer, originalFilename?: string): Promise<string> {
    // Generate unique filename
    const imageId = uuidv4();
    const ext = originalFilename 
      ? path.extname(originalFilename).toLowerCase() 
      : '.jpg';
    const filename = `${imageId}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // Optimize image with Sharp
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    // Return local URL
    return `/uploads/${filename}`;
  }

  /**
   * Get local file path from URL
   * @param imageUrl Image URL (e.g., /uploads/abc.jpg)
   * @returns Local filesystem path
   */
  async getImagePath(imageUrl: string): Promise<string> {
    const filename = path.basename(imageUrl);
    const filepath = path.join(this.uploadDir, filename);
    
    // Verify file exists
    if (!fs.existsSync(filepath)) {
      throw new Error(`Image not found: ${filename}`);
    }
    
    return filepath;
  }

  /**
   * Get full URL for image
   * @param relativePath Relative path (e.g., /uploads/abc.jpg)
   * @returns Full URL
   */
  getFullUrl(relativePath: string): string {
    return `${this.baseUrl}${relativePath}`;
  }

  /**
   * Delete image file
   * @param imageUrl Image URL
   */
  async deleteImage(imageUrl: string): Promise<void> {
    const filepath = await this.getImagePath(imageUrl);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  /**
   * Get image information
   * @param imageUrl Image URL
   * @returns Image metadata
   */
  async getImageInfo(imageUrl: string): Promise<{
    width: number;
    height: number;
    format: string;
    size: number;
  }> {
    const filepath = await this.getImagePath(imageUrl);
    const metadata = await sharp(filepath).metadata();
    const stats = fs.statSync(filepath);

    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: stats.size,
    };
  }
}
```

---

## Error Handling

### Custom Error Classes

```typescript
class AIServiceError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'AIServiceError';
  }
}

class ProductServiceError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ProductServiceError';
  }
}

class ValidationError extends Error {
  constructor(message: string, public errors: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Middleware

```typescript
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('Error:', err);

  if (err instanceof ValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_REQUEST',
        message: err.message,
        details: err.errors,
      },
    });
  }

  if (err instanceof AIServiceError) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'AI service temporarily unavailable',
      },
    });
  }

  if (err instanceof ProductServiceError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: 'PRODUCT_CONFIG_ERROR',
        message: err.message,
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

## Validation (Zod Schemas)

```typescript
const RoomDimensionsSchema = z.object({
  length: z.number().positive().max(50),
  width: z.number().positive().max(50),
  height: z.number().positive().max(6),
  unit: z.enum(['meters', 'feet']),
});

const RecommendationRequestSchema = z.object({
  roomType: z.enum(['living_room', 'bedroom', 'dining_room', 'home_office']),
  dimensions: RoomDimensionsSchema,
  budget: z.object({
    amount: z.number().positive(),
    currency: z.enum(['USD', 'SGD', 'AUD']),
  }).optional(),
  preferences: z.object({
    productIds: z.array(z.string()).optional(),
    categoryIds: z.array(z.string()).optional(),
    collectionIds: z.array(z.string()).optional(),
  }).optional(),
});

const ChatRequestSchema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().min(1).max(1000),
  language: z.enum(['en', 'zh']),
  context: z.object({
    currentDesign: z.any(),
  }),
});
```

---

## Middleware

### Request Validation Middleware

```typescript
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('Invalid request', error.errors));
      } else {
        next(error);
      }
    }
  };
};
```

### Rate Limiting Middleware

```typescript
import rateLimit from 'express-rate-limit';

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please try again later',
});
```

### File Upload Middleware

```typescript
import multer from 'multer';
import path from 'path';

// Use memory storage, process later via ImageStorageService
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // Only allow one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Allowed image types
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or WebP image files are allowed'));
    }
  },
});

// Upload controller
const uploadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
    }

    const storageService = new ImageStorageService();
    
    // Save to local storage
    const imageUrl = await storageService.uploadImage(
      req.file.buffer,
      req.file.originalname
    );

    // Get image info
    const imageInfo = await storageService.getImageInfo(imageUrl);

    res.json({
      success: true,
      imageUrl,
      imageId: path.basename(imageUrl, path.extname(imageUrl)),
      filename: req.file.originalname,
      size: imageInfo.size,
      dimensions: {
        width: imageInfo.width,
        height: imageInfo.height,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Route configuration
app.post('/api/upload', upload.single('image'), uploadController);
```

---

## Configuration

### Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-...

# Replicate
REPLICATE_API_TOKEN=r8_...

# Product Configuration (Local)
PRODUCTS_CONFIG_PATH=./config/products.yaml
PRODUCTS_IMAGES_DIR=./public/products

# Product Service (Removed, now local configuration)
# PRODUCT_SERVICE_URL=http://localhost:3002/api/products

# Image Storage (Local)
UPLOAD_DIR=./uploads
IMAGE_BASE_URL=http://localhost:3001
MAX_FILE_SIZE=10485760

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```


---

## Testing Strategy (Optional)

> **Note**: This project primarily relies on manual testing. Automated test configuration is included for reference only. We recommend using Postman, Thunder Client, or the frontend application for actual testing.

### Basic Health Check Test

```typescript
// tests/health.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('should return service health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'ai-service',
      timestamp: expect.any(String),
    });
  });
});
```

### Simple API Validation Tests (Optional)

```typescript
// tests/api.test.ts
import request from 'supertest';
import app from '../src/app';

describe('API Validation', () => {
  it('should reject invalid recommendation request', async () => {
    const response = await request(app)
      .post('/api/ai/recommend')
      .send({
        roomType: 'invalid_type',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('should reject upload request without file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

### Test Configuration

```json
// package.json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

### Recommended Manual Testing Approaches

1. **Using REST Client (VS Code Extension)**
   ```http
   ### Health Check
   GET http://localhost:3001/health

   ### Recommendation API
   POST http://localhost:3001/api/ai/recommend
   Content-Type: application/json

   {
     "roomType": "living_room",
     "dimensions": {
       "length": 5,
       "width": 4,
       "height": 3,
       "unit": "meters"
     }
   }
   ```

2. **Using Postman or Thunder Client**
   - Import API endpoints
   - Save test cases
   - Quick feature validation

3. **Using Frontend Application**
   - Most realistic test environment
   - Direct user experience validation

---

## Deployment

### Development

```bash
npm install
npm run dev  # Starts server with nodemon on http://localhost:3001
```

### Health Check Endpoint

```typescript
// src/routes/health.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ai-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});
```

### Production Build

```bash
npm run build  # Compiles TypeScript to /dist
npm start      # Runs compiled code
```

### Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY config ./config
COPY public ./public

# Create upload directory
RUN mkdir -p /app/uploads

# Set upload directory permissions
RUN chown -R node:node /app/uploads

EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REPLICATE_API_TOKEN=${REPLICATE_API_TOKEN}
      - PRODUCTS_CONFIG_PATH=/app/config/products.yaml
    volumes:
      - ./uploads:/app/uploads
      - ./config:/app/config:ro
      - ./public:/app/public:ro
```

---

## Performance Optimization

### Caching Strategy

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

class CachedProductClient extends ProductServiceClient {
  async searchProducts(params: SearchParams): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(params)}`;
    const cached = cache.get<Product[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const products = await super.searchProducts(params);
    cache.set(cacheKey, products);
    return products;
  }
}
```

### Request Queuing

```typescript
import PQueue from 'p-queue';

const openAIQueue = new PQueue({ concurrency: 5 }); // Max 5 concurrent requests

class RateLimitedOpenAIClient extends OpenAIClient {
  async chat(params: ChatParams): Promise<ChatResponse> {
    return openAIQueue.add(() => super.chat(params));
  }
}
```

---

## Monitoring & Logging

### Structured Logging (Winston)

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('Recommendation request received', { roomType, sessionId });
logger.error('OpenAI API error', { error: error.message, stack: error.stack });
```

### Request Logging Middleware

```typescript
const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration,
    });
  });
  
  next();
};
```

---

## Security

### API Key Validation

```typescript
const validateApiKey: RequestHandler = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid API key' },
    });
  }
  
  next();
};
```

### CORS Configuration

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
```

### Input Sanitization

```typescript
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

app.use(helmet());
app.use(mongoSanitize());
```

---

## API Documentation (Swagger)

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Service API',
      version: '1.0.0',
      description: 'Furniture recommendation and image analysis API',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Development' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## Project Structure

```
/src
  /controllers      # Request handlers
    recommendationController.ts
    chatController.ts
    imageController.ts
  /services         # Business logic
    RecommendationService.ts
    ChatService.ts
    ImageService.ts
  /clients          # External API clients
    OpenAIClient.ts
    ReplicateClient.ts
    ProductServiceClient.ts  # Local configuration loader
  /middleware       # Express middleware
    validation.ts
    errorHandler.ts
    rateLimiter.ts
  /models           # Domain models and types
    types.ts
    schemas.ts
  /utils            # Utility functions
    imageProcessing.ts
    promptBuilder.ts
  /routes           # Route definitions
    index.ts
  index.ts          # Entry point
  app.ts            # Express app setup
/config             # Configuration files
  products.yaml     # Product catalog configuration
/public             # Static assets
  /products         # Product images (copied from product directory)
    product1_img1.jpg
    product1_img2.jpg
    ...
/uploads            # Uploaded images (local storage, created at runtime)
  .gitkeep          # Keep directory structure
/tests              # Test files
  /unit
  /integration
```

---

## Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "axios": "^1.6.0",
    "openai": "^4.20.0",
    "replicate": "^0.25.0",
    "sharp": "^0.33.0",
    "multer": "^1.4.5-lts.1",
    "uuid": "^9.0.0",
    "js-yaml": "^4.1.0",
    "zod": "^3.22.0",
    "dotenv": "^16.3.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.0",
    "winston": "^3.11.0",
    "node-cache": "^5.1.2",
    "p-queue": "^8.0.1"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/express": "^4.17.0",
    "@types/multer": "^1.4.0",
    "@types/uuid": "^9.0.0",
    "@types/js-yaml": "^4.0.0",
    "@types/node": "^20.10.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "supertest": "^6.3.0",
    "nodemon": "^3.0.0",
    "ts-node": "^10.9.0",
    "eslint": "^8.56.0",
    "prettier": "^3.1.0"
  }
}
```

---

## Summary

The AI Service is a robust Node.js/TypeScript backend that integrates with external AI models (OpenAI, Replicate) to provide intelligent furniture recommendations, natural language interactions, and image analysis capabilities. It follows clean architecture principles with clear separation of concerns, comprehensive error handling, and production-ready features like rate limiting, caching, and structured logging.

## Why Replicate?

- **Cost-Effective**: ~80% cheaper than Stability AI official API, with $5 free monthly credits
- **Easy to Use**: Simple API without managing GPU infrastructure
- **Flexible**: Supports multiple Stable Diffusion models and versions
- **Scalable**: Pay-as-you-go with automatic scaling
- **Developer-Friendly**: Fast iteration, ideal for MVP and prototyping
