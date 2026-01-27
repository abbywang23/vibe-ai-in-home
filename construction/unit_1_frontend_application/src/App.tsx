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
} from '@mui/material';
import { RootState, AppDispatch } from './store';
import { configureRoom, updatePreferences, addChatMessage } from './store/slices/sessionSlice';
import { placeFurniture, removeFurniture, setRoomConfig } from './store/slices/designSlice';
import { addItem, updateQuantity, removeItem as removeCartItem } from './store/slices/cartSlice';
import { switchViewMode } from './store/slices/designSlice';
import RoomConfigPanel from './components/RoomConfigPanel';
import PreferencesPanel from './components/PreferencesPanel';
import RecommendationsDisplay from './components/RecommendationsDisplay';
import ChatPanel from './components/ChatPanel';
import ShoppingCart from './components/ShoppingCart';
import FurnitureList from './components/FurnitureList';
import VisualizationCanvas from './components/VisualizationCanvas';
import { RoomType, RoomDimensions, UserPreferences, MessageSender, ChatMessage as ChatMessageType, PlanningSession, RoomDesign, ShoppingCart } from './types/domain';
import { useGetRecommendationsMutation, useSendChatMessageMutation } from './services/aiApi';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.session) as PlanningSession;
  const design = useSelector((state: RootState) => state.design) as RoomDesign;
  const cart = useSelector((state: RootState) => state.cart) as ShoppingCart;
  const [activeTab, setActiveTab] = useState(0);
  
  const [getRecommendations] = useGetRecommendationsMutation();
  const [sendChat, { isLoading: isLoadingChat }] = useSendChatMessageMutation();

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
      } catch (error) {
        console.error('Failed to get recommendations:', error);
      }
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message to chat history
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
        message,
        language: session.userSettings.language,
        conversationHistory: session.chatHistory,
        sessionContext: {
          roomType: design.roomType || undefined,
          budget: session.preferences.budget || undefined,
        },
      }).unwrap();

      // Add AI response to chat history
      dispatch(addChatMessage(result.message));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAddToCart = (placementId: string) => {
    const placement = design.furniturePlacements.find((p: any) => p.placementId === placementId);
    if (placement) {
      const cartItem = {
        itemId: `item_${Date.now()}`,
        productId: placement.productId,
        productName: placement.productName,
        quantity: 1,
        unitPrice: { amount: 0, currency: 'USD' }, // Price would come from product service
        thumbnailUrl: '',
        isInStock: true,
        addedAt: new Date().toISOString(),
      };
      dispatch(addItem(cartItem));
    }
  };

  const handleRemove = (placementId: string) => {
    dispatch(removeFurniture(placementId));
  };

  const handleAddAllToCart = () => {
    design.furniturePlacements.forEach((placement) => {
      const cartItem = {
        itemId: `item_${Date.now()}_${placement.placementId}`,
        productId: placement.productId,
        productName: placement.productName,
        quantity: 1,
        unitPrice: { amount: 0, currency: 'USD' },
        thumbnailUrl: '',
        isInStock: true,
        addedAt: new Date().toISOString(),
      };
      dispatch(addItem(cartItem));
    });
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            🏠 Castlery Furniture Planner
          </Typography>
          <Typography variant="body2">
            Cart: {cart.items.length} items
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          AI-Powered Room Design
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
          {/* Left Panel */}
          <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
            <Paper sx={{ mb: 2 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="fullWidth">
                <Tab label="Configure" />
                <Tab label="Preferences" />
                <Tab label="Chat" />
                <Tab label="Cart" />
              </Tabs>
            </Paper>

            {activeTab === 0 && <RoomConfigPanel onConfigComplete={handleRoomConfig} />}
            {activeTab === 1 && <PreferencesPanel onPreferencesChange={handlePreferences} />}
            {activeTab === 2 && (
              <Box sx={{ height: 600 }}>
                <ChatPanel
                  messages={session.chatHistory}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingChat}
                />
              </Box>
            )}
            {activeTab === 3 && (
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
            
            <Box sx={{ mt: 3 }}>
              <RecommendationsDisplay
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

export default App;
