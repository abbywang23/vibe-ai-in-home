import { useState, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Home, 
  Ruler, 
  Sofa, 
  Palette,
  RefreshCw,
  DollarSign,
  Eye,
  ShoppingCart,
  Download,
  Share2,
  Zap,
  ChevronDown,
  ChevronUp,
  Lock,
  Check,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';
import { FurnitureComparisonCard } from './FurnitureComparisonCard';
import { aiApi } from '../services/aiApi';
import { RoomDimensions, FurnitureDimensions } from '../types/domain';

type StepId = 'upload' | 'vision' | 'selection' | 'confirmation';
type StepStatus = 'pending' | 'active' | 'completed' | 'locked';
type RoomIntent = 'refresh' | 'new';
type RoomSize = 'small' | 'medium' | 'large' | 'xlarge';

interface RoomSetup {
  intent: RoomIntent;
  roomType: string;
  width: number;
  length: number;
}

interface RoomData {
  imageUrl: string;
  roomType: string;
  dimensions: string;
  furniture: string[];
  style: string;
  confidence: number;
}

interface DesignPreferences {
  intent: 'refresh' | 'redesign';
  style: string;
  budget: { min: number; max: number };
}

interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  reason: string;
  dimensions: string;
  existingItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
  };
  isSelected?: boolean;
}

export type { FurnitureItem };

interface Step {
  id: StepId;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: StepStatus;
}

export function DesignStudio() {
  // 🔍 DEBUG: 确认这是 unit_1_frontend_application 的版本
  console.log('🎯 DesignStudio loaded from unit_1_frontend_application with API integration');
  console.log('📍 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET - Please configure VITE_API_BASE_URL in .env');
  
  const [steps, setSteps] = useState<Step[]>([
    { id: 'upload', number: 1, title: 'Room Setup', subtitle: 'Define room parameters', icon: <Upload className="w-5 h-5" />, status: 'active' },
    { id: 'vision', number: 2, title: 'Design Vision', subtitle: 'Define style & preferences', icon: <Palette className="w-5 h-5" />, status: 'pending' },
    { id: 'selection', number: 3, title: 'Furniture Selection', subtitle: 'Review AI recommendations', icon: <Sofa className="w-5 h-5" />, status: 'pending' },
    { id: 'confirmation', number: 4, title: 'Final Review', subtitle: 'Generate & purchase', icon: <Eye className="w-5 h-5" />, status: 'pending' }
  ]);

  const [expandedStep, setExpandedStep] = useState<StepId>('upload');
  const [roomSetup, setRoomSetup] = useState<RoomSetup>({
    intent: 'refresh',
    roomType: 'Living Room',
    width: 12,
    length: 15
  });
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [preferences, setPreferences] = useState<DesignPreferences>({
    intent: 'refresh',
    style: 'Modern Minimalist',
    budget: { min: 2000, max: 5000 }
  });
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingFurniture, setIsLoadingFurniture] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);

  // Update step status helper
  const updateStepStatus = (stepId: StepId, status: StepStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Handle step completion
  const completeStep = (stepId: StepId) => {
    updateStepStatus(stepId, 'completed');
    
    // Activate next step
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      updateStepStatus(nextStep.id, 'active');
      setExpandedStep(nextStep.id);
    }
  };

  // Handle step back - go to previous step
  const goBackToStep = (stepId: StepId) => {
    const stepIndex = steps.findIndex(s => s.id === stepId);
    
    // Set this step as active
    updateStepStatus(stepId, 'active');
    setExpandedStep(stepId);
    
    // Set all following steps as pending
    steps.forEach((step, index) => {
      if (index > stepIndex) {
        updateStepStatus(step.id, 'pending');
      }
    });
    
    // Reset states based on which step we're going back to
    if (stepId === 'upload') {
      // Going back to upload - keep roomData but allow re-upload
      setShowFinalResult(false);
    } else if (stepId === 'vision') {
      // Going back to vision - keep furniture but allow re-selection
      setShowFinalResult(false);
    } else if (stepId === 'selection') {
      // Going back to selection - allow re-selection
      setShowFinalResult(false);
    }
  };

  // Helper function to convert width/length to room dimensions
  const getRoomDimensionsFromSize = (width: number, length: number): RoomDimensions => {
    // Convert feet to meters (1 foot = 0.3048 meters)
    const widthMeters = width * 0.3048;
    const lengthMeters = length * 0.3048;
    return {
      length: Math.round(lengthMeters * 10) / 10,
      width: Math.round(widthMeters * 10) / 10,
      height: 2.8,
      unit: 'meters'
    };
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    try {
      // 1. 立即开始 loading 状态
      setIsAnalyzing(true);
      
      // 2. 上传图片
      console.log('Uploading image...');
      const uploadResponse = await aiApi.uploadImage(file);
      console.log('Upload response:', uploadResponse);
      
      // 3. 设置图片 URL，让用户看到上传的图片（loading 继续显示）
      setRoomData({
        imageUrl: uploadResponse.imageUrl,
        roomType: roomSetup.roomType,
        dimensions: `${roomSetup.width}' × ${roomSetup.length}'`,
        furniture: [],
        style: 'Modern',
        confidence: 0
      });
      
      console.log('Detecting furniture...');
      const roomDimensions = getRoomDimensionsFromSize(roomSetup.width, roomSetup.length);
      const detectResponse = await aiApi.detectRoom({
        imageUrl: uploadResponse.imageUrl,
        roomDimensions: roomDimensions
      });
      console.log('Detect response:', detectResponse);
      
      // 3. 更新状态 - 适配新的响应格式
      const detectedRoomType = detectResponse.roomType?.value || roomSetup.roomType;
      const detectedDimensions = detectResponse.roomDimensions 
        ? `${detectResponse.roomDimensions.length}×${detectResponse.roomDimensions.width}m`
        : `${roomDimensions.length}×${roomDimensions.width}m`;
      const detectedFurniture = detectResponse.detectedItems.map(item => item.furnitureType);
      const detectedStyle = detectResponse.roomStyle?.value || 'Modern';
      const confidence = detectResponse.roomType?.confidence || detectResponse.roomStyle?.confidence || 85;
      
      const data: RoomData = {
        imageUrl: uploadResponse.imageUrl,
        roomType: detectedRoomType,
        dimensions: detectedDimensions,
        furniture: detectedFurniture,
        style: detectedStyle,
        confidence: confidence
      };
      
      setRoomData(data);
      setPreferences(prev => ({ ...prev, style: data.style }));
      
    } catch (error) {
      console.error('Error uploading/analyzing image:', error);
      // 降级到模拟数据
      const data: RoomData = {
        imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
        roomType: 'Living Room',
        dimensions: "12' × 15'",
        furniture: ['Sofa', 'Coffee Table', 'Armchair'],
        style: 'Modern Minimalist',
        confidence: 95
      };
      setRoomData(data);
      setPreferences(prev => ({ ...prev, style: data.style }));
      alert('Failed to analyze image. Using demo data.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle upload step completion
  const handleUploadComplete = () => {
    completeStep('upload');
  };

  // Handle vision step completion
  const handleVisionComplete = async () => {
    completeStep('vision');
    setIsLoadingFurniture(true);
    
    try {
      // 调用智能推荐 API
      console.log('Getting smart recommendations...');
      const roomDimensions = getRoomDimensionsFromSize(roomSetup.width, roomSetup.length);
      const response = await aiApi.getSmartRecommendations({
        roomType: roomData?.roomType || roomSetup.roomType,
        roomDimensions: roomDimensions,
        preferences: {
          selectedCategories: preferences.intent === 'refresh' ? roomData?.furniture : undefined,
          budget: preferences.budget ? {
            amount: preferences.budget.max,
            currency: 'SGD'
          } : undefined
        },
        language: 'en'
      });
      console.log('Recommendations response:', response);
      
      // 更新家具列表 - 适配新的响应格式
      // 解析 reasoning 文本，提取每个产品的解释
      const parseReasoningForProduct = (reasoningText: string | undefined, productId: string, productName: string, category: string): string => {
        if (!reasoningText || typeof reasoningText !== 'string') {
          return `AI selected this ${category} based on your room size, style preferences, and budget.`;
        }
        
        // 如果 reasoning 是 JSON 字符串，尝试解析
        let reasoning: string = reasoningText;
        try {
          const parsed = JSON.parse(reasoningText);
          if (parsed.reasoning && typeof parsed.reasoning === 'string') {
            reasoning = parsed.reasoning;
          } else if (typeof parsed === 'string') {
            reasoning = parsed;
          } else {
            // 如果是对象但不是字符串，转换为字符串
            reasoning = JSON.stringify(parsed);
          }
        } catch {
          // 不是 JSON，直接使用原文本
        }
        
        // 确保 reasoning 是字符串
        if (typeof reasoning !== 'string') {
          return `AI selected this ${category} based on your room size, style preferences, and budget.`;
        }
        
        // 尝试从长文本中提取该产品的解释
        // 查找包含产品ID或产品名称的部分
        const productIdPattern = new RegExp(`product-\\d+|${productId}`, 'i');
        const productNamePattern = new RegExp(productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        
        // 尝试找到该产品的解释段落
        const lines = reasoning.split('\n');
        let productReason = '';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (productIdPattern.test(line) || productNamePattern.test(line)) {
            // 提取该产品相关的解释（当前行和后续几行）
            const explanationLines: string[] = [line];
            for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
              if (lines[j].trim() && !lines[j].match(/^\d+\./)) {
                explanationLines.push(lines[j]);
              } else if (lines[j].match(/^\d+\./)) {
                break; // 遇到下一个产品编号，停止
              }
            }
            productReason = explanationLines.join(' ').trim();
            break;
          }
        }
        
        // 如果找到了特定产品的解释，使用它；否则使用通用解释
        if (productReason) {
          // 清理 Markdown 格式
          return productReason
            .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
            .replace(/\n\n/g, ' ') // 替换双换行
            .replace(/\n/g, ' ') // 替换单换行
            .replace(/product-\d+/gi, '') // 移除产品ID引用
            .trim();
        }
        
        // 如果没有找到特定解释，返回通用文本
        return `AI selected this ${category} based on your room size, style preferences, and budget.`;
      };
      
      const furnitureWithSelection = response.products.map((item, index) => {
        // 处理 dimensions：将 FurnitureDimensions 对象转换为字符串
        const dims = item.dimensions as FurnitureDimensions;
        const unit = dims.unit || 'cm';
        const dimensionsStr = `${dims.width}${unit} W × ${dims.depth}${unit} D × ${dims.height}${unit} H`;
        
        // 提取该产品的 reasoning
        const productReason = parseReasoningForProduct(response.reasoning, item.id, item.name, item.category);
        
        return {
          ...item,
          dimensions: dimensionsStr,
          isSelected: true,
          reason: typeof productReason === 'string' ? productReason : String(productReason || 'AI recommended'),
          // 确保 imageUrl 存在（使用第一个图片）
          imageUrl: item.images && item.images.length > 0 ? item.images[0].url : item.imageUrl || '',
        } as FurnitureItem;
      });
      setSelectedFurniture(furnitureWithSelection);
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // 降级到模拟数据
      const furniture: FurnitureItem[] = [
        {
          id: '1',
          name: 'Aria Sofa',
          category: 'Sofa',
          price: 1899,
          imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
          reason: 'Upgraded comfort with modern design, better lumbar support and premium fabric',
          dimensions: '84" W × 36" D × 32" H',
          existingItem: {
            name: 'Old Fabric Sofa',
            imageUrl: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400&q=80',
            estimatedValue: 800
          },
          isSelected: true
        },
        {
          id: '2',
          name: 'Oslo Coffee Table',
          category: 'Coffee Table',
          price: 549,
          imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&q=80',
          reason: 'Sleeker profile with hidden storage compartments, matches sofa finish perfectly',
          dimensions: '48" W × 24" D × 18" H',
          existingItem: {
            name: 'Wooden Coffee Table',
            imageUrl: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=400&q=80',
            estimatedValue: 300
          },
          isSelected: true
        },
        {
          id: '3',
          name: 'Bergen Armchair',
          category: 'Armchair',
          price: 649,
          imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80',
          reason: 'Better ergonomics with improved back support, complements new sofa design',
          dimensions: '32" W × 34" D × 35" H',
          existingItem: {
            name: 'Vintage Armchair',
            imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80',
            estimatedValue: 450
          },
          isSelected: true
        }
      ];
      setSelectedFurniture(furniture);
      alert('Failed to get recommendations. Using demo data.');
    } finally {
      setIsLoadingFurniture(false);
    }
  };

  // Toggle furniture item selection
  const handleToggleFurniture = (id: string) => {
    setSelectedFurniture(prev => prev.map(item => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  // Handle selection step completion
  const handleSelectionComplete = () => {
    completeStep('selection');
  };

  // Handle render generation
  const handleGenerateRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    
    try {
      const selectedItems = selectedFurniture.filter(item => item.isSelected);
      
      // 模拟进度更新
      const progressInterval = setInterval(() => {
        setRenderProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);
      
      // 调用渲染 API
      console.log('Generating multi-render...');
      const response = await aiApi.generateMultiRender({
        imageUrl: roomData?.imageUrl || '',
        selectedFurniture: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl
        })),
        roomType: roomData?.roomType || roomSetup.roomType
      });
      console.log('Render response:', response);
      
      clearInterval(progressInterval);
      setRenderProgress(100);
      
      // 更新房间图片为渲染结果 - 适配新的响应格式
      const renderedImage = response.processedImageUrl || response.renderedImageUrl;
      if (renderedImage) {
        setRoomData(prev => prev ? {
          ...prev,
          imageUrl: renderedImage
        } : null);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowFinalResult(true);
      completeStep('confirmation');
      
    } catch (error) {
      console.error('Error generating render:', error);
      // 降级：使用原图
      const steps = [15, 40, 65, 85, 100];
      for (const progress of steps) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setRenderProgress(progress);
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      setShowFinalResult(true);
      completeStep('confirmation');
      alert('Failed to generate render. Showing original image.');
    } finally {
      setIsRendering(false);
    }
  };

  const totalCost = selectedFurniture.filter(item => item.isSelected).reduce((sum, item) => sum + item.price, 0);
  const withinBudget = totalCost <= preferences.budget.max;

  const activeStep = steps.find(s => s.status === 'active');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-primary sticky top-0 z-20">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-primary-foreground mb-1">AI Interior Design Studio</h3>
            <p className="text-primary-foreground/80" style={{ fontSize: 'var(--text-caption)' }}>
              {activeStep && `Step ${activeStep.number}/4: ${activeStep.title}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors" style={{ fontSize: 'var(--text-base)' }}>
              Save Progress
            </button>
            <button className="px-4 py-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors" style={{ fontSize: 'var(--text-base)' }}>
              Help
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Vertical Stepper */}
        <div className="w-[480px] border-r border-border bg-card overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isExpanded={expandedStep === step.id}
                  onToggle={() => {
                    if (step.status === 'active' || step.status === 'completed') {
                      setExpandedStep(expandedStep === step.id ? null as any : step.id);
                      // If clicking on a completed step to expand it, allow re-editing
                      if (step.status === 'completed' && expandedStep !== step.id) {
                        goBackToStep(step.id);
                      }
                    }
                  }}
                  isLast={index === steps.length - 1}
                >
                  {step.id === 'upload' && (
                    <UploadStepContent
                      roomSetup={roomSetup}
                      onRoomSetupChange={setRoomSetup}
                      roomData={roomData}
                      isAnalyzing={isAnalyzing}
                      onUpload={handleImageUpload}
                      onComplete={handleUploadComplete}
                      isCompleted={step.status === 'completed'}
                    />
                  )}
                  {step.id === 'vision' && roomData && (
                    <VisionStepContent
                      roomData={roomData}
                      preferences={preferences}
                      onPreferencesChange={setPreferences}
                      onComplete={handleVisionComplete}
                      isCompleted={step.status === 'completed'}
                    />
                  )}
                  {step.id === 'selection' && (
                    <SelectionStepContent
                      selectedFurniture={selectedFurniture}
                      onToggleFurniture={handleToggleFurniture}
                      isLoading={isLoadingFurniture}
                      totalCost={totalCost}
                      budget={preferences.budget}
                      withinBudget={withinBudget}
                      onComplete={handleSelectionComplete}
                      isCompleted={step.status === 'completed'}
                    />
                  )}
                  {step.id === 'confirmation' && (
                    <ConfirmationStepContent
                      onGenerate={handleGenerateRender}
                      isRendering={isRendering}
                      showFinalResult={showFinalResult}
                      totalCost={totalCost}
                    />
                  )}
                </StepCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Visualization Area */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Rendering Canvas - 80% of viewport height minus header */}
          <div className="overflow-y-auto" style={{ height: 'calc(80vh - 73px)' }}>
            <RenderingCanvas
              roomData={roomData}
              isAnalyzing={isAnalyzing}
              isRendering={isRendering}
              renderProgress={renderProgress}
              showFinalResult={showFinalResult}
              preferences={preferences}
              selectedFurniture={selectedFurniture}
              totalCost={totalCost}
              onUpload={handleImageUpload}
            />
          </div>

          {/* Furniture List Panel - Remaining height (auto) */}
          <div className="flex-1 border-t border-border bg-card overflow-y-auto">
            <FurnitureListPanel
              selectedFurniture={selectedFurniture}
              isLoading={isLoadingFurniture}
              totalCost={totalCost}
              showFinalResult={showFinalResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Card Component
interface StepCardProps {
  step: Step;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  children: React.ReactNode;
}

function StepCard({ step, isExpanded, onToggle, isLast, children }: StepCardProps) {
  const canInteract = step.status === 'active' || step.status === 'completed';
  const isCompleted = step.status === 'completed';
  const isPending = step.status === 'pending';
  const isActive = step.status === 'active';

  return (
    <div className="relative">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-[44px] bottom-[-16px] w-0.5 bg-border" />
      )}

      <div
        className={`relative rounded-lg border transition-all ${
          isExpanded && canInteract
            ? 'border-primary shadow-sm bg-background'
            : isCompleted
            ? 'border-border bg-background'
            : isPending
            ? 'border-border bg-muted/20'
            : 'border-border bg-background'
        }`}
      >
        {/* Step Header */}
        <button
          onClick={() => {
            if (canInteract) {
              onToggle();
              // If clicking on a completed step, allow editing
              if (isCompleted) {
                // This will be handled by the parent component
              }
            }
          }}
          disabled={!canInteract}
          className={`w-full p-4 flex items-center gap-4 text-left transition-colors ${
            !canInteract ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/30'
          }`}
        >
          {/* Step Number/Status Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              isCompleted
                ? 'bg-primary text-primary-foreground'
                : isActive
                ? 'bg-primary/10 text-primary border-2 border-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5" />
            ) : isPending ? (
              <Lock className="w-5 h-5" />
            ) : (
              step.icon
            )}
          </div>

          {/* Step Info */}
          <div className="flex-1 min-w-0">
            <h5 className="mb-0.5">{step.title}</h5>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              {step.subtitle}
            </p>
          </div>

          {/* Expand/Collapse Icon */}
          {canInteract && (
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </button>

        {/* Step Content */}
        {isExpanded && canInteract && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="pt-4">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Upload Step Content
function UploadStepContent({ roomSetup, onRoomSetupChange, roomData, isAnalyzing, onUpload, onComplete, isCompleted }: {
  roomSetup: RoomSetup;
  onRoomSetupChange: (setup: RoomSetup) => void;
  roomData: RoomData | null;
  isAnalyzing: boolean;
  onUpload: (file: File) => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Room Intent Selection */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Design Intent</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onRoomSetupChange({ ...roomSetup, intent: 'refresh' })}
            disabled={isCompleted}
            className={`p-4 rounded-lg border text-left transition-all ${
              roomSetup.intent === 'refresh'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-background'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <span className="font-medium" style={{ fontSize: 'var(--text-base)' }}>Refresh Room</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Keep existing layout, replace furniture
            </p>
          </button>
          <button
            onClick={() => onRoomSetupChange({ ...roomSetup, intent: 'new' })}
            disabled={isCompleted}
            className={`p-4 rounded-lg border text-left transition-all ${
              roomSetup.intent === 'new'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-background'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium" style={{ fontSize: 'var(--text-base)' }}>Furnish Room</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Furnish your room with new furniture
            </p>
          </button>
        </div>
      </div>

      {/* Room Type Selection */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Room Type</label>
        <select
          value={roomSetup.roomType}
          onChange={(e) => onRoomSetupChange({ ...roomSetup, roomType: e.target.value })}
          disabled={isCompleted}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-colors"
          style={{ fontSize: 'var(--text-base)' }}
        >
          <option value="Living Room">Living Room</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Dining Room">Dining Room</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Home Office">Home Office</option>
          <option value="Bathroom">Bathroom</option>
          <option value="Entryway">Entryway</option>
          <option value="Kids Room">Kids Room</option>
          <option value="Guest Room">Guest Room</option>
          <option value="Basement">Basement</option>
        </select>
      </div>

      {/* Room Dimensions Input */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Room Dimensions (feet)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Width</label>
            <input
              type="number"
              min="1"
              max="100"
              value={roomSetup.width}
              onChange={(e) => onRoomSetupChange({ ...roomSetup, width: Number(e.target.value) || 1 })}
              disabled={isCompleted}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-colors"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>
          <div>
            <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Length</label>
            <input
              type="number"
              min="1"
              max="100"
              value={roomSetup.length}
              onChange={(e) => onRoomSetupChange({ ...roomSetup, length: Number(e.target.value) || 1 })}
              disabled={isCompleted}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-colors"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>
        </div>
        <p className="text-muted-foreground mt-2 flex items-center gap-1" style={{ fontSize: 'var(--text-small)' }}>
          <Ruler className="w-3 h-3" />
          Room size: {roomSetup.width}' × {roomSetup.length}' ({roomSetup.width * roomSetup.length} sq ft)
        </p>
      </div>

      {/* Confirm & Continue Button */}
      {roomData ? (
        <button
          onClick={onComplete}
          disabled={isCompleted}
          className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Confirm & Continue
        </button>
      ) : (
        <div>
          <button
            disabled
            className="w-full px-6 py-3 bg-muted text-muted-foreground rounded-lg cursor-not-allowed"
          >
            Confirm & Continue
          </button>
          <p className="text-center text-muted-foreground mt-2" style={{ fontSize: 'var(--text-small)' }}>
            Please upload a room photo first
          </p>
        </div>
      )}
    </div>
  );
}

// Vision Step Content
function VisionStepContent({ roomData, preferences, onPreferencesChange, onComplete, isCompleted }: {
  roomData: RoomData;
  preferences: DesignPreferences;
  onPreferencesChange: (prefs: DesignPreferences) => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Style */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Style Preference</label>
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-2 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <p style={{ fontSize: 'var(--text-small)' }}>
            AI recommends: <strong>{roomData.style}</strong>
          </p>
        </div>
        <select
          value={preferences.style}
          onChange={(e) => onPreferencesChange({ ...preferences, style: e.target.value })}
          disabled={isCompleted}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-colors"
          style={{ fontSize: 'var(--text-base)' }}
        >
          <option value="Modern Minimalist">Modern Minimalist</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Scandinavian">Scandinavian</option>
          <option value="Industrial">Industrial</option>
          <option value="Mid-Century Modern">Mid-Century Modern</option>
          <option value="Traditional">Traditional</option>
          <option value="Transitional">Transitional</option>
          <option value="Bohemian">Bohemian</option>
          <option value="Rustic">Rustic</option>
          <option value="Farmhouse">Farmhouse</option>
          <option value="Coastal">Coastal</option>
          <option value="Eclectic">Eclectic</option>
          <option value="Art Deco">Art Deco</option>
          <option value="Mediterranean">Mediterranean</option>
        </select>
      </div>

      {/* Budget */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Budget Range</label>
        <div className="bg-background border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-base)' }}>
              ${preferences.budget.min.toLocaleString()} - ${preferences.budget.max.toLocaleString()}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Min</span>
              <span style={{ fontSize: 'var(--text-small)' }}>${preferences.budget.min.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={preferences.budget.min}
              onChange={(e) => onPreferencesChange({ ...preferences, budget: { ...preferences.budget, min: Number(e.target.value) } })}
              disabled={isCompleted}
              className="w-full accent-primary disabled:opacity-60"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Max</span>
              <span style={{ fontSize: 'var(--text-small)' }}>${preferences.budget.max.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={preferences.budget.max}
              onChange={(e) => onPreferencesChange({ ...preferences, budget: { ...preferences.budget, max: Number(e.target.value) } })}
              disabled={isCompleted}
              className="w-full accent-primary disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={onComplete}
          className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
        >
          Confirm & Continue
        </button>
      )}
    </div>
  );
}

// Selection Step Content
function SelectionStepContent({ selectedFurniture, onToggleFurniture, isLoading, totalCost, budget, withinBudget, onComplete, isCompleted }: {
  selectedFurniture: FurnitureItem[];
  onToggleFurniture: (id: string) => void;
  isLoading: boolean;
  totalCost: number;
  budget: { min: number; max: number };
  withinBudget: boolean;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
        <h5 className="mb-1">AI is selecting furniture...</h5>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
          Analyzing thousands of products
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Budget Summary */}
      <div className={`rounded-lg p-3 border ${
        withinBudget 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-destructive/5 border-destructive/20'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className={`w-5 h-5 ${withinBudget ? 'text-primary' : 'text-destructive'}`} />
            <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>
              {selectedFurniture.length} Items Selected
            </span>
          </div>
          <span className={`font-medium ${withinBudget ? 'text-primary' : 'text-destructive'}`} style={{ fontSize: 'var(--text-h5)' }}>
            ${totalCost.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            Budget: ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}
          </p>
          {withinBudget ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Within budget</span>
            </div>
          ) : (
            <span className="text-destructive" style={{ fontSize: 'var(--text-small)' }}>
              ${(totalCost - budget.max).toLocaleString()} over budget
            </span>
          )}
        </div>
      </div>

      {/* AI Selection Note */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          AI selected these items based on your room size, style preferences, and budget. Each item includes an explanation.
        </p>
      </div>

      {/* Furniture Items */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {selectedFurniture.map((item, index) => (
          <FurnitureCard key={item.id} item={item} index={index} isCompleted={isCompleted} onToggle={onToggleFurniture} />
        ))}
      </div>

      {/* Confirm Button */}
      {!isCompleted && (
        <button
          onClick={onComplete}
          disabled={!withinBudget}
          className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {withinBudget ? (
            <>
              <Check className="w-5 h-5" />
              Confirm Selection
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Adjust Budget or Items
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Furniture Card Component
function FurnitureCard({ item, index, isCompleted, onToggle }: { item: FurnitureItem; index: number; isCompleted: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all group">
      <div className="flex gap-3 p-3">
        {/* Product Image */}
        <div className="w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0" style={{ fontSize: 'var(--text-small)' }}>
                  {index + 1}
                </span>
                <h5 className="truncate">{item.name}</h5>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                {item.category}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-primary font-medium" style={{ fontSize: 'var(--text-h5)' }}>
                ${item.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Dimensions */}
          <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
            <Ruler className="w-3.5 h-3.5 flex-shrink-0" />
            <span style={{ fontSize: 'var(--text-small)' }}>{item.dimensions}</span>
          </div>

          {/* AI Reason */}
          <div className="bg-accent/5 border border-accent/20 rounded px-2 py-1.5 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              {typeof item.reason === 'string' ? item.reason : (item.reason ? String(item.reason) : 'AI recommended')}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="border-t border-border px-3 py-2 flex items-center gap-2">
          <button className="flex-1 px-3 py-1.5 bg-card border border-border rounded hover:border-primary transition-colors flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span style={{ fontSize: 'var(--text-small)' }}>Swap Item</span>
          </button>
          <button className="px-3 py-1.5 bg-card border border-border rounded hover:border-destructive hover:text-destructive transition-colors flex items-center justify-center gap-1.5" onClick={() => onToggle(item.id)}>
            <span style={{ fontSize: 'var(--text-small)' }}>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Confirmation Step Content
function ConfirmationStepContent({ onGenerate, isRendering, showFinalResult, totalCost }: {
  onGenerate: () => void;
  isRendering: boolean;
  showFinalResult: boolean;
  totalCost: number;
}) {
  return (
    <div className="space-y-4">
      {!showFinalResult ? (
        <>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h5 className="mb-2">Ready to Generate</h5>
            <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-caption)' }}>
              AI will place your selected furniture into the room with realistic lighting and shadows
            </p>
            <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              <Zap className="w-4 h-4" />
              <span>Estimated time: 15-20 seconds</span>
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={isRendering}
            className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Generate Rendering
              </>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h5 className="text-primary">Rendering Complete!</h5>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Your redesigned room is ready. Review the result and purchase when ready.
            </p>
          </div>

          <button className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Purchase All (${totalCost.toLocaleString()})
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Re-generate</span>
            </button>
            <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1">
              <Download className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Download</span>
            </button>
            <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Rendering Canvas - 新的两栏布局（Upload | Visualization）
function RenderingCanvas({ roomData, isAnalyzing, isRendering, renderProgress, showFinalResult, preferences, selectedFurniture, totalCost, onUpload }: {
  roomData: RoomData | null;
  isAnalyzing: boolean;
  isRendering: boolean;
  renderProgress: number;
  showFinalResult: boolean;
  preferences: DesignPreferences;
  selectedFurniture: FurnitureItem[];
  totalCost: number;
  onUpload: (file: File) => void;
}) {
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('File input changed!', event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      console.log('File selected:', file.name, file.type, file.size);
      onUpload(file);
    } else {
      console.log('No file selected');
    }
  };

  return (
    <div className="h-full p-6">
      <div className="h-full grid grid-cols-2 gap-6">
        {/* Left Column - Upload / Original */}
        <div className="flex flex-col">
          <div className="mb-3">
            <h4 className="mb-1">Original</h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Upload your room photo
            </p>
          </div>
          
          <div className="flex-1 flex flex-col">
            {!roomData ? (
              <div className="flex-1 relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleFileSelect}
                  disabled={isAnalyzing}
                  className="hidden"
                  id="room-image-upload-canvas"
                />
                <label
                  htmlFor="room-image-upload-canvas"
                  className={`absolute inset-0 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 bg-background group ${
                    isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-10 h-10 text-primary animate-spin" />
                      <div className="text-center">
                        <h5 className="mb-1">Analyzing Room...</h5>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                          AI is detecting room details
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <h5 className="mb-1">Upload Room Photo</h5>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                          Drag and drop or click to browse
                        </p>
                        <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-small)' }}>
                          Supports JPG, PNG up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </label>
              </div>
            ) : (
              <>
                <div className="flex-1 rounded-lg overflow-hidden border border-border bg-muted relative">
                  <img src={roomData.imageUrl} alt="Original Room" className="w-full h-full object-cover" />
                  
                  {/* Analyzing Overlay */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                        <h5 className="mb-1">Analyzing Room...</h5>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                          AI is detecting room details
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Uploaded Badge */}
                  {!isAnalyzing && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-card/90 backdrop-blur-sm border border-border rounded-lg flex items-center gap-2 shadow-sm">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span style={{ fontSize: 'var(--text-small)' }}>Uploaded</span>
                    </div>
                  )}
                </div>
                
                {/* AI Detected Results - Only show after analysis */}
                {!isAnalyzing && roomData.furniture.length > 0 && (
                  <div className="mt-3 bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h5 className="text-sm font-medium">AI Detected</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{roomData.roomType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ruler className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{roomData.dimensions}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sofa className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{roomData.furniture.length} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{roomData.style}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right Column - AI Visualization / Rendered */}
        <div className="flex flex-col">
          <div className="mb-3">
            <h4 className="mb-1">Rendered</h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              {showFinalResult ? 'AI-generated design' : 'Upload a room photo to start'}
            </p>
          </div>
          
          <div className="flex-1 relative">
            {!roomData ? (
              <div className="h-full rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h5 className="mb-2">No Rendering Yet</h5>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                    Upload a room photo to begin. AI will analyze your space and render furniture in real-time.
                  </p>
                </div>
              </div>
            ) : isRendering ? (
              <div className="h-full rounded-lg border border-border bg-background flex items-center justify-center">
                <div className="text-center max-w-sm">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                  </div>
                  <h5 className="mb-2">Generating Your Design</h5>
                  <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-caption)' }}>
                    AI is placing furniture with photorealistic rendering
                  </p>
                  <div className="mb-4">
                    <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${renderProgress}%` }}
                      />
                    </div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                      {renderProgress}% complete
                    </p>
                  </div>
                  <div className="space-y-2 text-left">
                    <AIStatusItem label="Placing furniture" status={renderProgress > 20 ? "complete" : "processing"} />
                    <AIStatusItem label="Adjusting lighting" status={renderProgress > 50 ? "complete" : renderProgress > 20 ? "processing" : "pending"} />
                    <AIStatusItem label="Adding details" status={renderProgress > 80 ? "complete" : renderProgress > 50 ? "processing" : "pending"} />
                    <AIStatusItem label="Finalizing" status={renderProgress === 100 ? "complete" : renderProgress > 80 ? "processing" : "pending"} />
                  </div>
                </div>
              </div>
            ) : showFinalResult ? (
              <div className="h-full rounded-lg overflow-hidden border border-border bg-muted relative">
                <img src={roomData.imageUrl} alt="Rendered Room" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 shadow-lg">
                  <Sparkles className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-small)' }}>AI Rendered</span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="mb-0.5">{roomData.roomType}</h5>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        {preferences.style} • {selectedFurniture.filter(f => f.isSelected).length} items • ${totalCost.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 border border-border rounded-lg hover:border-primary transition-colors bg-background">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-2 border border-border rounded-lg hover:border-primary transition-colors bg-background">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-lg border border-border bg-muted/30 flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h5 className="mb-2">Ready to Render</h5>
                  <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-caption)' }}>
                    Complete the design steps to generate your AI rendering
                  </p>
                  <div className="bg-card border border-border rounded-lg p-3">
                    <h5 className="mb-2 text-sm">Detection Results</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-left">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Type</p>
                        <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{roomData.roomType}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Size</p>
                        <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{roomData.dimensions}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Items</p>
                        <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{roomData.furniture.length} detected</p>
                      </div>
                      <div className="text-left">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Style</p>
                        <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{roomData.style}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Furniture List Panel
function FurnitureListPanel({ selectedFurniture, isLoading, totalCost, showFinalResult }: {
  selectedFurniture: FurnitureItem[];
  isLoading: boolean;
  totalCost: number;
  showFinalResult: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            Loading furniture recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (selectedFurniture.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Sofa className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h5 className="mb-2">Furniture Selection</h5>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            Complete the steps above to see AI-recommended furniture
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="mb-1">Selected Furniture ({selectedFurniture.length} items)</h4>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            AI-curated pieces that work together perfectly
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>Total</p>
          <p className="text-primary" style={{ fontSize: 'var(--text-h5)' }}>
            ${totalCost.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {selectedFurniture.map((item) => (
          <div key={item.id} className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors group">
            <div className="aspect-square bg-muted overflow-hidden">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3">
              <h5 className="mb-1 text-sm">{item.name}</h5>
              <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                {item.category}
              </p>
              <p className="text-primary font-medium" style={{ fontSize: 'var(--text-label)' }}>
                ${item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper Components
function AIDetection({ icon, label, value, confidence }: { icon: React.ReactNode; label: string; value: string; confidence: number }) {
  return (
    <div className="p-2 bg-background rounded border border-border">
      <div className="flex items-center gap-1 mb-1 text-primary">
        <div className="w-3 h-3">{icon}</div>
        <span style={{ fontSize: 'var(--text-small)' }}>{label}</span>
      </div>
      <p className="font-medium mb-1" style={{ fontSize: 'var(--text-caption)' }}>{value}</p>
      <div className="flex items-center gap-1">
        <div className="flex-1 bg-muted rounded-full h-1">
          <div className="bg-primary h-1 rounded-full" style={{ width: `${confidence}%` }} />
        </div>
        <span className="text-primary" style={{ fontSize: 'var(--text-small)' }}>{confidence}%</span>
      </div>
    </div>
  );
}

function DetectionBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{label}</p>
        <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{value}</p>
      </div>
    </div>
  );
}

function AIStatusItem({ label, status }: { label: string; status: 'pending' | 'processing' | 'complete' }) {
  return (
    <div className="flex items-center gap-3 p-2 bg-card rounded">
      {status === 'complete' && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
      {status === 'processing' && <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />}
      {status === 'pending' && <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />}
      <span className={status === 'complete' ? 'text-foreground' : 'text-muted-foreground'} style={{ fontSize: 'var(--text-caption)' }}>
        {label}
      </span>
    </div>
  );
}