import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from '../services/RecommendationService';
import { RecommendationRequest, RecommendationResponse } from '../models/types';
import { RecommendationRequestSchema } from '../models/schemas';

export class RecommendationController {
  constructor(private recommendationService: RecommendationService) {}

  /**
   * POST /api/ai/recommend
   * Generate furniture recommendations
   */
  async recommend(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request
      const validatedData = RecommendationRequestSchema.parse(req.body);
      const request: RecommendationRequest = validatedData as RecommendationRequest;

      // Generate recommendations
      const recommendations = await this.recommendationService.generateRecommendations(request);

      // Calculate total price
      const totalPrice = this.recommendationService.calculateTotalPrice(recommendations);

      // Check budget
      const budgetCheck = this.recommendationService.checkBudgetExceeded(
        totalPrice,
        request.budget
      );

      const response: RecommendationResponse = {
        success: true,
        recommendations,
        totalPrice,
        budgetExceeded: budgetCheck.exceeded,
        exceededAmount: budgetCheck.exceededAmount,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
