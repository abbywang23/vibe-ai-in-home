import { useState, useEffect } from 'react';
import { Eye, ShoppingCart, RefreshCw, Download, Share2, Sparkles, DollarSign, ArrowLeft, Check } from 'lucide-react';
import { RoomData, DesignPreferences, FurnitureItem } from '@/app/App';
import { ProgressBar } from '@/app/components/prototype/ProgressBar';

interface RenderStepProps {
  roomData: RoomData;
  preferences: DesignPreferences;
  furniture: FurnitureItem[];
  onStartOver: () => void;
  onRefine: () => void;
}

export function RenderStep({ roomData, preferences, furniture, onStartOver, onRefine }: RenderStepProps) {
  const [isRendering, setIsRendering] = useState(true);
  const [renderProgress, setRenderProgress] = useState(0);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  useEffect(() => {
    // Simulate rendering process
    const steps = [
      { progress: 15, delay: 500, status: 'Placing furniture in room...' },
      { progress: 40, delay: 1000, status: 'Adjusting lighting and shadows...' },
      { progress: 65, delay: 1500, status: 'Adding realistic details...' },
      { progress: 85, delay: 2000, status: 'Finalizing scene...' },
      { progress: 100, delay: 2500, status: 'Complete!' }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setRenderProgress(steps[currentStep].progress);
        currentStep++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsRendering(false), 500);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const totalCost = furniture.reduce((sum, item) => sum + item.price, 0);
  const renderedImageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80';

  if (isRendering) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-6">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-primary/10">
              <Sparkles className="w-10 h-10 text-primary animate-pulse" />
            </div>
            <h3 className="mb-2">Creating Your Design</h3>
            <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-base)' }}>
              Our AI is rendering your room with selected furniture
            </p>
            <div className="w-full bg-muted rounded-full h-3 mb-2">
              <div
                className="bg-primary h-3 rounded-full transition-all duration-500"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              {renderProgress}% complete
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <ProgressBar currentStep={3} totalSteps={3} />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2>Your Redesigned Room</h2>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              {preferences.style} style • {furniture.length} items • ${totalCost.toLocaleString()}
            </p>
          </div>
          <button
            onClick={onStartOver}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Start Over
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rendered Image */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="relative aspect-[4/3]">
                <img
                  src={renderedImageUrl}
                  alt="Rendered room"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg hover:bg-background transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  {showComparison ? 'Hide' : 'Show'} Before/After
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ActionButton icon={<RefreshCw />} label="Generate Variation" />
              <ActionButton icon={<Sparkles />} label="Add Accessories" />
              <ActionButton icon={<Download />} label="Download" />
              <ActionButton icon={<Share2 />} label="Share" />
            </div>

            {/* Refinement Options */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
              <h4 className="mb-4">Want to make changes?</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={onRefine}
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Swap Furniture
                </button>
                <button className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors">
                  Adjust Positions
                </button>
                <button className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors">
                  Change Lighting
                </button>
                <button className="px-4 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors">
                  Try Different Style
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Shopping List */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h4 className="mb-4">Shopping List</h4>
              <div className="space-y-3 mb-6">
                {furniture.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedItem === item.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium mb-1" style={{ fontSize: 'var(--text-label)' }}>
                          {item.name}
                        </div>
                        <div className="text-primary" style={{ fontSize: 'var(--text-caption)' }}>
                          ${item.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="pt-4 border-t border-border mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 'var(--text-label)' }}>Total</span>
                  <span className="text-primary" style={{ fontSize: 'var(--text-h4)' }}>
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  {furniture.length} items
                </p>
              </div>

              <button className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 group">
                <ShoppingCart className="w-5 h-5" />
                Purchase All Items
              </button>

              <p className="text-center text-muted-foreground mt-4" style={{ fontSize: 'var(--text-caption)' }}>
                Free shipping on orders over $1,000
              </p>
            </div>

            {/* Room Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h5 className="mb-4">Room Details</h5>
              <div className="space-y-3">
                <InfoItem label="Type" value={roomData.roomType} />
                <InfoItem label="Dimensions" value={roomData.dimensions} />
                <InfoItem label="Style" value={preferences.style} />
                <InfoItem label="Intent" value={preferences.intent === 'refresh' ? 'Refresh Existing' : 'Complete Redesign'} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="px-4 py-3 bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2">
      {icon}
      <span className="hidden md:inline" style={{ fontSize: 'var(--text-caption)' }}>{label}</span>
    </button>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-border last:border-0">
      <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
        {label}
      </span>
      <span className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>
        {value}
      </span>
    </div>
  );
}
