import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  AppBar,
  Toolbar,
} from '@mui/material';
import RoomConfigPanel from './components/RoomConfigPanel';
import PreferencesPanel from './components/PreferencesPanel';
import RecommendationsDisplay from './components/RecommendationsDisplay';
import ChatPanel from './components/ChatPanel';
import {
  RoomConfig,
  UserPreferences,
  Recommendation,
  ChatMessage,
} from './types';
import { apiService } from './services/api';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#e74c3c',
    },
  },
});

function App() {
  const [step, setStep] = useState<'config' | 'preferences' | 'results'>('config');
  const [roomConfig, setRoomConfig] = useState<RoomConfig | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [budgetExceeded, setBudgetExceeded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sessionId] = useState<string>(() => 
    `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  const handleRoomConfigComplete = (config: RoomConfig) => {
    setRoomConfig(config);
    setStep('preferences');
  };

  const handlePreferencesComplete = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    setLoading(true);
    setError(null);

    try {
      if (!roomConfig) {
        throw new Error('Room configuration is missing');
      }

      const response = await apiService.getRecommendations(roomConfig, prefs);
      
      setRecommendations(response.recommendations);
      setTotalPrice(response.totalPrice);
      setBudgetExceeded(response.budgetExceeded);
      setStep('results');
    } catch (err: any) {
      setError(err.message || 'Failed to get recommendations');
      console.error('Error getting recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: message,
      sender: 'user',
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, userMessage]);

    try {
      const response = await apiService.sendChatMessage(sessionId, message, 'en');
      
      // Add AI response
      const aiMessage: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        content: response.reply,
        sender: 'ai',
        timestamp: new Date(),
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending chat message:', err);
    }
  };

  const handleStartOver = () => {
    setStep('config');
    setRoomConfig(null);
    setPreferences({});
    setRecommendations([]);
    setTotalPrice(0);
    setBudgetExceeded(false);
    setError(null);
    setChatMessages([]);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              🏠 Castlery 家具规划助手
            </Typography>
            <Typography variant="body2">
              Furniture Room Planner
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {error && (
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
              <Typography>错误: {error}</Typography>
            </Paper>
          )}

          {step === 'config' && (
            <RoomConfigPanel onComplete={handleRoomConfigComplete} />
          )}

          {step === 'preferences' && roomConfig && (
            <PreferencesPanel
              roomConfig={roomConfig}
              onComplete={handlePreferencesComplete}
              onBack={() => setStep('config')}
              loading={loading}
            />
          )}

          {step === 'results' && (
            <Box>
              <RecommendationsDisplay
                recommendations={recommendations}
                totalPrice={totalPrice}
                budgetExceeded={budgetExceeded}
                budget={preferences.budget}
                roomConfig={roomConfig!}
                onStartOver={handleStartOver}
              />
              
              <Box sx={{ mt: 4 }}>
                <ChatPanel
                  messages={chatMessages}
                  onSendMessage={handleSendMessage}
                />
              </Box>
            </Box>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
