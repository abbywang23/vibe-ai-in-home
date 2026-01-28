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
  const isRetryingRef = useRef(false); // Track retry state to prevent concurrent retries

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
    isRetryingRef.current = false;
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
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
    // Clear any existing timeout first
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
    
    // Use functional updates to avoid closure issues
    setRetryCount((currentRetryCount) => {
      if (currentRetryCount >= maxRetries) {
        // Try fallback if available
        setCurrentSrc((currentSrcValue) => {
          if (fallbackSrc && currentSrcValue !== fallbackSrc) {
            if (enableLogging) {
              log('Switching to fallback image', { fallbackSrc, currentSrc: currentSrcValue });
            }
            setRetryCount(0);
            setHasError(false);
            setIsLoading(true);
            setIsRetrying(false);
            onRetry?.(0);
            return fallbackSrc;
          }
          
          // No more retries available
          if (enableLogging) {
            log('Max retries exceeded, giving up', { retryCount: currentRetryCount, maxRetries });
          }
          setHasError(true);
          setIsLoading(false);
          setIsRetrying(false);
          return currentSrcValue;
        });
        return currentRetryCount;
      }

      if (enableLogging) {
        log('Starting retry', { retryCount: currentRetryCount + 1, maxRetries });
      }
      
      setIsRetrying(true);
      setHasError(false);
      isRetryingRef.current = true;
      
      retryTimeoutRef.current = setTimeout(() => {
        const newRetryCount = currentRetryCount + 1;
        setRetryCount(newRetryCount);
        setIsLoading(true);
        setIsRetrying(false);
        isRetryingRef.current = false;
        
        // Force reload by adding timestamp
        const separator = originalSrcRef.current.includes('?') ? '&' : '?';
        const newSrc = `${originalSrcRef.current}${separator}_retry=${Date.now()}`;
        setCurrentSrc(newSrc);
        
        if (enableLogging) {
          log('Retry attempt', { retryCount: newRetryCount, newSrc });
        }
        
        onRetry?.(newRetryCount);
      }, retryDelay);
      
      return currentRetryCount;
    });
  }, [maxRetries, fallbackSrc, retryDelay, onRetry, enableLogging]);

  const handleLoad = useCallback(() => {
    // Clear any pending retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
    }
    
    isRetryingRef.current = false;
    
    if (enableLogging) {
      log('Image loaded successfully', { currentSrc, retryCount });
    }
    setIsLoading(false);
    setHasError(false);
    setIsRetrying(false);
    onLoad?.();
  }, [onLoad, currentSrc, retryCount, enableLogging]);

  const handleError = useCallback((event: Event) => {
    // Don't process error if already retrying to avoid infinite loops
    if (isRetryingRef.current) {
      if (enableLogging) {
        log('Ignoring error during retry', { currentSrc });
      }
      return;
    }
    
    if (enableLogging) {
      log('Image load error', { currentSrc, retryCount, error: event });
    }
    setIsLoading(false);
    onError?.(event);
    
    // Auto retry if we haven't exceeded max retries
    setRetryCount((currentRetryCount) => {
      setCurrentSrc((currentSrcValue) => {
        if (currentRetryCount < maxRetries || (fallbackSrc && currentSrcValue !== fallbackSrc)) {
          // Use a small delay to avoid immediate retry which might cause issues
          setTimeout(() => {
            handleRetry();
          }, 100);
        } else {
          setHasError(true);
        }
        return currentSrcValue;
      });
      return currentRetryCount;
    });
  }, [maxRetries, fallbackSrc, handleRetry, onError, enableLogging, currentSrc, retryCount]);

  const manualRetry = useCallback(() => {
    if (enableLogging) {
      log('Manual retry triggered');
    }
    setRetryCount(0);
    setHasError(false);
    setIsLoading(true);
    setIsRetrying(false);
    isRetryingRef.current = false;
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
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
    isRetryingRef.current = false;
    
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = undefined;
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