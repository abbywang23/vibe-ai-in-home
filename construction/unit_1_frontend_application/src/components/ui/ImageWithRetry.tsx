import React, { useCallback, useRef, useEffect } from 'react';
import { RefreshCw, ImageIcon, AlertCircle } from 'lucide-react';
import { useImageRetry } from '../../hooks/useImageRetry';
import { imageRetryConfig } from '../../config/imageRetryConfig';

interface ImageWithRetryProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  fallbackSrc?: string;
  fallbackType?: 'furniture' | 'room' | 'product';
  maxRetries?: number;
  retryDelay?: number;
  onLoad?: () => void;
  onError?: (error: Event) => void;
  onRetry?: (retryCount: number) => void;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  showRetryButton?: boolean;
  enableLogging?: boolean;
}

export function ImageWithRetry({
  src,
  alt,
  className = '',
  style,
  fallbackSrc,
  fallbackType = 'furniture',
  maxRetries,
  retryDelay,
  onLoad,
  onError,
  onRetry,
  placeholder,
  errorPlaceholder,
  showRetryButton = true,
  enableLogging,
}: ImageWithRetryProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Use provided fallback or get from config based on type
  const effectiveFallbackSrc = fallbackSrc || imageRetryConfig.fallbackImages[fallbackType];
  
  const {
    currentSrc,
    isLoading,
    hasError,
    isRetrying,
    retryCount,
    retry,
    _handleLoad,
    _handleError,
  } = useImageRetry(src, {
    maxRetries,
    retryDelay,
    fallbackSrc: effectiveFallbackSrc,
    onLoad,
    onError,
    onRetry,
    enableLogging,
  }) as any;

  const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    _handleLoad();
  }, [_handleLoad]);

  const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    _handleError(event.nativeEvent);
  }, [_handleError]);

  // Check if image is already loaded (for cached images) when src changes
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalHeight !== 0 && isLoading) {
      // Image is already loaded (from cache), trigger load handler
      _handleLoad();
    }
  }, [currentSrc, isLoading, _handleLoad]);

  // Error state - show error placeholder
  if (hasError && !isRetrying) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted ${className}`}
        style={style}
      >
        {errorPlaceholder || (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-6 h-6" />
            <span className="text-xs text-center">Failed to load image</span>
            {showRetryButton && (
              <button
                onClick={retry}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-background border border-border rounded hover:bg-accent transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Retrying state - show retry indicator
  if (isRetrying) {
    return (
      <div 
        className={`flex items-center justify-center bg-muted ${className}`}
        style={style}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span className="text-xs">Retrying... ({retryCount}/{maxRetries || imageRetryConfig.maxRetries})</span>
        </div>
      </div>
    );
  }

  // Show image - always render the img element, even if loading
  // This allows cached images to display immediately
  // The loading placeholder will be shown via CSS or overlay if needed
  return (
    <div className="relative" style={{ width: style?.width, height: style?.height }}>
      {isLoading && !hasError && (
        <div 
          className={`absolute inset-0 flex items-center justify-center bg-muted z-10`}
        >
          {placeholder || (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-6 h-6" />
              <span className="text-xs">Loading...</span>
            </div>
          )}
        </div>
      )}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={className}
        style={{
          ...style,
          opacity: isLoading && !hasError ? 0 : 1,
          transition: 'opacity 0.2s',
          display: 'block',
        }}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
}

export default ImageWithRetry;