import { fetchAPI, API_BASE_URL } from './api';
import { RoomDimensions, DetectedFurnitureItem } from '../types/domain';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinaryUpload';

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
    return fetchAPI<DetectionResponse>('/api/ai/detect', {
      method: 'POST',
      body: JSON.stringify(request),
    });
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
    return fetchAPI<FurnitureItem>(`/api/ai/products/${id}`);
  },

  /**
   * 搜索产品
   */
  async searchProducts(params: {
    category?: string;
    style?: string;
    minPrice?: number;
    maxPrice?: number;
    roomType?: string;
  }): Promise<{ products: FurnitureItem[] }> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    return fetchAPI<{ products: FurnitureItem[] }>(
      `/api/ai/products/search?${queryString}`
    );
  },

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    return fetchAPI<{ status: string; service: string }>('/health');
  },
};
