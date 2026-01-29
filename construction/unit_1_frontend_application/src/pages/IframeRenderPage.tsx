import { useState } from 'react';
import { AlertCircle, RefreshCw, Sparkles, Upload, Search, CheckCircle, Loader2 } from 'lucide-react';
import { RenderProgress } from '../components/iframe/RenderProgress';
import { RenderUploadArea } from '../components/iframe/RenderUploadArea';
import { RenderPreview } from '../components/iframe/RenderPreview';
import { Button } from '../components/ui/button';
import { useIframeMessage } from '../hooks/useIframeMessage';
import { aiApi } from '../services/aiApi';
import { uploadToCloudinary, validateImageFile } from '../utils/cloudinaryUpload';
import { RenderStatus } from '../types/iframe';
import { DimensionUnit } from '../types/domain';

export function IframeRenderPage() {
  const { furnitureData, sendStatus } = useIframeMessage();
  
  console.log('=== IFRAME RENDER PAGE ===');
  console.log('Current furnitureData:', furnitureData);
  
  const [status, setStatus] = useState<RenderStatus>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>();
  const [renderedImageUrl, setRenderedImageUrl] = useState<string>();
  const [error, setError] = useState<string>();

  // 更新状态并通知父窗口
  const updateStatus = (newStatus: RenderStatus, data?: any) => {
    setStatus(newStatus);
    sendStatus(newStatus, data);
  };

  const handleFileSelect = async (file: File) => {
    // 验证文件
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      updateStatus('error', { error: validation.error });
      return;
    }

    setError(undefined);
    setOriginalImageUrl(undefined);
    setRenderedImageUrl(undefined);

    try {
      // 1. 上传图片
      updateStatus('uploading');
      setUploadProgress(0);
      
      const uploadResult = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress.percentage);
      });
      
      setOriginalImageUrl(uploadResult.imageUrl);
      updateStatus('uploading', { 
        progress: 100,
        originalImageUrl: uploadResult.imageUrl 
      });

      // 2. 检测房间（AI 识别房间类型和尺寸）
      updateStatus('detecting');

      const detectionResult = await aiApi.detectRoom({
        imageUrl: uploadResult.imageUrl,
        roomDimensions: {
          length: 15,
          width: 12,
          height: 8,
          unit: DimensionUnit.FEET,
        },
      });

      console.log('Detection result:', detectionResult);

      // 3. 生成渲染图（使用 AI 识别的房间信息）
      if (!furnitureData?.furniture || furnitureData.furniture.length === 0) {
        throw new Error('No furniture data provided');
      }

      updateStatus('rendering');

      const renderResult = await aiApi.generateMultiRender({
        imageUrl: uploadResult.imageUrl,
        selectedFurniture: furnitureData.furniture.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.renderImageUrl || item.imageUrl,
        })),
        roomType: detectionResult.roomType?.value,
        roomDimensions: detectionResult.roomDimensions ? {
          length: detectionResult.roomDimensions.length,
          width: detectionResult.roomDimensions.width,
          height: detectionResult.roomDimensions.height,
          unit: detectionResult.roomDimensions.unit === 'meters' ? DimensionUnit.METERS : DimensionUnit.FEET,
        } : {
          length: 15,
          width: 12,
          height: 8,
          unit: DimensionUnit.FEET,
        },
      });

      console.log('Render result:', renderResult);

      setRenderedImageUrl(renderResult.processedImageUrl);
      updateStatus('completed', {
        renderedImageUrl: renderResult.processedImageUrl,
        originalImageUrl: uploadResult.imageUrl,
      });

    } catch (err: any) {
      console.error('Render process failed:', err);
      const errorMessage = err.message || 'Failed to process image';
      setError(errorMessage);
      updateStatus('error', { error: errorMessage });
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setUploadProgress(0);
    setOriginalImageUrl(undefined);
    setRenderedImageUrl(undefined);
    setError(undefined);
    updateStatus('idle');
  };

  // 模拟渲染完成效果（仅用于开发预览）
  const handleMockComplete = () => {
    const mockOriginalUrl = 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800';
    const mockRenderedUrl = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800';
    
    setOriginalImageUrl(mockOriginalUrl);
    setRenderedImageUrl(mockRenderedUrl);
    updateStatus('completed', {
      originalImageUrl: mockOriginalUrl,
      renderedImageUrl: mockRenderedUrl,
    });
  };

  return (
    <div className="w-[1000px] h-[580px] flex" style={{ backgroundColor: '#f9f7ef' }}>
      {/* 左侧区域 - 纯色背景 */}
      <div 
        className="w-[330px] h-[580px] flex flex-col p-6 relative"
        style={{ 
          backgroundColor: '#f9f7ef',
        }}
      >
        {/* 错误提示 - 在标题上方 */}
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-destructive break-words">{error}</p>
            </div>
          </div>
        )}

        {/* 内容层 - 与右侧卡片顶部对齐 */}
        <div className="relative z-10 flex flex-col mt-[75px]">
          {/* 标题和描述 */}
          <div className="text-left mb-4">
            <h2 className="text-3xl font-semibold mb-2" style={{ color: '#3C101E' }}>
              Visualize Your Space
            </h2>
            <p className="text-sm" style={{ color: '#3C101E' }}>
              Upload your room photo and see how our furniture transforms your space instantly
            </p>
          </div>

          {/* 家具图片展示 - 只显示第一个，使用 renderImageUrl */}
          {furnitureData?.furniture && furnitureData.furniture.length > 0 && (
            <div className="w-32 h-32 rounded-lg overflow-hidden" style={{ backgroundColor: 'transparent' }}>
              <img
                src={furnitureData.furniture[0].renderImageUrl || furnitureData.furniture[0].imageUrl}
                alt={furnitureData.furniture[0].name}
                className="w-full h-full object-contain"
                title={furnitureData.furniture[0].name}
              />
            </div>
          )}
        </div>
      </div>

      {/* 右侧区域 - 无背景图 */}
      <div className="flex-1 flex flex-col gap-4 py-6 pr-8 relative">
        {/* 进度指示器 */}
        <div className="flex justify-center">
          <div className="flex items-start w-full max-w-[260px]">
            {[
              { id: 'upload', label: 'Upload', icon: Upload },
              { id: 'detect', label: 'Detect', icon: Search },
              { id: 'render', label: 'Render', icon: Sparkles },
            ].map((step, index) => {
              const stepStatus = getStepStatus(step.id);
              const nextStepStatus = index < 2 ? getStepStatus([
                { id: 'upload', label: 'Upload', icon: Upload },
                { id: 'detect', label: 'Detect', icon: Search },
                { id: 'render', label: 'Render', icon: Sparkles },
              ][index + 1].id) : 'pending';
              const Icon = step.icon;
              
              return (
                <>
                  <div key={step.id} className="flex flex-col items-center gap-1">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                        ${stepStatus === 'completed' ? 'bg-[rgb(210,92,27)] text-white shadow-sm' : ''}
                        ${stepStatus === 'active' ? 'bg-[rgb(210,92,27)]/15 text-[rgb(210,92,27)] ring-2 ring-[rgb(210,92,27)]/30' : ''}
                        ${stepStatus === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                      `}
                    >
                      {stepStatus === 'completed' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : stepStatus === 'active' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`
                        text-[10px] font-medium transition-colors whitespace-nowrap
                        ${stepStatus === 'completed' || stepStatus === 'active' ? 'text-[rgb(210,92,27)]' : ''}
                      `}
                      style={{ color: stepStatus === 'pending' ? '#3C101E' : undefined }}
                    >
                      {step.label}
                    </span>
                  </div>
                  
                  {index < 2 && (
                    <div 
                      key={`line-${step.id}`}
                      className="flex-1 flex items-center"
                      style={{ height: '32px' }}
                    >
                      <div
                        className={`
                          w-full h-0.5 transition-all duration-300 rounded-full
                          ${nextStepStatus === 'completed' || nextStepStatus === 'active' ? 'bg-[rgb(210,92,27)]' : 'bg-muted'}
                        `}
                      />
                    </div>
                  )}
                </>
              );
            })}
          </div>
        </div>

        {/* 图片区域 - 左右排列 */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* Upload room photo */}
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col">
            {status === 'idle' || status === 'uploading' ? (
              status === 'idle' ? (
                <RenderUploadArea
                  onFileSelect={handleFileSelect}
                  isUploading={false}
                  uploadProgress={uploadProgress}
                />
              ) : (
                <RenderUploadArea
                  onFileSelect={handleFileSelect}
                  isUploading={true}
                  uploadProgress={uploadProgress}
                />
              )
            ) : (
              <RenderPreview
                imageUrl={originalImageUrl}
                isLoading={false}
                title="Upload room photo"
                emptyText="Upload a room photo to start"
              />
            )}
          </div>

          {/* Rendered */}
          <div className="flex-1 border border-border rounded-lg overflow-hidden bg-white shadow-sm">
            <RenderPreview
              imageUrl={renderedImageUrl}
              isLoading={status === 'detecting' || status === 'rendering'}
              title="Rendered"
              emptyText="AI will render furniture in real-time"
            />
          </div>
        </div>

        {/* 底部操作按钮 - 在右侧区域底部 */}
        {(status === 'completed' || status === 'error') && (
          <div className="mt-4">
            <Button
              onClick={handleReset}
              variant="outline"
              className="w-full shadow-sm bg-white"
              size="sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Another Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  function getStepStatus(stepId: string): 'completed' | 'active' | 'pending' {
    if (status === 'completed') return 'completed';
    if (status === 'error') return 'pending';
    
    if (stepId === 'upload') {
      if (status === 'uploading') return 'active';
      if (['detecting', 'rendering', 'completed'].includes(status)) return 'completed';
    }
    if (stepId === 'detect') {
      if (status === 'detecting') return 'active';
      if (['rendering', 'completed'].includes(status)) return 'completed';
    }
    if (stepId === 'render') {
      if (status === 'rendering') return 'active';
      if (status === 'completed') return 'completed';
    }
    
    return 'pending';
  }
}
