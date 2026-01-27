import { z } from 'zod';

// Zod Validation Schemas

export const RoomDimensionsSchema = z.object({
  length: z.number().positive().max(50),
  width: z.number().positive().max(50),
  height: z.number().positive().max(6),
  unit: z.enum(['meters', 'feet', 'centimeters', 'inches']),
});

export const MoneySchema = z.object({
  amount: z.number().positive(),
  currency: z.string().length(3),
});

export const PreferencesSchema = z.object({
  selectedCategories: z.array(z.string()).optional(),
  selectedCollections: z.array(z.string()).optional(),
  preferredProducts: z.array(z.string()).optional(),
});

export const RecommendationRequestSchema = z.object({
  roomType: z.enum(['living_room', 'bedroom', 'dining_room', 'home_office']),
  dimensions: RoomDimensionsSchema,
  budget: MoneySchema.optional(),
  preferences: PreferencesSchema.optional(),
  language: z.string().optional(),
});

export const ChatRequestSchema = z.object({
  sessionId: z.string().min(1), // 改为简单的字符串验证，不要求UUID格式
  message: z.string().min(1).max(1000),
  language: z.enum(['en', 'zh']),
  context: z.object({
    currentDesign: z.any().optional(),
  }),
});

export const ProductSearchParamsSchema = z.object({
  query: z.string().optional(),
  categories: z.array(z.string()).optional(),
  collections: z.array(z.string()).optional(),
  maxPrice: z.number().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});
