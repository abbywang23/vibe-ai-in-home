import { useState, useEffect, useRef } from 'react';
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
import { RoomDimensions, FurnitureDimensions, DetectedFurnitureItem, DimensionUnit } from '../types/domain';

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
  originalImageUrl: string; // 用户最初上传的原始图片URL，永远不变
  renderedImageUrl?: string; // multi-render成功后生成的渲染图片URL
  roomType: string;
  dimensions: string;
  furniture: string[];
  style: string;
  confidence: number;
  detectedItems?: DetectedFurnitureItem[]; // 保存完整的检测结果（含特征）
  roomDimensions?: RoomDimensions; // 保存 detect 返回的 roomDimensions（用于传递给 multi-render）
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
  imageUrl: string; // 用于前端展示（第一张图片）
  renderImageUrl?: string; // 用于渲染（第二张图片，如果存在）
  reason?: string;
  dimensions?: string;
  existingItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
  };
  isSelected?: boolean;
  // 支持 API 返回的 Product 类型中的 images 属性（用于 Swap Item 功能）
  images?: Array<{
    url: string;
    alt: string;
  }>;
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
    budget: { min: 2000, max: 50000 }
  });
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingFurniture, setIsLoadingFurniture] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);
  const [swappingItemId, setSwappingItemId] = useState<string | null>(null);
  const isSwappingRef = useRef<boolean>(false); // 使用 ref 来立即防止重复点击
  const swappingItemIdRef = useRef<string | null>(null); // 使用 ref 来跟踪正在交换的商品ID

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
      unit: DimensionUnit.METERS
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
      
      // 3. 上传成功后，立即设置图片数据（让图片显示出来）
      setRoomData({
        imageUrl: uploadResponse.imageUrl,
        originalImageUrl: uploadResponse.imageUrl,
        roomType: roomSetup.roomType,
        dimensions: `${roomSetup.width}' × ${roomSetup.length}'`,
        furniture: [],
        style: 'Analyzing...',
        confidence: 0
      });
      
      // 4. 继续保持 analyzing 状态，进行检测（图片已显示，loading 蒙层覆盖在上面）
      console.log('Detecting furniture...');
      const roomDimensions = getRoomDimensionsFromSize(roomSetup.width, roomSetup.length);
      
      // 调用 detect API
      const detectResponse = await aiApi.detectRoom({
        imageUrl: uploadResponse.imageUrl,
        roomDimensions: roomDimensions
      });
      
      console.log('Detect response:', detectResponse);
      
      // 5. 检测完成后，更新数据并关闭 loading
      // 安全检查：确保响应格式正确
      if (!detectResponse) {
        console.error('Detect response is null or undefined');
        setIsAnalyzing(false);
        return;
      }
      
      // 更新状态 - 适配新的响应格式
      const detectedRoomType = detectResponse.roomType?.value || roomSetup.roomType;
      const detectedDimensions = detectResponse.roomDimensions 
        ? `${detectResponse.roomDimensions.length}×${detectResponse.roomDimensions.width}m`
        : `${roomDimensions.length}×${roomDimensions.width}m`;
      
      // 安全检查：确保 detectedItems 存在且是数组
      const detectedFurniture = (detectResponse.detectedItems && Array.isArray(detectResponse.detectedItems))
        ? detectResponse.detectedItems.map(item => item.furnitureType)
        : [];
      
      const detectedStyle = detectResponse.roomStyle?.value || 'Modern';
      const confidence = detectResponse.roomType?.confidence || detectResponse.roomStyle?.confidence || 85;
      
      // 转换 detect 返回的 roomDimensions 格式（RoomDimensionsAnalysis -> RoomDimensions）
      let savedRoomDimensions: RoomDimensions | undefined;
      if (detectResponse.roomDimensions) {
        const unit = detectResponse.roomDimensions.unit === 'meters' 
          ? DimensionUnit.METERS 
          : detectResponse.roomDimensions.unit === 'feet' 
          ? DimensionUnit.FEET 
          : DimensionUnit.METERS; // 默认使用 meters
        savedRoomDimensions = {
          length: detectResponse.roomDimensions.length,
          width: detectResponse.roomDimensions.width,
          height: detectResponse.roomDimensions.height,
          unit: unit
        };
      }
      
      const data: RoomData = {
        imageUrl: uploadResponse.imageUrl,
        originalImageUrl: uploadResponse.imageUrl, // 保存原始图片URL
        roomType: detectedRoomType,
        dimensions: detectedDimensions,
        furniture: detectedFurniture,
        style: detectedStyle,
        confidence: confidence,
        detectedItems: detectResponse.detectedItems || [], // 保存完整的检测结果（含特征）
        roomDimensions: savedRoomDimensions // 保存 detect 返回的 roomDimensions
      };
      
      console.log('Updating roomData with detection results:', {
        roomType: data.roomType,
        dimensions: data.dimensions,
        furnitureCount: data.furniture.length,
        style: data.style,
        detectedItemsCount: data.detectedItems?.length || 0
      });
      
      setRoomData(data);
      setPreferences(prev => ({ ...prev, style: data.style }));
      
      // 6. 所有操作完成，关闭 loading 状态
      setIsAnalyzing(false);
      
    } catch (error) {
      console.error('Error uploading/detecting image:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      setIsAnalyzing(false);
      // 降级到模拟数据
      const fallbackImageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80';
      const data: RoomData = {
        imageUrl: fallbackImageUrl,
        originalImageUrl: fallbackImageUrl, // 保存原始图片URL
        roomType: 'Living Room',
        dimensions: "12' × 15'",
        furniture: ['Sofa', 'Coffee Table', 'Armchair'],
        style: 'Modern Minimalist',
        confidence: 95
      };
      setRoomData(data);
      setPreferences(prev => ({ ...prev, style: data.style }));
      alert('Failed to upload image. Using demo data.');
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
        existingFurniture: roomData?.detectedItems, // 传递已有家具特征
        language: 'en'
      });
      console.log('Recommendations response:', response);
      
      // 生成客户友好的推荐理由
      const generateFriendlyReason = (category: string, roomType: string): string => {
        const reasons: Record<string, string[]> = {
          'sofa': [
            'Comfortable seating that fits your space perfectly',
            'Modern design that complements your room style',
            'Perfect size for your living area'
          ],
          'table': [
            'Ideal dimensions for your dining space',
            'Versatile design that matches your style',
            'Perfect for family gatherings and daily use'
          ],
          'chair': [
            'Ergonomic design for maximum comfort',
            'Stylish addition that complements your furniture',
            'Perfect height and size for your space'
          ],
          'bed': [
            'Comfortable and spacious for restful sleep',
            'Elegant design that enhances your bedroom',
            'Perfect fit for your room dimensions'
          ],
          'desk': [
            'Functional workspace that fits your room',
            'Modern design with ample storage',
            'Perfect for productivity and comfort'
          ],
          'storage': [
            'Maximizes your storage space efficiently',
            'Sleek design that organizes your belongings',
            'Perfect solution for your storage needs'
          ]
        };
        
        // 标准化类别名称
        const normalizedCategory = category.toLowerCase();
        
        // 查找匹配的类别
        for (const [key, messages] of Object.entries(reasons)) {
          if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
            // 随机选择一个理由
            return messages[Math.floor(Math.random() * messages.length)];
          }
        }
        
        // 默认理由
        return 'Perfect fit for your room size and style preferences';
      };
      
      const furnitureWithSelection = response.products.map((item) => {
        // 类型断言：API 返回的产品可能包含 images 属性
        const productWithImages = item as FurnitureItem & {
          images?: Array<{ url: string; alt: string }>;
          dimensions?: string | FurnitureDimensions;
        };
        
        // 处理 dimensions：可能是 FurnitureDimensions 对象或字符串
        let dimensionsStr: string;
        if (typeof productWithImages.dimensions === 'string') {
          dimensionsStr = productWithImages.dimensions;
        } else if (productWithImages.dimensions && typeof productWithImages.dimensions === 'object') {
          const dims = productWithImages.dimensions as FurnitureDimensions;
          const unit = dims.unit || 'cm';
          dimensionsStr = `${dims.width}${unit} W × ${dims.depth}${unit} D × ${dims.height}${unit} H`;
        } else {
          dimensionsStr = 'Dimensions not available';
        }
        
        // 提取该产品的 reasoning - 使用客户友好的文案
        const productReason = generateFriendlyReason(item.category, roomData?.roomType || roomSetup.roomType);
        
        // 处理图片URL：展示用第一张，渲染用第二张（如果存在）
        let displayImageUrl = item.imageUrl || '';
        let renderImageUrl: string | undefined;
        
        if (productWithImages.images && productWithImages.images.length > 0) {
          // 展示用第一张图片
          displayImageUrl = productWithImages.images[0].url;
          // 渲染用第二张图片（如果存在），否则也用第一张
          renderImageUrl = productWithImages.images.length > 1 
            ? productWithImages.images[1].url 
            : productWithImages.images[0].url;
        } else {
          // 如果没有 images 数组，两个都用 imageUrl
          renderImageUrl = displayImageUrl;
        }
        
        // 🔍 在 "refresh" 模式下，匹配检测到的家具并填充 existingItem
        let existingItem: FurnitureItem['existingItem'] = undefined;
        if (roomSetup.intent === 'refresh' && roomData?.detectedItems) {
          // 尝试根据类别匹配检测到的家具
          // 将产品类别标准化为小写，并尝试匹配
          const normalizedCategory = item.category.toLowerCase();
          const matchedDetectedItem = roomData.detectedItems.find(detected => {
            const detectedType = detected.furnitureType.toLowerCase();
            // 尝试多种匹配方式
            return (
              detectedType === normalizedCategory ||
              detectedType.includes(normalizedCategory) ||
              normalizedCategory.includes(detectedType)
            );
          });
          
          if (matchedDetectedItem) {
            // 生成检测到的家具的显示名称
            const detectedName = matchedDetectedItem.furnitureType.charAt(0).toUpperCase() + 
                                 matchedDetectedItem.furnitureType.slice(1).replace(/_/g, ' ');
            
            // 估算价值（基于产品价格的 40-60%）
            const estimatedValue = Math.round(item.price * (0.4 + Math.random() * 0.2));
            
            // 使用房间图片作为检测到的家具的图片（因为我们没有单独的家具图片）
            const detectedImageUrl = roomData.imageUrl;
            
            existingItem = {
              name: detectedName,
              imageUrl: detectedImageUrl,
              estimatedValue: estimatedValue
            };
            
            console.log(`Matched detected item for ${item.name}:`, {
              detectedType: matchedDetectedItem.furnitureType,
              productCategory: item.category,
              estimatedValue
            });
          }
        }
        
        return {
          ...item,
          dimensions: dimensionsStr,
          isSelected: true,
          reason: typeof productReason === 'string' ? productReason : String(productReason || 'AI recommended'),
          imageUrl: displayImageUrl, // 用于前端展示
          renderImageUrl: renderImageUrl, // 用于渲染
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

  // Remove furniture item from list
  const handleRemoveFurniture = (id: string) => {
    setSelectedFurniture(prev => prev.filter(item => item.id !== id));
  };

  // Handle swap furniture item
  const handleSwapFurniture = async (itemId: string) => {
    // 防止重复点击：使用 ref 立即检查，避免状态更新的延迟
    if (isSwappingRef.current) {
      console.log('Swap operation already in progress, ignoring click');
      return;
    }
    
    // 防止重复点击：如果已经有正在处理的交换操作，直接返回
    if (swappingItemId !== null || swappingItemIdRef.current !== null) {
      console.log('Swap operation already in progress, ignoring click');
      return;
    }
    
    try {
      isSwappingRef.current = true;
      swappingItemIdRef.current = itemId;
      setSwappingItemId(itemId);
      
      // 获取要替换的家具项
      const itemToSwap = selectedFurniture.find(item => item.id === itemId);
      if (!itemToSwap) {
        isSwappingRef.current = false;
        swappingItemIdRef.current = null;
        setSwappingItemId(null);
        alert('Cannot swap this item');
        return;
      }
      
      // 收集当前品类中所有商品的ID（用于排除）
      const categoryProductIds = selectedFurniture
        .filter(item => item.category.toLowerCase().trim() === itemToSwap.category.toLowerCase().trim())
        .map(item => item.id);
      
      // 调用新接口获取下一个商品（排除已选商品）
      console.log('Getting next product in category...', { 
        category: itemToSwap.category, 
        excludeCount: categoryProductIds.length 
      });
      const nextProductRaw = await aiApi.getNextProductForSwap(
        itemToSwap.category, 
        itemToSwap.name,
        categoryProductIds
      );
      
      // 类型断言：确保包含 images 属性
      type ProductWithImages = FurnitureItem & {
        images?: Array<{ url: string; alt: string }>;
      };
      const nextProduct = nextProductRaw as ProductWithImages;
      
      // 处理替代产品的 dimensions（如果返回的是字符串则直接使用，否则使用原商品的）
      const dimensionsStr = nextProduct.dimensions || itemToSwap.dimensions || 'Dimensions not available';
      
      // 处理替代产品的图片URL：展示用第一张，渲染用第二张（如果存在）
      let displayImageUrl = nextProduct.imageUrl || '';
      let renderImageUrl: string | undefined;
      
      // 如果新商品有 images 属性，使用它
      const productImages = (nextProduct as ProductWithImages).images;
      if (productImages && productImages.length > 0) {
        // 展示用第一张图片
        displayImageUrl = productImages[0].url;
        // 渲染用第二张图片（如果存在），否则也用第一张
        renderImageUrl = productImages.length > 1 
          ? productImages[1].url 
          : productImages[0].url;
      } else {
        // 如果没有 images 数组，两个都用 imageUrl
        renderImageUrl = displayImageUrl;
      }
      
      // 只更新商品列表，不调用 replace API，不更新房间图片
      // 最终渲染会在确认步骤统一生成
      // 如果新商品已在列表中，不做移动（保持原位置）
      setSelectedFurniture(prev => {
        const existingIndex = prev.findIndex(item => item.id === nextProduct.id);
        
        if (existingIndex !== -1) {
          // 新商品已在列表中，不做任何操作（不移动）
          console.log('Product already in list, skipping swap');
          return prev;
        }
        
        // 新商品不在列表中，正常替换
        return prev.map(item => {
          if (item.id === itemId) {
            return {
              ...nextProduct,
              dimensions: dimensionsStr,
              imageUrl: displayImageUrl, // 用于前端展示
              renderImageUrl: renderImageUrl, // 用于渲染
              isSelected: item.isSelected,
              reason: `Swapped from ${item.name}. ${nextProduct.reason || ''}`
            } as FurnitureItem;
          }
          return item;
        });
      });
      
      console.log(`Successfully swapped to ${nextProduct.name}`);
      
    } catch (error) {
      console.error('Error swapping furniture:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to swap furniture. Please try again.';
      alert(errorMessage);
    } finally {
      isSwappingRef.current = false;
      swappingItemIdRef.current = null;
      setSwappingItemId(null);
    }
  };

  // Handle selection step completion
  const handleSelectionComplete = () => {
    completeStep('selection');
  };

  // Handle render generation
  const handleGenerateRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setShowFinalResult(false); // 重置最终结果状态，以便重新显示渲染进度
    
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
      // 优先使用 detect 返回的 roomDimensions，如果没有则使用 roomSetup 的值
      let roomDimensions: RoomDimensions | undefined;
      if (roomData?.roomDimensions) {
        // 使用 detect 返回的 roomDimensions（已经是 meters 单位）
        roomDimensions = roomData.roomDimensions;
        console.log('Using detected room dimensions:', roomDimensions);
      } else {
        // 使用 roomSetup 的值转换为 meters
        roomDimensions = getRoomDimensionsFromSize(roomSetup.width, roomSetup.length);
        console.log('Using roomSetup dimensions:', roomDimensions);
      }
      
      const response = await aiApi.generateMultiRender({
        imageUrl: roomData?.originalImageUrl || roomData?.imageUrl || '', // 使用原始图片URL进行渲染
        selectedFurniture: selectedItems.map(item => ({
          id: item.id,
          name: item.name,
          imageUrl: item.renderImageUrl || item.imageUrl // 优先使用renderImageUrl（第二张），否则使用imageUrl（第一张）
        })),
        roomType: roomData?.roomType || roomSetup.roomType,
        roomDimensions: roomDimensions // Pass room dimensions to Decor8
      });
      console.log('Render response:', response);
      
      clearInterval(progressInterval);
      setRenderProgress(100);
      
      // 保存渲染结果到renderedImageUrl，不更新originalImageUrl和imageUrl
      const renderedImage = response.processedImageUrl || response.renderedImageUrl;
      if (renderedImage) {
        setRoomData(prev => prev ? {
          ...prev,
          renderedImageUrl: renderedImage // 只更新渲染结果，保持originalImageUrl不变
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

  // 下载图片功能
  const handleDownloadImage = async () => {
    try {
      // 获取要下载的图片URL（优先使用渲染后的图片）
      const imageUrl = roomData?.renderedImageUrl || roomData?.imageUrl;
      
      if (!imageUrl) {
        alert('No image available to download');
        return;
      }

      // 创建一个临时的 a 标签来触发下载
      const link = document.createElement('a');
      link.href = imageUrl;
      
      // 生成文件名
      const timestamp = new Date().getTime();
      const fileName = `room-design-${timestamp}.jpg`;
      link.download = fileName;
      
      // 如果是跨域图片，需要先转换为 blob
      if (imageUrl.startsWith('http')) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          link.href = blobUrl;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // 清理 blob URL
          setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
        } catch (error) {
          console.error('Failed to download image via blob:', error);
          // 降级：直接打开图片
          window.open(imageUrl, '_blank');
        }
      } else {
        // 本地图片可以直接下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  // 清除 detect 缓存
  const handleClearDetectCache = () => {
    if (confirm('确定要清除 detect 的缓存吗？这将清除所有已缓存的检测结果。')) {
      aiApi.clearDetectCache();
      alert('缓存已清除');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-primary flex-shrink-0 z-20">
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
            <button 
              onClick={handleClearDetectCache}
              className="px-4 py-2 text-primary-foreground/90 hover:text-primary-foreground transition-colors flex items-center gap-2" 
              style={{ fontSize: 'var(--text-base)' }}
              title="清除 detect 缓存"
            >
              <X className="w-4 h-4" />
              清除缓存
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
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
                      roomIntent={roomSetup.intent}
                      selectedFurniture={selectedFurniture}
                      onToggleFurniture={handleToggleFurniture}
                      onRemoveFurniture={handleRemoveFurniture}
                      onSwapFurniture={handleSwapFurniture}
                      swappingItemId={swappingItemId}
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
                      onDownload={handleDownloadImage}
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
        <div className="flex-1 bg-background overflow-y-auto">
          <div className="flex flex-col">
            {/* Rendering Canvas - Fixed height for proper display */}
            <div style={{ height: '600px' }}>
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
                onGenerate={handleGenerateRender}
                onDownload={handleDownloadImage}
              />
            </div>

            {/* Furniture List Panel */}
            <div className="border-t border-border bg-card">
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
              max={Math.min(50000, preferences.budget.max)} // min的最大值不能超过max
              step="500"
              value={preferences.budget.min}
              onChange={(e) => {
                const newMin = Number(e.target.value);
                // 如果新的min大于max，则同时更新max为newMin
                const newMax = newMin > preferences.budget.max ? newMin : preferences.budget.max;
                onPreferencesChange({ 
                  ...preferences, 
                  budget: { min: newMin, max: newMax } 
                });
              }}
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
              min={Math.max(1000, preferences.budget.min)} // max的最小值不能小于min
              max="50000"
              step="500"
              value={preferences.budget.max}
              onChange={(e) => {
                const newMax = Number(e.target.value);
                // 如果新的max小于min，则同时更新min为newMax
                const newMin = newMax < preferences.budget.min ? newMax : preferences.budget.min;
                onPreferencesChange({ 
                  ...preferences, 
                  budget: { min: newMin, max: newMax } 
                });
              }}
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
function SelectionStepContent({ roomIntent, selectedFurniture, onToggleFurniture, onRemoveFurniture, onSwapFurniture, swappingItemId, isLoading, totalCost, budget, withinBudget, onComplete, isCompleted }: {
  roomIntent: RoomIntent;
  selectedFurniture: FurnitureItem[];
  onToggleFurniture: (id: string) => void;
  onRemoveFurniture: (id: string) => void;
  onSwapFurniture: (id: string) => void;
  swappingItemId: string | null;
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
        {roomIntent === 'refresh' ? (
          // Refresh Room: 显示对比卡片（Current vs AI Recommended）
          selectedFurniture.map((item, index) => (
            <FurnitureComparisonCard 
              key={item.id} 
              item={item} 
              index={index} 
              isCompleted={isCompleted} 
              onToggle={onToggleFurniture}
              onSwap={onSwapFurniture}
              isSwapping={swappingItemId !== null}
              onRemove={onRemoveFurniture}
            />
          ))
        ) : (
          // Furnish Room: 显示单列卡片（只有 AI Recommended）
          selectedFurniture.map((item, index) => (
            <FurnitureCard 
              key={item.id} 
              item={item} 
              index={index} 
              isCompleted={isCompleted} 
              onToggle={onToggleFurniture}
              onRemove={onRemoveFurniture}
              onSwap={onSwapFurniture}
              isSwapping={swappingItemId !== null}
            />
          ))
        )}
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
function FurnitureCard({ item, index, isCompleted, onToggle, onRemove, onSwap, isSwapping }: { 
  item: FurnitureItem; 
  index: number; 
  isCompleted: boolean; 
  onToggle: (id: string) => void;
  onRemove?: (id: string) => void;
  onSwap?: (id: string) => void;
  isSwapping?: boolean;
}) {
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
          {onSwap && (
            <button 
              onClick={() => onSwap(item.id)}
              disabled={isSwapping}
              className="flex-1 px-3 py-1.5 bg-card border border-border rounded hover:border-primary transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSwapping ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span style={{ fontSize: 'var(--text-small)' }}>Swapping...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span style={{ fontSize: 'var(--text-small)' }}>Swap Item</span>
                </>
              )}
            </button>
          )}
          <button 
            className="px-3 py-1.5 bg-card border border-border rounded hover:border-destructive hover:text-destructive transition-colors flex items-center justify-center gap-1.5" 
            onClick={() => {
              if (onRemove) {
                onRemove(item.id);
              } else {
                onToggle(item.id);
              }
            }}
          >
            <X className="w-3.5 h-3.5" />
            <span style={{ fontSize: 'var(--text-small)' }}>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Confirmation Step Content
function ConfirmationStepContent({ onGenerate, onDownload, isRendering, showFinalResult, totalCost }: {
  onGenerate: () => void;
  onDownload: () => void;
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

          <button className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium">
            <ShoppingCart className="w-5 h-5" />
            <span style={{ fontSize: 'var(--text-base)' }}>Purchase All (${totalCost.toLocaleString()})</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button 
              onClick={onGenerate}
              disabled={isRendering}
              className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isRendering ? 'animate-spin' : ''}`} />
              <span style={{ fontSize: 'var(--text-small)' }}>Re-generate</span>
            </button>
            <button 
              onClick={onDownload}
              className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1"
            >
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
function RenderingCanvas({ roomData, isAnalyzing, isRendering, renderProgress, showFinalResult, preferences, selectedFurniture, totalCost, onUpload, onGenerate, onDownload }: {
  roomData: RoomData | null;
  isAnalyzing: boolean;
  isRendering: boolean;
  renderProgress: number;
  showFinalResult: boolean;
  preferences: DesignPreferences;
  selectedFurniture: FurnitureItem[];
  totalCost: number;
  onUpload: (file: File) => void;
  onGenerate: () => void;
  onDownload: () => void;
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
        <div className="flex flex-col h-full">
          <div className="mb-3 flex-shrink-0">
            <h4 className="mb-1">Original</h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Upload your room photo
            </p>
          </div>
          
          <div className="flex-1 min-h-0 relative">
            {!roomData ? (
              <div className="absolute inset-0">
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
              <div className="absolute inset-0 flex flex-col gap-3">
                <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border bg-muted relative">
                  <img src={roomData.originalImageUrl || roomData.imageUrl} alt="Original Room" className="w-full h-full object-cover" />
                  
                  {/* Analyzing Overlay - 30% opacity */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-background/30 flex items-center justify-center">
                      <div className="text-center bg-background/90 backdrop-blur-sm px-6 py-4 rounded-lg border border-border shadow-lg">
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
                  <div className="bg-card border border-border rounded-lg p-3 flex-shrink-0">
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
              </div>
            )}
          </div>
        </div>

        {/* Right Column - AI Visualization / Rendered */}
        <div className="flex flex-col h-full">
          <div className="mb-3 flex-shrink-0">
            <h4 className="mb-1">Rendered</h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              {showFinalResult ? 'AI-generated design' : 'Upload a room photo to start'}
            </p>
          </div>
          
          <div className="flex-1 min-h-0 relative">
            {!roomData ? (
              <div className="absolute inset-0 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
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
              <div className="absolute inset-0 flex flex-col gap-3">
                {/* Rendering progress area - matching Original's flex structure */}
                <div className="flex-1 min-h-0 rounded-lg border border-border bg-background flex items-center justify-center">
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
                {/* Placeholder for info card to maintain height consistency */}
                <div className="flex-shrink-0 flex gap-2">
                  <div className="flex-1 h-[88px]"></div>
                  <div className="w-[40px]"></div>
                </div>
              </div>
            ) : showFinalResult ? (
              <div className="absolute inset-0 flex flex-col gap-3">
                {/* Image with fixed height matching Original */}
                <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-border bg-muted relative">
                  <img src={roomData.renderedImageUrl || roomData.imageUrl} alt="Rendered Room" className="w-full h-full object-cover" />
                  {/* AI Rendered Badge - stays on image */}
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 shadow-lg">
                    <Sparkles className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-small)' }}>AI Rendered</span>
                  </div>
                </div>
                
                {/* Info and buttons section - moved below image */}
                <div className="flex-shrink-0 flex gap-2">
                  <div className="flex-1 bg-card border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h5 className="text-sm font-medium">AI Generated</h5>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-2">
                        <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{preferences.style}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sofa className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{selectedFurniture.filter(f => f.isSelected).length} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>${totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{roomData.roomType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={onGenerate}
                      disabled={isRendering}
                      className="p-2 border border-border rounded-lg hover:border-primary transition-colors bg-background disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Re-generate"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRendering ? 'animate-spin' : ''}`} />
                    </button>
                    <button 
                      onClick={onDownload}
                      className="p-2 border border-border rounded-lg hover:border-primary transition-colors bg-background"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
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