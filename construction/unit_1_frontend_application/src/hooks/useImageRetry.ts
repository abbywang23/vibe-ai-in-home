import { useState, useCallback, useRef, useEffect } from 'react';
import { imageRetryConfig } from '../config/imageRetryConfig';

interface UseImageRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  onRetry?: (retryCount: number) => void;
  enableLogging?: boolean;
}

interface UseImageRetryReturn {
  currentSrc: string;
  isLoading: boolean;
  hasError: boolean;
  isRetrying: boolean;
  retryCount: number;
  retry: () => void;
  reset: () => void;
}

const log = (message: string, data?: any) => {
  if (imageRetryConfig.enableLogging) {
    console.log(`[ImageRetry] ${message}`, data || '');
  }
};

export function useImageRetry(
  src: string,
  options: UseImageRetryOptions = {}
): UseImageRetryReturn {
  const {
    maxRetries = imageRetryConfig.maxRetries,
    retryDelay = imageRetryConfig.retryDelay,
    fallbackSrc,
    onLoad,
    onError,
    onRetry,
    enableLogging = imageRetryConfig.enableLogging,
  } = options;

  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const originalSrcRef = useRef(src);

  // Update original src when src changes
  useEffect(() => {
    originalSrcRef.current = src;
    if (enableLogging) {
      log('Image src updated', { src });
    }
  }, [src, enableLogging]);

  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setRetryCount(0);
    setIsLoading(true);
    setHasError(false);
    setIsRetrying(false);
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    if (enableLogging) {
      log('State reset for new image', { src });
    }
  }, [src, enableLogging]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  const handleRetry = useCallback(() => {
    if (retryCount >= maxRetries) {
      // Try fallback if available
      if (fallbackSrc && currentSrc !== fallbackSrc) {
        if (enableLogging) {
          log('Switching to fallback image', { fallbackSrc, currentSrc });
        }
        setCurrentSrc(fallbackSrc);
        setRetryCount(0);
        setHasError(false);
        setIsLoading(true);
        onRetry?.(0);
        return;
      }
      
      // No more retries available
      if (enableLogging) {
        log('Max retries exceeded, giving up', { retryCount, maxRetries });
      }
      setHasError(true);
      setIsLoading(false);
      setIsRetrying(false);
      return;
    }

    if (enableLogging) {
      log('Starting retry', { retryCount: retryCount + 1, maxRetries });
    }
    
    setIsRetrying(true);
    setHasError(false);
    
    retryTimeoutRef.current = setTimeout(() => {
      const newRetryCount = retryCount + 1;
      setRetryCount(newRetryCount);
      setIsLoading(true);
      setIsRetrying(false);
      
      // Force reload by adding timestamp
      const separator = originalSrcRef.current.includes('?') ? '&' : '?';
      const newSrc = `${originalSrcRef.current}${separator}_retry=${Date.now()}`;
      setCurrentSrc(newSrc);
      
      if (enableLogging) {
        log('Retry attempt', { retryCount: newRetryCount, newSrc });
      }
      
      onRetry?.(newRetryCount);
    }, retryDelay);
  }, [retryCount, maxRetries, fallbackSrc, currentSrc, retryDelay, onRetry, enableLogging]);

  const handleLoad = useCallback(() => {
    if (enableLogging) {
      log('Image loaded successfully', { currentSrc, retryCount });
    }
    setIsLoading(false);
    setHasError(false);
    setIsRetrying(false);
    onLoad?.();
  }, [onLoad, currentSrc, retryCount, enableLogging]);

  const handleError = useCallback((event: Event) => {
    if (enableLogging) {
      log('Image load error', { currentSrc, retryCount, error: event });
    }
    setIsLoading(false);
    onError?.(event);
    
    // Auto retry if we haven't exceeded max retries
    if (retryCount < maxRetries || (fallbackSrc && currentSrc !== fallbackSrc)) {
      handleRetry();
    } else {
      setHasError(true);
    }
  }, [retryCount, maxRetries, fallbackSrc, currentSrc, handleRetry, onError, enableLogging]);

  const manualRetry = useCallback(() => {
    if (enableLogging) {
      log('Manual retry triggered');
    }
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setIsRetrying(false);
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // Reset to original src
    setCurrentSrc(originalSrcRef.current);
    onRetry?.(0);
  }, [onRetry, enableLogging]);

  const reset = useCallback(() => {
    if (enableLogging) {
      log('Reset triggered');
    }
    setCurrentSrc(originalSrcRef.current);
    setRetryCount(0);
    setIsLoading(true);
    setHasError(false);
    setIsRetrying(false);
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [enableLogging]);

  return {
    currentSrc,
    isLoading,
    hasError,
    isRetrying,
    retryCount,
    retry: manualRetry,
    reset,
    // Internal handlers for image events
    _handleLoad: handleLoad,
    _handleError: handleError,
  } as UseImageRetryReturn & {
    _handleLoad: () => void;
    _handleError: (event: Event) => void;
  };
}

export default useImageRetry;