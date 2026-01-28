import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
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
   * GET /api/ai/upload/signature
   * Get Cloudinary upload signature for frontend direct upload
   */
  async getUploadSignature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cloudinaryConfig = {
        apiKey: process.env.CLOUDINARY_API_KEY || '117752995173679',
        apiSecret: process.env.CLOUDINARY_API_SECRET || 'OGiujqsUNHsYduK3mg96lEg_L4I',
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'dyurkavye'
      };

      // Generate timestamp (valid for 1 hour)
      const timestamp = Math.floor(Date.now() / 1000);
      
      // Generate unique public_id
      const randomId = crypto.randomBytes(8).toString('hex');
      const publicId = `user_uploads/room_${timestamp}_${randomId}`;
      
      // Generate signature: sha1(public_id=xxx&timestamp=xxx + api_secret)
      const signatureString = `public_id=${publicId}&timestamp=${timestamp}${cloudinaryConfig.apiSecret}`;
      const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

      res.json({
        success: true,
        apiKey: cloudinaryConfig.apiKey,
        cloudName: cloudinaryConfig.cloudName,
        timestamp,
        signature,
        publicId,
        // Signature is valid for 1 hour (3600 seconds)
        expiresAt: timestamp + 3600
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/ai/upload
   * Upload room image (kept for backward compatibility, but not used as fallback)
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
        req.file.originalname,
        req
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

  /**
   * POST /api/ai/multi-render
   * Generate multi-furniture render using image fusion
   */
  async generateMultiFurnitureRender(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { imageUrl, selectedFurniture, roomType } = req.body;

      if (!imageUrl || !selectedFurniture || !Array.isArray(selectedFurniture)) {
        res.status(400).json({
          success: false,
          message: 'imageUrl and selectedFurniture array are required'
        });
        return;
      }

      if (selectedFurniture.length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one furniture item must be selected'
        });
        return;
      }

      const result = await this.imageService.generateMultiFurnitureRender(
        imageUrl,
        selectedFurniture,
        roomType || 'living room',
        req
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}