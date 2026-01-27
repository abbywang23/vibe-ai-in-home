import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ImageProcessingService } from '../services/ImageProcessingService';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export class ImageController {
  constructor(private imageService: ImageProcessingService) {}

  /**
   * Middleware for handling file upload
   */
  uploadMiddleware = upload.single('image');

  /**
   * POST /api/ai/upload
   * Upload room image
   */
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
        return;
      }

      const result = await this.imageService.uploadImage(
        req.file.buffer,
        req.file.originalname
      );

      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/detect
   * Detect furniture in uploaded image
   */
  async detectFurniture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageUrl, roomDimensions } = req.body;

      if (!imageUrl) {
        res.status(400).json({
          success: false,
          message: 'Image URL is required'
        });
        return;
      }

      if (!roomDimensions) {
        res.status(400).json({
          success: false,
          message: 'Room dimensions are required'
        });
        return;
      }

      const result = await this.imageService.detectFurniture(imageUrl, roomDimensions);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/replace
   * Replace detected furniture with Castlery product
   */
  async replaceFurniture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageUrl, detectedItemId, replacementProductId } = req.body;

      if (!imageUrl || !detectedItemId || !replacementProductId) {
        res.status(400).json({
          success: false,
          message: 'imageUrl, detectedItemId, and replacementProductId are required'
        });
        return;
      }

      const result = await this.imageService.replaceFurniture(
        imageUrl,
        detectedItemId,
        replacementProductId
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/place
   * Place furniture in empty room
   */
  async placeFurniture(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageUrl, productId, imagePosition, rotation, scale } = req.body;

      if (!imageUrl || !productId || !imagePosition) {
        res.status(400).json({
          success: false,
          message: 'imageUrl, productId, and imagePosition are required'
        });
        return;
      }

      const result = await this.imageService.placeFurniture(
        imageUrl,
        productId,
        imagePosition,
        rotation || 0,
        scale || 1.0
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}