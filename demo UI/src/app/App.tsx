import { useState } from 'react';
import { LandingPage } from '@/app/components/LandingPage';
import { DesignStudio } from '@/app/components/DesignStudio';

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  return <DesignStudio />;
}
