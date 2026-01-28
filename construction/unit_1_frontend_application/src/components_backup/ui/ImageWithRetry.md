# ImageWithRetry 组件

一个带有自动重试机制的图片组件，当图片加载失败时会自动重试，并提供 fallback 图片和手动重试功能。

## 功能特性

- ✅ **自动重试**: 图片加载失败时自动重试，可配置重试次数和延迟
- ✅ **Fallback 支持**: 支持备用图片，重试失败后自动切换
- ✅ **加载状态**: 显示加载中、重试中、错误等状态
- ✅ **手动重试**: 提供重试按钮让用户手动重试
- ✅ **类型化 Fallback**: 根据图片类型自动选择合适的占位图
- ✅ **日志记录**: 开发环境下记录重试过程（可配置）
- ✅ **自定义占位符**: 支持自定义加载和错误状态的占位符

## 基本用法

```tsx
import ImageWithRetry from './ui/ImageWithRetry';

// 基本使用
<ImageWithRetry
  src="https://example.com/image.jpg"
  alt="Product image"
  className="w-full h-full object-cover"
/>

// 指定 fallback 类型
<ImageWithRetry
  src="https://example.com/furniture.jpg"
  alt="Furniture"
  className="w-full h-full object-cover"
  fallbackType="furniture" // 'furniture' | 'room' | 'product'
/>

// 自定义配置
<ImageWithRetry
  src="https://example.com/image.jpg"
  alt="Custom image"
  className="w-full h-full object-cover"
  maxRetries={5}
  retryDelay={2000}
  fallbackSrc="/custom-fallback.jpg"
  onRetry={(retryCount) => console.log(`Retry attempt: ${retryCount}`)}
/>
```

## Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `src` | `string` | - | 图片源地址（必需） |
| `alt` | `string` | - | 图片替代文本（必需） |
| `className` | `string` | `''` | CSS 类名 |
| `style` | `React.CSSProperties` | - | 内联样式 |
| `fallbackSrc` | `string` | - | 自定义备用图片地址 |
| `fallbackType` | `'furniture' \| 'room' \| 'product'` | `'furniture'` | 备用图片类型 |
| `maxRetries` | `number` | `3` | 最大重试次数 |
| `retryDelay` | `number` | `1500` | 重试延迟（毫秒） |
| `onLoad` | `() => void` | - | 图片加载成功回调 |
| `onError` | `(error: Event) => void` | - | 图片加载失败回调 |
| `onRetry` | `(retryCount: number) => void` | - | 重试回调 |
| `placeholder` | `React.ReactNode` | - | 自定义加载占位符 |
| `errorPlaceholder` | `React.ReactNode` | - | 自定义错误占位符 |
| `showRetryButton` | `boolean` | `true` | 是否显示重试按钮 |
| `enableLogging` | `boolean` | 根据环境 | 是否启用日志记录 |

## 配置

全局配置位于 `src/config/imageRetryConfig.ts`：

```typescript
export const imageRetryConfig = {
  maxRetries: 3,           // 默认最大重试次数
  retryDelay: 1500,        // 默认重试延迟
  fallbackImages: {
    furniture: '/images/placeholder-furniture.jpg',
    room: '/images/placeholder-room.jpg',
    product: '/images/placeholder-product.jpg',
  },
  enableLogging: process.env.NODE_ENV === 'development',
};
```

## 使用 Hook

如果需要更灵活的控制，可以直接使用 `useImageRetry` Hook：

```tsx
import { useImageRetry } from '../hooks/useImageRetry';

function CustomImageComponent({ src, alt }) {
  const {
    currentSrc,
    isLoading,
    hasError,
    isRetrying,
    retryCount,
    retry,
    reset,
    _handleLoad,
    _handleError,
  } = useImageRetry(src, {
    maxRetries: 3,
    retryDelay: 1500,
    onRetry: (count) => console.log(`Retry ${count}`),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (hasError) {
    return (
      <div>
        <div>Failed to load image</div>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onLoad={_handleLoad}
      onError={(e) => _handleError(e.nativeEvent)}
    />
  );
}
```

## 状态说明

组件有以下几种状态：

1. **加载中** (`isLoading: true, hasError: false`)
   - 显示加载占位符
   - 如果正在重试，显示重试动画和进度

2. **加载成功** (`isLoading: false, hasError: false`)
   - 显示图片

3. **加载失败** (`isLoading: false, hasError: true`)
   - 显示错误占位符
   - 提供重试按钮（如果启用）

## 重试逻辑

1. 图片加载失败时，自动开始重试
2. 重试时会在原始 URL 后添加时间戳参数强制刷新
3. 达到最大重试次数后，如果有 fallback 图片，会尝试加载 fallback
4. 如果 fallback 也失败，显示错误状态
5. 用户可以随时点击重试按钮手动重试

## 最佳实践

1. **为不同类型的图片使用合适的 fallbackType**：
   ```tsx
   // 家具图片
   <ImageWithRetry src={furnitureUrl} fallbackType="furniture" />
   
   // 房间图片
   <ImageWithRetry src={roomUrl} fallbackType="room" />
   
   // 产品图片
   <ImageWithRetry src={productUrl} fallbackType="product" />
   ```

2. **在生产环境中关闭日志**：
   ```tsx
   <ImageWithRetry src={url} enableLogging={false} />
   ```

3. **为重要图片设置更多重试次数**：
   ```tsx
   <ImageWithRetry src={importantUrl} maxRetries={5} />
   ```

4. **使用回调监控图片加载情况**：
   ```tsx
   <ImageWithRetry
     src={url}
     onRetry={(count) => analytics.track('image_retry', { count })}
     onError={(error) => analytics.track('image_error', { error })}
   />
   ```