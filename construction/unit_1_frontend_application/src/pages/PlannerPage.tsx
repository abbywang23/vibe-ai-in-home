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
import { placeFurniture, removeFurniture, setRoomConfig, switchViewMode, setRoomImage } from '../store/slices/designSlice';
import { addItem, updateQuantity, removeItem as removeCartItem } from '../store/slices/cartSlice';
import { addNotification } from '../store/slices/uiSlice';
import RoomConfigPanel from '../components/RoomConfigPanel';
import PreferencesPanel from '../components/PreferencesPanel';
import ChatPanel from '../components/ChatPanel';
import ShoppingCart from '../components/ShoppingCart';
import FurnitureList from '../components/FurnitureList';
import VisualizationCanvas from '../components/VisualizationCanvas';
import NotificationSnackbar from '../components/NotificationSnackbar';
import RoomImageManager from '../components/RoomImageManager';
import { RoomType, RoomDimensions, UserPreferences, MessageSender, ChatMessage as ChatMessageType, PlanningSession, RoomDesign, ShoppingCart as ShoppingCartType, RoomImage, DetectedFurnitureItem } from '../types/domain';
import { useGetRecommendationsMutation, useSendChatMessageMutation, useUploadImageMutation, useDetectFurnitureMutation, useReplaceFurnitureMutation, usePlaceFurnitureMutation } from '../services/aiApi';
import ImageProcessingService from '../services/ImageProcessingService';
import { brandColors, spacing } from '../theme/brandTheme';

export default function PlannerPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.session) as PlanningSession;
  const design = useSelector((state: RootState) => state.design) as RoomDesign;
  const cart = useSelector((state: RootState) => state.cart) as ShoppingCartType;
  const [activeTab, setActiveTab] = useState(0);
  
  const [getRecommendations] = useGetRecommendationsMutation();
  const [sendChat, { isLoading: isLoadingChat }] = useSendChatMessageMutation();
  const [uploadImage, { isLoading: isUploadingImage }] = useUploadImageMutation();
  const [detectFurniture, { isLoading: isDetectingFurniture }] = useDetectFurnitureMutation();
  const [replaceFurniture, { isLoading: isReplacingFurniture }] = useReplaceFurnitureMutation();
  const [placeFurnitureInImage, { isLoading: isPlacingFurniture }] = usePlaceFurnitureMutation();
  
  const [currentImageFile, setCurrentImageFile] = useState<File | null>(null);
  const [currentPreviewUrl, setCurrentPreviewUrl] = useState<string | null>(null);

  const handleRoomConfig = (config: { roomType: RoomType; dimensions: RoomDimensions }) => {
    dispatch(configureRoom(config));
    dispatch(setRoomConfig(config));
  };

  const handlePreferences = async (prefs: UserPreferences) => {
    dispatch(updatePreferences(prefs));
    
    // Request AI recommendations
    if (design.roomType && design.roomDimensions) {
      try {
        const result = await getRecommendations({
          roomType: design.roomType,
          dimensions: design.roomDimensions,
          budget: prefs.budget || undefined,
          preferences: prefs,
          language: session.userSettings.language,
        }).unwrap();

        // Add recommendations to design
        result.recommendations.forEach((placement) => {
          dispatch(placeFurniture(placement));
        });

        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: `Added ${result.recommendations.length} furniture recommendations`,
        }));

        // Check budget
        if (result.isBudgetExceeded && result.exceededAmount) {
          dispatch(addNotification({
            type: 'warning',
            message: `Budget exceeded by ${result.exceededAmount.currency} ${result.exceededAmount.amount.toFixed(2)}`,
          }));
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to get recommendations. Please try again.',
        }));
      }
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
    setCurrentImageFile(file);
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

  const handleViewReplacements = (itemId: string) => {
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
                <Tab label="Configure" />
                <Tab label="Preferences" />
                <Tab label="Image" />
                <Tab label="Chat" />
                <Tab label="Cart" />
              </Tabs>
            </Paper>

            {activeTab === 0 && <RoomConfigPanel onConfigComplete={handleRoomConfig} />}
            {activeTab === 1 && <PreferencesPanel onPreferencesChange={handlePreferences} />}
            {activeTab === 2 && (
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
            {activeTab === 3 && (
              <Box sx={{ height: 600 }}>
                <ChatPanel
                  messages={session.chatHistory}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingChat}
                />
              </Box>
            )}
            {activeTab === 4 && (
              <ShoppingCart
                items={cart.items}
                onUpdateQuantity={(itemId, quantity) => dispatch(updateQuantity({ itemId, quantity }))}
                onRemove={(itemId) => dispatch(removeCartItem(itemId))}
                onCheckout={() => alert('Checkout feature coming soon!')}
              />
            )}
          </Box>

          {/* Right Panel - Visualization and Furniture */}
          <Box sx={{ flex: 1 }}>
            <VisualizationCanvas
              mode={design.viewState.mode}
              design={design}
              onModeChange={(mode) => dispatch(switchViewMode(mode))}
            />
            
            <Box sx={{ mt: 3 }}>
              <FurnitureList
                placements={design.furniturePlacements}
                onAddToCart={handleAddToCart}
                onRemove={handleRemove}
              />
            </Box>
          </Box>
        </Box>

        {/* Status Bar */}
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Status: {session.status} | Room: {design.roomType || 'Not configured'} | 
            Furniture: {design.furniturePlacements.length} items | 
            Cart: {cart.items.length} items
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
