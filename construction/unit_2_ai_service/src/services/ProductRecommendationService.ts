import { ProductServiceClient } from '../clients/ProductServiceClient';
import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';
import { Product, RoomType, RoomDimensions, ProductSearchParams } from '../models/types';

export interface SmartRecommendationRequest {
  roomType: RoomType;
  roomDimensions: RoomDimensions;
  preferences: {
    selectedCategories?: string[];
    selectedCollections?: string[];
    budget?: { amount: number; currency: string };
  };
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

    // Step 1: Get candidate products based on filters
    // If no categories selected, get all products (filtered by collections and budget if specified)
    const searchParams: ProductSearchParams = {
      categories: request.preferences.selectedCategories && request.preferences.selectedCategories.length > 0 
        ? request.preferences.selectedCategories 
        : undefined,
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
    const systemPrompt = this.buildSystemPrompt(request.language || 'en');
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
    
    // Get recommended products
    const recommendedProducts = candidateProducts.filter(p => recommendedIds.includes(p.id));

    console.log('generateAIRecommendations - Returning:', {
      success: true,
      recommendedProductIds: recommendedIds.length,
      products: recommendedProducts.length,
      productIds: recommendedProducts.map(p => p.id),
    });

    return {
      success: true,
      recommendedProductIds: recommendedIds,
      reasoning: aiResponse,
      products: recommendedProducts,
    };
  }

  /**
   * Build system prompt for AI
   */
  private buildSystemPrompt(language: string): string {
    if (language === 'zh') {
      return `你是一个专业的家具推荐专家。你的任务是根据用户的房间信息、偏好和可用商品，智能推荐最合适的家具产品。

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
5. 提供清晰的推荐理由`;
    } else {
      return `You are a professional furniture recommendation expert. Your task is to intelligently recommend the most suitable furniture products based on user's room information, preferences, and available products.

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
5. Provide clear reasoning for recommendations`;
    }
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
          
          // Validate product IDs exist
          const validIds = parsed.recommendedProductIds.filter((id: string) =>
            candidateProducts.some(p => p.id === id)
          );
          
          console.log('Valid product IDs after validation:', validIds);
          
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

    console.log('Product IDs extracted from text:', productIds);

    // If still no results, return first 5-8 products as fallback
    if (productIds.length === 0) {
      const fallbackIds = candidateProducts.slice(0, 8).map(p => p.id);
      console.log('Using fallback: returning first products:', fallbackIds);
      return fallbackIds;
    }

    return productIds.slice(0, 10); // Limit to 10 products
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
