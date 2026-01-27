import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import { RootState, AppDispatch } from '../store';
import { configureRoom, updatePreferences, addChatMessage } from '../store/slices/sessionSlice';
import { removeFurniture, setRoomConfig, setRoomImage } from '../store/slices/designSlice';
import { addItem, updateQuantity, removeItem as removeCartItem } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/uiSlice';
import RoomInformationSetup, { SetupMode } from '../components/RoomInformationSetup';
import AIDetectionPreviewStep from '../components/AIDetectionPreviewStep';
import PreferenceSelectionStep from '../components/PreferenceSelectionStep';
import ProductSelectionStep from '../components/ProductSelectionStep';
import ChatPanel from '../components/ChatPanel';
import ShoppingCart from '../components/ShoppingCart';
import FurnitureList from '../components/FurnitureList';
import VisualizationCanvas from '../components/VisualizationCanvas';
import NotificationSnackbar from '../components/NotificationSnackbar';
import RoomImageManager from '../components/RoomImageManager';
import { RoomType, RoomDimensions, UserPreferences, MessageSender, ChatMessage as ChatMessageType, PlanningSession, RoomDesign, ShoppingCart as ShoppingCartType, RoomImage, DetectedFurnitureItem, Product } from '../types/domain';
import { useSendChatMessageMutation, useUploadImageMutation, useDetectFurnitureMutation, useReplaceFurnitureMutation, usePlaceFurnitureMutation } from '../services/aiApi';
import ImageProcessingService from '../services/ImageProcessingService';
import { brandColors, spacing } from '../theme/brandTheme';

export default function PlannerPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.session) as PlanningSession;
  const design = useSelector((state: RootState) => state.design) as RoomDesign;
  const cart = useSelector((state: RootState) => state.cart) as ShoppingCartType;
  const [activeTab, setActiveTab] = useState(0);
  
  // New flow state - 5 step process
  const [currentStep, setCurrentStep] = useState<'setup' | 'detection' | 'preferences' | 'products' | 'complete'>('setup');
  const [roomImageUrl, setRoomImageUrl] = useState<string>('');
  const [detectedItems, setDetectedItems] = useState<DetectedFurnitureItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<UserPreferences | null>(null);
  const [setupMode, setSetupMode] = useState<SetupMode | null>(null);
  
  const [sendChat, { isLoading: isLoadingChat }] = useSendChatMessageMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [detectFurniture, { isLoading: isDetectingFurniture }] = useDetectFurnitureMutation();
  const [replaceFurniture, { isLoading: isReplacingFurniture }] = useReplaceFurnitureMutation();
  const [placeFurnitureInImage, { isLoading: isPlacingFurniture }] = usePlaceFurnitureMutation();
  
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);

  const handleSetupComplete = async (config: {
    roomType: RoomType;
    dimensions: RoomDimensions;
    imageFile?: File;
    imagePreviewUrl?: string;
  }) => {
    // Save room configuration
    dispatch(configureRoom({ roomType: config.roomType, dimensions: config.dimensions }));
    dispatch(setRoomConfig({ roomType: config.roomType, dimensions: config.dimensions }));
    
    // Handle image upload if provided
    if (config.imageFile && config.imagePreviewUrl) {
      setCurrentPreviewUrl(config.imagePreviewUrl);
      
      try {
        // Upload image
        const formData = new FormData();
        formData.append('image', config.imageFile);
        const uploadResult = await uploadImage(formData).unwrap();
        
        // Save image URL for new flow
        setRoomImageUrl(uploadResult.imageUrl);
        
        // Create room image object
        const roomImage: RoomImage = {
          imageId: `image_${Date.now()}`,
          originalUrl: uploadResult.imageUrl,
          processedUrl: null,
          detectedFurniture: [],
          isEmpty: false,
          appliedReplacements: [],
          appliedPlacements: [],
          uploadedAt: new Date().toISOString(),
        };
        dispatch(setRoomImage(roomImage));
        
        // Auto-detect furniture - this will determine the mode
        try {
          const detectionResult = await detectFurniture({
            imageUrl: uploadResult.imageUrl,
            roomDimensions: config.dimensions,
          }).unwrap();
          
          setDetectedItems(detectionResult.detectedItems);
          
          // Determine mode based on detection result
          if (detectionResult.isEmpty || detectionResult.detectedItems.length === 0) {
            setSetupMode(SetupMode.EMPTY_ROOM);
          } else {
            setSetupMode(SetupMode.REPLACE_FURNITURE);
          }
        } catch (error) {
          console.error('Failed to detect furniture:', error);
          // Default to empty room mode if detection fails
          setSetupMode(SetupMode.EMPTY_ROOM);
        }
        
        // Move to AI detection step
        setCurrentStep('detection');
      } catch (error) {
        console.error('Failed to upload image:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to upload image. Please try again.',
        }));
      }
    } else {
      // No image - default to empty room mode and skip detection
      setSetupMode(SetupMode.EMPTY_ROOM);
      setCurrentStep('preferences');
    }
    
    dispatch(addNotification({
      type: 'success',
      message: 'Room setup completed!',
    }));
  };

  const handleDetectionConfirm = (selectedIds: string[]) => {
    setSelectedItemIds(selectedIds);
    // Filter detected items to only include selected ones
    const filteredItems = detectedItems.filter(item => selectedIds.includes(item.itemId));
    setDetectedItems(filteredItems);
    setCurrentStep('preferences');
  };

  const handlePreferencesConfirm = (preferences: UserPreferences) => {
    setSelectedPreferences(preferences);
    dispatch(updatePreferences(preferences));
    setCurrentStep('products');
  };

  const handleProductSelectionComplete = (result: { processedImageUrl: string; selectedProduct: Product }) => {
    // Update room image with processed result
    if (design.roomImage) {
      const updatedRoomImage: RoomImage = {
        ...design.roomImage,
        processedUrl: result.processedImageUrl,
      };
      dispatch(setRoomImage(updatedRoomImage));
    }

    // Add product to cart
    const cartItem = {
      itemId: `item_${Date.now()}`,
      productId: result.selectedProduct.id,
      productName: result.selectedProduct.name,
      quantity: 1,
      unitPrice: { amount: result.selectedProduct.price, currency: result.selectedProduct.currency || 'SGD' },
      thumbnailUrl: result.selectedProduct.images?.[0]?.url || '',
      isInStock: true,
      addedAt: new Date().toISOString(),
    };
    dispatch(addItem(cartItem));

    setCurrentStep('complete');
    
    dispatch(addNotification({
      type: 'success',
      message: `Design completed! ${result.selectedProduct.name} added to cart.`,
    }));
  };

  const handleBackToPreferences = () => {
    setCurrentStep('preferences');
  };

  const handleBackToDetection = () => {
    setCurrentStep('detection');
  };

  const handleBackToSetup = () => {
    setCurrentStep('setup');
  };

  const handleImageUploadForSetup = async (file: File, previewUrl: string) => {
    setCurrentPreviewUrl(previewUrl);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      const uploadResult = await uploadImage(formData).unwrap();
      
      // Create room image object and save to state immediately
      const roomImage: RoomImage = {
        imageId: `image_${Date.now()}`,
        originalUrl: uploadResult.imageUrl || previewUrl, // Use uploaded URL or preview URL
        processedUrl: null,
        detectedFurniture: [],
        isEmpty: false,
        appliedReplacements: [],
        appliedPlacements: [],
        uploadedAt: new Date().toISOString(),
      };
      dispatch(setRoomImage(roomImage));
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Even if upload fails, show preview URL
      const roomImage: RoomImage = {
        imageId: `image_${Date.now()}`,
        originalUrl: previewUrl,
        processedUrl: null,
        detectedFurniture: [],
        isEmpty: false,
        appliedReplacements: [],
        appliedPlacements: [],
        uploadedAt: new Date().toISOString(),
      };
      dispatch(setRoomImage(roomImage));
    }
  };

  const handleSendMessage = async (message: string) => {
    const userMessage: ChatMessageType = {
      messageId: `msg-${Date.now()}`,
      content: message,
      sender: MessageSender.USER,
      timestamp: new Date().toISOString(),
      language: session.userSettings.language,
    };
    dispatch(addChatMessage(userMessage));

    try {
      const result = await sendChat({
        sessionId: session.sessionId || 'default',
        message,
        language: session.userSettings.language as 'en' | 'zh',
        context: {
          currentDesign: design,
        },
      }).unwrap();

      const aiMessage: ChatMessageType = {
        messageId: `msg-${Date.now()}_ai`,
        content: result.reply,
        sender: MessageSender.AI,
        timestamp: new Date().toISOString(),
        language: session.userSettings.language,
      };
      dispatch(addChatMessage(aiMessage));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAddToCart = (placementId: string) => {
    const placement = design.furniturePlacements.find((p) => p.placementId === placementId);
    if (placement) {
      const cartItem = {
        itemId: `item_${Date.now()}`,
        productId: placement.productId,
        productName: placement.productName,
        quantity: 1,
        unitPrice: { amount: 0, currency: 'USD' },
        thumbnailUrl: '',
        isInStock: true,
        addedAt: new Date().toISOString(),
      };
      dispatch(addItem(cartItem));
      dispatch(addNotification({
        type: 'success',
        message: `Added ${placement.productName} to cart`,
      }));
    }
  };

  const handleRemove = (placementId: string) => {
    dispatch(removeFurniture(placementId));
  };

  // Image upload and processing handlers
  const handleImageUpload = async (file: File, previewUrl: string) => {
    setCurrentPreviewUrl(previewUrl);

    try {
      const formData = await ImageProcessingService.prepareForUpload(file);
      const result = await uploadImage(formData).unwrap();

      dispatch(addNotification({
        type: 'success',
        message: 'Image uploaded successfully',
      }));

      // Store image info temporarily
      const roomImage: RoomImage = {
        imageId: `img_${Date.now()}`,
        originalUrl: result.imageUrl,
        processedUrl: null,
        detectedFurniture: [],
        appliedReplacements: [],
        appliedPlacements: [],
        isEmpty: false,
        uploadedAt: new Date().toISOString(),
      };
      dispatch(setRoomImage(roomImage));
    } catch (error) {
      console.error('Failed to upload image:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to upload image. Please try again.',
      }));
    }
  };

  const handleDetectFurniture = async () => {
    if (!design.roomImage || !design.roomDimensions) return;

    try {
      const result = await detectFurniture({
        imageUrl: design.roomImage.originalUrl,
        roomDimensions: design.roomDimensions,
      }).unwrap();

      const updatedRoomImage: RoomImage = {
        ...design.roomImage,
        detectedFurniture: result.detectedItems,
        isEmpty: result.isEmpty,
      };
      dispatch(setRoomImage(updatedRoomImage));

      if (result.isEmpty) {
        dispatch(addNotification({
          type: 'info',
          message: 'Empty room detected. You can now place furniture!',
        }));
      } else {
        dispatch(addNotification({
          type: 'success',
          message: `Detected ${result.detectedItems.length} furniture items`,
        }));
      }
    } catch (error) {
      console.error('Failed to detect furniture:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to detect furniture. Please try again.',
      }));
    }
  };

  const handleReplaceItem = async (itemId: string) => {
    if (!design.roomImage) return;

    try {
      // For demo, use a placeholder product ID
      const result = await replaceFurniture({
        imageUrl: design.roomImage.originalUrl,
        detectedItemId: itemId,
        replacementProductId: 'product_demo_123',
      }).unwrap();

      const updatedRoomImage: RoomImage = {
        ...design.roomImage,
        processedUrl: result.processedImageUrl,
        appliedReplacements: [
          ...design.roomImage.appliedReplacements,
          result.replacement,
        ],
      };
      dispatch(setRoomImage(updatedRoomImage));

      dispatch(addNotification({
        type: 'success',
        message: 'Furniture replaced successfully',
      }));
    } catch (error) {
      console.error('Failed to replace furniture:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to replace furniture. Please try again.',
      }));
    }
  };

  const handleViewReplacements = () => {
    dispatch(addNotification({
      type: 'info',
      message: 'Replacement suggestions feature coming soon!',
    }));
  };

  const handlePlaceFurnitureInImage = async (
    productId: string,
    position: { x: number; y: number },
    rotation: number,
    scale: number
  ) => {
    if (!design.roomImage) return;

    try {
      const result = await placeFurnitureInImage({
        imageUrl: design.roomImage.originalUrl,
        productId,
        imagePosition: position,
        rotation,
        scale,
      }).unwrap();

      const updatedRoomImage: RoomImage = {
        ...design.roomImage,
        processedUrl: result.processedImageUrl,
        appliedPlacements: [
          ...design.roomImage.appliedPlacements,
          result.placement,
        ],
      };
      dispatch(setRoomImage(updatedRoomImage));

      dispatch(addNotification({
        type: 'success',
        message: 'Furniture placed successfully',
      }));
    } catch (error) {
      console.error('Failed to place furniture:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to place furniture. Please try again.',
      }));
    }
  };

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: brandColors.white, minHeight: '100vh' }}>
      <NotificationSnackbar />
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: brandColors.white,
          borderBottom: `1px solid ${brandColors.mediumGray}`,
        }}
      >
        <Toolbar>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={{ 
              mr: 2,
              color: brandColors.terracotta,
              '&:hover': {
                backgroundColor: 'rgba(217, 116, 73, 0.08)',
              }
            }}
          >
            Home
          </Button>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              color: brandColors.sienna,
              fontWeight: 600,
            }}
          >
            Castlery Furniture Planner
          </Typography>
          <Typography 
            variant="body2"
            sx={{ color: brandColors.darkGray }}
          >
            Cart: {cart.items.length} items
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: spacing.lg / 8, mb: spacing.lg / 8 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            color: brandColors.sienna,
            mb: spacing.lg / 8,
          }}
        >
          AI-Powered Room Design
        </Typography>

        {/* New Flow - Step-based UI */}
        {currentStep === 'setup' && (
          <RoomInformationSetup
            onSetupComplete={handleSetupComplete}
            onImageUpload={handleImageUploadForSetup}
            isUploadingImage={isUploadingImage}
          />
        )}

        {currentStep === 'detection' && roomImageUrl && setupMode !== null && (
          <AIDetectionPreviewStep
            roomImageUrl={roomImageUrl}
            mode={setupMode}
            detectedItems={detectedItems}
            isDetecting={isDetectingFurniture}
            onItemsConfirm={handleDetectionConfirm}
            onBack={handleBackToSetup}
          />
        )}

        {currentStep === 'preferences' && design.roomType && (
          <PreferenceSelectionStep
            roomType={design.roomType}
            onPreferencesConfirm={handlePreferencesConfirm}
            onBack={setupMode === SetupMode.EMPTY_ROOM ? handleBackToSetup : handleBackToDetection}
          />
        )}

        {currentStep === 'products' && selectedPreferences && roomImageUrl && design.roomType && design.roomDimensions && setupMode !== null && (
          <ProductSelectionStep
            preferences={selectedPreferences}
            roomImageUrl={roomImageUrl}
            roomType={design.roomType}
            roomDimensions={design.roomDimensions}
            mode={setupMode === SetupMode.REPLACE_FURNITURE ? 'replace' : 'empty_room'}
            detectedItems={detectedItems.filter(item => selectedItemIds.includes(item.itemId))}
            onComplete={handleProductSelectionComplete}
            onBack={handleBackToPreferences}
          />
        )}

        {currentStep === 'complete' && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h4" sx={{ color: brandColors.sienna, mb: 2 }}>
              🎉 Design Complete!
            </Typography>
            <Typography variant="body1" sx={{ color: brandColors.darkGray, mb: 4 }}>
              Your room design is ready. Check out your cart or continue exploring.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                variant="contained"
                onClick={() => setActiveTab(4)}
                sx={{
                  backgroundColor: brandColors.terracotta,
                  '&:hover': { backgroundColor: brandColors.sienna },
                }}
              >
                View Cart
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setCurrentStep('setup');
                  setSelectedPreferences(null);
                  setRoomImageUrl('');
                  setDetectedItems([]);
                  setSelectedItemIds([]);
                  setSetupMode(null);
                }}
                sx={{
                  borderColor: brandColors.terracotta,
                  color: brandColors.terracotta,
                  '&:hover': { borderColor: brandColors.sienna, color: brandColors.sienna },
                }}
              >
                Start New Design
              </Button>
            </Box>
          </Box>
        )}

        {/* Legacy Tabs - Show only when in complete state or for additional features */}
        {currentStep === 'complete' && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              {/* Left Panel */}
              <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    mb: 2,
                    border: `1px solid ${brandColors.mediumGray}`,
                  }}
                >
                  <Tabs 
                    value={activeTab} 
                    onChange={(_, v) => setActiveTab(v)} 
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        color: brandColors.darkGray,
                        fontWeight: 500,
                      },
                      '& .Mui-selected': {
                        color: brandColors.terracotta,
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: brandColors.terracotta,
                      },
                    }}
                  >
                    <Tab label="Image" />
                    <Tab label="Chat" />
                    <Tab label="Cart" />
                  </Tabs>
                </Paper>

                {activeTab === 0 && (
                  <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                    <RoomImageManager
                      roomImage={design.roomImage}
                      onImageUpload={handleImageUpload}
                      onDetectFurniture={handleDetectFurniture}
                      onReplaceItem={handleReplaceItem}
                      onViewReplacements={handleViewReplacements}
                      onPlaceFurniture={handlePlaceFurnitureInImage}
                      isUploading={isUploadingImage}
                      isDetecting={isDetectingFurniture}
                      isProcessing={isReplacingFurniture || isPlacingFurniture}
                    />
                  </Box>
                )}
                {activeTab === 1 && (
                  <Box sx={{ height: 600 }}>
                    <ChatPanel
                      messages={session.chatHistory}
                      onSendMessage={handleSendMessage}
                      isLoading={isLoadingChat}
                    />
                  </Box>
                )}
                {activeTab === 2 && (
                  <ShoppingCart
                    items={cart.items}
                    onUpdateQuantity={(itemId, quantity) => dispatch(updateQuantity({ itemId, quantity }))}
                    onRemove={(itemId) => dispatch(removeCartItem(itemId))}
                    onCheckout={() => alert('Checkout feature coming soon!')}
                  />
                )}
              </Box>

              {/* Right Panel - Image Display / Visualization and Furniture */}
              <Box sx={{ flex: 1 }}>
                {/* Show uploaded room image if available */}
                {design.roomImage && design.roomImage.originalUrl && (
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ color: brandColors.sienna }}>
                        Your Room Design
                      </Typography>
                      {design.roomImage.processedUrl && (
                        <Button
                          size="small"
                          onClick={() => {
                            // Toggle between original and processed image
                            // This would need state management to toggle
                          }}
                        >
                          {design.roomImage.processedUrl ? 'Show Original' : 'Show Processed'}
                        </Button>
                      )}
                    </Box>
                    <Box
                      sx={{
                        width: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: `2px solid ${brandColors.mediumGray}`,
                        backgroundColor: brandColors.cream,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: 400,
                        maxHeight: 600,
                      }}
                    >
                      <img
                        src={design.roomImage.processedUrl || design.roomImage.originalUrl}
                        alt="Room"
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          maxHeight: 600,
                          objectFit: 'contain',
                        }}
                        onError={(e) => {
                          // Fallback to preview URL if original fails
                          const target = e.target as HTMLImageElement;
                          if (target.src !== currentPreviewUrl && currentPreviewUrl) {
                            target.src = currentPreviewUrl;
                          }
                        }}
                      />
                    </Box>
                    {design.roomImage.detectedFurniture.length > 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Detected {design.roomImage.detectedFurniture.length} furniture items
                      </Typography>
                    )}
                    {design.roomImage.isEmpty && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Empty room detected
                      </Typography>
                    )}
                  </Paper>
                )}
                
                {/* Show visualization canvas if no image or as overlay */}
                {(!design.roomImage || !design.roomImage.originalUrl) && (
                  <VisualizationCanvas
                    design={design}
                  />
                )}
                
                <Box sx={{ mt: 3 }}>
                  <FurnitureList
                    placements={design.furniturePlacements}
                    onAddToCart={handleAddToCart}
                    onRemove={handleRemove}
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Status Bar */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Status: {currentStep} | Room: {design.roomType || 'Not configured'} | 
            Furniture: {design.furniturePlacements.length} items | 
            Cart: {cart.items.length} items
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
