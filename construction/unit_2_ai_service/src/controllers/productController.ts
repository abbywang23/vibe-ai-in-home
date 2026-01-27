import { Request, Response, NextFunction } from 'express';
import { ProductServiceClient } from '../clients/ProductServiceClient';
import {
  ProductSearchParams,
  ProductSearchResponse,
  CategoryResponse,
  ProductDetailResponse,
} from '../models/types';

export class ProductController {
  constructor(private productClient: ProductServiceClient) {}

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
}
