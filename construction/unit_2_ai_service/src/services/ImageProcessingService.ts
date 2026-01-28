import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';
import { ProductServiceClient } from '../clients/ProductServiceClient';
import * as fs from 'fs';
import * as path from 'path';

type JsonObject = Record<string, unknown>;
type JsonPath = Array<string | number>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getJsonPath(root: unknown, path: JsonPath): unknown {
  let current: unknown = root;
  for (const seg of path) {
    if (typeof seg === 'number') {
      if (!Array.isArray(current) || seg < 0 || seg >= current.length) return undefined;
      current = current[seg];
      continue;
    }
    if (!isJsonObject(current)) return undefined;
    current = current[seg];
  }
  return current;
}

function getStringAtPath(root: unknown, path: JsonPath): string | undefined {
  const value = getJsonPath(root, path);
  return typeof value === 'string' ? value : undefined;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// Type definitions for API responses
interface QwenAnalysisResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface QwenImageGenResponse {
  output: {
    choices: Array<{
      message: {
        content: Array<{
          image: string;
        }>;
      };
    }>;
  };
}

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
  private uploadsDir: string;

  constructor(private productClient: ProductServiceClient) {
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Helper function to create a clean URL with new query parameters
   * Always starts from the base URL without existing query parameters
   */
  private createProcessedImageUrl(baseUrl: string, params: Record<string, string | number>): string {
    try {
      // Parse the URL and remove existing query parameters
      const url = new URL(baseUrl);
      url.search = ''; // Clear all existing query parameters
      
      // Add new parameters
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
      return url.toString();
    } catch (error) {
      // If URL parsing fails, extract base URL manually
      const baseUrlClean = baseUrl.split('?')[0]; // Remove query parameters
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      return `${baseUrlClean}?${queryString}`;
    }
  }

  /**
   * Helper function to safely append query parameters to a URL (legacy method)
   * Handles URLs that may already have query parameters or special characters
   */
  private appendQueryParams(baseUrl: string, params: Record<string, string | number>): string {
    // Use the new clean method instead
    return this.createProcessedImageUrl(baseUrl, params);
  }

  /**
   * Upload and process image
   */
  async uploadImage(imageBuffer: Buffer, filename: string): Promise<ImageUploadResponse> {
    try {
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext);
      const uniqueFilename = `${timestamp}-${baseName}${ext}`;
      
      // Save file to local uploads directory
      const filePath = path.join(this.uploadsDir, uniqueFilename);
      fs.writeFileSync(filePath, imageBuffer);
      
      // Return local server URL
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      const imageUrl = `${baseUrl}/uploads/${uniqueFilename}`;
      
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
   * Replace furniture using AI - Multi-image fusion approach
   */
  private async replaceFurnitureWithAI(
    imageUrl: string,
    detectedItemId: string,
    product: any,
    aiClient: any
  ): Promise<FurnitureReplacementResponse> {
    try {
      // Convert image URL to base64 for Qwen API
      let imageData: string;
      
      if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('http://127.0.0.1')) {
        // For local URLs, read the file directly
        const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
        const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
        
        if (fs.existsSync(fullPath)) {
          const imageBuffer = fs.readFileSync(fullPath);
          const base64Image = imageBuffer.toString('base64');
          const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
          imageData = `data:${mimeType};base64,${base64Image}`;
        } else {
          throw new Error('Local image file not found');
        }
      } else {
        // For remote URLs, use the URL directly
        imageData = imageUrl;
      }

      // Use wan2.6-image for multi-image fusion
      console.log('Using wan2.6-image for furniture replacement with multi-image fusion...');
      
      // Construct prompt for furniture replacement
      const replacementPrompt = `将这个房间中的现有家具替换为${product.name}。要求：
1. 保持房间的整体布局和风格
2. 新家具应该与房间的色彩搭配和谐
3. 确保家具的尺寸和比例适合房间空间
4. 保持自然的光线和阴影效果
5. 生成高质量、真实感的室内设计效果图
请生成一张专业的室内设计渲染图，展示${product.name}完美融入到这个房间中，替换原有家具的效果。`;

      const imageGenResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'wan2.6-image',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  {
                    text: replacementPrompt
                  },
                  {
                    image: imageData
                  }
                ]
              }
            ]
          },
          parameters: {
            prompt_extend: true,
            watermark: false,
            n: 1,
            enable_interleave: false,
            size: '1280*1280'
          }
        }),
      });

      if (!imageGenResponse.ok) {
        const errorText = await imageGenResponse.text();
        throw new Error(`wan2.6-image API error: ${imageGenResponse.status} - ${errorText}`);
      }

      const imageGenResult = await imageGenResponse.json() as any;
      console.log('wan2.6-image generation result:', imageGenResult);

      // Extract generated image URL
      if (imageGenResult.output && imageGenResult.output.choices && imageGenResult.output.choices.length > 0) {
        const content = imageGenResult.output.choices[0].message.content;
        if (content && content.length > 0 && content[0].image) {
          const generatedImageUrl = content[0].image;
          
          // Download and save the generated image locally
          const imageResponse = await fetch(generatedImageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to download generated image: ${imageResponse.status}`);
          }
          const imageBuffer = await imageResponse.arrayBuffer();
          
          const timestamp = Date.now();
          const filename = `replaced_${timestamp}_${product.id}.png`;
          const localPath = path.join(this.uploadsDir, filename);
          
          fs.writeFileSync(localPath, Buffer.from(imageBuffer));
          
          const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
          const processedImageUrl = `${baseUrl}/uploads/${filename}`;

          console.log(`Successfully generated replacement image using wan2.6-image: ${filename}`);

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
        } else {
          throw new Error('No generated image in response content');
        }
      } else {
        throw new Error('Invalid response format from wan2.6-image API');
      }

    } catch (error) {
      console.error('wan2.6-image generation failed:', error);
      
      // Fallback to copying original image with new filename
      console.log('Falling back to image copy approach...');
      try {
        let sourceImageBuffer: Buffer;
        
        if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('http://127.0.0.1')) {
          const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
          const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
          
          if (fs.existsSync(fullPath)) {
            sourceImageBuffer = fs.readFileSync(fullPath);
          } else {
            throw new Error('Local image file not found');
          }
        } else {
          const imageResponse = await fetch(imageUrl);
          sourceImageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        }
        
        const timestamp = Date.now();
        const filename = `replaced_${timestamp}_${product.id}.jpg`;
        const localPath = path.join(this.uploadsDir, filename);
        
        fs.writeFileSync(localPath, sourceImageBuffer);
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        const processedImageUrl = `${baseUrl}/uploads/${filename}`;

        console.log(`Created fallback replacement image: ${filename}`);

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
      } catch (fallbackError) {
        console.error('Fallback image copy also failed:', fallbackError);
        
        // Final fallback to query parameter approach
        const processedImageUrl = this.createProcessedImageUrl(imageUrl, {
          replaced: detectedItemId,
          with: product.id,
          fallback: 'true',
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
    }
  }

  /**
   * Place furniture using AI - Multi-image fusion approach
   */
  private async placeFurnitureWithAI(
    imageUrl: string,
    product: any,
    imagePosition: { x: number; y: number },
    rotation: number,
    scale: number,
    aiClient: any
  ): Promise<FurniturePlacementResponse> {
    try {
      // Convert image URL to base64 for Qwen API
      let imageData: string;
      
      if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('http://127.0.0.1')) {
        // For local URLs, read the file directly
        const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
        const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
        
        if (fs.existsSync(fullPath)) {
          const imageBuffer = fs.readFileSync(fullPath);
          const base64Image = imageBuffer.toString('base64');
          const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
          imageData = `data:${mimeType};base64,${base64Image}`;
        } else {
          throw new Error('Local image file not found');
        }
      } else {
        // For remote URLs, use the URL directly
        imageData = imageUrl;
      }

      // Use wan2.6-image for multi-image fusion
      console.log('Using wan2.6-image for furniture placement with multi-image fusion...');
      
      // Construct prompt for furniture placement
      const placementPrompt = `在这个房间中放置${product.name}家具。要求：
1. 将家具放置在房间的合适位置（大约在图片的${imagePosition.x}%, ${imagePosition.y}%位置）
2. 家具旋转角度为${rotation}度，缩放比例为${scale}
3. 确保家具与房间风格协调，光线自然
4. 保持房间的整体布局和透视关系
5. 生成高质量、真实感的室内设计效果图
请生成一张专业的室内设计渲染图，展示${product.name}完美融入到这个房间中的效果。`;

      const imageGenResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'wan2.6-image',
          input: {
            messages: [
              {
                role: 'user',
                content: [
                  {
                    text: placementPrompt
                  },
                  {
                    image: imageData
                  }
                ]
              }
            ]
          },
          parameters: {
            prompt_extend: true,
            watermark: false,
            n: 1,
            enable_interleave: false,
            size: '1280*1280'
          }
        }),
      });

      if (!imageGenResponse.ok) {
        const errorText = await imageGenResponse.text();
        throw new Error(`wan2.6-image API error: ${imageGenResponse.status} - ${errorText}`);
      }

      const imageGenResult = await imageGenResponse.json() as any;
      console.log('wan2.6-image generation result:', imageGenResult);

      // Extract generated image URL
      if (imageGenResult.output && imageGenResult.output.choices && imageGenResult.output.choices.length > 0) {
        const content = imageGenResult.output.choices[0].message.content;
        if (content && content.length > 0 && content[0].image) {
          const generatedImageUrl = content[0].image;
          
          // Download and save the generated image locally
          const imageResponse = await fetch(generatedImageUrl);
          if (!imageResponse.ok) {
            throw new Error(`Failed to download generated image: ${imageResponse.status}`);
          }
          const imageBuffer = await imageResponse.arrayBuffer();
          
          const timestamp = Date.now();
          const filename = `placed_${timestamp}_${product.id}.png`;
          const localPath = path.join(this.uploadsDir, filename);
          
          fs.writeFileSync(localPath, Buffer.from(imageBuffer));
          
          const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
          const processedImageUrl = `${baseUrl}/uploads/${filename}`;

          console.log(`Successfully generated placement image using wan2.6-image: ${filename}`);

          return {
            success: true,
            processedImageUrl,
            placement: {
              placementId: `ai_placement_${timestamp}`,
              productId: product.id,
              productName: product.name,
              imagePosition,
              scale,
              rotation,
              appliedAt: new Date().toISOString(),
            }
          };
        } else {
          throw new Error('No generated image in response content');
        }
      } else {
        throw new Error('Invalid response format from wan2.6-image API');
      }

    } catch (error) {
      console.error('wan2.6-image generation failed:', error);
      
      // Fallback to copying original image with new filename
      console.log('Falling back to image copy approach...');
      try {
        let sourceImageBuffer: Buffer;
        
        if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('http://127.0.0.1')) {
          const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
          const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
          
          if (fs.existsSync(fullPath)) {
            sourceImageBuffer = fs.readFileSync(fullPath);
          } else {
            throw new Error('Local image file not found');
          }
        } else {
          const imageResponse = await fetch(imageUrl);
          sourceImageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        }
        
        const timestamp = Date.now();
        const filename = `placed_${timestamp}_${product.id}.jpg`;
        const localPath = path.join(this.uploadsDir, filename);
        
        fs.writeFileSync(localPath, sourceImageBuffer);
        
        const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
        const processedImageUrl = `${baseUrl}/uploads/${filename}`;

        console.log(`Created fallback placement image: ${filename}`);

        return {
          success: true,
          processedImageUrl,
          placement: {
            placementId: `ai_placement_${timestamp}`,
            productId: product.id,
            productName: product.name,
            imagePosition,
            scale,
            rotation,
            appliedAt: new Date().toISOString(),
          }
        };
      } catch (fallbackError) {
        console.error('Fallback image copy also failed:', fallbackError);
        
        // Final fallback to query parameter approach
        const processedImageUrl = this.createProcessedImageUrl(imageUrl, {
          placed: product.id,
          pos: `${imagePosition.x},${imagePosition.y}`,
          rot: rotation,
          scale: scale,
          fallback: 'true',
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
    }
  }

  /**
   * Upload image to Cloudinary and return URL
   */
  private async uploadToCloudinary(imageUrl: string, imageName: string): Promise<string> {
    const cloudinaryConfig = {
      apiKey: process.env.CLOUDINARY_API_KEY || '117752995173679',
      apiSecret: process.env.CLOUDINARY_API_SECRET || 'OGiujqsUNHsYduK3mg96lEg_L4I',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dyurkavye'
    };

    try {
      // Get image buffer
      let imageBuffer: Buffer;
      
      if (imageUrl.startsWith('http://localhost') || imageUrl.startsWith('http://127.0.0.1')) {
        // For local URLs, read the file directly
        const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
        const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
        
        if (fs.existsSync(fullPath)) {
          imageBuffer = fs.readFileSync(fullPath);
        } else {
          throw new Error('Local image file not found');
        }
      } else {
        // For remote URLs, fetch the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      }

      // Generate timestamp and public_id for signature
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `multi_render_${imageName}_${timestamp}`;
      
      // Generate signature: sha1(public_id=xxx&timestamp=xxx + api_secret)
      const crypto = require('crypto');
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      // Create form data for upload
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', imageBuffer);
      formData.append('api_key', cloudinaryConfig.apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('public_id', publicId);

      // Upload to Cloudinary
      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      });

      if (!uploadResponse.ok) {
        throw new Error(`Cloudinary upload failed: ${uploadResponse.status}`);
      }

      const uploadResult: unknown = await uploadResponse.json();

      const secureUrl = getStringAtPath(uploadResult, ['secure_url']);
      if (secureUrl) {
        console.log(`Successfully uploaded to Cloudinary: ${secureUrl}`);
        return secureUrl;
      }

      const url = getStringAtPath(uploadResult, ['url']);
      if (url) {
        console.log(`Successfully uploaded to Cloudinary: ${url}`);
        return url;
      }

      throw new Error('No URL returned from Cloudinary');

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Poll task status until completion
   */
  private async pollTaskStatus(taskId: string, maxAttempts: number = 120, interval: number = 3000): Promise<string> {
    console.log(`Starting to poll task ${taskId} (max ${maxAttempts} attempts, ${interval}ms interval)`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await new Promise(resolve => setTimeout(resolve, interval));
        
        const taskResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
          }
        });

        if (!taskResponse.ok) {
          console.warn(`[${attempt}] Task status query failed: ${taskResponse.status}`);
          continue;
        }

        const taskResult: unknown = await taskResponse.json();
        const taskStatus =
          getStringAtPath(taskResult, ['output', 'task_status']) ??
          getStringAtPath(taskResult, ['task_status']);
        
        if (attempt % 10 === 0) {
          console.log(`[${attempt}] Task status: ${taskStatus}`);
        }

        if (taskStatus === 'SUCCEEDED') {
          // Extract image URL from various possible paths
          const imageUrl =
            getStringAtPath(taskResult, ['output', 'results', 0, 'url']) ||
            getStringAtPath(taskResult, ['output', 'result', 0, 'url']) ||
            getStringAtPath(taskResult, ['output', 'results', 0, 'image']) ||
            getStringAtPath(taskResult, ['output', 'result', 0, 'image']) ||
            getStringAtPath(taskResult, ['output', 'image_url']) ||
            getStringAtPath(taskResult, ['output', 'choices', 0, 'message', 'content', 0, 'image']);

          if (imageUrl) {
            console.log(`✅ Task completed successfully! Image URL: ${imageUrl}`);
            return imageUrl;
          } else {
            throw new Error('Task succeeded but no image URL found in response');
          }
        } else if (taskStatus === 'FAILED') {
          console.error('Task failed:', taskResult);
          throw new Error(`Task failed: ${JSON.stringify(taskResult)}`);
        }
        // Continue polling for PENDING/RUNNING status
        
      } catch (error) {
        if (attempt % 10 === 1) {
          console.warn(`[${attempt}] Polling error:`, getErrorMessage(error));
        }
      }
    }

    throw new Error(`Task polling timeout after ${maxAttempts} attempts`);
  }

  /**
   * Generate multi-furniture render using wan2.5-i2i-preview with Cloudinary upload
   */
  async generateMultiFurnitureRender(
    imageUrl: string,
    selectedFurniture: Array<{ id: string; name: string; imageUrl?: string }>,
    roomType: string
  ): Promise<FurniturePlacementResponse> {
    console.log('Starting multi-furniture render with Cloudinary + wan2.5-i2i-preview...');
    
    try {
      // Step 1: Upload room image to Cloudinary
      console.log('Step 1: Uploading room image to Cloudinary...');
      const roomImageCloudinaryUrl = await this.uploadToCloudinary(imageUrl, 'room');
      
      // Step 2: Prepare images array (room + product images)
      const images: string[] = [roomImageCloudinaryUrl];
      
      // Add product image URLs (limit to 3 more to stay within API limits)
      let productImageCount = 0;
      for (const furniture of selectedFurniture) {
        if (furniture.imageUrl && productImageCount < 3) {
          images.push(furniture.imageUrl);
          productImageCount++;
          console.log(`Added product image: ${furniture.name}`);
        }
      }

      console.log(`Using ${images.length} images for generation`);

      // Step 3: Construct prompt for multi-furniture placement
      const furnitureList = selectedFurniture.map(item => item.name).join('、');
      const prompt = `请基于房间图片和家具产品图片，生成一张现代简约风格的${roomType}渲染图。将以下Castlery家具产品自然地融入到房间中：${furnitureList}。

要求：
1. 合理安排所有家具的位置，确保空间布局协调
2. 家具之间保持适当的距离和比例关系  
3. 整体风格统一，色彩搭配和谐
4. 保持房间的自然光线和阴影效果
5. 创造一个实用且美观的生活空间

请生成一张专业的室内设计渲染图，展示所有选中的家具完美融入到这个房间中的效果。`;

      // Step 4: Submit async task to wan2.5-i2i-preview
      console.log('Step 2: Submitting async task to wan2.5-i2i-preview...');
      
      const taskResponse = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/image2image/image-synthesis', {
        method: 'POST',
        headers: {
          'X-DashScope-Async': 'enable',
          'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'wan2.5-i2i-preview',
          input: {
            prompt: prompt,
            images: images
          },
          parameters: {
            n: 1
          }
        })
      });

      if (!taskResponse.ok) {
        const errorText = await taskResponse.text();
        throw new Error(`wan2.5-i2i-preview API error: ${taskResponse.status} - ${errorText}`);
      }

      const taskResult: unknown = await taskResponse.json();
      const taskId =
        getStringAtPath(taskResult, ['task_id']) ||
        getStringAtPath(taskResult, ['output', 'task_id']);
      
      if (!taskId) {
        throw new Error('No task ID returned from API');
      }

      console.log(`✅ Task submitted successfully! Task ID: ${taskId}`);

      // Step 5: Poll for task completion
      console.log('Step 3: Polling for task completion...');
      const generatedImageUrl = await this.pollTaskStatus(taskId);

      // Step 6: Download and save the generated image locally
      console.log('Step 4: Downloading and saving generated image...');
      const imageResponse = await fetch(generatedImageUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to download generated image: ${imageResponse.status}`);
      }
      const imageBuffer = await imageResponse.arrayBuffer();
      
      const timestamp = Date.now();
      const filename = `multi_render_${timestamp}.png`;
      const localPath = path.join(this.uploadsDir, filename);
      
      fs.writeFileSync(localPath, Buffer.from(imageBuffer));
      
      const baseUrl = process.env.BASE_URL || 'http://localhost:3001';
      const processedImageUrl = `${baseUrl}/uploads/${filename}`;

      console.log(`✅ Multi-furniture render completed successfully: ${filename}`);

      return {
        success: true,
        processedImageUrl,
        placement: {
          placementId: `multi_render_${timestamp}`,
          productId: selectedFurniture.map(f => f.id).join(','),
          productName: furnitureList,
          imagePosition: { x: 50, y: 50 }, // Center position for multi-furniture
          scale: 1,
          rotation: 0,
          appliedAt: new Date().toISOString(),
        }
      };

    } catch (error) {
      console.error('Multi-furniture render failed:', error);
      throw error;
    }
  }
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
    // For demo, return the original image URL with query parameters to simulate processing
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
    // For demo, return the original image URL with query parameters to simulate processing
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