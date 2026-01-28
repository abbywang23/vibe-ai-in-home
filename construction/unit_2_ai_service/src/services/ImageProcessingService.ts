import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';
import { ProductServiceClient } from '../clients/ProductServiceClient';
import { Request } from 'express';
import { getBaseUrl } from '../utils/urlHelper';
import * as fs from 'fs';
import * as path from 'path';
import { getRoomAnalysisPrompts } from '../prompts/roomAnalysisPrompt';

type JsonObject = Record<string, unknown>;
type JsonPath = Array<string | number>;

function isJsonObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function clampNumber(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizeNullableString(value: unknown, maxLen: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.length > maxLen ? trimmed.slice(0, maxLen) : trimmed;
}

const ROOM_STYLE_VALUES = [
  'Modern',
  'Nordic',
  'Classic',
  'Minimalist',
  'Industrial',
  'Contemporary',
  'Traditional',
  'Bohemian',
] as const;

function isRoomStyleValue(value: unknown): value is RoomStyleAnalysis['value'] {
  return typeof value === 'string' && (ROOM_STYLE_VALUES as readonly string[]).includes(value);
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

// 支持的家具类型（与 products.yaml 中的 room_type_categories 保持一致）
export const SUPPORTED_FURNITURE_TYPES = ['sofa', 'table', 'chair', 'storage', 'bed', 'desk'] as const;
export type SupportedFurnitureType = typeof SUPPORTED_FURNITURE_TYPES[number];

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
  furnitureType: SupportedFurnitureType;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  style?: RoomStyleAnalysis['value'] | null;
  material?: string | null;
  color?: string | null;
  sizeBucket?: 'small' | 'medium' | 'large' | null;
  estimatedDimensions?: {
    width: number | null;
    depth: number | null;
    height: number | null;
    unit: 'meters';
    confidence: number; // 0-100
  } | null;
  notes?: string | null;
}

export interface RoomTypeAnalysis {
  value: 'living_room' | 'bedroom' | 'dining_room' | 'home_office';
  confidence: number; // 0-100
}

export interface RoomDimensionsAnalysis {
  length: number;
  width: number;
  height: number;
  unit: 'meters' | 'feet';
  confidence: number; // 0-100
}

export interface RoomStyleAnalysis {
  value: 'Modern' | 'Nordic' | 'Classic' | 'Minimalist' | 'Industrial' | 'Contemporary' | 'Traditional' | 'Bohemian';
  confidence: number; // 0-100
}

export interface FurnitureCountAnalysis {
  value: number;
  confidence: number; // 0-100
}

export interface FurnitureDetectionResponse {
  success: boolean;
  detectedItems: DetectedFurnitureItem[];
  isEmpty: boolean;
  
  // 新增：智能分析结果
  roomType?: RoomTypeAnalysis;
  roomDimensions?: RoomDimensionsAnalysis;
  roomStyle?: RoomStyleAnalysis;
  furnitureCount?: FurnitureCountAnalysis;
  
  // 保留原有字段（向后兼容）
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
  async uploadImage(imageBuffer: Buffer, filename: string, req?: Request): Promise<ImageUploadResponse> {
    try {
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const ext = path.extname(filename);
      const baseName = path.basename(filename, ext);
      const uniqueFilename = `${timestamp}-${baseName}${ext}`;
      
      // Save file to local uploads directory
      const filePath = path.join(this.uploadsDir, uniqueFilename);
      fs.writeFileSync(filePath, imageBuffer);
      
      // Return local server URL using request-based base URL
      const baseUrl = getBaseUrl(req);
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
   * Detect furniture using AI (Qwen-VL) - Enhanced with room analysis
   */
  private async detectFurnitureWithAI(
    imageUrl: string,
    roomDimensions: any,
    aiClient: any
  ): Promise<FurnitureDetectionResponse> {
    // 使用增强的 prompt
    const prompts = getRoomAnalysisPrompts(
      roomDimensions ? {
        roomDimensions: {
          length: roomDimensions.length,
          width: roomDimensions.width,
          height: roomDimensions.height,
          unit: roomDimensions.unit,
        }
      } : undefined
    );

    // Upload to Cloudinary if it's a local URL (localhost, 127.0.0.1, or local network IP)
    // Qwen API can't access local network URLs, so we need to upload to Cloudinary
    let imageDataForAPI: { url: string } | { url: string; detail?: string };
    
    const serverBaseUrl = getBaseUrl();
    const isLocalUrl = imageUrl.startsWith('http://localhost') || 
                      imageUrl.startsWith('http://127.0.0.1') ||
                      imageUrl.startsWith(serverBaseUrl) ||
                      /^https?:\/\/10\.\d+\.\d+\.\d+/.test(imageUrl) ||
                      /^https?:\/\/192\.168\.\d+\.\d+/.test(imageUrl) ||
                      /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/.test(imageUrl);
    
    if (isLocalUrl) {
      // For local URLs, upload to Cloudinary
      console.log(`Uploading local image to Cloudinary for Qwen API access...`);
      try {
        const cloudinaryUrl = await this.uploadToCloudinary(imageUrl, 'detect');
        imageDataForAPI = { url: cloudinaryUrl };
        console.log(`✅ Image uploaded to Cloudinary: ${cloudinaryUrl}`);
      } catch (uploadError) {
        console.error('Failed to upload to Cloudinary, falling back to base64:', uploadError);
        // Fallback to base64 if Cloudinary upload fails
        try {
          const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
          const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
          
          if (fs.existsSync(fullPath)) {
            const imageBuffer = fs.readFileSync(fullPath);
            const base64Image = imageBuffer.toString('base64');
            const mimeType = imagePath.endsWith('.png') ? 'image/png' : 'image/jpeg';
            imageDataForAPI = { url: `data:${mimeType};base64,${base64Image}` };
            console.log(`Converted local image to base64 as fallback`);
          } else {
            throw new Error('Local file not found and Cloudinary upload failed');
          }
        } catch (error) {
          console.error('All fallback methods failed, using original URL:', error);
          imageDataForAPI = { url: imageUrl };
        }
      }
    } else {
      // For remote URLs (public HTTPS), use directly
      imageDataForAPI = { url: imageUrl };
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: prompts.system },
      { 
        role: 'user', 
        content: [
          {
            type: 'image_url',
            image_url: imageDataForAPI
          },
          {
            type: 'text',
            text: prompts.user
          }
        ]
      }
    ];

    console.log('Calling Qwen API for furniture detection...');
    const startTime = Date.now();
    
    const response = await aiClient.chatCompletion({
      model: 'qwen3-vl-plus', // 使用Qwen-VL模型
      messages,
      temperature: 0.3,
      max_tokens: 2000, // 增加token数量以支持更详细的响应
    });
    
    const elapsedTime = Date.now() - startTime;
    console.log(`Qwen API response received in ${elapsedTime}ms`);

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parse AI response
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        
        // 验证和过滤家具类型，只保留支持的6种类型
        const validDetectedItems: DetectedFurnitureItem[] = (result.detectedItems || [])
          .filter((item: any) => {
            const isValid = SUPPORTED_FURNITURE_TYPES.includes(item.furnitureType);
            if (!isValid) {
              console.warn(`⚠️ 过滤掉不支持的家具类型: ${item.furnitureType} (itemId: ${item.itemId})`);
            }
            return isValid;
          })
          .map((item: any) => {
            const style = isRoomStyleValue(item.style) ? item.style : null;
            const material = normalizeNullableString(item.material, 40);
            const color = normalizeNullableString(item.color, 40);
            const notes = normalizeNullableString(item.notes, 120);

            const sizeBucket: DetectedFurnitureItem['sizeBucket'] =
              item.sizeBucket === 'small' || item.sizeBucket === 'medium' || item.sizeBucket === 'large'
                ? item.sizeBucket
                : null;

            let estimatedDimensions: DetectedFurnitureItem['estimatedDimensions'] = null;
            if (isJsonObject(item.estimatedDimensions)) {
              const w = getJsonPath(item.estimatedDimensions, ['width']);
              const d = getJsonPath(item.estimatedDimensions, ['depth']);
              const h = getJsonPath(item.estimatedDimensions, ['height']);
              const conf = clampNumber(getJsonPath(item.estimatedDimensions, ['confidence']), 0, 100) ?? 0;

              const width = typeof w === 'number' && Number.isFinite(w) && w >= 0 ? w : null;
              const depth = typeof d === 'number' && Number.isFinite(d) && d >= 0 ? d : null;
              const height = typeof h === 'number' && Number.isFinite(h) && h >= 0 ? h : null;

              // 只要至少有一个维度有效，就保留该对象；否则置空
              if (width !== null || depth !== null || height !== null) {
                estimatedDimensions = {
                  width,
                  depth,
                  height,
                  unit: 'meters',
                  confidence: conf,
                };
              }
            }

            return {
              itemId: typeof item.itemId === 'string' ? item.itemId : String(item.itemId ?? ''),
              furnitureType: item.furnitureType as SupportedFurnitureType,
              boundingBox: item.boundingBox,
              confidence: typeof item.confidence === 'number' ? item.confidence : 0,
              style,
              material,
              color,
              sizeBucket,
              estimatedDimensions,
              notes,
            };
          });
        
        console.log(`✅ 家具检测结果: 原始 ${result.detectedItems?.length || 0} 件，过滤后 ${validDetectedItems.length} 件`);
        
        // 构建增强的响应
        const response: FurnitureDetectionResponse = {
          success: true,
          detectedItems: validDetectedItems,
          isEmpty: result.isEmpty || false,
        };
        
        // 添加智能分析结果
        if (result.roomType) {
          response.roomType = {
            value: result.roomType.value,
            confidence: result.roomType.confidence || 0,
          };
        }
        
        if (result.roomDimensions) {
          response.roomDimensions = {
            length: result.roomDimensions.length,
            width: result.roomDimensions.width,
            height: result.roomDimensions.height,
            unit: result.roomDimensions.unit || 'meters',
            confidence: result.roomDimensions.confidence || 0,
          };
          
          // 同时保留原有字段（向后兼容）
          response.estimatedRoomDimensions = {
            length: result.roomDimensions.length,
            width: result.roomDimensions.width,
            height: result.roomDimensions.height,
            unit: result.roomDimensions.unit || 'meters',
          };
        }
        
        if (result.roomStyle) {
          response.roomStyle = {
            value: result.roomStyle.value,
            confidence: result.roomStyle.confidence || 0,
          };
        }
        
        if (result.furnitureCount) {
          // 使用过滤后的家具数量
          response.furnitureCount = {
            value: result.furnitureCount.value || validDetectedItems.length || 0,
            confidence: result.furnitureCount.confidence || 0,
          };
        } else {
          // 如果没有提供 furnitureCount，使用过滤后的数量
          response.furnitureCount = {
            value: validDetectedItems.length,
            confidence: 95, // 默认置信度
          };
        }
        
        console.log('✅ Enhanced room analysis completed:', {
          roomType: response.roomType?.value,
          roomStyle: response.roomStyle?.value,
          furnitureCount: response.furnitureCount?.value,
        });
        
        return response;
      }
    } catch (parseError) {
      console.error('Failed to parse AI detection response:', parseError);
      console.error('Raw AI response:', aiResponse);
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
      
      // Check if this is a local server URL (localhost, 127.0.0.1, or same host as BASE_URL)
      const baseUrl = getBaseUrl();
      const isLocalUrl = imageUrl.startsWith('http://localhost') || 
                        imageUrl.startsWith('http://127.0.0.1') ||
                        imageUrl.startsWith(baseUrl);
      
      if (isLocalUrl) {
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
          
          const baseUrl = getBaseUrl();
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
        
        // Check if this is a local server URL
        const serverBaseUrl = getBaseUrl();
        const isLocalUrl = imageUrl.startsWith('http://localhost') || 
                          imageUrl.startsWith('http://127.0.0.1') ||
                          imageUrl.startsWith(serverBaseUrl);
        
        if (isLocalUrl) {
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
        
        const processedImageUrl = `${serverBaseUrl}/uploads/${filename}`;

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
      
      // Check if this is a local server URL (localhost, 127.0.0.1, or same host as BASE_URL)
      const baseUrl = getBaseUrl();
      const isLocalUrl = imageUrl.startsWith('http://localhost') || 
                        imageUrl.startsWith('http://127.0.0.1') ||
                        imageUrl.startsWith(baseUrl);
      
      if (isLocalUrl) {
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
          
          const baseUrl = getBaseUrl();
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
        
        // Check if this is a local server URL
        const serverBaseUrl = getBaseUrl();
        const isLocalUrl = imageUrl.startsWith('http://localhost') || 
                          imageUrl.startsWith('http://127.0.0.1') ||
                          imageUrl.startsWith(serverBaseUrl);
        
        if (isLocalUrl) {
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
        
        const processedImageUrl = `${serverBaseUrl}/uploads/${filename}`;

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
   * Reference: test-wan25-curl.sh upload_to_cloudinary function
   */
  private async uploadToCloudinary(imageUrl: string, imageName: string): Promise<string> {
    const cloudinaryConfig = {
      apiKey: process.env.CLOUDINARY_API_KEY || '117752995173679',
      apiSecret: process.env.CLOUDINARY_API_SECRET || 'OGiujqsUNHsYduK3mg96lEg_L4I',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dyurkavye'
    };

    try {
      // Get image buffer and determine file extension
      let imageBuffer: Buffer;
      let fileExtension = '.jpg'; // Default extension
      
      // Check if this is a local server URL (localhost, 127.0.0.1, or same host as BASE_URL)
      const serverBaseUrl = getBaseUrl();
      const isLocalUrl = imageUrl.startsWith('http://localhost') || 
                        imageUrl.startsWith('http://127.0.0.1') ||
                        imageUrl.startsWith(serverBaseUrl);
      
      if (isLocalUrl) {
        // For local URLs, read the file directly
        const imagePath = imageUrl.replace(/^https?:\/\/[^\/]+/, '');
        const fullPath = path.join(process.cwd(), imagePath.replace('/uploads/', 'uploads/'));
        
        if (fs.existsSync(fullPath)) {
          imageBuffer = fs.readFileSync(fullPath);
          // Get extension from file path
          const ext = path.extname(fullPath).toLowerCase();
          if (ext) {
            fileExtension = ext;
          }
        } else {
          throw new Error(`Local image file not found: ${fullPath}`);
        }
      } else {
        // For remote URLs, fetch the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
          throw new Error(`Failed to fetch image: ${imageResponse.status}`);
        }
        imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
        
        // Try to get extension from URL
        try {
          const urlObj = new URL(imageUrl);
          const pathname = urlObj.pathname;
          const ext = path.extname(pathname).toLowerCase();
          if (ext && ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
            fileExtension = ext;
          }
        } catch (e) {
          // Use default extension if URL parsing fails
        }
      }

      // Generate timestamp and public_id for signature (matching script format)
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `test_wan25_${imageName}_${timestamp}`;
      
      // Generate signature: sha1(public_id=xxx&timestamp=xxx + api_secret)
      // Cloudinary signature format: sha1(parameter_string + api_secret)
      const crypto = require('crypto');
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      console.log(`Cloudinary upload params: api_key=${cloudinaryConfig.apiKey}, timestamp=${timestamp}, signature=${signature.substring(0, 8)}..., public_id=${publicId}`);

      // Use axios for better form-data support in Node.js
      const axios = require('axios');
      const FormData = require('form-data');
      const formData = new FormData();
      
      // Append file with proper filename
      formData.append('file', imageBuffer, {
        filename: `image${fileExtension}`,
        contentType: fileExtension === '.png' ? 'image/png' : 'image/jpeg'
      });
      formData.append('api_key', cloudinaryConfig.apiKey);
      formData.append('timestamp', timestamp.toString());
      formData.append('signature', signature);
      formData.append('public_id', publicId);

      // Upload to Cloudinary using axios (better form-data support)
      const uploadResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      // axios returns data directly, not a Response object
      const uploadResult = uploadResponse.data;

      // Extract URL (matching script logic: prefer secure_url, fallback to url)
      const secureUrl = getStringAtPath(uploadResult, ['secure_url']);
      if (secureUrl) {
        console.log(`✅ Successfully uploaded to Cloudinary: ${secureUrl}`);
        return secureUrl;
      }

      const url = getStringAtPath(uploadResult, ['url']);
      if (url) {
        console.log(`✅ Successfully uploaded to Cloudinary: ${url}`);
        return url;
      }

      console.error('Upload response:', JSON.stringify(uploadResult, null, 2));
      throw new Error('No URL returned from Cloudinary');

    } catch (error) {
      console.error('❌ Cloudinary upload error:', error);
      throw new Error(`Failed to upload to Cloudinary: ${getErrorMessage(error)}`);
    }
  }

  /**
   * Poll task status until completion
   * Reference: test-wan25-curl.sh polling implementation
   */
  private async pollTaskStatus(taskId: string, maxAttempts: number = 120, interval: number = 3000): Promise<string> {
    console.log(`Starting to poll task ${taskId} (max ${maxAttempts} attempts, ${interval}ms interval)`);
    
    let lastStatus = '';
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Wait before checking (except first attempt)
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        const taskResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`
          }
        });

        if (!taskResponse.ok) {
          // Only log warning every 10 attempts to avoid spam
          if (attempt % 10 === 1) {
            console.warn(`[${attempt}] Task status query failed: ${taskResponse.status}`);
          }
          continue;
        }

        const taskResult: unknown = await taskResponse.json();
        const taskStatus =
          getStringAtPath(taskResult, ['output', 'task_status']) ??
          getStringAtPath(taskResult, ['task_status']) ??
          'UNKNOWN';
        
        // Only print if status changed (similar to script behavior)
        if (taskStatus !== lastStatus) {
          const timestamp = new Date().toLocaleTimeString('zh-CN');
          console.log(`[${timestamp}] [${attempt}] 任务状态: ${taskStatus}`);
          lastStatus = taskStatus;
        } else if (attempt % 10 === 0) {
          // Show progress every 10 attempts
          const timestamp = new Date().toLocaleTimeString('zh-CN');
          console.log(`[${timestamp}] 已轮询 ${attempt} 次，继续等待...`);
        }

        if (taskStatus === 'SUCCEEDED') {
          console.log('');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('✅ 任务完成！');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('');
          
          // Extract image URL from various possible paths (matching script logic)
          const imageUrl =
            getStringAtPath(taskResult, ['output', 'results', 0, 'url']) ||
            getStringAtPath(taskResult, ['output', 'result', 0, 'url']) ||
            getStringAtPath(taskResult, ['output', 'results', 0, 'image']) ||
            getStringAtPath(taskResult, ['output', 'result', 0, 'image']) ||
            getStringAtPath(taskResult, ['output', 'image_url']) ||
            getStringAtPath(taskResult, ['output', 'choices', 0, 'message', 'content', 0, 'image']);

          if (imageUrl && imageUrl !== 'null') {
            console.log(`✅ 成功生成图片！`);
            console.log(`图片 URL: ${imageUrl}`);
            return imageUrl;
          } else {
            console.warn('⚠️ 响应中未找到图片 URL');
            console.log('完整响应:', JSON.stringify(taskResult, null, 2));
            throw new Error('Task succeeded but no image URL found in response');
          }
        } else if (taskStatus === 'FAILED') {
          console.log('');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('❌ 任务失败');
          console.log('═══════════════════════════════════════════════════════════');
          console.log('');
          console.log('错误信息:');
          console.log(JSON.stringify(taskResult, null, 2));
          throw new Error(`Task failed: ${JSON.stringify(taskResult)}`);
        }
        // Continue polling for PENDING/RUNNING status
        
      } catch (error) {
        // Only log errors every 10 attempts to avoid spam
        if (attempt % 10 === 1) {
          console.warn(`[${attempt}] Polling error:`, getErrorMessage(error));
        }
        // Continue polling even on error
      }
    }

    // Timeout reached
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`⚠️ 轮询超时（已轮询 ${maxAttempts} 次，约 ${Math.floor(maxAttempts * interval / 1000 / 60)} 分钟）`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('任务可能仍在处理中，请稍后使用以下命令查询:');
    console.log('');
    console.log(`curl -H "Authorization: Bearer $DASHSCOPE_API_KEY" \\`);
    console.log(`     https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`);
    console.log('');
    console.log(`任务 ID: ${taskId}`);
    
    throw new Error(`Task polling timeout after ${maxAttempts} attempts`);
  }

  /**
   * Generate multi-furniture render using Decor8AI API
   * Reference: test-decor8ai.py implementation
   */
  async generateMultiFurnitureRender(
    imageUrl: string,
    selectedFurniture: Array<{ id: string; name: string; imageUrl?: string }>,
    roomType: string,
    roomDimensions?: { length: number; width: number; height: number; unit: string },
    req?: Request
  ): Promise<FurniturePlacementResponse> {
    console.log('Starting multi-furniture render with Decor8AI API...');
    
    // Check for Decor8AI API key
    const decor8ApiKey = process.env.DECOR8_API_KEY;
    if (!decor8ApiKey) {
      throw new Error('DECOR8_API_KEY environment variable is not set');
    }

    try {
      // Step 1: Use the Cloudinary URL directly (frontend already uploaded to Cloudinary)
      console.log('Step 1: Using Cloudinary URL from frontend...');
      const roomImageCloudinaryUrl = imageUrl;
      console.log(`✅ Using Cloudinary URL: ${roomImageCloudinaryUrl}`);
      
      // Step 2: Query product details to get dimensions
      console.log('Step 2: Querying product dimensions...');
      const productIds = selectedFurniture.map(f => f.id).filter(Boolean);
      let productsMap: Map<string, any> = new Map();
      
      if (productIds.length > 0) {
        try {
          const products = await this.productClient.searchProducts({ productIds });
          products.forEach(p => {
            productsMap.set(p.id, p);
          });
          console.log(`✅ Found dimensions for ${products.length} products`);
        } catch (error) {
          console.warn('⚠️ Failed to query product dimensions, continuing without them:', error);
        }
      }

      // Step 3: Prepare decor_items from selected furniture with dimensions
      console.log('Step 3: Preparing decor items from selected furniture...');
      const decorItems: Array<{ 
        url: string; 
        name: string; 
        product_id?: string;
        dimensions?: { width: number | null; depth: number | null; height: number | null; unit: string };
      }> = [];
      
      for (const furniture of selectedFurniture) {
        if (furniture.imageUrl) {
          const product = furniture.id ? productsMap.get(furniture.id) : null;
          
          // Build optimized name with clear instructions for Decor8
          // This helps Decor8 distinguish furniture items from room images
          let optimizedName = `Furniture item: ${furniture.name}`;
          
          // Add dimensions to name if available (helps with size matching)
          if (product && product.dimensions) {
            const dims = product.dimensions;
            const dimParts: string[] = [];
            if (dims.width !== null) dimParts.push(`W${dims.width}${dims.unit === 'meters' ? 'm' : 'ft'}`);
            if (dims.depth !== null) dimParts.push(`D${dims.depth}${dims.unit === 'meters' ? 'm' : 'ft'}`);
            if (dims.height !== null) dimParts.push(`H${dims.height}${dims.unit === 'meters' ? 'm' : 'ft'}`);
            
            if (dimParts.length > 0) {
              optimizedName += ` (${dimParts.join(' ')})`;
            }
          }
          
          // Add instruction to extract furniture from product image with constraints
          optimizedName += ' - Extract ONLY this furniture piece from the product image and place it in the room. Keep all other room elements unchanged: preserve walls, floors, windows, doors, existing furniture, decorations, lighting, and overall room layout. Only modify/add this specific furniture item.';
          
          const decorItem: any = {
            url: furniture.imageUrl,
            name: optimizedName
          };
          
          // Add product_id if available
          if (furniture.id) {
            decorItem.product_id = furniture.id;
          }
          
          // Add dimensions if available (for API structure)
          if (product && product.dimensions) {
            decorItem.dimensions = {
              width: product.dimensions.width ?? null,
              depth: product.dimensions.depth ?? null,
              height: product.dimensions.height ?? null,
              unit: product.dimensions.unit || 'meters'
            };
            console.log(`✅ Added decor item with dimensions: ${furniture.name} - ${product.dimensions.width}W × ${product.dimensions.depth}D × ${product.dimensions.height}H ${product.dimensions.unit}`);
          } else {
            console.log(`✅ Added decor item: ${furniture.name} -> ${furniture.imageUrl} (no dimensions available)`);
          }
          
          decorItems.push(decorItem);
        } else {
          console.warn(`⚠️ Skipping ${furniture.name} - no image URL provided`);
        }
      }

      if (decorItems.length === 0) {
        throw new Error('No valid furniture items with image URLs provided');
      }

      console.log(`Using ${decorItems.length} decor items for generation`);

      // Step 4: Map roomType to Decor8AI room_type format
      const roomTypeMap: Record<string, string> = {
        'living room': 'livingroom',
        'livingroom': 'livingroom',
        'bedroom': 'bedroom',
        'kitchen': 'kitchen',
        'dining room': 'diningroom',
        'diningroom': 'diningroom',
        'bathroom': 'bathroom',
        'office': 'office',
        'home office': 'office',
        'family room': 'familyroom',
        'familyroom': 'familyroom',
      };
      const decor8RoomType = roomTypeMap[roomType.toLowerCase()] || 'livingroom';
      console.log(`Mapped room type: "${roomType}" -> "${decor8RoomType}"`);

      // Step 5: Call Decor8AI API
      console.log('Step 4: Calling Decor8AI generate_designs_for_room API...');
      
      const requestPayload: any = {
        input_image_url: roomImageCloudinaryUrl,
        room_type: decor8RoomType,
        design_style: 'minimalist', // Default to minimalist, can be made configurable
        num_images: 1,
        scale_factor: 2, // Max 1536 pixels, no additional charge
        decor_items: JSON.stringify(decorItems)
      };
      
      // Add room dimensions if provided
      if (roomDimensions) {
        requestPayload.room_dimensions = {
          length: roomDimensions.length,
          width: roomDimensions.width,
          height: roomDimensions.height,
          unit: roomDimensions.unit || 'meters'
        };
        console.log(`✅ Added room dimensions: ${roomDimensions.length} × ${roomDimensions.width} × ${roomDimensions.height} ${roomDimensions.unit || 'meters'}`);
      } else {
        console.log('⚠️ No room dimensions provided, Decor8 will infer from image');
      }

      console.log('Request payload:', JSON.stringify({
        ...requestPayload,
        decor_items: decorItems // Show readable format
      }, null, 2));
      
      const apiResponse = await fetch('https://api.decor8.ai/generate_designs_for_room', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${decor8ApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload)
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Decor8AI API error: ${apiResponse.status} - ${errorText}`);
      }

      const apiResult = await apiResponse.json() as any;
      console.log('Decor8AI API response:', JSON.stringify(apiResult, null, 2));
      
      // Extract image URL from response
      if (!apiResult.info || !apiResult.info.images || apiResult.info.images.length === 0) {
        console.error('Full response:', JSON.stringify(apiResult, null, 2));
        throw new Error('No image returned from Decor8AI API');
      }

      const generatedImageUrl = apiResult.info.images[0].url;
      console.log(`✅ Image generated successfully! URL: ${generatedImageUrl}`);

      // Step 5: Upload the generated image to Cloudinary
      console.log('Step 5: Uploading generated image to Cloudinary...');
      const processedImageUrl = await this.uploadToCloudinary(generatedImageUrl, 'multi_render');

      console.log(`✅ Multi-furniture render completed successfully: ${processedImageUrl}`);

      const furnitureList = selectedFurniture.map(item => item.name).join('、');
      
      return {
        success: true,
        processedImageUrl,
        placement: {
          placementId: `multi_render_${Date.now()}`,
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