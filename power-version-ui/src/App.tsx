import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AppProvider } from '@/context/AppContext';
import { fortressTheme } from '@/theme/fortressTheme';
import LandingPage from '@/pages/LandingPage';
import UnifiedDesignFlow from '@/components/UnifiedDesignFlow';

function App() {
  return (
    <ThemeProvider theme={fortressTheme}>
      <CssBaseline />
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/design" element={<UnifiedDesignFlow />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
