import { ProductServiceClient } from '../clients/ProductServiceClient';
import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';
import { Product, RoomType, RoomDimensions, ProductSearchParams } from '../models/types';
import { DetectedFurnitureItem } from './ImageProcessingService';

export interface SmartRecommendationRequest {
  roomType: RoomType;
  roomDimensions: RoomDimensions;
  preferences: {
    selectedCategories?: string[];
    selectedCollections?: string[];
    budget?: { amount: number; currency: string };
  };
  existingFurniture?: DetectedFurnitureItem[];
  language?: string;
}

export interface SmartRecommendationResponse {
  success: boolean;
  recommendedProductIds: string[];
  reasoning?: string;
  products: Product[];
}

/**
 * Product Recommendation Service - AI-powered product recommendations
 * Uses AI to intelligently select products based on user preferences and room context
 */
export class ProductRecommendationService {
  constructor(private productClient: ProductServiceClient) {}

  private truncate(text: string, maxLen: number): string {
    if (text.length <= maxLen) return text;
    return text.slice(0, maxLen);
  }

  private buildExistingFurnitureSection(lang: string, existingFurniture?: DetectedFurnitureItem[]): string {
    const items = Array.isArray(existingFurniture) ? existingFurniture : [];
    if (items.length === 0) {
      return lang === 'zh'
        ? `\n用户房间中已存在的家具（来自图片识别）：无（或未提供）\n`
        : `\nExisting furniture detected in the room (from image analysis): None (or not provided)\n`;
    }

    const top = [...items]
      .sort((a, b) => (typeof b.confidence === 'number' ? b.confidence : 0) - (typeof a.confidence === 'number' ? a.confidence : 0))
      .slice(0, 10);

    let out =
      lang === 'zh'
        ? `\n用户房间中已存在的家具（来自图片识别，Top ${top.length}）：\n`
        : `\nExisting furniture detected in the room (Top ${top.length}):\n`;

    top.forEach((it, idx) => {
      const dims = it.estimatedDimensions;
      const dimsStr =
        dims && (dims.width !== null || dims.depth !== null || dims.height !== null)
          ? `${dims.width ?? '?'}W × ${dims.depth ?? '?'}D × ${dims.height ?? '?'}H ${dims.unit} (conf:${dims.confidence})`
          : 'unknown';

      const parts: string[] = [];
      parts.push(`type=${it.furnitureType}`);
      parts.push(`dims=${dimsStr}`);
      if (it.sizeBucket) parts.push(`size=${it.sizeBucket}`);
      if (it.style) parts.push(`style=${it.style}`);
      if (it.material) parts.push(`material=${this.truncate(it.material, 40)}`);
      if (it.color) parts.push(`color=${this.truncate(it.color, 40)}`);
      if (it.notes) parts.push(`notes=${this.truncate(it.notes, 120)}`);

      out += `${idx + 1}. ${parts.join(', ')}\n`;
    });

    return out;
  }

  /**
   * Generate smart product recommendations using AI
   */
  async generateSmartRecommendations(
    request: SmartRecommendationRequest
  ): Promise<SmartRecommendationResponse> {
    console.log('Generating smart recommendations for:', {
      roomType: request.roomType,
      preferences: request.preferences,
    });

    // Step 1: Determine categories to use
    // If user didn't specify categories, get appropriate categories for the room type
    let categoriesToUse: string[] | undefined = undefined;
    
    if (request.preferences.selectedCategories && request.preferences.selectedCategories.length > 0) {
      // Use user-specified categories
      categoriesToUse = request.preferences.selectedCategories;
    } else {
      // Auto-determine categories based on room type
      try {
        const roomTypeCategories = await this.productClient.getCategoriesByRoomType(request.roomType);
        if (roomTypeCategories && roomTypeCategories.length > 0) {
          categoriesToUse = roomTypeCategories.map(cat => cat.id);
          console.log(`Auto-selected categories for ${request.roomType}:`, categoriesToUse);
        } else {
          console.warn(`No categories found for room type: ${request.roomType}`);
        }
      } catch (error) {
        console.error('Failed to get categories by room type:', error);
      }
    }

    // Step 2: Get candidate products based on filters
    const searchParams: ProductSearchParams = {
      categories: categoriesToUse,
      collections: request.preferences.selectedCollections && request.preferences.selectedCollections.length > 0
        ? request.preferences.selectedCollections
        : undefined,
      maxPrice: request.preferences.budget?.amount,
      limit: 50, // Get more candidates for AI to choose from
    };

    console.log('Search params:', JSON.stringify(searchParams, null, 2));
    console.log('Request preferences:', JSON.stringify(request.preferences, null, 2));
    
    let candidateProducts = await this.productClient.searchProducts(searchParams);
    console.log(`Found ${candidateProducts.length} candidate products with filters`);

    // If no products found with filters, try broader search
    if (candidateProducts.length === 0) {
      console.warn('No candidate products found for criteria:', searchParams);
      
      // Try search without category filter (if category was specified)
      if (searchParams.categories) {
        console.log('Trying search without category filter...');
        const noCategoryParams: ProductSearchParams = {
          collections: searchParams.collections,
          maxPrice: searchParams.maxPrice,
          limit: 50,
        };
        candidateProducts = await this.productClient.searchProducts(noCategoryParams);
        console.log(`Found ${candidateProducts.length} products without category filter`);
      }
      
      // If still no products, try without collection filter
      if (candidateProducts.length === 0 && searchParams.collections) {
        console.log('Trying search without collection filter...');
        const noCollectionParams: ProductSearchParams = {
          maxPrice: searchParams.maxPrice,
          limit: 50,
        };
        candidateProducts = await this.productClient.searchProducts(noCollectionParams);
        console.log(`Found ${candidateProducts.length} products without collection filter`);
      }
      
      // If still no products, try without price filter
      if (candidateProducts.length === 0 && searchParams.maxPrice) {
        console.log('Trying search without price filter...');
        const noPriceParams: ProductSearchParams = {
          limit: 50,
        };
        candidateProducts = await this.productClient.searchProducts(noPriceParams);
        console.log(`Found ${candidateProducts.length} products without price filter`);
      }
      
      // Final fallback: get all products
      if (candidateProducts.length === 0) {
        console.log('Trying search with no filters (all products)...');
        const allProductsParams: ProductSearchParams = {
          limit: 50,
        };
        candidateProducts = await this.productClient.searchProducts(allProductsParams);
        console.log(`Found ${candidateProducts.length} products in final fallback`);
      }
      
      if (candidateProducts.length === 0) {
        return {
          success: false,
          recommendedProductIds: [],
          reasoning: 'No products available. Please contact support.',
          products: [],
        };
      }
      
      // Use fallback results with a note
      const fallbackResult = this.generateRuleBasedRecommendations(candidateProducts, request);
      fallbackResult.reasoning = 'No products match your specific criteria. Here are some general recommendations.';
      return fallbackResult;
    }

    try {
      // Step 2: Use AI to select best products
      const aiClient = AIClientFactory.getAvailableClient();
      
      if (aiClient) {
        return await this.generateAIRecommendations(request, candidateProducts, aiClient);
      } else {
        // Fallback to rule-based selection
        return this.generateRuleBasedRecommendations(candidateProducts, request);
      }
    } catch (error) {
      console.error('AI recommendation error, falling back to rule-based:', error);
      return this.generateRuleBasedRecommendations(candidateProducts, request);
    }
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateAIRecommendations(
    request: SmartRecommendationRequest,
    candidateProducts: Product[],
    aiClient: any
  ): Promise<SmartRecommendationResponse> {
    const systemPrompt = this.buildSystemPrompt(request.language || 'en', request.roomType);
    const userPrompt = this.buildUserPrompt(request, candidateProducts);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await aiClient.chatCompletion({
      model: 'qwen-turbo',
      messages,
      temperature: 0.3, // Lower temperature for more consistent recommendations
      max_tokens: 2000,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parse AI response to extract product IDs
    const recommendedIds = this.parseAIResponse(aiResponse, candidateProducts);
    
    // Ensure no duplicates in recommended IDs (extra safety check)
    const uniqueRecommendedIds = Array.from(new Set(recommendedIds));
    
    // Get recommended products (filter will naturally deduplicate by product ID)
    const recommendedProducts = candidateProducts.filter(p => uniqueRecommendedIds.includes(p.id));

    console.log('generateAIRecommendations - Returning:', {
      success: true,
      recommendedProductIds: uniqueRecommendedIds.length,
      products: recommendedProducts.length,
      productIds: recommendedProducts.map(p => p.id),
    });

    return {
      success: true,
      recommendedProductIds: uniqueRecommendedIds,
      reasoning: aiResponse,
      products: recommendedProducts,
    };
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(language: string, roomType: RoomType): string {
    // Get room-specific restrictions
    const roomRestrictions = this.getRoomTypeRestrictions(roomType, language);
    
    if (language === 'zh') {
      return `你是一个专业的家具推荐专家。你的任务是根据用户的房间信息、偏好和可用商品，智能推荐最合适的家具产品。

${roomRestrictions}

请按照以下JSON格式返回推荐结果：
{
  "recommendedProductIds": ["product-1", "product-2", "product-3"],
  "reasoning": "推荐理由的详细说明"
}

要求：
1. 推荐3-10个最合适的商品
2. 考虑房间类型、尺寸、预算、风格偏好
3. 确保推荐的商品符合用户选择的类别和系列
4. 优先推荐性价比高、风格匹配的商品
5. 提供清晰的推荐理由
6. 结合“房间中已存在的家具”（如果提供），做“替换 + 补齐”的混合推荐：既给出可替换升级的同类，也补齐缺失的关键品类，并尽量保持风格/材质/颜色协调、尺寸合适
7. **严格遵守房间类型限制，不要推荐不适合该房间类型的家具**`;
    } else {
      return `You are a professional furniture recommendation expert. Your task is to intelligently recommend the most suitable furniture products based on user's room information, preferences, and available products.

${roomRestrictions}

Please return recommendations in the following JSON format:
{
  "recommendedProductIds": ["product-1", "product-2", "product-3"],
  "reasoning": "Detailed explanation of why these products are recommended"
}

Requirements:
1. Recommend 3-10 most suitable products
2. Consider room type, dimensions, budget, style preferences
3. Ensure recommended products match user's selected categories and collections
4. Prioritize products with good value and style match
5. Provide clear reasoning for recommendations
6. If existing furniture info is provided, make a mixed plan of both replacements (same type upgrades) and missing essentials; keep style/material/color cohesive and dimensions appropriate
7. **STRICTLY follow room type restrictions - do NOT recommend furniture unsuitable for this room type**`;
    }
  }

  /**
   * Get room type specific restrictions for the prompt
   */
  private getRoomTypeRestrictions(roomType: RoomType, language: string): string {
    const restrictions: Record<RoomType, { zh: string; en: string }> = {
      [RoomType.BEDROOM]: {
        zh: `**重要限制：这是卧室（Bedroom），请只推荐适合卧室的家具。**
- 必须推荐：床（Bed）、储物柜（Storage）、床头柜等
- 禁止推荐：沙发（Sofa）、咖啡桌（Coffee Table）等客厅家具
- 可选推荐：椅子（Chair）、桌子（Table，如梳妆台）`,
        en: `**IMPORTANT RESTRICTION: This is a BEDROOM - only recommend bedroom-appropriate furniture.**
- MUST recommend: Beds, Storage (wardrobes, dressers), Nightstands
- DO NOT recommend: Sofas, Coffee Tables, or other living room furniture
- Optional: Chairs, Tables (like dressing tables)`
      },
      [RoomType.LIVING_ROOM]: {
        zh: `**重要限制：这是客厅（Living Room），请推荐适合客厅的家具。**
- 必须推荐：沙发（Sofa）、茶几（Coffee Table）、椅子（Chair）等
- 可选推荐：储物柜（Storage）、边桌（Side Table）等`,
        en: `**IMPORTANT RESTRICTION: This is a LIVING ROOM - recommend living room furniture.**
- MUST recommend: Sofas, Coffee Tables, Chairs
- Optional: Storage, Side Tables`
      },
      [RoomType.DINING_ROOM]: {
        zh: `**重要限制：这是餐厅（Dining Room），请推荐适合餐厅的家具。**
- 必须推荐：餐桌（Dining Table）、餐椅（Dining Chairs）
- 可选推荐：储物柜（Storage，如餐边柜）`,
        en: `**IMPORTANT RESTRICTION: This is a DINING ROOM - recommend dining room furniture.**
- MUST recommend: Dining Tables, Dining Chairs
- Optional: Storage (like sideboards)`
      },
      [RoomType.HOME_OFFICE]: {
        zh: `**重要限制：这是家庭办公室（Home Office），请推荐适合办公的家具。**
- 必须推荐：书桌（Desk）、办公椅（Office Chair）、储物柜（Storage）
- 可选推荐：书架（Bookshelf）等`,
        en: `**IMPORTANT RESTRICTION: This is a HOME OFFICE - recommend office furniture.**
- MUST recommend: Desks, Office Chairs, Storage
- Optional: Bookshelves`
      },
    };

    const restriction = restrictions[roomType];
    return restriction ? (language === 'zh' ? restriction.zh : restriction.en) : '';
  }

  /**
   * Build user prompt with context
   */
  private buildUserPrompt(
    request: SmartRecommendationRequest,
    candidateProducts: Product[]
  ): string {
    const lang = request.language || 'en';
    
    let prompt = '';
    
    if (lang === 'zh') {
      prompt = `请为以下场景推荐家具：

房间信息：
- 房间类型：${request.roomType}
- 房间尺寸：${request.roomDimensions.length} × ${request.roomDimensions.width} × ${request.roomDimensions.height} ${request.roomDimensions.unit}

用户偏好：
- 选择的家具类别：${request.preferences.selectedCategories?.join(', ') || '无'}
- 选择的风格系列：${request.preferences.selectedCollections?.join(', ') || '无'}
- 预算：${request.preferences.budget ? `${request.preferences.budget.amount} ${request.preferences.budget.currency}` : '无限制'}

可用商品列表（共${candidateProducts.length}个）：
`;
    } else {
      prompt = `Please recommend furniture for the following scenario:

Room Information:
- Room Type: ${request.roomType}
- Room Dimensions: ${request.roomDimensions.length} × ${request.roomDimensions.width} × ${request.roomDimensions.height} ${request.roomDimensions.unit}

User Preferences:
- Selected Categories: ${request.preferences.selectedCategories?.join(', ') || 'None'}
- Selected Collections: ${request.preferences.selectedCollections?.join(', ') || 'None'}
- Budget: ${request.preferences.budget ? `${request.preferences.budget.amount} ${request.preferences.budget.currency}` : 'No limit'}

Available Products (${candidateProducts.length} items):
`;
    }

    // Existing furniture context (helps decide replacement vs missing essentials)
    prompt += this.buildExistingFurnitureSection(lang, request.existingFurniture);

    // Add product information
    candidateProducts.forEach((product, index) => {
      prompt += `\n${index + 1}. Product ID: ${product.id}\n`;
      prompt += `   Name: ${product.name}\n`;
      prompt += `   Category: ${product.category}\n`;
      prompt += `   Price: ${product.price} ${product.currency}\n`;
      if (product.dimensions) {
        prompt += `   Dimensions: ${product.dimensions.width}W × ${product.dimensions.depth}D × ${product.dimensions.height}H ${product.dimensions.unit}\n`;
      }
      if (product.tags && product.tags.length > 0) {
        prompt += `   Tags: ${product.tags.join(', ')}\n`;
      }
      if (product.description) {
        prompt += `   Description: ${product.description.substring(0, 100)}\n`;
      }
    });

    if (lang === 'zh') {
      prompt += `\n请从以上商品中选择3-10个最合适的推荐给用户，并说明推荐理由。`;
    } else {
      prompt += `\nPlease select 3-10 most suitable products from the above list and explain your reasoning.`;
    }

    return prompt;
  }

  /**
   * Parse AI response to extract product IDs
   */
  private parseAIResponse(aiResponse: string, candidateProducts: Product[]): string[] {
    console.log('Parsing AI response, candidate products count:', candidateProducts.length);
    
    // Try to extract JSON from response
    let jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('Parsed AI JSON response:', parsed);
        
        if (parsed.recommendedProductIds && Array.isArray(parsed.recommendedProductIds)) {
          console.log('Found recommendedProductIds:', parsed.recommendedProductIds);
          
          // Validate product IDs exist and remove duplicates
          const validIds: string[] = Array.from(new Set(
            parsed.recommendedProductIds
              .filter((id: unknown): id is string => typeof id === 'string')
              .filter((id: string) =>
                candidateProducts.some(p => p.id === id)
              )
          ));
          
          console.log('Valid product IDs after validation and deduplication:', validIds);
          
          if (validIds.length > 0) {
            return validIds;
          } else {
            console.warn('No valid product IDs found in AI response, using fallback');
          }
        }
      } catch (e) {
        console.warn('Failed to parse AI JSON response:', e);
      }
    }

    // Fallback: Try to extract product IDs from text
    const productIds: string[] = [];
    candidateProducts.forEach(product => {
      if (aiResponse.includes(product.id) || aiResponse.includes(product.name)) {
        productIds.push(product.id);
      }
    });

    // Remove duplicates
    const uniqueProductIds = Array.from(new Set(productIds));
    console.log('Product IDs extracted from text (after deduplication):', uniqueProductIds);

    // If still no results, return first 5-8 products as fallback
    if (uniqueProductIds.length === 0) {
      const fallbackIds = candidateProducts.slice(0, 8).map(p => p.id);
      console.log('Using fallback: returning first products:', fallbackIds);
      return fallbackIds;
    }

    return uniqueProductIds.slice(0, 10); // Limit to 10 products
  }

  /**
   * Fallback rule-based recommendations
   */
  private generateRuleBasedRecommendations(
    candidateProducts: Product[],
    request: SmartRecommendationRequest
  ): SmartRecommendationResponse {
    // Simple rule: select first 5-8 products that match criteria
    const selected = candidateProducts.slice(0, 8);
    
    return {
      success: true,
      recommendedProductIds: selected.map(p => p.id),
      reasoning: `Selected ${selected.length} products based on your preferences and room type.`,
      products: selected,
    };
  }
}
