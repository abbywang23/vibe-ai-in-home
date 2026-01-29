import { Router } from 'express';
import { RecommendationController } from '../controllers/recommendationController';
import { ChatController } from '../controllers/chatController';
import { ProductController } from '../controllers/productController';
import { ImageController } from '../controllers/imageController';
import { RecommendationService } from '../services/RecommendationService';
import { ChatService } from '../services/ChatService';
import { ImageProcessingService } from '../services/ImageProcessingService';
import { ProductServiceClient } from '../clients/ProductServiceClient';
import { ProductRecommendationService } from '../services/ProductRecommendationService';
import { AIClientFactory } from '../clients/AIClientFactory';

/**
 * Setup all API routes
 */
export function setupRoutes(): Router {
  const router = Router();

  // Initialize clients and services
  const productClient = new ProductServiceClient();
  const recommendationService = new RecommendationService(productClient);
  const productRecommendationService = new ProductRecommendationService(productClient);
  const chatService = new ChatService();
  const imageService = new ImageProcessingService(productClient);

  // Initialize controllers
  const recommendationController = new RecommendationController(recommendationService);
  const chatController = new ChatController(chatService);
  const productController = new ProductController(productClient, productRecommendationService);
  const imageController = new ImageController(imageService);

  // Health check
  router.get('/health', (req, res) => {
    const availableProviders = AIClientFactory.listAvailableProviders();
    
    res.json({
      status: 'ok',
      service: 'ai-service',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      aiProviders: {
        available: availableProviders,
        fallback: 'mock',
      },
    });
  });

  // AI endpoints
  router.post('/api/ai/recommend', (req, res, next) =>
    recommendationController.recommend(req, res, next)
  );

  router.post('/api/ai/recommend-from-detected', (req, res, next) =>
    recommendationController.recommendFromDetected(req, res, next)
  );

  router.post('/api/ai/chat', (req, res, next) =>
    chatController.chat(req, res, next)
  );

  // Product endpoints
  // Note: More specific routes must be defined before parameterized routes
  router.get('/api/ai/products/search', (req, res, next) =>
    productController.searchProducts(req, res, next)
  );

  router.get('/api/ai/products/categories/by-room-type', (req, res, next) =>
    productController.getCategoriesByRoomType(req, res, next)
  );

  router.get('/api/ai/products/categories', (req, res, next) =>
    productController.getCategories(req, res, next)
  );

  router.get('/api/ai/products/collections', (req, res, next) =>
    productController.getCollections(req, res, next)
  );

  router.post('/api/ai/products/smart-recommend', (req, res, next) =>
    productController.getSmartRecommendations(req, res, next)
  );

  router.post('/api/ai/products/swap-next', (req, res, next) =>
    productController.getNextProductForSwap(req, res, next)
  );

  // This must be last to avoid matching other routes
  router.get('/api/ai/products/:id', (req, res, next) =>
    productController.getProductById(req, res, next)
  );

  // Image processing endpoints
  // Get upload signature for frontend direct upload
  router.get('/api/ai/upload/signature', (req, res, next) =>
    imageController.getUploadSignature(req, res, next)
  );

  // Legacy upload endpoint (kept for backward compatibility)
  router.post('/api/ai/upload', 
    imageController.uploadMiddleware,
    (req, res, next) => imageController.uploadImage(req, res, next)
  );

  router.post('/api/ai/detect', (req, res, next) =>
    imageController.detectFurniture(req, res, next)
  );

  router.post('/api/ai/replace', (req, res, next) =>
    imageController.replaceFurniture(req, res, next)
  );

  router.post('/api/ai/place', (req, res, next) =>
    imageController.placeFurniture(req, res, next)
  );

  router.post('/api/ai/multi-render', (req, res, next) =>
    imageController.generateMultiFurnitureRender(req, res, next)
  );

  return router;
}
