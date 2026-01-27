import { useState } from 'react';
import { ChevronLeft, ArrowRight, RefreshCw, Palette, DollarSign, Sparkles } from 'lucide-react';
import { RoomData, DesignPreferences } from '@/app/App';
import { ProgressBar } from '@/app/components/prototype/ProgressBar';

interface VisionStepProps {
  roomData: RoomData;
  onComplete: (preferences: DesignPreferences) => void;
  onBack: () => void;
}

export function VisionStep({ roomData, onComplete, onBack }: VisionStepProps) {
  const [intent, setIntent] = useState<'refresh' | 'redesign'>('refresh');
  const [style, setStyle] = useState(roomData.style);
  const [budget, setBudget] = useState({ min: 2000, max: 5000 });

  const styles = [
    'Modern Minimalist',
    'Contemporary',
    'Scandinavian',
    'Industrial',
    'Mid-Century Modern',
    'Traditional',
    'Bohemian',
    'Rustic'
  ];

  const handleContinue = () => {
    onComplete({ intent, style, budget });
  };

  return (
    <div className="min-h-screen">
      <ProgressBar currentStep={2} totalSteps={3} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <h2 className="mb-2">Define Your Vision</h2>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Tell us what you're looking for and we'll suggest the perfect furniture
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Design Intent */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-primary" />
                <h4>What would you like to do?</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setIntent('refresh')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    intent === 'refresh'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-muted'
                  }`}
                >
                  <h5 className="mb-2">Refresh Existing</h5>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                    Replace some furniture while keeping the overall layout
                  </p>
                </button>
                <button
                  onClick={() => setIntent('redesign')}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    intent === 'redesign'
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:border-muted'
                  }`}
                >
                  <h5 className="mb-2">Complete Redesign</h5>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                    Start fresh with a completely new furniture arrangement
                  </p>
                </button>
              </div>
            </div>

            {/* Style Selection */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-primary" />
                <h4>Choose Your Style</h4>
              </div>
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <p style={{ fontSize: 'var(--text-caption)' }}>
                    Based on your room, we recommend: <strong>{roomData.style}</strong>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStyle(s)}
                    className={`px-4 py-3 rounded-lg border transition-all ${
                      style === s
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border bg-card hover:border-muted'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary" />
                <h4>Set Your Budget</h4>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>
                      Budget Range
                    </p>
                    <p style={{ fontSize: 'var(--text-h4)' }}>
                      ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>
                      Recommended
                    </p>
                    <p className="text-accent" style={{ fontSize: 'var(--text-label)' }}>
                      $2,000 - $5,000
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2">Minimum: ${budget.min.toLocaleString()}</label>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={budget.min}
                      onChange={(e) => setBudget({ ...budget, min: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                  <div>
                    <label className="block mb-2">Maximum: ${budget.max.toLocaleString()}</label>
                    <input
                      type="range"
                      min="1000"
                      max="10000"
                      step="500"
                      value={budget.max}
                      onChange={(e) => setBudget({ ...budget, max: Number(e.target.value) })}
                      className="w-full accent-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
              <h5 className="mb-4">Your Preferences</h5>
              <div className="space-y-4 mb-6">
                <SummaryItem label="Room Type" value={roomData.roomType} />
                <SummaryItem label="Dimensions" value={roomData.dimensions} />
                <SummaryItem label="Design Intent" value={intent === 'refresh' ? 'Refresh Existing' : 'Complete Redesign'} />
                <SummaryItem label="Style" value={style} />
                <SummaryItem label="Budget" value={`$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`} />
              </div>
              <button
                onClick={handleContinue}
                className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 group"
              >
                See AI Recommendations
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="pb-3 border-b border-border last:border-0">
      <div className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>
        {label}
      </div>
      <div className="font-medium" style={{ fontSize: 'var(--text-label)' }}>
        {value}
      </div>
    </div>
  );
}
