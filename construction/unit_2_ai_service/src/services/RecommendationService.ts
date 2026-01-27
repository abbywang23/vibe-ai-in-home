import { ProductServiceClient } from '../clients/ProductServiceClient';
import {
  RecommendationRequest,
  Recommendation,
  Product,
  RoomType,
  Position3D,
} from '../models/types';

/**
 * Recommendation Service - Generates furniture recommendations
 * Uses rule-based logic (mock AI) for demo purposes
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

    console.log(`Generated ${recommendations.length} recommendations`);
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
