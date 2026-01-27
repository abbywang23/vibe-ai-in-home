import express, { Express } from 'express';
import cors from 'cors';
import { setupRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Create and configure Express application
 */
export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS configuration
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  // In development, allow any origin from the same network
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow configured origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // In development, allow any localhost or local network IP
      if (process.env.NODE_ENV === 'development') {
        const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
        const isLocalNetwork = /^https?:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin) || 
                              /^https?:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) ||
                              /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+:\d+$/.test(origin);
        
        if (isLocalhost || isLocalNetwork) {
          return callback(null, true);
        }
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  // Request logging with CORS info
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'}`);
    next();
  });

  // Setup routes
  const router = setupRoutes();
  app.use(router);

  // Error handlers (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
