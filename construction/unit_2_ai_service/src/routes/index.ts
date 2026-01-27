import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { ChatController } from '../controllers/chatController';
import { ProductController } from '../controllers/productController';
import { RecommendationService } from '../services/RecommendationService';
import { ChatService } from '../services/ChatService';
import { ProductServiceClient } from '../clients/ProductServiceClient';

/**
 * Setup all API routes
 */
export function setupRoutes(): Router {
  const router = Router();

  // Initialize clients and services
  const productClient = new ProductServiceClient();
  const recommendationService = new RecommendationService(productClient);
  const chatService = new ChatService();

  // Initialize controllers
  const recommendationController = new RecommendationController(recommendationService);
  const chatController = new ChatController(chatService);
  const productController = new ProductController(productClient);

  // Health check
  router.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // AI endpoints
  router.post('/api/ai/recommend', (req, res, next) =>
    recommendationController.recommend(req, res, next)
  );

  router.post('/api/ai/chat', (req, res, next) =>
    chatController.chat(req, res, next)
  );

  // Product endpoints
  router.get('/api/ai/products/search', (req, res, next) =>
    productController.searchProducts(req, res, next)
  );

  router.get('/api/ai/products/categories', (req, res, next) =>
    productController.getCategories(req, res, next)
  );

  router.get('/api/ai/products/:id', (req, res, next) =>
    productController.getProductById(req, res, next)
  );

  return router;
}
