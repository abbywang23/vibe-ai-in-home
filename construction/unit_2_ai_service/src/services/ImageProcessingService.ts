import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';
import { ProductServiceClient } from '../clients/ProductServiceClient';

export interface ImageUploadResponse {
  success: boolean;
  imageUrl: string;
  message?: string;
}

export interface DetectedFurnitureItem {
  itemId: string;
  furnitureType: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
}

export interface FurnitureDetectionResponse {
  success: boolean;
  detectedItems: DetectedFurnitureItem[];
  isEmpty: boolean;
  estimatedRoomDimensions?: {
    length: number;
    width: number;
    height: number;
    unit: string;
  };
}

export interface FurnitureReplacementResponse {
  success: boolean;
  processedImageUrl: string;
  replacement: {
    detectedItemId: string;
    replacementProductId: string;
    replacementProductName: string;
    appliedAt: string;
  };
}

export interface FurniturePlacementResponse {
  success: boolean;
  processedImageUrl: string;
  placement: {
    placementId: string;
    productId: string;
    productName: string;
    imagePosition: { x: number; y: number };
    scale: number;
    rotation: number;
    appliedAt: string;
  };
}

export class ImageProcessingService {
  constructor(private productClient: ProductServiceClient) {}

  /**
   * Helper function to safely append query parameters to a URL
   * Handles URLs that may already have query parameters or special characters
   */
  private appendQueryParams(baseUrl: string, params: Record<string, string | number>): string {
    try {
      // Try to parse as a complete URL
      const url = new URL(baseUrl);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
      return url.toString();
    } catch (error) {
      // If URL parsing fails (e.g., relative URL or malformed), manually construct
      const separator = baseUrl.includes('?') ? '&' : '?';
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      return `${baseUrl}${separator}${queryString}`;
    }
  }

  /**
   * Upload and process image
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<ImageUploadResponse> {
    try {
      // For demo purposes, we'll simulate image upload
      // In production, you would upload to cloud storage (OSS, S3, etc.)
      // URL encode the filename to handle special characters like spaces, parentheses, etc.
      const encodedFilename = encodeURIComponent(filename);
      const imageUrl = `https://demo-storage.example.com/uploads/${Date.now()}-${encodedFilename}`;
      
      console.log(`Image uploaded: ${filename} -> ${imageUrl}`);
      
      return {
        success: true,
        imageUrl,
        message: 'Image uploaded successfully'
      };
    } catch (error) {
      console.error('Image upload error:', error);
      return {
        success: false,
        imageUrl: '',
        message: 'Failed to upload image'
      };
    }
  }

  /**
   * Detect furniture in image using Qwen-VL
   */
  async detectFurniture(
    imageUrl: string,
    roomDimensions: { length: number; width: number; height: number; unit: string }
  ): Promise<FurnitureDetectionResponse> {
    console.log(`Detecting furniture in image: ${imageUrl}`);

    try {
      const aiClient = AIClientFactory.getAvailableClient();
      
      if (aiClient) {
        return await this.detectFurnitureWithAI(imageUrl, roomDimensions, aiClient);
      } else {
        // Fallback to mock detection
        return this.generateMockDetection(imageUrl);
      }
    } catch (error) {
      console.error('Furniture detection error, falling back to mock:', error);
      return this.generateMockDetection(imageUrl);
    }
  }

  /**
   * Replace furniture using AI
   */
  async replaceFurniture(
    imageUrl: string,
    detectedItemId: string,
    replacementProductId: string
  ): Promise<FurnitureReplacementResponse> {
    console.log(`Replacing furniture: ${detectedItemId} with ${replacementProductId}`);

    try {
      // Get product details
      const products = await this.productClient.searchProducts({ 
        productIds: [replacementProductId] 
      });
      const product = products.find(p => p.id === replacementProductId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const aiClient = AIClientFactory.getAvailableClient();
      
      if (aiClient) {
        return await this.replaceFurnitureWithAI(imageUrl, detectedItemId, product, aiClient);
      } else {
        // Fallback to mock replacement
        return this.generateMockReplacement(imageUrl, detectedItemId, product);
      }
    } catch (error) {
      console.error('Furniture replacement error, falling back to mock:', error);
      // Generate mock response
      const products = await this.productClient.searchProducts({ 
        productIds: [replacementProductId] 
      });
      const product = products.find(p => p.id === replacementProductId);
      
      return this.generateMockReplacement(imageUrl, detectedItemId, product || {
        id: replacementProductId,
        name: 'Unknown Product',
        price: 0,
        currency: 'USD'
      } as any);
    }
  }

  /**
   * Place furniture in empty room using AI
   */
  async placeFurniture(
    imageUrl: string,
    productId: string,
    imagePosition: { x: number; y: number },
    rotation: number,
    scale: number
  ): Promise<FurniturePlacementResponse> {
    console.log(`Placing furniture: ${productId} at position (${imagePosition.x}, ${imagePosition.y})`);

    try {
      // Get product details
      const products = await this.productClient.searchProducts({ 
        productIds: [productId] 
      });
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      const aiClient = AIClientFactory.getAvailableClient();
      
      if (aiClient) {
        return await this.placeFurnitureWithAI(imageUrl, product, imagePosition, rotation, scale, aiClient);
      } else {
        // Fallback to mock placement
        return this.generateMockPlacement(imageUrl, product, imagePosition, rotation, scale);
      }
    } catch (error) {
      console.error('Furniture placement error, falling back to mock:', error);
      // Generate mock response
      const products = await this.productClient.searchProducts({ 
        productIds: [productId] 
      });
      const product = products.find(p => p.id === productId);
      
      return this.generateMockPlacement(imageUrl, product || {
        id: productId,
        name: 'Unknown Product',
        price: 0,
        currency: 'USD'
      } as any, imagePosition, rotation, scale);
    }
  }

  /**
   * Detect furniture using AI (Qwen-VL)
   */
  private async detectFurnitureWithAI(
    imageUrl: string,
    roomDimensions: any,
    aiClient: any
  ): Promise<FurnitureDetectionResponse> {
    const systemPrompt = `你是一个专业的室内设计师和家具识别专家。请分析这张房间图片，识别其中的家具并判断房间是否为空。

请按照以下JSON格式返回结果：
{
  "isEmpty": boolean,
  "detectedItems": [
    {
      "itemId": "unique_id",
      "furnitureType": "家具类型（如：沙发、桌子、椅子等）",
      "boundingBox": {
        "x": 边界框左上角x坐标（0-100百分比）,
        "y": 边界框左上角y坐标（0-100百分比）,
        "width": 边界框宽度（0-100百分比）,
        "height": 边界框高度（0-100百分比）
      },
      "confidence": 置信度（0-1之间的小数）
    }
  ],
  "estimatedRoomDimensions": {
    "length": 估计的房间长度,
    "width": 估计的房间宽度,
    "height": 估计的房间高度,
    "unit": "meters"
  }
}

如果房间是空的，isEmpty设为true，detectedItems为空数组。
如果房间有家具，isEmpty设为false，列出所有检测到的家具。`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          },
          {
            type: 'text',
            text: `请分析这张房间图片，识别其中的家具。房间尺寸参考：${roomDimensions.length}x${roomDimensions.width}x${roomDimensions.height} ${roomDimensions.unit}`
          }
        ]
      }
    ];

    const response = await aiClient.chatCompletion({
      model: 'qwen3-vl-plus', // 使用Qwen-VL模型
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parse AI response
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          detectedItems: result.detectedItems || [],
          isEmpty: result.isEmpty || false,
          estimatedRoomDimensions: result.estimatedRoomDimensions
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI detection response:', parseError);
    }

    // Fallback to mock if parsing fails
    return this.generateMockDetection(imageUrl);
  }

  /**
   * Replace furniture using AI
   */
  private async replaceFurnitureWithAI(
    imageUrl: string,
    detectedItemId: string,
    product: any,
    aiClient: any
  ): Promise<FurnitureReplacementResponse> {
    const systemPrompt = `你是一个专业的室内设计师。请帮助用户将房间图片中的指定家具替换为新的Castlery产品。

产品信息：
- 名称：${product.name}
- 尺寸：${product.dimensions?.width || 'N/A'}x${product.dimensions?.depth || 'N/A'}x${product.dimensions?.height || 'N/A'}
- 价格：${product.currency} ${product.price}

请描述替换后的效果，并返回JSON格式：
{
  "success": true,
  "description": "替换效果描述",
  "processedImageUrl": "处理后的图片URL（模拟）"
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          },
          {
            type: 'text',
            text: `请将图片中ID为"${detectedItemId}"的家具替换为${product.name}，并描述替换效果。`
          }
        ]
      }
    ];

    const response = await aiClient.chatCompletion({
      model: 'qwen3-vl-plus',
      messages,
      temperature: 0.5,
      max_tokens: 500,
    });

    // For demo, generate a mock processed image URL
    const processedImageUrl = this.appendQueryParams(imageUrl, {
      replaced: detectedItemId,
      with: product.id,
      t: Date.now()
    });

    return {
      success: true,
      processedImageUrl,
      replacement: {
        detectedItemId,
        replacementProductId: product.id,
        replacementProductName: product.name,
        appliedAt: new Date().toISOString(),
      }
    };
  }

  /**
   * Place furniture using AI
   */
  private async placeFurnitureWithAI(
    imageUrl: string,
    product: any,
    imagePosition: { x: number; y: number },
    rotation: number,
    scale: number,
    aiClient: any
  ): Promise<FurniturePlacementResponse> {
    const systemPrompt = `你是一个专业的室内设计师。请帮助用户在空房间图片中放置Castlery家具产品。

产品信息：
- 名称：${product.name}
- 尺寸：${product.dimensions?.width || 'N/A'}x${product.dimensions?.depth || 'N/A'}x${product.dimensions?.height || 'N/A'}
- 价格：${product.currency} ${product.price}

放置参数：
- 位置：(${imagePosition.x}, ${imagePosition.y})
- 旋转：${rotation}度
- 缩放：${scale}倍

请描述放置后的效果，并返回JSON格式：
{
  "success": true,
  "description": "放置效果描述",
  "processedImageUrl": "处理后的图片URL（模拟）"
}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: [
          {
            type: 'image_url',
            image_url: { url: imageUrl }
          },
          {
            type: 'text',
            text: `请在这个空房间中放置${product.name}，位置在(${imagePosition.x}, ${imagePosition.y})，旋转${rotation}度，缩放${scale}倍。`
          }
        ]
      }
    ];

    const response = await aiClient.chatCompletion({
      model: 'qwen3-vl-plus',
      messages,
      temperature: 0.5,
      max_tokens: 500,
    });

    // For demo, generate a mock processed image URL
    const processedImageUrl = this.appendQueryParams(imageUrl, {
      placed: product.id,
      pos: `${imagePosition.x},${imagePosition.y}`,
      rot: rotation,
      scale: scale,
      t: Date.now()
    });

    return {
      success: true,
      processedImageUrl,
      placement: {
        placementId: `placement_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        imagePosition,
        scale,
        rotation,
        appliedAt: new Date().toISOString(),
      }
    };
  }

  /**
   * Generate mock furniture detection (fallback)
   */
  private generateMockDetection(imageUrl: string): FurnitureDetectionResponse {
    // Simulate detection based on URL or random
    const isEmpty = Math.random() > 0.5;
    
    if (isEmpty) {
      return {
        success: true,
        detectedItems: [],
        isEmpty: true,
        estimatedRoomDimensions: {
          length: 5,
          width: 4,
          height: 3,
          unit: 'meters'
        }
      };
    }

    // Generate mock detected furniture
    const mockItems: DetectedFurnitureItem[] = [
      {
        itemId: 'detected_1',
        furnitureType: 'sofa',
        boundingBox: { x: 20, y: 40, width: 40, height: 25 },
        confidence: 0.92
      },
      {
        itemId: 'detected_2',
        furnitureType: 'table',
        boundingBox: { x: 45, y: 65, width: 20, height: 15 },
        confidence: 0.87
      }
    ];

    return {
      success: true,
      detectedItems: mockItems,
      isEmpty: false,
      estimatedRoomDimensions: {
        length: 5,
        width: 4,
        height: 3,
        unit: 'meters'
      }
    };
  }

  /**
   * Generate mock furniture replacement (fallback)
   */
  private generateMockReplacement(
    imageUrl: string,
    detectedItemId: string,
    product: any
  ): FurnitureReplacementResponse {
    const processedImageUrl = this.appendQueryParams(imageUrl, {
      mock_replaced: detectedItemId,
      with: product.id,
      t: Date.now()
    });

    return {
      success: true,
      processedImageUrl,
      replacement: {
        detectedItemId,
        replacementProductId: product.id,
        replacementProductName: product.name,
        appliedAt: new Date().toISOString(),
      }
    };
  }

  /**
   * Generate mock furniture placement (fallback)
   */
  private generateMockPlacement(
    imageUrl: string,
    product: any,
    imagePosition: { x: number; y: number },
    rotation: number,
    scale: number
  ): FurniturePlacementResponse {
    const processedImageUrl = this.appendQueryParams(imageUrl, {
      mock_placed: product.id,
      pos: `${imagePosition.x},${imagePosition.y}`,
      t: Date.now()
    });

    return {
      success: true,
      processedImageUrl,
      placement: {
        placementId: `mock_placement_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        imagePosition,
        scale,
        rotation,
        appliedAt: new Date().toISOString(),
      }
    };
  }
}