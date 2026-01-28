import { fetchAPI, API_BASE_URL } from './api';

// ============= 类型定义 =============

export interface UploadImageResponse {
  imageUrl: string;
  detectedObjects?: any[];
}

export interface DetectFurnitureRequest {
  imageUrl: string;
  roomType?: string;
}

export interface DetectFurnitureResponse {
  roomType: string;
  dimensions: string;
  furniture: string[];
  style: string;
  confidence: number;
}

export interface SmartRecommendRequest {
  roomType: string;
  style: string;
  budget: { min: number; max: number };
  intent: 'refresh' | 'redesign';
  existingFurniture?: string[];
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  reason: string;
  dimensions: string;
  existingItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
  };
  isSelected?: boolean;
}

export interface SmartRecommendResponse {
  recommendations: FurnitureItem[];
  totalCost: number;
  withinBudget: boolean;
}

export interface MultiRenderRequest {
  roomImageUrl: string;
  furnitureItems: Array<{
    productId: string;
    position?: { x: number; y: number };
    scale?: number;
  }>;
  style: string;
  renderQuality?: 'draft' | 'high';
}

export interface MultiRenderResponse {
  renderedImageUrl: string;
  processingTime: number;
  furniturePlacements?: Array<{
    productId: string;
    position: { x: number; y: number };
    confidence: number;
  }>;
}

// ============= API 服务 =============

export const aiApi = {
  /**
   * 上传图片
   */
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`${API_BASE_URL}/api/ai/upload`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Upload failed');
    }
    
    return response.json();
  },
  
  /**
   * 检测房间中的家具
   */
  async detectFurniture(request: DetectFurnitureRequest): Promise<DetectFurnitureResponse> {
    return fetchAPI<DetectFurnitureResponse>('/api/ai/detect', {
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
