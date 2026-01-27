# Unit 2: AI Service - Logical Design

## Overview

The AI Service is a Node.js/TypeScript backend service that provides AI-powered furniture recommendations, natural language chat interactions, furniture detection in images, and furniture replacement/placement rendering. It integrates with external AI models (OpenAI GPT-4/GPT-4V, Stability AI) and the Product Service.

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
- **Stability AI SDXL**: Image generation, inpainting

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint + Prettier
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Service                                │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API Layer (Express)                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │Recommend │  │   Chat   │  │  Detect  │  │ Replace  │   │ │
│  │  │Controller│  │Controller│  │Controller│  │Controller│   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Application Layer                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │Recommendation│  │     Chat     │  │    Image     │     │ │
│  │  │   Service    │  │   Service    │  │   Service    │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Domain Layer                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  Models  │  │  Types   │  │Validators│  │  Utils   │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Infrastructure Layer                       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  OpenAI  │  │Stability │  │ Product  │  │  Image   │   │ │
│  │  │  Client  │  │AI Client │  │  Client  │  │ Storage  │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  External APIs   │
                    │  - OpenAI API    │
                    │  - Stability AI  │
                    │  - Product API   │
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
**Purpose**: Upload room image

**Request**: Multipart form data with image file

**Response**:
```typescript
interface UploadResponse {
  success: boolean;
  imageUrl: string;
  imageId: string;
}
```

---

## Service Layer

### RecommendationService

**Responsibilities**:
- Generate furniture recommendations using GPT-4
- Query Product Service for available products
- Optimize furniture placement for room layout
- Apply budget constraints

**Key Methods**:

```typescript
class RecommendationService {
  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    // 1. Query Product Service for available products
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
- Generate furniture replacement images using Stability AI
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
    // 1. Get product images from Product Service
    const products = await this.productClient.getProductsByIds(
      request.replacements.map(r => r.newProductId)
    );

    // 2. For each replacement, generate inpainting mask
    const results = [];
    for (const replacement of request.replacements) {
      const detection = await this.getDetection(replacement.detectedItemId);
      const product = products.find(p => p.id === replacement.newProductId);

      // 3. Call Stability AI for inpainting
      const resultImage = await this.stabilityAIClient.inpaint({
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

    // 3. Call Stability AI for image generation
    const resultImage = await this.stabilityAIClient.imageToImage({
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

### Stability AI Client

```typescript
class StabilityAIClient {
  private apiKey: string;
  private baseUrl = 'https://api.stability.ai/v1';

  constructor() {
    this.apiKey = process.env.STABILITY_API_KEY;
  }

  async inpaint(params: InpaintParams): Promise<ImageResult> {
    const formData = new FormData();
    formData.append('image', await this.fetchImage(params.image));
    formData.append('mask', params.mask);
    formData.append('prompt', params.prompt);
    formData.append('negative_prompt', params.negativePrompt);

    const response = await axios.post(
      `${this.baseUrl}/generation/stable-diffusion-xl-1024-v1-0/image-to-image/masking`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    const imageBuffer = Buffer.from(response.data.artifacts[0].base64, 'base64');
    const imageUrl = await this.uploadImage(imageBuffer);

    return { url: imageUrl };
  }

  async imageToImage(params: ImageToImageParams): Promise<ImageResult> {
    const formData = new FormData();
    formData.append('init_image', await this.fetchImage(params.image));
    formData.append('prompt', params.prompt);
    formData.append('image_strength', params.strength.toString());

    const response = await axios.post(
      `${this.baseUrl}/generation/stable-diffusion-xl-1024-v1-0/image-to-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...formData.getHeaders(),
        },
      }
    );

    const imageBuffer = Buffer.from(response.data.artifacts[0].base64, 'base64');
    const imageUrl = await this.uploadImage(imageBuffer);

    return { url: imageUrl };
  }
}
```

### Product Service Client

```typescript
class ProductServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002/api/products';
  }

  async searchProducts(params: SearchParams): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}/search`, { params });
    return response.data.products;
  }

  async getProductsByIds(ids: string[]): Promise<Product[]> {
    const promises = ids.map(id => 
      axios.get(`${this.baseUrl}/${id}`).then(r => r.data.product)
    );
    return Promise.all(promises);
  }

  async getProductsByType(type: FurnitureType, maxPrice?: number): Promise<Product[]> {
    const response = await axios.get(`${this.baseUrl}/by-type/${type}`, {
      params: { priceMax: maxPrice },
    });
    return response.data.products;
  }
}
```

### Image Storage Service

```typescript
class ImageStorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async uploadImage(buffer: Buffer, filename?: string): Promise<string> {
    const imageId = filename || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const filepath = path.join(this.uploadDir, `${imageId}.jpg`);

    // Optimize image with Sharp
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    // Return URL (in production, this would be S3/CDN URL)
    return `/uploads/${imageId}.jpg`;
  }

  async getImagePath(imageUrl: string): Promise<string> {
    const filename = path.basename(imageUrl);
    return path.join(this.uploadDir, filename);
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
        code: 'PRODUCT_SERVICE_ERROR',
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
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});
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

# Stability AI
STABILITY_API_KEY=sk-...

# Product Service
PRODUCT_SERVICE_URL=http://localhost:3002/api/products

# Image Storage
UPLOAD_DIR=./uploads
IMAGE_BASE_URL=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```


---

## Testing Strategy

### Unit Tests (Jest)

```typescript
describe('RecommendationService', () => {
  let service: RecommendationService;
  let mockOpenAIClient: jest.Mocked<OpenAIClient>;
  let mockProductClient: jest.Mocked<ProductServiceClient>;

  beforeEach(() => {
    mockOpenAIClient = {
      chat: jest.fn(),
    } as any;
    mockProductClient = {
      searchProducts: jest.fn(),
    } as any;
    service = new RecommendationService(mockOpenAIClient, mockProductClient);
  });

  it('should generate recommendations within budget', async () => {
    mockProductClient.searchProducts.mockResolvedValue([
      { id: '1', name: 'Sofa', price: 1000 },
      { id: '2', name: 'Table', price: 500 },
    ]);
    mockOpenAIClient.chat.mockResolvedValue({
      content: JSON.stringify([
        { productId: '1', position: { x: 0, y: 0, z: 0 }, rotation: 0 },
      ]),
    });

    const result = await service.generateRecommendations({
      roomType: 'living_room',
      dimensions: { length: 5, width: 4, height: 3, unit: 'meters' },
      budget: { amount: 2000, currency: 'USD' },
    });

    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe('1');
  });
});
```

### Integration Tests (Supertest)

```typescript
describe('POST /api/ai/recommend', () => {
  it('should return recommendations', async () => {
    const response = await request(app)
      .post('/api/ai/recommend')
      .send({
        roomType: 'living_room',
        dimensions: { length: 5, width: 4, height: 3, unit: 'meters' },
        budget: { amount: 2000, currency: 'USD' },
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.recommendations).toBeInstanceOf(Array);
  });

  it('should return 400 for invalid request', async () => {
    const response = await request(app)
      .post('/api/ai/recommend')
      .send({
        roomType: 'invalid',
      })
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
npm run dev  # Starts server with nodemon on http://localhost:3001
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
COPY uploads ./uploads

EXPOSE 3001

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
      - STABILITY_API_KEY=${STABILITY_API_KEY}
      - PRODUCT_SERVICE_URL=http://product-service:3002/api/products
    volumes:
      - ./uploads:/app/uploads
    depends_on:
      - product-service
```

---

## Performance Optimization

### Caching Strategy

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

class CachedProductServiceClient extends ProductServiceClient {
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
    StabilityAIClient.ts
    ProductServiceClient.ts
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
/uploads            # Uploaded images (local storage)
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
    "sharp": "^0.33.0",
    "multer": "^1.4.5-lts.1",
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

The AI Service is a robust Node.js/TypeScript backend that integrates with external AI models (OpenAI, Stability AI) to provide intelligent furniture recommendations, natural language interactions, and image analysis capabilities. It follows clean architecture principles with clear separation of concerns, comprehensive error handling, and production-ready features like rate limiting, caching, and structured logging.
