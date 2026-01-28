export interface ImageRetryConfig {
  maxRetries: number;
  retryDelay: number;
  fallbackImages: {
    furniture: string;
    room: string;
    product: string;
  };
  enableLogging: boolean;
}

export const defaultImageRetryConfig: ImageRetryConfig = {
  maxRetries: 3,
  retryDelay: 1500, // 1.5 seconds
  fallbackImages: {
    furniture: '/images/placeholder-furniture.jpg',
    room: '/images/placeholder-room.jpg',
    product: '/images/placeholder-product.jpg',
  },
  enableLogging: process.env.NODE_ENV === 'development',
};

// Environment-specific overrides
export const getImageRetryConfig = (): ImageRetryConfig => {
  const config = { ...defaultImageRetryConfig };
  
  // Production optimizations
  if (process.env.NODE_ENV === 'production') {
    config.maxRetries = 2; // Fewer retries in production
    config.retryDelay = 1000; // Faster retries
    config.enableLogging = false;
  }
  
  // Development settings
  if (process.env.NODE_ENV === 'development') {
    config.enableLogging = true;
  }
  
  return config;
};

export const imageRetryConfig = getImageRetryConfig();