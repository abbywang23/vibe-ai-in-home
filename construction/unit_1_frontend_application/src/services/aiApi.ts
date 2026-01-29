import { fetchAPI } from './api';
import { RoomDimensions, DetectedFurnitureItem, FurnitureDimensions } from '../types/domain';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinaryUpload';
import SparkMD5 from 'spark-md5';

// ============= 类型定义 =============

export interface UploadImageResponse {
  imageUrl: string;
  detectedObjects?: any[];
}

// 注意：detectFurniture 方法已废弃，请使用 detectRoom 方法
// @deprecated 使用 DetectionRequest 和 DetectionResponse
export interface DetectFurnitureRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
}

export interface DetectFurnitureResponse {
  success: boolean;
  detectedItems: DetectedFurnitureItem[];
  isEmpty: boolean;
  roomType?: RoomTypeAnalysis;
  roomDimensions?: RoomDimensionsAnalysis;
  roomStyle?: RoomStyleAnalysis;
  furnitureCount?: FurnitureCountAnalysis;
  estimatedRoomDimensions?: RoomDimensions;
}

export interface SmartRecommendRequest {
  roomType: string;
  roomDimensions: RoomDimensions;
  preferences?: {
    selectedCategories?: string[];
    selectedCollections?: string[];
    budget?: { amount: number; currency: string };
  };
  existingFurniture?: DetectedFurnitureItem[];
  language?: string;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  reason?: string;
  dimensions?: string;
  existingItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
  };
  isSelected?: boolean;
}

export interface SmartRecommendResponse {
  success: boolean;
  recommendedProductIds: string[];
  reasoning?: string;
  products: FurnitureItem[];
}

export interface MultiRenderRequest {
  imageUrl: string;
  selectedFurniture: Array<{
    id: string;
    name: string;
    imageUrl?: string;
  }>;
  roomType?: string;
  roomDimensions?: RoomDimensions;
}

export interface MultiRenderResponse {
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
  // 向后兼容字段
  renderedImageUrl?: string;
  processingTime?: number;
}

// Chat API 接口
export interface ChatRequest {
  sessionId: string;
  message: string;
  language: 'en' | 'zh';
  context: {
    currentDesign?: any;
  };
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  actions: any[];
}

// Detection API 接口
export interface DetectionRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
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

export interface DetectionResponse {
  success: boolean;
  detectedItems: DetectedFurnitureItem[];
  isEmpty: boolean;

  // 新增：智能分析结果
  roomType?: RoomTypeAnalysis;
  roomDimensions?: RoomDimensionsAnalysis;
  roomStyle?: RoomStyleAnalysis;
  furnitureCount?: FurnitureCountAnalysis;

  // 保留原有字段（向后兼容）
  estimatedRoomDimensions?: RoomDimensions;
}

// Replacement API 接口
export interface ReplacementRequest {
  imageUrl: string;
  detectedItemId: string;
  replacementProductId: string;
}

export interface ReplacementResponse {
  success: boolean;
  processedImageUrl: string;
  replacement: {
    detectedItemId: string;
    replacementProductId: string;
    replacementProductName: string;
    appliedAt: string;
  };
}

// Placement API 接口
export interface PlacementRequest {
  imageUrl: string;
  productId: string;
  imagePosition: { x: number; y: number };
  rotation: number;
  scale: number;
}

export interface PlacementResponse {
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

// 后端返回的 Product 类型
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
  dimensions: FurnitureDimensions;
  inStock: boolean;
  delivery: string;
  externalUrl: string;
}

interface ProductDetailResponse {
  success: boolean;
  product: Product;
}

interface ProductSearchResponse {
  success: boolean;
  products: Product[];
  total: number;
}

// ============= 缓存相关类型和常量 =============

interface CachedDetection {
  response: DetectionResponse;
  cachedAt: number;
}

interface DetectCache {
  [hash: string]: CachedDetection;
}

const DETECT_CACHE_KEY = 'ai_detect_cache';

/**
 * 计算请求参数的 MD5 hash
 */
function calculateRequestMD5(request: DetectionRequest): string {
  const jsonStr = JSON.stringify(request);
  return SparkMD5.hash(jsonStr);
}

/**
 * 从 localStorage 读取缓存的检测结果
 */
function getCachedDetect(hash: string): DetectionResponse | null {
  try {
    const cacheStr = localStorage.getItem(DETECT_CACHE_KEY);
    if (!cacheStr) return null;

    const cache: DetectCache = JSON.parse(cacheStr);
    const cached = cache[hash];

    if (cached) {
      return cached.response;
    }

    return null;
  } catch (error) {
    // If cache is corrupted, clear it
    console.warn('Failed to read detect cache, clearing:', error);
    try {
      localStorage.removeItem(DETECT_CACHE_KEY);
    } catch (e) {
      // Ignore cleanup errors
    }
    return null;
  }
}

/**
 * 保存检测结果到缓存
 */
function setCachedDetect(hash: string, response: DetectionResponse): void {
  try {
    // Check if we need to cleanup before saving
    ensureDetectCacheSpace();

    const cacheStr = localStorage.getItem(DETECT_CACHE_KEY);
    const cache: DetectCache = cacheStr ? JSON.parse(cacheStr) : {};

    cache[hash] = {
      response: response,
      cachedAt: Date.now(),
    };

    localStorage.setItem(DETECT_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    // If storage is full or unavailable, try cleanup and retry once
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        cleanupOldestDetectCache();
        const cacheStr = localStorage.getItem(DETECT_CACHE_KEY);
        const cache: DetectCache = cacheStr ? JSON.parse(cacheStr) : {};
        cache[hash] = {
          response: response,
          cachedAt: Date.now(),
        };
        localStorage.setItem(DETECT_CACHE_KEY, JSON.stringify(cache));
      } catch (retryError) {
        // If still fails, just skip caching
        console.warn('Failed to save detect cache:', retryError);
      }
    } else {
      console.warn('Failed to save detect cache:', error);
    }
  }
}

/**
 * 确保缓存空间足够
 */
function ensureDetectCacheSpace(): void {
  try {
    const cacheStr = localStorage.getItem(DETECT_CACHE_KEY);
    if (!cacheStr) return;

    // Try to estimate size (rough calculation)
    const estimatedSize = new Blob([cacheStr]).size;
    const threshold = 1024 * 1024; // 1MB threshold

    if (estimatedSize > threshold) {
      cleanupOldestDetectCache();
    }
  } catch (error) {
    // Ignore errors during space check
  }
}

/**
 * 清理最旧的缓存条目
 */
function cleanupOldestDetectCache(): void {
  try {
    const cacheStr = localStorage.getItem(DETECT_CACHE_KEY);
    if (!cacheStr) return;

    const cache: DetectCache = JSON.parse(cacheStr);
    const entries = Object.entries(cache);

    if (entries.length === 0) return;

    // Sort by cachedAt (oldest first)
    entries.sort((a, b) => a[1].cachedAt - b[1].cachedAt);

    // Remove oldest 50% of entries
    const removeCount = Math.max(1, Math.floor(entries.length / 2));
    const newCache: DetectCache = {};

    // Keep the newer half
    for (let i = removeCount; i < entries.length; i++) {
      newCache[entries[i][0]] = entries[i][1];
    }

    localStorage.setItem(DETECT_CACHE_KEY, JSON.stringify(newCache));
  } catch (error) {
    // If cleanup fails, clear entire cache
    console.warn('Failed to cleanup detect cache, clearing all:', error);
    try {
      localStorage.removeItem(DETECT_CACHE_KEY);
    } catch (e) {
      // Ignore
    }
  }
}

// ============= 转换函数 =============

/**
 * 将后端的 Product 转换为前端的 FurnitureItem
 */
function convertProductToFurnitureItem(product: Product, reason?: string): FurnitureItem {
  // 处理 dimensions：将 FurnitureDimensions 对象转换为字符串
  const dims = product.dimensions;
  const unit = dims.unit || 'cm';
  const dimensionsStr = `${dims.width}${unit} W × ${dims.depth}${unit} D × ${dims.height}${unit} H`;
  
  return {
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.images && product.images.length > 1 ? product.images[1].url : (product.images && product.images.length > 0 ? product.images[0].url : ''),
    reason: reason || product.description || '',
    dimensions: dimensionsStr,
    isSelected: false,
  };
}

// ============= API 服务 =============

export const aiApi = {
  /**
   * 上传图片 - 直接上传到 Cloudinary
   * @param file 要上传的图片文件
   * @param onProgress 可选的上传进度回调
   */
  async uploadImage(file: File, onProgress?: (percentage: number) => void): Promise<UploadImageResponse> {
    // 验证文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error || 'Invalid file');
    }

    try {
      // 直接上传到 Cloudinary
      const result = await uploadToCloudinary(file, (progress) => {
        if (onProgress) {
          onProgress(progress.percentage);
        }
      });

      // 返回格式与后端兼容
      return {
        imageUrl: result.imageUrl,
        detectedObjects: [], // Cloudinary 上传不包含检测结果
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Upload failed');
    }
  },

  /**
   * 检测房间中的家具
   * @deprecated 请使用 detectRoom 方法
   */
  async detectFurniture(request: DetectFurnitureRequest): Promise<DetectFurnitureResponse> {
    return fetchAPI<DetectFurnitureResponse>('/api/ai/detect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 检测房间（使用 DetectionRequest/DetectionResponse）
   */
  async detectRoom(request: DetectionRequest): Promise<DetectionResponse> {
    // 缓存功能已暂时禁用，但保留实现代码以便将来重新启用
    // 计算请求参数的 MD5 hash 并检查缓存
    // let requestHash: string | undefined;
    // try {
    //   requestHash = calculateRequestMD5(request);
    //   const cached = getCachedDetect(requestHash);
    //   if (cached) {
    //     console.log('Using cached detection result:', {
    //       hash: requestHash?.substring(0, 8),
    //       detectedItemsCount: cached.detectedItems?.length || 0,
    //       roomType: cached.roomType?.value,
    //       isEmpty: cached.isEmpty
    //     });
    //     return cached;
    //   }
    // } catch (hashError) {
    //   // If hash calculation fails, continue with normal API call
    //   console.warn('Failed to calculate request hash, skipping cache:', hashError);
    // }

    // 调用 API
    console.log('Calling detect API with request:', {
      imageUrl: request.imageUrl.substring(0, 50) + '...',
      roomDimensions: request.roomDimensions
    });
    
    const response = await fetchAPI<DetectionResponse>('/api/ai/detect', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    console.log('Detect API response received:', {
      success: response.success,
      detectedItemsCount: response.detectedItems?.length || 0,
      roomType: response.roomType?.value,
      isEmpty: response.isEmpty
    });

    // 缓存功能已暂时禁用，但保留实现代码以便将来重新启用
    // 保存到缓存（如果 hash 计算成功）
    // if (requestHash) {
    //   try {
    //     setCachedDetect(requestHash, response);
    //     console.log('Cached detection result:', requestHash.substring(0, 8));
    //   } catch (cacheError) {
    //     // Ignore cache errors, API call was successful
    //     console.warn('Failed to cache detect result:', cacheError);
    //   }
    // }

    return response;
  },

  /**
   * 获取智能推荐
   */
  async getSmartRecommendations(request: SmartRecommendRequest): Promise<SmartRecommendResponse> {
    return fetchAPI<SmartRecommendResponse>('/api/ai/products/smart-recommend', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 生成多家具渲染图
   */
  async generateMultiRender(request: MultiRenderRequest): Promise<MultiRenderResponse> {
    return fetchAPI<MultiRenderResponse>('/api/ai/multi-render', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 获取产品详情
   */
  async getProductById(id: string): Promise<FurnitureItem> {
    const response = await fetchAPI<ProductDetailResponse>(`/api/ai/products/${id}`);
    return convertProductToFurnitureItem(response.product);
  },

  /**
   * 搜索产品
   * 注意：后端只支持 q, category, maxPrice, limit 参数
   * style, minPrice, roomType 参数会被忽略
   */
  async searchProducts(params: {
    category?: string;
    style?: string;
    minPrice?: number;
    maxPrice?: number;
    roomType?: string;
    q?: string; // 查询关键词
    limit?: number; // 限制数量
  }): Promise<{ products: FurnitureItem[] }> {
    // 只使用后端支持的参数
    const backendParams: Record<string, string> = {};
    
    if (params.q) {
      backendParams.q = params.q;
    }
    if (params.category) {
      backendParams.category = params.category;
    }
    if (params.maxPrice !== undefined && params.maxPrice !== null) {
      backendParams.maxPrice = String(params.maxPrice);
    }
    if (params.limit !== undefined && params.limit !== null) {
      backendParams.limit = String(params.limit);
    }
    
    // 忽略不支持的参数：style, minPrice, roomType
    
    const queryString = new URLSearchParams(backendParams).toString();
    const response = await fetchAPI<ProductSearchResponse>(
      `/api/ai/products/search${queryString ? `?${queryString}` : ''}`
    );
    
    // 转换 Product[] 为 FurnitureItem[]
    return {
      products: response.products.map(product => convertProductToFurnitureItem(product)),
    };
  },

  /**
   * 替换家具
   */
  async replaceFurniture(request: ReplacementRequest): Promise<ReplacementResponse> {
    return fetchAPI<ReplacementResponse>('/api/ai/replace', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    return fetchAPI<{ status: string; service: string }>('/health');
  },
};
