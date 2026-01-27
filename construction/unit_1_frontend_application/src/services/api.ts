import axios from 'axios';
import {
  RoomConfig,
  UserPreferences,
  RecommendationResponse,
  ProductSearchResponse,
  CategoryResponse,
  ChatResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Get recommendations
  async getRecommendations(
    roomConfig: RoomConfig,
    preferences?: UserPreferences,
    language: string = 'en'
  ): Promise<RecommendationResponse> {
    const response = await api.post('/api/ai/recommend', {
      roomType: roomConfig.roomType,
      dimensions: roomConfig.dimensions,
      budget: preferences?.budget,
      preferences: {
        selectedCategories: preferences?.selectedCategories,
        selectedCollections: preferences?.selectedCollections,
      },
      language,
    });
    return response.data;
  },

  // Search products
  async searchProducts(query?: string, limit: number = 10): Promise<ProductSearchResponse> {
    const response = await api.get('/api/ai/products/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Get categories
  async getCategories(): Promise<CategoryResponse> {
    const response = await api.get('/api/ai/products/categories');
    return response.data;
  },

  // Get product by ID
  async getProductById(id: string): Promise<any> {
    const response = await api.get(`/api/ai/products/${id}`);
    return response.data;
  },

  // Chat
  async sendChatMessage(
    sessionId: string,
    message: string,
    language: 'en' | 'zh' = 'en'
  ): Promise<ChatResponse> {
    const response = await api.post('/api/ai/chat', {
      sessionId,
      message,
      language,
      context: {},
    });
    return response.data;
  },
};
