import { Request, Response, NextFunction } from 'express';
import { ProductServiceClient } from '../clients/ProductServiceClient';
import { ProductRecommendationService } from '../services/ProductRecommendationService';
import {
  ProductSearchParams,
  ProductSearchResponse,
  CategoryResponse,
  ProductDetailResponse,
} from '../models/types';

export class ProductController {
  constructor(
    private productClient: ProductServiceClient,
    private recommendationService?: ProductRecommendationService
  ) {}

  /**
   * GET /api/ai/products/search
   * Search products
   */
  async searchProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q, category, maxPrice, limit } = req.query;

      const params: ProductSearchParams = {
        query: q as string,
        categories: category ? [category as string] : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        limit: limit ? parseInt(limit as string) : 10,
      };

      const products = await this.productClient.searchProducts(params);

      const response: ProductSearchResponse = {
        success: true,
        products,
        total: products.length,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/products/categories
   * Get all categories
   */
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await this.productClient.getCategories();

      const response: CategoryResponse = {
        success: true,
        categories,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/products/:id
   * Get product by ID
   */
  async getProductById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const product = await this.productClient.getProductById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        });
        return;
      }

      const response: ProductDetailResponse = {
        success: true,
        product,
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/products/categories/by-room-type
   * Get categories by room type
   */
  async getCategoriesByRoomType(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roomType } = req.query;

      if (!roomType || typeof roomType !== 'string') {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'roomType query parameter is required',
          },
        });
        return;
      }

      const categories = await this.productClient.getCategoriesByRoomType(roomType);

      res.json({
        success: true,
        roomType,
        categories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/ai/products/collections
   * Get all collections
   */
  async getCollections(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const collections = await this.productClient.getCollections();

      res.json({
        success: true,
        collections,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/products/smart-recommend
   * Get AI-powered smart product recommendations
   */
  async getSmartRecommendations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!this.recommendationService) {
        res.status(503).json({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Recommendation service not available',
          },
        });
        return;
      }

      const { roomType, roomDimensions, preferences, language, existingFurniture } = req.body;

      console.log('getSmartRecommendations - Request body:', JSON.stringify(req.body, null, 2));

      if (!roomType || !roomDimensions) {
        console.error('getSmartRecommendations - Missing required fields:', { roomType, roomDimensions });
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'roomType and roomDimensions are required',
          },
        });
        return;
      }

      const result = await this.recommendationService.generateSmartRecommendations({
        roomType,
        roomDimensions,
        preferences: preferences || {},
        existingFurniture: Array.isArray(existingFurniture) ? existingFurniture : undefined,
        language: language || 'en',
      });

      console.log('getSmartRecommendations - Response:', {
        success: result.success,
        productCount: result.products?.length || 0,
        recommendedIds: result.recommendedProductIds?.length || 0,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/products/swap-next
   * Get next product in category for Swap Item feature
   */
  async getNextProductForSwap(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, productName } = req.body;

      if (!category || !productName) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'category and productName are required',
          },
        });
        return;
      }

      const nextProduct = await this.productClient.getNextProductInCategory(category, productName);

      if (!nextProduct) {
        res.status(404).json({
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found in category or category is empty',
          },
        });
        return;
      }

      res.json({
        success: true,
        product: nextProduct,
      });
    } catch (error) {
      next(error);
    }
  }
}
