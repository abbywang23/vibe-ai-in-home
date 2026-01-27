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
  recommendations: FurniturePlacement[];
  totalPrice: Money;
  isBudgetExceeded: boolean;
  exceededAmount?: Money;
}

interface ChatRequest {
  message: string;
  language: string;
  conversationHistory: ChatMessage[];
  sessionContext: {
    roomType?: RoomType;
    budget?: Money;
  };
}

interface ChatResponse {
  message: ChatMessage;
  suggestedActions?: Array<{
    type: string;
    data: any;
  }>;
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

interface ReplacementRequest {
  imageUrl: string;
  detectedItemId: string;
  replacementProductId: string;
}

interface ReplacementResponse {
  processedImageUrl: string;
  replacement: {
    detectedItemId: string;
    replacementProductId: string;
    replacementProductName: string;
    appliedAt: string;
  };
}

interface PlacementRequest {
  imageUrl: string;
  productId: string;
  imagePosition: { x: number; y: number };
  rotation: number;
  scale: number;
}

interface PlacementResponse {
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
    
    // Furniture Replacement (for furnished rooms)
    replaceFurniture: builder.mutation<ReplacementResponse, ReplacementRequest>({
      query: (data) => ({
        url: '/replace',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Furniture Placement (for empty rooms)
    placeFurniture: builder.mutation<PlacementResponse, PlacementRequest>({
      query: (data) => ({
        url: '/place',
        method: 'POST',
        body: data,
      }),
    }),
    
    // Product Search
    searchProducts: builder.query<{ products: Product[] }, {
      query?: string;
      categories?: string[];
      collections?: string[];
      minPrice?: number;
      maxPrice?: number;
    }>({
      query: (params) => ({
        url: '/products/search',
        params,
      }),
    }),
    
    // Get Product Details
    getProductById: builder.query<Product, string>({
      query: (id) => `/products/${id}`,
    }),
    
    // Get Categories
    getCategories: builder.query<{ categories: Category[] }, void>({
      query: () => '/products/categories',
    }),
    
    // Get Collections
    getCollections: builder.query<{ collections: Collection[] }, void>({
      query: () => '/products/collections',
    }),
  }),
});

export const {
  useGetRecommendationsMutation,
  useSendChatMessageMutation,
  useUploadImageMutation,
  useDetectFurnitureMutation,
  useReplaceFurnitureMutation,
  usePlaceFurnitureMutation,
  useSearchProductsQuery,
  useGetProductByIdQuery,
  useGetCategoriesQuery,
  useGetCollectionsQuery,
} = aiApi;
