# 单元 2：AI 服务 - 逻辑设计

## 概述

AI 服务是一个 Node.js/TypeScript 后端服务，提供 AI 驱动的家具推荐、自然语言聊天交互、图像中的家具检测以及家具替换/放置渲染功能。它集成了外部 AI 模型（OpenAI GPT-4/GPT-4V、Replicate）和本地产品配置。

---

## 技术栈

### 核心技术
- **运行时**: Node.js 20+ LTS
- **语言**: TypeScript 5+
- **框架**: Express.js
- **HTTP 客户端**: Axios
- **验证**: Zod
- **图像处理**: Sharp
- **文件上传**: Multer
- **环境配置**: dotenv

### 外部 AI 服务
- **OpenAI GPT-4**: 家具推荐、聊天
- **OpenAI GPT-4V**: 图像分析、家具检测
- **Replicate (SDXL)**: 图像生成、修复（通过 Replicate 运行 Stable Diffusion XL）

### 开发工具
- **包管理器**: npm
- **代码检查**: ESLint + Prettier
- **测试**: Jest + Supertest
- **API 文档**: Swagger/OpenAPI

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI 服务                                   │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    API 层 (Express)                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │推荐控制器│  │聊天控制器│  │检测控制器│  │替换控制器│   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    应用层                                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │ │
│  │  │  推荐服务    │  │   聊天服务   │  │   图像服务   │     │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘     │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      领域层                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  模型    │  │  类型    │  │  验证器  │  │  工具    │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  基础设施层                                  │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │
│  │  │  OpenAI  │  │Replicate │  │  产品    │  │  图像    │   │ │
│  │  │  客户端  │  │  客户端  │  │  客户端  │  │  存储    │   │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   外部 API       │
                    │  - OpenAI API    │
                    │  - Replicate API │
                    └──────────────────┘
```

---

## API 端点

### POST /api/ai/recommend
**用途**: 生成家具推荐

**请求体**:
```typescript
interface RecommendationRequest {
  roomType: RoomType;
  dimensions: RoomDimensions;
  budget?: Budget;
  preferences?: UserPreferences;
}
```

**响应**:
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
**用途**: 用于设计优化的自然语言聊天

**请求体**:
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

**响应**:
```typescript
interface ChatResponse {
  success: boolean;
  reply: string;
  updatedRecommendations?: Recommendation[];
  actions: DesignAction[];
}
```

### POST /api/ai/detect
**用途**: 检测上传的房间图像中的家具

**请求体**:
```typescript
interface DetectionRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
}
```

**响应**:
```typescript
interface DetectionResponse {
  success: boolean;
  isEmpty: boolean;
  detectedItems: DetectedFurniture[];
  roomSpace?: RoomSpace;
}
```

### POST /api/ai/replace
**用途**: 将家具替换应用到图像

**请求体**:
```typescript
interface ReplacementRequest {
  imageUrl: string;
  replacements: Array<{
    detectedItemId: string;
    newProductId: string;
  }>;
}
```

**响应**:
```typescript
interface ReplacementResponse {
  success: boolean;
  resultImageUrl: string;
  appliedReplacements: AppliedReplacement[];
}
```

### POST /api/ai/place
**用途**: 在空房间图像中放置家具

**请求体**:
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

**响应**:
```typescript
interface PlacementResponse {
  success: boolean;
  resultImageUrl: string;
  appliedPlacements: AppliedPlacement[];
}
```

### POST /api/upload
**用途**: 上传房间图像到服务器本地存储

**请求**: Multipart 表单数据，包含图像文件
- Content-Type: multipart/form-data
- Field name: `image`
- Max file size: 10MB
- Allowed types: image/jpeg, image/png, image/webp

**响应**:
```typescript
interface UploadResponse {
  success: boolean;
  imageUrl: string;      // 本地服务器 URL，如 /uploads/abc123.jpg
  imageId: string;       // 图像唯一标识符
  filename: string;      // 原始文件名
  size: number;          // 文件大小（字节）
  dimensions: {          // 图像尺寸
    width: number;
    height: number;
  };
}
```

**实现说明**:
- 前端通过 FormData 上传图像
- 后端使用 Multer 接收文件
- 文件保存在服务器本地 `./uploads` 目录
- 返回本地访问路径（非云存储 URL）

### GET /api/ai/products/search
**用途**: 从本地产品目录搜索产品

**查询参数**:
- `q` (string, optional): 搜索关键词
- `category` (string, optional): 按类别筛选
- `maxPrice` (number, optional): 最大价格筛选
- `limit` (number, optional): 最大结果数，默认 10

**响应**:
```typescript
interface ProductSearchResponse {
  success: boolean;
  products: Product[];
  total: number;
}
```

### GET /api/ai/products/categories
**用途**: 获取所有可用的产品类别

**响应**:
```typescript
interface CategoriesResponse {
  success: boolean;
  categories: Array<{
    id: string;
    name: string;
    productCount: number;
  }>;
}
```

### GET /api/ai/products/{id}
**用途**: 获取产品详细信息

**响应**:
```typescript
interface ProductDetailResponse {
  success: boolean;
  product: Product;
}
```

---

## 服务层

### RecommendationService（推荐服务）

**职责**:
- 使用 GPT-4 生成家具推荐
- 从本地配置加载可用产品
- 优化房间布局的家具放置
- 应用预算约束

**关键方法**:

```typescript
class RecommendationService {
  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    // 1. 从本地配置加载可用产品
    const products = await this.productClient.searchProducts({
      categories: request.preferences?.selectedCategories,
      collections: request.preferences?.selectedCollections,
      maxPrice: request.budget?.amount,
    });

    // 2. 使用房间配置和产品构建 AI 提示
    const prompt = this.buildRecommendationPrompt(request, products);

    // 3. 调用 OpenAI GPT-4
    const aiResponse = await this.openAIClient.chat({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    // 4. 将 AI 响应解析为推荐
    const recommendations = this.parseRecommendations(aiResponse);

    // 5. 验证并优化放置
    return this.optimizePlacements(recommendations, request.dimensions);
  }

  private buildRecommendationPrompt(
    request: RecommendationRequest,
    products: Product[]
  ): string {
    return `
      房间类型: ${request.roomType}
      尺寸: ${request.dimensions.length}m × ${request.dimensions.width}m
      预算: ${request.budget?.amount} ${request.budget?.currency}
      
      可用产品:
      ${products.map(p => `- ${p.name} (${p.dimensions.width}×${p.dimensions.depth}m, ${p.price})`).join('\n')}
      
      任务: 推荐最佳家具布置，包括位置和旋转角度。
      输出格式: JSON 数组，包含 productId、position {x, y, z}、rotation、reasoning。
    `;
  }
}
```


### ChatService（聊天服务）

**职责**:
- 管理对话式 AI 交互
- 维护聊天上下文和历史
- 从 AI 响应中解析设计操作
- 支持多语言对话

**关键方法**:

```typescript
class ChatService {
  async processMessage(request: ChatRequest): Promise<ChatResponse> {
    // 1. 构建对话上下文
    const messages = this.buildChatContext(request);

    // 2. 调用 OpenAI GPT-4
    const aiResponse = await this.openAIClient.chat({
      model: 'gpt-4',
      messages,
      temperature: 0.8,
    });

    // 3. 解析响应中的设计操作
    const actions = this.parseDesignActions(aiResponse);

    // 4. 如果存在操作，生成更新的推荐
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
        content: `你是一个有帮助的家具设计助手。
                  当前房间: ${request.context.currentDesign.roomType}
                  当前家具: ${request.context.currentDesign.furniturePlacements.length} 件
                  语言: ${request.language}`,
      },
      { role: 'user', content: request.message },
    ];
  }
}
```

### ImageService（图像服务）

**职责**:
- 使用 GPT-4V 检测上传图像中的家具
- 确定房间是空的还是有现有家具
- 使用 Replicate (SDXL) 生成家具替换图像
- 为空房间生成家具放置图像
- 用电器和装饰元素丰富房间

**关键方法**:

```typescript
class ImageService {
  async detectFurniture(request: DetectionRequest): Promise<DetectionResponse> {
    // 1. 调用 GPT-4V 进行家具检测
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

    // 2. 解析检测结果
    const detections = this.parseDetections(visionResponse);

    // 3. 确定房间是否为空
    const isEmpty = detections.length === 0 || 
                    detections.every(d => d.confidence < 0.3);

    // 4. 如果为空，分析房间空间
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
    // 1. 从本地配置获取产品图像
    const products = await this.productClient.getProductsByIds(
      request.replacements.map(r => r.newProductId)
    );

    // 2. 为每个替换生成修复蒙版
    const results = [];
    for (const replacement of request.replacements) {
      const detection = await this.getDetection(replacement.detectedItemId);
      const product = products.find(p => p.id === replacement.newProductId);

      // 3. 调用 Replicate 进行修复
      const resultImage = await this.replicateClient.inpaint({
        image: request.imageUrl,
        mask: this.createMask(detection.boundingBox),
        prompt: `${product.name}，逼真的家具，专业室内照片`,
        negativePrompt: '模糊，扭曲，不真实',
      });

      results.push({
        detectedItemId: replacement.detectedItemId,
        newProductId: replacement.newProductId,
        productName: product.name,
        resultImageUrl: resultImage.url,
      });
    }

    // 4. 将所有替换合成到最终图像
    const finalImageUrl = await this.compositeImages(request.imageUrl, results);

    return {
      success: true,
      resultImageUrl: finalImageUrl,
      appliedReplacements: results,
    };
  }

  async placeFurniture(request: PlacementRequest): Promise<PlacementResponse> {
    // 1. 获取产品图像
    const products = await this.productClient.getProductsByIds(
      request.placements.map(p => p.productId)
    );

    // 2. 生成放置提示
    const prompt = this.buildPlacementPrompt(request, products);

    // 3. 调用 Replicate 进行图像生成
    const resultImage = await this.replicateClient.imageToImage({
      image: request.imageUrl,
      prompt,
      strength: 0.6, // 保留房间结构
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
      return `${p.name} 位于位置 (${placement.position.x}, ${placement.position.z})`;
    }).join(', ');

    return `
      空房间室内，包含 ${furnitureDescriptions}。
      逼真的家具放置，专业室内摄影，
      适当的比例和透视，自然光照。
    `;
  }
}
```


---

## 基础设施层

### OpenAI 客户端

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
      throw new AIServiceError('OpenAI 聊天失败', error);
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
      throw new AIServiceError('OpenAI 视觉失败', error);
    }
  }
}
```

### Replicate 客户端

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
      // 使用 SDXL Inpainting 模型
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

      // output 是图像 URL 数组
      const imageUrl = Array.isArray(output) ? output[0] : output;
      
      // 下载并重新上传到本地存储
      const localUrl = await this.downloadAndStore(imageUrl);

      return { url: localUrl };
    } catch (error) {
      throw new AIServiceError('Replicate inpaint 失败', error);
    }
  }

  async imageToImage(params: ImageToImageParams): Promise<ImageResult> {
    try {
      // 使用 SDXL Image-to-Image 模型
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
      throw new AIServiceError('Replicate image-to-image 失败', error);
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
      throw new AIServiceError('Replicate text-to-image 失败', error);
    }
  }

  private async downloadAndStore(imageUrl: string): Promise<string> {
    // 从 Replicate 下载图像
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 上传到本地存储
    const storageService = new ImageStorageService();
    return await storageService.uploadImage(buffer);
  }
}
```

### 产品服务客户端（本地配置）

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
   * 从本地 YAML 文件加载产品数据
   */
  private loadProducts(): void {
    try {
      const configPath = process.env.PRODUCTS_CONFIG_PATH || './config/products.yaml';
      const fileContents = fs.readFileSync(configPath, 'utf8');
      const config = yaml.load(fileContents) as ProductsConfig;

      // 转换为内部 Product 格式
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
   * 解析价格字符串（如 "$1,999"）为数字
   */
  private parsePrice(priceStr: string): number {
    return parseFloat(priceStr.replace(/[$,]/g, ''));
  }

  /**
   * 根据产品名称推断类别
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
   * 根据产品名称推断尺寸（简化版）
   */
  private inferDimensions(name: string): Dimensions {
    // 根据产品类型返回典型尺寸
    if (name.includes('Sectional')) {
      return { width: 2.5, depth: 1.8, height: 0.85, unit: 'meters' };
    }
    if (name.includes('3 Seater')) {
      return { width: 2.0, depth: 0.9, height: 0.85, unit: 'meters' };
    }
    return { width: 1.5, depth: 0.8, height: 0.85, unit: 'meters' };
  }

  /**
   * 搜索产品
   */
  async searchProducts(params: SearchParams): Promise<Product[]> {
    let results = [...this.productsArray];

    // 按类别筛选
    if (params.categories && params.categories.length > 0) {
      results = results.filter(p => 
        params.categories!.includes(p.category)
      );
    }

    // 按标签筛选
    if (params.collections && params.collections.length > 0) {
      results = results.filter(p =>
        p.tags.some(tag => params.collections!.includes(tag))
      );
    }

    // 按价格筛选
    if (params.maxPrice) {
      results = results.filter(p => p.price <= params.maxPrice!);
    }

    return results;
  }

  /**
   * 根据 ID 获取产品
   */
  async getProductsByIds(ids: string[]): Promise<Product[]> {
    return ids
      .map(id => this.products.get(id))
      .filter((p): p is Product => p !== undefined);
  }

  /**
   * 根据类型获取产品
   */
  async getProductsByType(type: FurnitureType, maxPrice?: number): Promise<Product[]> {
    let results = this.productsArray.filter(p => p.category === type);

    if (maxPrice) {
      results = results.filter(p => p.price <= maxPrice);
    }

    return results;
  }

  /**
   * 获取所有产品
   */
  async getAllProducts(): Promise<Product[]> {
    return [...this.productsArray];
  }

  /**
   * 重新加载产品配置（用于热更新）
   */
  async reloadProducts(): Promise<void> {
    this.products.clear();
    this.productsArray = [];
    this.loadProducts();
  }
}

// Product 类型定义
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

### 图像存储服务（本地存储）

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
    
    // 确保上传目录存在
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * 保存上传的图像到本地存储
   * @param buffer 图像 Buffer
   * @param originalFilename 原始文件名（可选）
   * @returns 本地访问 URL
   */
  async uploadImage(buffer: Buffer, originalFilename?: string): Promise<string> {
    // 生成唯一文件名
    const imageId = uuidv4();
    const ext = originalFilename 
      ? path.extname(originalFilename).toLowerCase() 
      : '.jpg';
    const filename = `${imageId}${ext}`;
    const filepath = path.join(this.uploadDir, filename);

    // 使用 Sharp 优化图像
    await sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toFile(filepath);

    // 返回本地 URL
    return `/uploads/${filename}`;
  }

  /**
   * 从 URL 获取本地文件路径
   * @param imageUrl 图像 URL（如 /uploads/abc.jpg）
   * @returns 本地文件系统路径
   */
  async getImagePath(imageUrl: string): Promise<string> {
    const filename = path.basename(imageUrl);
    const filepath = path.join(this.uploadDir, filename);
    
    // 验证文件是否存在
    if (!fs.existsSync(filepath)) {
      throw new Error(`Image not found: ${filename}`);
    }
    
    return filepath;
  }

  /**
   * 获取图像的完整 URL
   * @param relativePath 相对路径（如 /uploads/abc.jpg）
   * @returns 完整 URL
   */
  getFullUrl(relativePath: string): string {
    return `${this.baseUrl}${relativePath}`;
  }

  /**
   * 删除图像文件
   * @param imageUrl 图像 URL
   */
  async deleteImage(imageUrl: string): Promise<void> {
    const filepath = await this.getImagePath(imageUrl);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  }

  /**
   * 获取图像信息
   * @param imageUrl 图像 URL
   * @returns 图像元数据
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

## 控制器层

### 产品控制器

```typescript
import { Request, Response, NextFunction } from 'express';
import { ProductServiceClient } from '../clients/ProductServiceClient';

class ProductController {
  private productClient: ProductServiceClient;

  constructor() {
    this.productClient = new ProductServiceClient();
  }

  /**
   * 搜索产品
   * GET /api/ai/products/search
   */
  async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, category, maxPrice, limit } = req.query;

      const products = await this.productClient.searchProducts({
        query: q as string,
        categories: category ? [category as string] : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      });

      const limitNum = limit ? parseInt(limit as string) : 10;
      const limitedProducts = products.slice(0, limitNum);

      res.json({
        success: true,
        products: limitedProducts,
        total: products.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取产品类别
   * GET /api/ai/products/categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await this.productClient.getAllProducts();
      
      // 统计每个类别的产品数量
      const categoryMap = new Map<string, number>();
      products.forEach(product => {
        const count = categoryMap.get(product.category) || 0;
        categoryMap.set(product.category, count + 1);
      });

      const categories = Array.from(categoryMap.entries()).map(([id, count]) => ({
        id,
        name: this.formatCategoryName(id),
        productCount: count,
      }));

      res.json({
        success: true,
        categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取产品详情
   * GET /api/ai/products/:id
   */
  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const products = await this.productClient.getProductsByIds([id]);

      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: '产品未找到',
          },
        });
      }

      res.json({
        success: true,
        product: products[0],
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 格式化类别名称
   */
  private formatCategoryName(categoryId: string): string {
    const nameMap: Record<string, string> = {
      sofa: '沙发',
      chair: '椅子',
      table: '桌子',
      furniture: '家具',
    };
    return nameMap[categoryId] || categoryId;
  }
}

export default ProductController;
```

---

## 错误处理

### 自定义错误类

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

### 错误中间件

```typescript
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('错误:', err);

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
        message: 'AI 服务暂时不可用',
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
      message: '发生意外错误',
    },
  });
};
```

---

## 验证（Zod 模式）

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

## 中间件

### 请求验证中间件

```typescript
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(new ValidationError('无效请求', error.errors));
      } else {
        next(error);
      }
    }
  };
};
```

### 速率限制中间件

```typescript
import rateLimit from 'express-rate-limit';

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 10, // 每分钟 10 个请求
  message: '请求过多，请稍后再试',
});
```

### 文件上传中间件

```typescript
import multer from 'multer';
import path from 'path';

// 使用内存存储，后续通过 ImageStorageService 处理
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1, // 一次只允许上传一个文件
  },
  fileFilter: (req, file, cb) => {
    // 允许的图像类型
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传 JPEG、PNG 或 WebP 格式的图像文件'));
    }
  },
});

// 上传控制器
const uploadController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: '未找到上传的文件',
        },
      });
    }

    const storageService = new ImageStorageService();
    
    // 保存到本地存储
    const imageUrl = await storageService.uploadImage(
      req.file.buffer,
      req.file.originalname
    );

    // 获取图像信息
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

// 路由配置
app.post('/api/upload', upload.single('image'), uploadController);
```

---

## 配置

### 环境变量

```env
# 服务器
PORT=3001
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-...

# Replicate
REPLICATE_API_TOKEN=r8_...

# 产品配置（本地）
PRODUCTS_CONFIG_PATH=./config/products.yaml
PRODUCTS_IMAGES_DIR=./public/products

# 产品服务（已移除，改为本地配置）
# PRODUCT_SERVICE_URL=http://localhost:3002/api/products

# 图像存储（本地）
UPLOAD_DIR=./uploads
IMAGE_BASE_URL=http://localhost:3001
MAX_FILE_SIZE=10485760

# 速率限制
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10
```


---

## 测试策略（可选）

> **注意**：本项目以手动测试为主。自动化测试配置已包含，但仅作为参考。建议使用 Postman、Thunder Client 或前端应用进行实际测试。

### 基础健康检查测试

```typescript
// tests/health.test.ts
import request from 'supertest';
import app from '../src/app';

describe('Health Check', () => {
  it('应该返回服务健康状态', async () => {
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

### 简单的 API 验证测试（可选）

```typescript
// tests/api.test.ts
import request from 'supertest';
import app from '../src/app';

describe('API Validation', () => {
  it('应该拒绝无效的推荐请求', async () => {
    const response = await request(app)
      .post('/api/ai/recommend')
      .send({
        roomType: 'invalid_type',
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('INVALID_REQUEST');
  });

  it('应该拒绝没有文件的上传请求', async () => {
    const response = await request(app)
      .post('/api/upload')
      .expect(400);

    expect(response.body.success).toBe(false);
  });
});
```

### 测试配置

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

### 推荐的手动测试方式

1. **使用 REST Client（VS Code 扩展）**
   ```http
   ### 健康检查
   GET http://localhost:3001/health

   ### 推荐接口
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

2. **使用 Postman 或 Thunder Client**
   - 导入 API 端点
   - 保存测试用例
   - 快速验证功能

3. **使用前端应用**
   - 最真实的测试环境
   - 直接验证用户体验

---

## 部署

### 开发环境

```bash
npm install
npm run dev  # 使用 nodemon 在 http://localhost:3001 启动服务器
```

### 健康检查端点

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

### 生产构建

```bash
npm run build  # 将 TypeScript 编译到 /dist
npm start      # 运行编译后的代码
```

### Docker 部署

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY config ./config
COPY public ./public

# 创建上传目录
RUN mkdir -p /app/uploads

# 设置上传目录权限
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

## 性能优化

### 缓存策略

```typescript
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 600 }); // 10 分钟

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

### 请求队列

```typescript
import PQueue from 'p-queue';

const openAIQueue = new PQueue({ concurrency: 5 }); // 最多 5 个并发请求

class RateLimitedOpenAIClient extends OpenAIClient {
  async chat(params: ChatParams): Promise<ChatResponse> {
    return openAIQueue.add(() => super.chat(params));
  }
}
```

---

## 监控和日志

### 结构化日志（Winston）

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

// 使用方法
logger.info('收到推荐请求', { roomType, sessionId });
logger.error('OpenAI API 错误', { error: error.message, stack: error.stack });
```

### 请求日志中间件

```typescript
const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('HTTP 请求', {
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

## 安全性

### API 密钥验证

```typescript
const validateApiKey: RequestHandler = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: '无效的 API 密钥' },
    });
  }
  
  next();
};
```

### CORS 配置

```typescript
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
}));
```

### 输入清理

```typescript
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

app.use(helmet());
app.use(mongoSanitize());
```

---

## API 文档（Swagger）

```typescript
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI 服务 API',
      version: '1.0.0',
      description: '家具推荐和图像分析 API',
    },
    servers: [
      { url: 'http://localhost:3001', description: '开发环境' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## 项目结构

```
/src
  /controllers      # 请求处理器
    recommendationController.ts
    chatController.ts
    imageController.ts
    uploadController.ts
    productController.ts  # 产品相关端点
  /services         # 业务逻辑
    RecommendationService.ts
    ChatService.ts
    ImageService.ts
  /clients          # 外部 API 客户端
    OpenAIClient.ts
    ReplicateClient.ts
    ProductServiceClient.ts  # 本地配置加载器
  /middleware       # Express 中间件
    validation.ts
    errorHandler.ts
    rateLimiter.ts
  /models           # 领域模型和类型
    types.ts
    schemas.ts
  /utils            # 工具函数
    imageProcessing.ts
    promptBuilder.ts
  /routes           # 路由定义
    index.ts
    aiRoutes.ts
    productRoutes.ts
  index.ts          # 入口点
  app.ts            # Express 应用设置
/config             # 配置文件
  products.yaml     # 产品目录配置
/public             # 静态资源
  /products         # 产品图像（从 product 目录复制）
    product1_img1.jpg
    product1_img2.jpg
    ...
/uploads            # 上传的图像（本地存储，运行时创建）
  .gitkeep          # 保持目录结构
/tests              # 测试文件
  /unit
  /integration
```

---

## 依赖项

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

## 总结

AI 服务是一个强大的 Node.js/TypeScript 后端，集成了外部 AI 模型（OpenAI、Replicate），提供智能家具推荐、自然语言交互和图像分析功能。它遵循清晰的架构原则，具有明确的关注点分离、全面的错误处理以及生产就绪的功能，如速率限制、缓存和结构化日志。

## 为什么选择 Replicate？

- **成本效益**: 比 Stability AI 官方 API 便宜约 80%，每月提供 $5 免费额度
- **易于使用**: 简单的 API，无需管理 GPU 基础设施
- **灵活性**: 支持多种 Stable Diffusion 模型和版本
- **可扩展**: 按需付费，自动扩展
- **开发友好**: 快速迭代，适合 MVP 和原型开发
