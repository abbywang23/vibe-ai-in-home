import { useState, useEffect } from 'react';
import { 
  Upload, 
  Sparkles, 
  CheckCircle, 
  Home, 
  Ruler, 
  Sofa, 
  Palette,
  RefreshCw,
  DollarSign,
  ArrowRight,
  Eye,
  ShoppingCart,
  Download,
  Share2,
  Zap
} from 'lucide-react';

type Step = 'upload' | 'vision' | 'selection' | 'render';

interface RoomData {
  imageUrl: string;
  roomType: string;
  dimensions: string;
  furniture: string[];
  style: string;
  confidence: number;
}

interface DesignPreferences {
  intent: 'refresh' | 'redesign';
  style: string;
  budget: { min: number; max: number };
}

interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  reason: string;
  dimensions: string;
}

export function UnifiedDesignFlow() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [preferences, setPreferences] = useState<DesignPreferences>({
    intent: 'refresh',
    style: 'Modern Minimalist',
    budget: { min: 2000, max: 5000 }
  });
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingFurniture, setIsLoadingFurniture] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Handle image upload and analysis
  const handleImageUpload = async () => {
    const imageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80';
    setIsAnalyzing(true);

    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));

    const data: RoomData = {
      imageUrl,
      roomType: 'Living Room',
      dimensions: "12' × 15'",
      furniture: ['Sofa', 'Coffee Table', 'Armchair'],
      style: 'Modern Minimalist',
      confidence: 95
    };

    setRoomData(data);
    setPreferences(prev => ({ ...prev, style: data.style }));
    setIsAnalyzing(false);
    setCurrentStep('vision');
  };

  // Auto-load furniture when vision is complete
  useEffect(() => {
    if (currentStep === 'selection' && selectedFurniture.length === 0) {
      setIsLoadingFurniture(true);
      setTimeout(() => {
        const furniture: FurnitureItem[] = [
          {
            id: '1',
            name: 'Aria Sofa',
            category: 'Sofa',
            price: 1899,
            imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
            reason: 'Perfect for 12\' wall, matches modern style',
            dimensions: '84" W × 36" D × 32" H'
          },
          {
            id: '2',
            name: 'Oslo Coffee Table',
            category: 'Coffee Table',
            price: 549,
            imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&q=80',
            reason: 'Complements sofa height, wood tone matches',
            dimensions: '48" W × 24" D × 18" H'
          },
          {
            id: '3',
            name: 'Bergen Armchair',
            category: 'Armchair',
            price: 649,
            imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80',
            reason: 'Completes seating area, within budget',
            dimensions: '32" W × 34" D × 35" H'
          },
          {
            id: '4',
            name: 'Larsen Bookshelf',
            category: 'Storage',
            price: 429,
            imageUrl: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&q=80',
            reason: 'Adds storage, fills corner space perfectly',
            dimensions: '36" W × 16" D × 72" H'
          },
          {
            id: '5',
            name: 'Nordic Side Table',
            category: 'Side Table',
            price: 279,
            imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80',
            reason: 'Balances room layout, functional accent',
            dimensions: '20" W × 20" D × 24" H'
          }
        ];
        setSelectedFurniture(furniture);
        setIsLoadingFurniture(false);
      }, 1500);
    }
  }, [currentStep, selectedFurniture.length]);

  // Handle render
  const handleGenerateRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);
    setCurrentStep('render');

    const steps = [15, 40, 65, 85, 100];
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 500));
      setRenderProgress(progress);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRendering(false);
  };

  const totalCost = selectedFurniture.reduce((sum, item) => sum + item.price, 0);
  const withinBudget = totalCost <= preferences.budget.max;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <h2>AI Interior Design Studio</h2>
          <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
            Transform your space with intelligent furniture recommendations
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Steps */}
        <div className="w-full lg:w-[600px] xl:w-[700px] border-r border-border bg-card overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[
                { id: 'upload', label: 'Upload', num: 1 },
                { id: 'vision', label: 'Vision', num: 2 },
                { id: 'selection', label: 'Selection', num: 3 },
                { id: 'render', label: 'Results', num: 4 }
              ].map((step, idx) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        currentStep === step.id || 
                        (currentStep === 'vision' && step.id === 'upload') ||
                        (currentStep === 'selection' && ['upload', 'vision'].includes(step.id)) ||
                        (currentStep === 'render' && ['upload', 'vision', 'selection'].includes(step.id))
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <span style={{ fontSize: 'var(--text-small)' }}>{step.num}</span>
                    </div>
                    <span
                      className="mt-1 text-xs"
                      style={{ fontSize: 'var(--text-small)' }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < 3 && <div className="flex-1 h-0.5 bg-border mb-6" />}
                </div>
              ))}
            </div>

            {/* Step 1: Upload */}
            <div className={`transition-opacity ${currentStep === 'upload' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-primary" />
                <h4>Step 1: Upload Your Room</h4>
              </div>
              
              {!roomData ? (
                <button
                  onClick={handleImageUpload}
                  disabled={isAnalyzing}
                  className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-4 bg-background group disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                      <div className="text-center">
                        <h5 className="mb-2">Analyzing Your Room...</h5>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                          AI is detecting room details
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Upload className="w-8 h-8 text-primary" />
                      </div>
                      <div className="text-center">
                        <h5 className="mb-2">Click to Upload Room Photo</h5>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                          JPG, PNG up to 10MB
                        </p>
                      </div>
                    </>
                  )}
                </button>
              ) : (
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <h5 className="text-primary">Analysis Complete</h5>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <AIDetection icon={<Home />} label="Room Type" value={roomData.roomType} />
                    <AIDetection icon={<Ruler />} label="Dimensions" value={roomData.dimensions} />
                    <AIDetection icon={<Sofa />} label="Furniture" value={roomData.furniture.join(', ')} />
                    <AIDetection icon={<Palette />} label="Style" value={roomData.style} />
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Vision */}
            {roomData && (
              <div className={`transition-opacity ${currentStep === 'vision' ? 'opacity-100' : currentStep === 'upload' ? 'opacity-0 h-0 overflow-hidden' : 'opacity-50 pointer-events-none'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4>Step 2: Define Your Vision</h4>
                </div>

                <div className="space-y-4">
                  {/* Design Intent */}
                  <div>
                    <label className="block mb-2">What would you like to do?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPreferences({ ...preferences, intent: 'refresh' })}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          preferences.intent === 'refresh'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <RefreshCw className="w-4 h-4" />
                          <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>Refresh</span>
                        </div>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          Replace some items
                        </p>
                      </button>
                      <button
                        onClick={() => setPreferences({ ...preferences, intent: 'redesign' })}
                        className={`p-4 rounded-lg border transition-all text-left ${
                          preferences.intent === 'redesign'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-muted'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4" />
                          <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>Redesign</span>
                        </div>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          Complete makeover
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Style */}
                  <div>
                    <label className="block mb-2">Style Preference</label>
                    <select
                      value={preferences.style}
                      onChange={(e) => setPreferences({ ...preferences, style: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option>Modern Minimalist</option>
                      <option>Contemporary</option>
                      <option>Scandinavian</option>
                      <option>Industrial</option>
                      <option>Mid-Century Modern</option>
                      <option>Traditional</option>
                      <option>Bohemian</option>
                      <option>Rustic</option>
                    </select>
                  </div>

                  {/* Budget */}
                  <div>
                    <label className="block mb-2">Budget Range</label>
                    <div className="bg-background border border-border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span style={{ fontSize: 'var(--text-label)' }}>
                          ${preferences.budget.min.toLocaleString()} - ${preferences.budget.max.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>Min</span>
                          <span style={{ fontSize: 'var(--text-caption)' }}>${preferences.budget.min.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="10000"
                          step="500"
                          value={preferences.budget.min}
                          onChange={(e) => setPreferences({ ...preferences, budget: { ...preferences.budget, min: Number(e.target.value) } })}
                          className="w-full accent-primary"
                        />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>Max</span>
                          <span style={{ fontSize: 'var(--text-caption)' }}>${preferences.budget.max.toLocaleString()}</span>
                        </div>
                        <input
                          type="range"
                          min="1000"
                          max="10000"
                          step="500"
                          value={preferences.budget.max}
                          onChange={(e) => setPreferences({ ...preferences, budget: { ...preferences.budget, max: Number(e.target.value) } })}
                          className="w-full accent-primary"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep('selection')}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Selection
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Selection */}
            {currentStep !== 'upload' && (
              <div className={`transition-opacity ${currentStep === 'selection' || currentStep === 'render' ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
                <div className="flex items-center gap-2 mb-4">
                  <Sofa className="w-5 h-5 text-primary" />
                  <h4>Step 3: AI Furniture Selection</h4>
                </div>

                {isLoadingFurniture ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <Zap className="w-8 h-8 text-primary animate-pulse mx-auto mb-3" />
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                      AI is selecting perfect furniture...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFurniture.map((item) => (
                      <div key={item.id} className="bg-background border border-border rounded-lg p-3 hover:border-primary/50 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded bg-muted overflow-hidden flex-shrink-0">
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="text-sm">{item.name}</h5>
                              <span className="text-primary font-medium" style={{ fontSize: 'var(--text-caption)' }}>
                                ${item.price.toLocaleString()}
                              </span>
                            </div>
                            <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                              {item.category}
                            </p>
                            <div className="flex items-start gap-1 p-2 bg-accent/5 border border-accent/20 rounded">
                              <Sparkles className="w-3 h-3 text-accent flex-shrink-0 mt-0.5" />
                              <p className="text-accent" style={{ fontSize: 'var(--text-small)' }}>
                                {item.reason}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span style={{ fontSize: 'var(--text-label)' }}>Total Cost</span>
                        <span className="text-primary" style={{ fontSize: 'var(--text-h5)' }}>
                          ${totalCost.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                        {withinBudget ? '✓ Within your budget' : `$${(totalCost - preferences.budget.max).toLocaleString()} over budget`}
                      </p>
                    </div>

                    {currentStep === 'selection' && (
                      <button
                        onClick={handleGenerateRender}
                        disabled={!withinBudget}
                        className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Generate My Design
                        <Eye className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Actions */}
            {currentStep === 'render' && !isRendering && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-primary" />
                  <h4>Step 4: Results & Actions</h4>
                </div>

                <button className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Purchase All Items (${totalCost.toLocaleString()})
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button className="px-4 py-3 bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-caption)' }}>Variations</span>
                  </button>
                  <button className="px-4 py-3 bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-caption)' }}>Accessories</span>
                  </button>
                  <button className="px-4 py-3 bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-caption)' }}>Download</span>
                  </button>
                  <button className="px-4 py-3 bg-card border border-border rounded-lg hover:border-primary transition-colors flex items-center justify-center gap-2">
                    <Share2 className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-caption)' }}>Share</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setCurrentStep('upload');
                    setRoomData(null);
                    setSelectedFurniture([]);
                    setRenderProgress(0);
                  }}
                  className="w-full px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                  style={{ fontSize: 'var(--text-caption)' }}
                >
                  Start Over
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Live Preview */}
        <div className="flex-1 bg-background overflow-y-auto">
          <div className="h-full flex items-center justify-center p-6">
            {!roomData ? (
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
                  <Eye className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="mb-3">Live Preview</h3>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                  Upload a room photo to see AI analysis and design results here
                </p>
              </div>
            ) : currentStep === 'upload' || currentStep === 'vision' ? (
              <div className="w-full max-w-3xl">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border mb-6">
                  <img src={roomData.imageUrl} alt="Your room" className="w-full h-full object-cover" />
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="mb-4">Detected Room Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoCard icon={<Home />} label="Room Type" value={roomData.roomType} confidence={roomData.confidence} />
                    <InfoCard icon={<Ruler />} label="Dimensions" value={`${roomData.dimensions} (180 sq ft)`} confidence={92} />
                    <InfoCard icon={<Sofa />} label="Furniture" value={roomData.furniture.join(', ')} confidence={88} />
                    <InfoCard icon={<Palette />} label="Style" value={roomData.style} confidence={90} />
                  </div>
                </div>
              </div>
            ) : isRendering ? (
              <div className="text-center max-w-md">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                </div>
                <h3 className="mb-3">Rendering Your Design</h3>
                <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-base)' }}>
                  AI is placing furniture and optimizing the scene
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
            ) : (
              <div className="w-full max-w-4xl">
                <div className="aspect-[4/3] rounded-lg overflow-hidden border border-border mb-6 relative group">
                  <img src={roomData.imageUrl} alt="Rendered room" className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-caption)' }}>AI Rendered</span>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h4 className="mb-4">Your Redesigned {roomData.roomType}</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>Style</p>
                      <p className="font-medium" style={{ fontSize: 'var(--text-label)' }}>{preferences.style}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>Items</p>
                      <p className="font-medium" style={{ fontSize: 'var(--text-label)' }}>{selectedFurniture.length} pieces</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>Total</p>
                      <p className="font-medium text-primary" style={{ fontSize: 'var(--text-label)' }}>${totalCost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AIDetection({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-3 bg-background rounded-lg border border-border">
      <div className="flex items-center gap-2 mb-1 text-primary">
        {icon}
        <span style={{ fontSize: 'var(--text-small)' }}>{label}</span>
      </div>
      <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{value}</p>
    </div>
  );
}

function InfoCard({ icon, label, value, confidence }: { icon: React.ReactNode; label: string; value: string; confidence: number }) {
  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2 text-primary">
        {icon}
        <span style={{ fontSize: 'var(--text-label)' }}>{label}</span>
      </div>
      <p className="font-medium mb-1" style={{ fontSize: 'var(--text-base)' }}>{value}</p>
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-background rounded-full h-1">
          <div className="bg-primary h-1 rounded-full" style={{ width: `${confidence}%` }} />
        </div>
        <span className="text-primary" style={{ fontSize: 'var(--text-small)' }}>{confidence}%</span>
      </div>
    </div>
  );
}
