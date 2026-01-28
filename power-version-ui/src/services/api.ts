import axios from 'axios';
import { 
  ApiResponse, 
  UploadResponse, 
  DetectionResponse, 
  RenderResponse,
  Product 
} from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Image Upload
export async function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post<ApiResponse<UploadResponse>>(
    '/api/ai/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Upload failed');
  }

  return response.data.data;
}

// Furniture Detection
export async function detectFurniture(imageUrl: string): Promise<DetectionResponse> {
  const response = await api.post<ApiResponse<DetectionResponse>>(
    '/api/ai/detect',
    { imageUrl }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Detection failed');
  }

  return response.data.data;
}

// Furniture Replacement (Path A)
export async function replaceFurniture(params: {
  imageUrl: string;
  categories: string[];
  budget: number;
  collections?: string[];
  roomType: string;
  dimensions: { width: number; height: number; length: number };
}): Promise<RenderResponse> {
  const response = await api.post<ApiResponse<RenderResponse>>(
    '/api/ai/replace',
    params
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Replacement failed');
  }

  return response.data.data;
}

// Empty Room Furnishing (Path B)
export async function furnishEmptyRoom(params: {
  imageUrl: string;
  style: string;
  collections: string[];
  roomType: string;
  dimensions: { width: number; height: number; length: number };
}): Promise<RenderResponse> {
  const response = await api.post<ApiResponse<RenderResponse>>(
    '/api/ai/place',
    params
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Furnishing failed');
  }

  return response.data.data;
}

// Multi-furniture Rendering
export async function multiRender(params: {
  imageUrl: string;
  products: string[];
  roomType: string;
}): Promise<RenderResponse> {
  const response = await api.post<ApiResponse<RenderResponse>>(
    '/api/ai/multi-render',
    params
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Rendering failed');
  }

  return response.data.data;
}

// Get Product Recommendations
export async function getSmartRecommendations(params: {
  roomType: string;
  budget?: number;
  categories?: string[];
  style?: string;
}): Promise<Product[]> {
  const response = await api.post<ApiResponse<{ products: Product[] }>>(
    '/api/ai/products/smart-recommend',
    params
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Recommendation failed');
  }

  return response.data.data.products;
}

// Get Product by ID
export async function getProductById(id: string): Promise<Product> {
  const response = await api.get<ApiResponse<Product>>(
    `/api/ai/products/${id}`
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Product not found');
  }

  return response.data.data;
}

// Search Products
export async function searchProducts(query: string): Promise<Product[]> {
  const response = await api.get<ApiResponse<{ products: Product[] }>>(
    '/api/ai/products/search',
    { params: { q: query } }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Search failed');
  }

  return response.data.data.products;
}

// Get Collections
export async function getCollections(): Promise<string[]> {
  const response = await api.get<ApiResponse<{ collections: string[] }>>(
    '/api/ai/products/collections'
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch collections');
  }

  return response.data.data.collections;
}

// Chat with AI
export async function chatWithAI(message: string, context?: any): Promise<string> {
  const response = await api.post<ApiResponse<{ response: string }>>(
    '/api/ai/chat',
    { message, context }
  );

  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Chat failed');
  }

  return response.data.data.response;
}

export default api;
