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

  /**
   * POST /api/ai/recommend-from-detected
   * Generate furniture recommendations based on detected furniture categories
   * This endpoint is specifically for replacing existing furniture
   */
  async recommendFromDetected(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { detectedCategories, ...requestData } = req.body;

      if (!detectedCategories || !Array.isArray(detectedCategories) || detectedCategories.length === 0) {
        res.status(400).json({
          success: false,
          error: 'detectedCategories array is required and must not be empty',
        });
        return;
      }

      // Validate the rest of the request
      const validatedData = RecommendationRequestSchema.parse(requestData);
      const request: RecommendationRequest = validatedData as RecommendationRequest;

      console.log(`Generating recommendations for detected categories: ${detectedCategories.join(', ')}`);

      // Generate recommendations based on detected categories
      const recommendations = await this.recommendationService.generateRecommendationsFromDetectedCategories(
        request,
        detectedCategories
      );

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
        metadata: {
          detectedCategories,
          matchedCategories: recommendations.map(r => r.productName),
        },
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
}
