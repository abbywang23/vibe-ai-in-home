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
import { setRoomConfig, placeFurniture, removeFurniture, setFurniturePlacements } from './store/slices/designSlice';
import { addItem } from './store/slices/cartSlice';
import RoomConfigPanel from './components/RoomConfigPanel';
import PreferencesPanel from './components/PreferencesPanel';
import RecommendationsDisplay from './components/RecommendationsDisplay';
import ChatPanel from './components/ChatPanel';
import { RoomType, RoomDimensions, UserPreferences, MessageSender, ChatMessage as ChatMessageType } from './types/domain';
import { useGetRecommendationsMutation, useSendChatMessageMutation } from './services/aiApi';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const session = useSelector((state: RootState) => state.session);
  const design = useSelector((state: RootState) => state.design);
  const cart = useSelector((state: RootState) => state.cart);
  const [activeTab, setActiveTab] = useState(0);
  
  const [getRecommendations] = useGetRecommendationsMutation();
  const [sendChat, { isLoading: isLoadingChat }] = useSendChatMessageMutation();

  const handleRoomConfig = (config: { roomType: RoomType; dimensions: RoomDimensions }) => {
    dispatch(configureRoom(config));
    // Also update the design slice
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
          budget: prefs.budget ? { amount: prefs.budget.amount, currency: prefs.budget.currency } : undefined,
          preferences: {
            selectedCategories: prefs.selectedCategories,
            selectedCollections: prefs.selectedCollections,
            preferredProducts: prefs.preferredProducts,
          },
          language: session.userSettings.language,
        }).unwrap();

        // Convert backend recommendations to frontend FurniturePlacement format
        const placements = result.recommendations.map((rec) => ({
          placementId: `placement_${Date.now()}_${rec.productId}`,
          productId: rec.productId,
          productName: rec.productName,
          productDimensions: {
            width: 1.0, // Default dimensions - would need to fetch from product
            depth: 1.0,
            height: 1.0,
            unit: 'meters',
          },
          position: rec.position,
          rotation: rec.rotation,
          isFromAI: true,
          addedAt: new Date().toISOString(),
        }));

        // Replace all placements with new recommendations
        dispatch(setFurniturePlacements(placements));
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
        sessionId: session.sessionId || 'default',
        message,
        language: session.userSettings.language as 'en' | 'zh',
        context: {
          currentDesign: design,
        },
      }).unwrap();

      // Add AI response to chat history
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
          </Box>

          {/* Right Panel - Recommendations */}
          <Box sx={{ flex: 1 }}>
            <RecommendationsDisplay
              placements={design.furniturePlacements}
              onAddToCart={handleAddToCart}
              onRemove={handleRemove}
            />
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
