import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { DesignStudio } from './components/DesignStudio';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return <DesignStudio />;
}
