import { ProductServiceClient } from '../clients/ProductServiceClient';
import { AIClientFactory } from '../clients/AIClientFactory';
import { ChatMessage } from '../clients/AIClient';
import {
  RecommendationRequest,
  Recommendation,
  Product,
  RoomType,
  Position3D,
} from '../models/types';

/**
 * Recommendation Service - Generates furniture recommendations
 * Supports AI-powered recommendations with mock fallback
 */
export class RecommendationService {
  constructor(private productClient: ProductServiceClient) {}

  /**
   * Generate furniture recommendations based on room configuration
   */
  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<Recommendation[]> {
    console.log('Generating recommendations for:', request.roomType);

    // 1. Load available products
    const products = await this.productClient.searchProducts({
      categories: request.preferences?.selectedCategories,
      collections: request.preferences?.selectedCollections,
      maxPrice: request.budget?.amount,
    });

    if (products.length === 0) {
      console.warn('No products available for recommendations');
      return [];
    }

    try {
      // Try to get an available AI client
      const aiClient = AIClientFactory.getAvailableClient();
      
      if (aiClient) {
        // Use AI for intelligent recommendations
        return await this.generateAIRecommendations(request, products, aiClient);
      } else {
        // Fallback to rule-based recommendations
        return this.generateRuleBasedRecommendations(request, products);
      }
    } catch (error) {
      console.error('AI recommendation error, falling back to rule-based:', error);
      // Fallback to rule-based recommendations on error
      return this.generateRuleBasedRecommendations(request, products);
    }
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateAIRecommendations(
    request: RecommendationRequest,
    products: Product[],
    aiClient: any
  ): Promise<Recommendation[]> {
    const systemPrompt = this.buildRecommendationSystemPrompt();
    const userPrompt = this.buildRecommendationUserPrompt(request, products);

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await aiClient.chatCompletion({
      model: undefined, // Use default model
      messages,
      temperature: 0.3, // Lower temperature for more consistent recommendations
      max_tokens: 1000,
    });

    const aiResponse = response.choices[0]?.message?.content || '';
    
    // Parse AI response and convert to recommendations
    return this.parseAIRecommendations(aiResponse, products, request.dimensions);
  }

  /**
   * Build system prompt for AI recommendations
   */
  private buildRecommendationSystemPrompt(): string {
    return `You are a professional interior designer and furniture consultant. Your task is to recommend furniture for a room based on:
1. Room type and dimensions
2. User budget constraints
3. Available furniture products
4. Interior design best practices

For each recommendation, provide:
- Product ID from the available list
- Specific position in the room (x, y, z coordinates in meters)
- Rotation angle (0-360 degrees)
- Brief reasoning for the placement

Format your response as JSON array with this structure:
[
  {
    "productId": "product-1",
    "position": {"x": 2.5, "y": 0, "z": 0.5},
    "rotation": 0,
    "reasoning": "Placed against the back wall as focal point"
  }
]

Consider room flow, functionality, and aesthetic balance. Ensure furniture fits within room dimensions.`;
  }

  /**
   * Build user prompt with room and product details
   */
  private buildRecommendationUserPrompt(request: RecommendationRequest, products: Product[]): string {
    const roomInfo = `Room Type: ${request.roomType}
Room Dimensions: ${request.dimensions.length}m × ${request.dimensions.width}m × ${request.dimensions.height}m
Budget: ${request.budget ? `${request.budget.currency} ${request.budget.amount}` : 'No budget specified'}`;

    const productList = products.slice(0, 10).map(p => 
      `- ${p.id}: ${p.name} (${p.currency} ${p.price}) - ${p.dimensions.width}×${p.dimensions.depth}×${p.dimensions.height}m`
    ).join('\n');

    return `${roomInfo}

Available Products:
${productList}

Please recommend 1-3 furniture pieces that would work well in this room. Consider the room size, budget constraints, and furniture dimensions.`;
  }

  /**
   * Parse AI response into recommendations
   */
  private parseAIRecommendations(aiResponse: string, products: Product[], dimensions: any): Recommendation[] {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const aiRecommendations = JSON.parse(jsonMatch[0]);
      const recommendations: Recommendation[] = [];

      for (const aiRec of aiRecommendations) {
        const product = products.find(p => p.id === aiRec.productId);
        if (product) {
          recommendations.push({
            productId: product.id,
            productName: product.name,
            position: aiRec.position,
            rotation: aiRec.rotation || 0,
            reasoning: aiRec.reasoning || 'AI recommendation',
            price: product.price,
          });
        }
      }

      return recommendations;
    } catch (error) {
      console.error('Failed to parse AI recommendations:', error);
      // Fallback to rule-based if parsing fails
      return this.generateRuleBasedRecommendations({ 
        roomType: RoomType.LIVING_ROOM, 
        dimensions, 
        budget: undefined 
      }, products);
    }
  }

  /**
   * Generate rule-based recommendations (fallback)
   */
  private generateRuleBasedRecommendations(
    request: RecommendationRequest,
    products: Product[]
  ): Recommendation[] {
    // 2. Select products based on room type
    const selectedProducts = this.selectProductsForRoom(
      request.roomType,
      products,
      request.budget?.amount
    );

    // 3. Generate placements with positions and rotations
    const recommendations = this.generatePlacements(
      selectedProducts,
      request.dimensions
    );

    console.log(`Generated ${recommendations.length} rule-based recommendations`);
    return recommendations;
  }

  /**
   * Select appropriate products for room type
   */
  private selectProductsForRoom(
    roomType: RoomType,
    products: Product[],
    maxBudget?: number
  ): Product[] {
    const selected: Product[] = [];
    let totalCost = 0;

    // Define product priorities by room type
    const priorities = this.getRoomTypePriorities(roomType);

    for (const category of priorities) {
      const categoryProducts = products.filter((p) => p.category === category);
      
      if (categoryProducts.length > 0) {
        // Pick the first affordable product in this category
        for (const product of categoryProducts) {
          if (!maxBudget || totalCost + product.price <= maxBudget) {
            selected.push(product);
            totalCost += product.price;
            break; // Only one item per category for simplicity
          }
        }
      }
    }

    return selected;
  }

  /**
   * Get product category priorities for each room type
   */
  private getRoomTypePriorities(roomType: RoomType): string[] {
    const priorities: Record<RoomType, string[]> = {
      [RoomType.LIVING_ROOM]: ['sofa', 'table', 'chair', 'storage'],
      [RoomType.BEDROOM]: ['bed', 'storage', 'chair', 'table'],
      [RoomType.DINING_ROOM]: ['table', 'chair', 'storage'],
      [RoomType.HOME_OFFICE]: ['desk', 'chair', 'storage'],
    };

    return priorities[roomType] || ['sofa', 'table', 'chair'];
  }

  /**
   * Generate placements with positions and rotations
   */
  private generatePlacements(
    products: Product[],
    dimensions: { length: number; width: number; height: number }
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const roomLength = dimensions.length;
    const roomWidth = dimensions.width;

    // Simple placement logic: distribute furniture along walls
    let currentX = 0.5; // Start 0.5m from wall
    let currentZ = 0.5;

    products.forEach((product, index) => {
      const furnitureWidth = product.dimensions.width;
      const furnitureDepth = product.dimensions.depth;

      // Determine position based on index
      let position: Position3D;
      let rotation: number;
      let reasoning: string;

      if (index === 0) {
        // First item: center against back wall
        position = {
          x: roomLength / 2,
          y: 0,
          z: currentZ,
        };
        rotation = 0;
        reasoning = `Placed ${product.name} against the back wall as the focal point`;
      } else if (index === 1) {
        // Second item: center of room or opposite wall
        position = {
          x: roomLength / 2,
          y: 0,
          z: roomWidth - furnitureDepth - 0.5,
        };
        rotation = 180;
        reasoning = `Placed ${product.name} opposite the main furniture`;
      } else if (index === 2) {
        // Third item: left side
        position = {
          x: currentX,
          y: 0,
          z: roomWidth / 2,
        };
        rotation = 90;
        reasoning = `Placed ${product.name} on the left side for balance`;
      } else {
        // Additional items: right side
        position = {
          x: roomLength - furnitureWidth - 0.5,
          y: 0,
          z: roomWidth / 2,
        };
        rotation = 270;
        reasoning = `Placed ${product.name} on the right side to complete the layout`;
      }

      recommendations.push({
        productId: product.id,
        productName: product.name,
        position,
        rotation,
        reasoning,
        price: product.price,
      });
    });

    return recommendations;
  }

  /**
   * Calculate total price of recommendations
   */
  calculateTotalPrice(recommendations: Recommendation[]): number {
    return recommendations.reduce((sum, rec) => sum + rec.price, 0);
  }

  /**
   * Check if budget is exceeded
   */
  checkBudgetExceeded(
    totalPrice: number,
    budget?: { amount: number }
  ): { exceeded: boolean; exceededAmount?: number } {
    if (!budget) {
      return { exceeded: false };
    }

    if (totalPrice > budget.amount) {
      return {
        exceeded: true,
        exceededAmount: totalPrice - budget.amount,
      };
    }

    return { exceeded: false };
  }
}
