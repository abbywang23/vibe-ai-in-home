import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  RoomType,
  RoomDimensions,
  Money,
  UserPreferences,
  FurniturePlacement,
  ChatMessage,
  DetectedFurnitureItem,
  Product,
  Category,
  Collection,
} from '../types/domain';

const API_BASE_URL = import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:3001/api/ai';

// Request/Response Types
interface RecommendationRequest {
  roomType: RoomType;
  dimensions: RoomDimensions;
  budget?: Money;
  preferences: UserPreferences;
  language: string;
}

interface RecommendationResponse {
  success: boolean;
  recommendations: Array<{
    productId: string;
    productName: string;
    position: Position3D;
    rotation: number;
    reasoning: string;
    price: number;
  }>;
  totalPrice: number;
  budgetExceeded: boolean;
  exceededAmount?: number;
}

interface ChatRequest {
  sessionId: string;
  message: string;
  language: 'en' | 'zh';
  context: {
    currentDesign?: any;
  };
}

interface ChatResponse {
  success: boolean;
  reply: string;
  actions: any[];
}

interface DetectionRequest {
  imageUrl: string;
  roomDimensions: RoomDimensions;
}

interface DetectionResponse {
  detectedItems: DetectedFurnitureItem[];
  isEmpty: boolean;
  estimatedRoomDimensions?: RoomDimensions;
}

export const aiApi = createApi({
  reducerPath: 'aiApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  endpoints: (builder) => ({
    // AI Recommendations
    getRecommendations: builder.mutation<RecommendationResponse, RecommendationRequest>({
      query: (data) => ({
        url: '/recommend',
        method: 'POST',
        body: data,
      }),
    }),
    
    // AI Chat
    sendChatMessage: builder.mutation<ChatResponse, ChatRequest>({
      query: (data) => ({
        url: '/chat',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Image Upload
    uploadImage: builder.mutation<{ imageUrl: string }, FormData>({
      query: (formData) => ({
        url: '/upload',
        method: 'POST',
        body: formData,
      }),
    }),
    
    // Furniture Detection
    detectFurniture: builder.mutation<DetectionResponse, DetectionRequest>({
      query: (data) => ({
        url: '/detect',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Product Search
    searchProducts: builder.query<{ success: boolean; products: Product[]; total: number }, {
      q?: string;
      categories?: string[];
      collections?: string[];
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/products/search',
        params,
      }),
    }),
    
    // Get Product Details
    getProductById: builder.query<{ success: boolean; product: Product }, string>({
      query: (id) => `/products/${id}`,
    }),
    
    // Get Categories
    getCategories: builder.query<{ success: boolean; categories: Array<{ id: string; name: string; productCount: number }> }, void>({
      query: () => '/products/categories',
    }),
    
    // Get Collections - Remove this as backend doesn't have collections endpoint
    // getCollections: builder.query<{ collections: Collection[] }, void>({
    //   query: () => '/products/collections',
    // }),
  }),
});

export const {
  useGetRecommendationsMutation,
  useSendChatMessageMutation,
  useUploadImageMutation,
  useDetectFurnitureMutation,
  useSearchProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  // useGetCollectionsQuery, // Removed as backend doesn't support this
} = aiApi;
