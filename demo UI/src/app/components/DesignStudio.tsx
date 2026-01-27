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
  Eye,
  ShoppingCart,
  Download,
  Share2,
  Zap,
  ChevronDown,
  ChevronUp,
  Lock,
  Check,
  Loader2,
  ArrowLeft,
  ArrowRight,
  X
} from 'lucide-react';
import { FurnitureComparisonCard } from './FurnitureComparisonCard';

type StepId = 'upload' | 'vision' | 'selection' | 'confirmation';
type StepStatus = 'pending' | 'active' | 'completed' | 'locked';
type RoomIntent = 'refresh' | 'new';
type RoomSize = 'small' | 'medium' | 'large' | 'xlarge';

interface RoomSetup {
  intent: RoomIntent;
  size: RoomSize;
  roomType: string;
}

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
  existingItem?: {
    name: string;
    imageUrl: string;
    estimatedValue: number;
  };
  isSelected?: boolean;
}

export type { FurnitureItem };

interface Step {
  id: StepId;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: StepStatus;
}

export function DesignStudio() {
  const [steps, setSteps] = useState<Step[]>([
    { id: 'upload', number: 1, title: 'Room Setup', subtitle: 'Upload & analyze your space', icon: <Upload className="w-5 h-5" />, status: 'active' },
    { id: 'vision', number: 2, title: 'Design Vision', subtitle: 'Define style & preferences', icon: <Palette className="w-5 h-5" />, status: 'pending' },
    { id: 'selection', number: 3, title: 'Furniture Selection', subtitle: 'Review AI recommendations', icon: <Sofa className="w-5 h-5" />, status: 'pending' },
    { id: 'confirmation', number: 4, title: 'Final Review', subtitle: 'Generate & purchase', icon: <Eye className="w-5 h-5" />, status: 'pending' }
  ]);

  const [expandedStep, setExpandedStep] = useState<StepId>('upload');
  const [roomSetup, setRoomSetup] = useState<RoomSetup>({
    intent: 'refresh',
    size: 'medium',
    roomType: 'Living Room'
  });
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
  const [showFinalResult, setShowFinalResult] = useState(false);

  // Update step status helper
  const updateStepStatus = (stepId: StepId, status: StepStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Handle step completion
  const completeStep = (stepId: StepId) => {
    updateStepStatus(stepId, 'completed');
    
    // Activate next step
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      updateStepStatus(nextStep.id, 'active');
      setExpandedStep(nextStep.id);
    }
  };

  // Handle image upload
  const handleImageUpload = async () => {
    setIsAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2500));

    const data: RoomData = {
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
      roomType: 'Living Room',
      dimensions: "12' × 15'",
      furniture: ['Sofa', 'Coffee Table', 'Armchair'],
      style: 'Modern Minimalist',
      confidence: 95
    };

    setRoomData(data);
    setPreferences(prev => ({ ...prev, style: data.style }));
    setIsAnalyzing(false);
  };

  // Handle upload step completion
  const handleUploadComplete = () => {
    completeStep('upload');
  };

  // Handle vision step completion
  const handleVisionComplete = () => {
    completeStep('vision');
    
    // Auto-load furniture with existing items detected
    setIsLoadingFurniture(true);
    setTimeout(() => {
      const furniture: FurnitureItem[] = [
        {
          id: '1',
          name: 'Aria Sofa',
          category: 'Sofa',
          price: 1899,
          imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
          reason: 'Upgraded comfort with modern design, better lumbar support and premium fabric',
          dimensions: '84" W × 36" D × 32" H',
          existingItem: {
            name: 'Old Fabric Sofa',
            imageUrl: 'https://images.unsplash.com/photo-1550581190-9c1c48d21d6c?w=400&q=80',
            estimatedValue: 800
          },
          isSelected: true
        },
        {
          id: '2',
          name: 'Oslo Coffee Table',
          category: 'Coffee Table',
          price: 549,
          imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=400&q=80',
          reason: 'Sleeker profile with hidden storage compartments, matches sofa finish perfectly',
          dimensions: '48" W × 24" D × 18" H',
          existingItem: {
            name: 'Wooden Coffee Table',
            imageUrl: 'https://images.unsplash.com/photo-1533090368676-1fd25485db88?w=400&q=80',
            estimatedValue: 300
          },
          isSelected: true
        },
        {
          id: '3',
          name: 'Bergen Armchair',
          category: 'Armchair',
          price: 649,
          imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&q=80',
          reason: 'Better ergonomics with improved back support, complements new sofa design',
          dimensions: '32" W × 34" D × 35" H',
          existingItem: {
            name: 'Vintage Armchair',
            imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&q=80',
            estimatedValue: 450
          },
          isSelected: true
        }
      ];
      setSelectedFurniture(furniture);
      setIsLoadingFurniture(false);
    }, 1500);
  };

  // Toggle furniture item selection
  const handleToggleFurniture = (id: string) => {
    setSelectedFurniture(prev => prev.map(item => 
      item.id === id ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  // Handle selection step completion
  const handleSelectionComplete = () => {
    completeStep('selection');
  };

  // Handle render generation
  const handleGenerateRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    const steps = [15, 40, 65, 85, 100];
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setRenderProgress(progress);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRendering(false);
    setShowFinalResult(true);
    completeStep('confirmation');
  };

  const totalCost = selectedFurniture.filter(item => item.isSelected).reduce((sum, item) => sum + item.price, 0);
  const withinBudget = totalCost <= preferences.budget.max;

  const activeStep = steps.find(s => s.status === 'active');

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="max-w-[2000px] mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h3>AI Interior Design Studio</h3>
            <p className="text-muted-foreground mt-0.5" style={{ fontSize: 'var(--text-caption)' }}>
              {activeStep && `Step ${activeStep.number}/4: ${activeStep.title}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">
              Save Progress
            </button>
            <button className="px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors">
              Help
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Vertical Stepper */}
        <div className="w-[480px] border-r border-border bg-card overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <StepCard
                  key={step.id}
                  step={step}
                  isExpanded={expandedStep === step.id}
                  onToggle={() => {
                    if (step.status === 'active' || step.status === 'completed') {
                      setExpandedStep(expandedStep === step.id ? null as any : step.id);
                    }
                  }}
                  isLast={index === steps.length - 1}
                >
                  {step.id === 'upload' && (
                    <UploadStepContent
                      roomSetup={roomSetup}
                      onRoomSetupChange={setRoomSetup}
                      roomData={roomData}
                      isAnalyzing={isAnalyzing}
                      onUpload={handleImageUpload}
                      onComplete={handleUploadComplete}
                      isCompleted={step.status === 'completed'}
                    />
                  )}
                  {step.id === 'vision' && roomData && (
                    <VisionStepContent
                      roomData={roomData}
                      preferences={preferences}
                      onPreferencesChange={setPreferences}
                      onComplete={handleVisionComplete}
                      isCompleted={step.status === 'completed'}
                    />
                  )}
                  {step.id === 'selection' && (
                    <SelectionStepContent
                      selectedFurniture={selectedFurniture}
                      onToggleFurniture={handleToggleFurniture}
                      isLoading={isLoadingFurniture}
                      totalCost={totalCost}
                      budget={preferences.budget}
                      withinBudget={withinBudget}
                      onComplete={handleSelectionComplete}
                      isCompleted={step.status === 'completed'}
                    />
                  )}
                  {step.id === 'confirmation' && (
                    <ConfirmationStepContent
                      onGenerate={handleGenerateRender}
                      isRendering={isRendering}
                      showFinalResult={showFinalResult}
                      totalCost={totalCost}
                    />
                  )}
                </StepCard>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Visualization Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Rendering Canvas */}
          <div className="flex-1 overflow-y-auto">
            <RenderingCanvas
              roomData={roomData}
              isAnalyzing={isAnalyzing}
              isRendering={isRendering}
              renderProgress={renderProgress}
              showFinalResult={showFinalResult}
              preferences={preferences}
              selectedFurniture={selectedFurniture}
              totalCost={totalCost}
            />
          </div>

          {/* Furniture List Panel */}
          <div className="h-[280px] border-t border-border bg-card overflow-y-auto">
            <FurnitureListPanel
              selectedFurniture={selectedFurniture}
              isLoading={isLoadingFurniture}
              totalCost={totalCost}
              showFinalResult={showFinalResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Card Component
interface StepCardProps {
  step: Step;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  children: React.ReactNode;
}

function StepCard({ step, isExpanded, onToggle, isLast, children }: StepCardProps) {
  const canInteract = step.status === 'active' || step.status === 'completed';
  const isCompleted = step.status === 'completed';
  const isPending = step.status === 'pending';
  const isActive = step.status === 'active';

  return (
    <div className="relative">
      {/* Vertical Line */}
      {!isLast && (
        <div className="absolute left-[19px] top-[44px] bottom-[-16px] w-0.5 bg-border" />
      )}

      <div
        className={`relative rounded-lg border transition-all ${
          isExpanded && canInteract
            ? 'border-primary shadow-sm bg-background'
            : isCompleted
            ? 'border-border bg-background'
            : isPending
            ? 'border-border bg-muted/20'
            : 'border-border bg-background'
        }`}
      >
        {/* Step Header */}
        <button
          onClick={onToggle}
          disabled={!canInteract}
          className={`w-full p-4 flex items-center gap-4 text-left transition-colors ${
            !canInteract ? 'cursor-not-allowed opacity-60' : 'hover:bg-muted/30'
          }`}
        >
          {/* Step Number/Status Icon */}
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
              isCompleted
                ? 'bg-primary text-primary-foreground'
                : isActive
                ? 'bg-primary/10 text-primary border-2 border-primary'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {isCompleted ? (
              <Check className="w-5 h-5" />
            ) : isPending ? (
              <Lock className="w-5 h-5" />
            ) : (
              step.icon
            )}
          </div>

          {/* Step Info */}
          <div className="flex-1 min-w-0">
            <h5 className="mb-0.5">{step.title}</h5>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              {step.subtitle}
            </p>
          </div>

          {/* Expand/Collapse Icon */}
          {canInteract && (
            <div className="text-muted-foreground">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
          )}
        </button>

        {/* Step Content */}
        {isExpanded && canInteract && (
          <div className="px-4 pb-4 border-t border-border">
            <div className="pt-4">
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Upload Step Content
function UploadStepContent({ roomSetup, onRoomSetupChange, roomData, isAnalyzing, onUpload, onComplete, isCompleted }: {
  roomSetup: RoomSetup;
  onRoomSetupChange: (setup: RoomSetup) => void;
  roomData: RoomData | null;
  isAnalyzing: boolean;
  onUpload: () => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  const getRoomSizeLabel = (size: RoomSize) => {
    const labels = {
      small: 'Small (< 150 sq ft)',
      medium: 'Medium (150-300 sq ft)',
      large: 'Large (300-500 sq ft)',
      xlarge: 'X-Large (> 500 sq ft)'
    };
    return labels[size];
  };

  return (
    <div className="space-y-4">
      {/* Room Intent Selection */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Design Intent</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onRoomSetupChange({ ...roomSetup, intent: 'refresh' })}
            disabled={isCompleted}
            className={`p-4 rounded-lg border text-left transition-all ${
              roomSetup.intent === 'refresh'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-background'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-primary" />
              <span className="font-medium" style={{ fontSize: 'var(--text-base)' }}>Refresh Room</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Keep existing layout, replace furniture
            </p>
          </button>
          <button
            onClick={() => onRoomSetupChange({ ...roomSetup, intent: 'new' })}
            disabled={isCompleted}
            className={`p-4 rounded-lg border text-left transition-all ${
              roomSetup.intent === 'new'
                ? 'border-primary bg-primary/5 shadow-sm'
                : 'border-border hover:border-primary/50 bg-background'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-medium" style={{ fontSize: 'var(--text-base)' }}>New Room</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Start fresh, complete redesign
            </p>
          </button>
        </div>
      </div>

      {/* Room Type Selection */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Room Type</label>
        <select
          value={roomSetup.roomType}
          onChange={(e) => onRoomSetupChange({ ...roomSetup, roomType: e.target.value })}
          disabled={isCompleted}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-colors"
          style={{ fontSize: 'var(--text-base)' }}
        >
          <option value="Living Room">Living Room</option>
          <option value="Bedroom">Bedroom</option>
          <option value="Dining Room">Dining Room</option>
          <option value="Kitchen">Kitchen</option>
          <option value="Home Office">Home Office</option>
          <option value="Bathroom">Bathroom</option>
          <option value="Entryway">Entryway</option>
          <option value="Kids Room">Kids Room</option>
          <option value="Guest Room">Guest Room</option>
          <option value="Basement">Basement</option>
        </select>
      </div>

      {/* Room Size Selection */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Room Size</label>
        <div className="bg-background border border-border rounded-lg p-2">
          <div className="grid grid-cols-2 gap-2">
            {(['small', 'medium', 'large', 'xlarge'] as RoomSize[]).map((size) => (
              <button
                key={size}
                onClick={() => onRoomSetupChange({ ...roomSetup, size })}
                disabled={isCompleted}
                className={`px-3 py-2.5 rounded-md text-center transition-all ${
                  roomSetup.size === size
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card hover:bg-muted text-foreground'
                } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="font-medium mb-0.5" style={{ fontSize: 'var(--text-label)' }}>
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </div>
                <div className="text-xs opacity-90">
                  {size === 'small' && '< 150 sq ft'}
                  {size === 'medium' && '150-300 sq ft'}
                  {size === 'large' && '300-500 sq ft'}
                  {size === 'xlarge' && '> 500 sq ft'}
                </div>
              </button>
            ))}
          </div>
        </div>
        <p className="text-muted-foreground mt-2" style={{ fontSize: 'var(--text-small)' }}>
          <Ruler className="w-3 h-3 inline mr-1" />
          Selected: {getRoomSizeLabel(roomSetup.size)}
        </p>
      </div>

      {/* Upload Area */}
      {!roomData ? (
        <button
          onClick={onUpload}
          disabled={isAnalyzing}
          className="w-full aspect-video border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 bg-background group disabled:opacity-50"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <div className="text-center">
                <h5 className="mb-1">Analyzing Room...</h5>
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
                <h5 className="mb-1">Upload Room Photo</h5>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  Click or drag to upload (JPG, PNG)
                </p>
              </div>
            </>
          )}
        </button>
      ) : (
        <>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h5 className="text-primary">Room Analyzed Successfully</h5>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <AIDetection icon={<Home />} label="Type" value={roomData.roomType} confidence={roomData.confidence} />
              <AIDetection icon={<Ruler />} label="Size" value={roomData.dimensions} confidence={92} />
              <AIDetection icon={<Sofa />} label="Items" value={`${roomData.furniture.length} detected`} confidence={88} />
              <AIDetection icon={<Palette />} label="Style" value={roomData.style} confidence={90} />
            </div>
          </div>

          {!isCompleted && (
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Confirm & Continue
            </button>
          )}
        </>
      )}
    </div>
  );
}

// Vision Step Content
function VisionStepContent({ roomData, preferences, onPreferencesChange, onComplete, isCompleted }: {
  roomData: RoomData;
  preferences: DesignPreferences;
  onPreferencesChange: (prefs: DesignPreferences) => void;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  return (
    <div className="space-y-4">
      {/* Design Intent */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Design Intent</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onPreferencesChange({ ...preferences, intent: 'refresh' })}
            disabled={isCompleted}
            className={`p-3 rounded-lg border text-left transition-all ${
              preferences.intent === 'refresh'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <RefreshCw className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-label)' }}>Refresh</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Replace items
            </p>
          </button>
          <button
            onClick={() => onPreferencesChange({ ...preferences, intent: 'redesign' })}
            disabled={isCompleted}
            className={`p-3 rounded-lg border text-left transition-all ${
              preferences.intent === 'redesign'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-label)' }}>Redesign</span>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Full makeover
            </p>
          </button>
        </div>
      </div>

      {/* Style */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Style Preference</label>
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-2 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <p style={{ fontSize: 'var(--text-small)' }}>
            AI recommends: <strong>{roomData.style}</strong>
          </p>
        </div>
        <select
          value={preferences.style}
          onChange={(e) => onPreferencesChange({ ...preferences, style: e.target.value })}
          disabled={isCompleted}
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60 transition-colors"
          style={{ fontSize: 'var(--text-base)' }}
        >
          <option value="Modern Minimalist">Modern Minimalist</option>
          <option value="Contemporary">Contemporary</option>
          <option value="Scandinavian">Scandinavian</option>
          <option value="Industrial">Industrial</option>
          <option value="Mid-Century Modern">Mid-Century Modern</option>
          <option value="Traditional">Traditional</option>
          <option value="Transitional">Transitional</option>
          <option value="Bohemian">Bohemian</option>
          <option value="Rustic">Rustic</option>
          <option value="Farmhouse">Farmhouse</option>
          <option value="Coastal">Coastal</option>
          <option value="Eclectic">Eclectic</option>
          <option value="Art Deco">Art Deco</option>
          <option value="Mediterranean">Mediterranean</option>
        </select>
      </div>

      {/* Budget */}
      <div>
        <label className="block mb-2 font-medium" style={{ fontSize: 'var(--text-label)' }}>Budget Range</label>
        <div className="bg-background border border-border rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-base)' }}>
              ${preferences.budget.min.toLocaleString()} - ${preferences.budget.max.toLocaleString()}
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Min</span>
              <span style={{ fontSize: 'var(--text-small)' }}>${preferences.budget.min.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={preferences.budget.min}
              onChange={(e) => onPreferencesChange({ ...preferences, budget: { ...preferences.budget, min: Number(e.target.value) } })}
              disabled={isCompleted}
              className="w-full accent-primary disabled:opacity-60"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Max</span>
              <span style={{ fontSize: 'var(--text-small)' }}>${preferences.budget.max.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="10000"
              step="500"
              value={preferences.budget.max}
              onChange={(e) => onPreferencesChange({ ...preferences, budget: { ...preferences.budget, max: Number(e.target.value) } })}
              disabled={isCompleted}
              className="w-full accent-primary disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {!isCompleted && (
        <button
          onClick={onComplete}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Confirm & Continue
        </button>
      )}
    </div>
  );
}

// Selection Step Content
function SelectionStepContent({ selectedFurniture, onToggleFurniture, isLoading, totalCost, budget, withinBudget, onComplete, isCompleted }: {
  selectedFurniture: FurnitureItem[];
  onToggleFurniture: (id: string) => void;
  isLoading: boolean;
  totalCost: number;
  budget: { min: number; max: number };
  withinBudget: boolean;
  onComplete: () => void;
  isCompleted: boolean;
}) {
  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
        <h5 className="mb-1">AI is selecting furniture...</h5>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
          Analyzing thousands of products
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Budget Summary */}
      <div className={`rounded-lg p-3 border ${
        withinBudget 
          ? 'bg-primary/5 border-primary/20' 
          : 'bg-destructive/5 border-destructive/20'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className={`w-5 h-5 ${withinBudget ? 'text-primary' : 'text-destructive'}`} />
            <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>
              {selectedFurniture.length} Items Selected
            </span>
          </div>
          <span className={`font-medium ${withinBudget ? 'text-primary' : 'text-destructive'}`} style={{ fontSize: 'var(--text-h5)' }}>
            ${totalCost.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            Budget: ${budget.min.toLocaleString()} - ${budget.max.toLocaleString()}
          </p>
          {withinBudget ? (
            <div className="flex items-center gap-1 text-primary">
              <Check className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Within budget</span>
            </div>
          ) : (
            <span className="text-destructive" style={{ fontSize: 'var(--text-small)' }}>
              ${(totalCost - budget.max).toLocaleString()} over budget
            </span>
          )}
        </div>
      </div>

      {/* AI Selection Note */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          AI selected these items based on your room size, style preferences, and budget. Each item includes an explanation.
        </p>
      </div>

      {/* Furniture Items */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {selectedFurniture.map((item, index) => (
          <FurnitureCard key={item.id} item={item} index={index} isCompleted={isCompleted} onToggle={onToggleFurniture} />
        ))}
      </div>

      {/* Confirm Button */}
      {!isCompleted && (
        <button
          onClick={onComplete}
          disabled={!withinBudget}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {withinBudget ? (
            <>
              <Check className="w-5 h-5" />
              Confirm Selection
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              Adjust Budget or Items
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Furniture Card Component
function FurnitureCard({ item, index, isCompleted, onToggle }: { item: FurnitureItem; index: number; isCompleted: boolean; onToggle: (id: string) => void }) {
  return (
    <div className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all group">
      <div className="flex gap-3 p-3">
        {/* Product Image */}
        <div className="w-24 h-24 flex-shrink-0 bg-muted rounded overflow-hidden">
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0" style={{ fontSize: 'var(--text-small)' }}>
                  {index + 1}
                </span>
                <h5 className="truncate">{item.name}</h5>
              </div>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                {item.category}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-primary font-medium" style={{ fontSize: 'var(--text-h5)' }}>
                ${item.price.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Dimensions */}
          <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
            <Ruler className="w-3.5 h-3.5 flex-shrink-0" />
            <span style={{ fontSize: 'var(--text-small)' }}>{item.dimensions}</span>
          </div>

          {/* AI Reason */}
          <div className="bg-accent/5 border border-accent/20 rounded px-2 py-1.5 flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              {item.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="border-t border-border px-3 py-2 flex items-center gap-2">
          <button className="flex-1 px-3 py-1.5 bg-card border border-border rounded hover:border-primary transition-colors flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span style={{ fontSize: 'var(--text-small)' }}>Swap Item</span>
          </button>
          <button className="px-3 py-1.5 bg-card border border-border rounded hover:border-destructive hover:text-destructive transition-colors flex items-center justify-center gap-1.5" onClick={() => onToggle(item.id)}>
            <span style={{ fontSize: 'var(--text-small)' }}>Remove</span>
          </button>
        </div>
      )}
    </div>
  );
}

// Confirmation Step Content
function ConfirmationStepContent({ onGenerate, isRendering, showFinalResult, totalCost }: {
  onGenerate: () => void;
  isRendering: boolean;
  showFinalResult: boolean;
  totalCost: number;
}) {
  return (
    <div className="space-y-4">
      {!showFinalResult ? (
        <>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <h5 className="mb-2">Ready to Generate</h5>
            <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-caption)' }}>
              AI will place your selected furniture into the room with realistic lighting and shadows
            </p>
            <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              <Zap className="w-4 h-4" />
              <span>Estimated time: 15-20 seconds</span>
            </div>
          </div>

          <button
            onClick={onGenerate}
            disabled={isRendering}
            className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isRendering ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                Generate Rendering
              </>
            )}
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h5 className="text-primary">Rendering Complete!</h5>
            </div>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Your redesigned room is ready. Review the result and purchase when ready.
            </p>
          </div>

          <button className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Purchase All (${totalCost.toLocaleString()})
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1">
              <RefreshCw className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Re-generate</span>
            </button>
            <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1">
              <Download className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Download</span>
            </button>
            <button className="px-3 py-2 bg-card border border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center gap-1">
              <Share2 className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)' }}>Share</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Rendering Canvas
function RenderingCanvas({ roomData, isAnalyzing, isRendering, renderProgress, showFinalResult, preferences, selectedFurniture, totalCost }: {
  roomData: RoomData | null;
  isAnalyzing: boolean;
  isRendering: boolean;
  renderProgress: number;
  showFinalResult: boolean;
  preferences: DesignPreferences;
  selectedFurniture: FurnitureItem[];
  totalCost: number;
}) {
  if (!roomData) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-6">
            <Eye className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="mb-3">AI Visualization Canvas</h3>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Upload a room photo to begin. AI will analyze your space and render furniture in real-time.
          </p>
        </div>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h3 className="mb-3">Analyzing Your Room</h3>
          <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-base)' }}>
            AI is detecting room type, dimensions, existing furniture, and style
          </p>
          <div className="space-y-2 text-left max-w-xs mx-auto">
            <AIStatusItem label="Detecting room type" status="processing" />
            <AIStatusItem label="Measuring dimensions" status="processing" />
            <AIStatusItem label="Identifying furniture" status="processing" />
            <AIStatusItem label="Analyzing style" status="processing" />
          </div>
        </div>
      </div>
    );
  }

  if (isRendering) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="text-center max-w-lg">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-primary animate-pulse" />
          </div>
          <h3 className="mb-3">Generating Your Design</h3>
          <p className="text-muted-foreground mb-8" style={{ fontSize: 'var(--text-base)' }}>
            AI is placing furniture with photorealistic rendering
          </p>
          <div className="mb-4">
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
          <div className="space-y-2 text-left max-w-md mx-auto">
            <AIStatusItem label="Placing furniture in room" status={renderProgress > 20 ? "complete" : "processing"} />
            <AIStatusItem label="Adjusting lighting & shadows" status={renderProgress > 50 ? "complete" : renderProgress > 20 ? "processing" : "pending"} />
            <AIStatusItem label="Adding realistic details" status={renderProgress > 80 ? "complete" : renderProgress > 50 ? "processing" : "pending"} />
            <AIStatusItem label="Finalizing scene" status={renderProgress === 100 ? "complete" : renderProgress > 80 ? "processing" : "pending"} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        <div className="flex-1 mb-4">
          <div className="relative h-full rounded-lg overflow-hidden border border-border bg-muted">
            <img src={roomData.imageUrl} alt="Room" className="w-full h-full object-cover" />
            {showFinalResult && (
              <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center gap-2 shadow-lg">
                <CheckCircle className="w-5 h-5" />
                <span style={{ fontSize: 'var(--text-label)' }}>AI Rendered</span>
              </div>
            )}
          </div>
        </div>
        
        {showFinalResult ? (
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="mb-1">Your Redesigned {roomData.roomType}</h4>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  {preferences.style} • {selectedFurniture.length} items • ${totalCost.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button className="px-4 py-2 border border-border rounded-lg hover:border-primary transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-4">
            <h5 className="mb-3">AI Detection Results</h5>
            <div className="grid grid-cols-4 gap-3">
              <DetectionBadge icon={<Home />} label="Type" value={roomData.roomType} />
              <DetectionBadge icon={<Ruler />} label="Size" value={roomData.dimensions} />
              <DetectionBadge icon={<Sofa />} label="Furniture" value={`${roomData.furniture.length} items`} />
              <DetectionBadge icon={<Palette />} label="Style" value={roomData.style} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Furniture List Panel
function FurnitureListPanel({ selectedFurniture, isLoading, totalCost, showFinalResult }: {
  selectedFurniture: FurnitureItem[];
  isLoading: boolean;
  totalCost: number;
  showFinalResult: boolean;
}) {
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            Loading furniture recommendations...
          </p>
        </div>
      </div>
    );
  }

  if (selectedFurniture.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Sofa className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h5 className="mb-2">Furniture Selection</h5>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            Complete the steps above to see AI-recommended furniture
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="mb-1">Selected Furniture ({selectedFurniture.length} items)</h4>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            AI-curated pieces that work together perfectly
          </p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-caption)' }}>Total</p>
          <p className="text-primary" style={{ fontSize: 'var(--text-h5)' }}>
            ${totalCost.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {selectedFurniture.map((item) => (
          <div key={item.id} className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors group">
            <div className="aspect-square bg-muted overflow-hidden">
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
            </div>
            <div className="p-3">
              <h5 className="mb-1 text-sm">{item.name}</h5>
              <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-small)' }}>
                {item.category}
              </p>
              <p className="text-primary font-medium" style={{ fontSize: 'var(--text-label)' }}>
                ${item.price.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper Components
function AIDetection({ icon, label, value, confidence }: { icon: React.ReactNode; label: string; value: string; confidence: number }) {
  return (
    <div className="p-2 bg-background rounded border border-border">
      <div className="flex items-center gap-1 mb-1 text-primary">
        <div className="w-3 h-3">{icon}</div>
        <span style={{ fontSize: 'var(--text-small)' }}>{label}</span>
      </div>
      <p className="font-medium mb-1" style={{ fontSize: 'var(--text-caption)' }}>{value}</p>
      <div className="flex items-center gap-1">
        <div className="flex-1 bg-muted rounded-full h-1">
          <div className="bg-primary h-1 rounded-full" style={{ width: `${confidence}%` }} />
        </div>
        <span className="text-primary" style={{ fontSize: 'var(--text-small)' }}>{confidence}%</span>
      </div>
    </div>
  );
}

function DetectionBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded">
      <div className="text-primary">{icon}</div>
      <div>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{label}</p>
        <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>{value}</p>
      </div>
    </div>
  );
}

function AIStatusItem({ label, status }: { label: string; status: 'pending' | 'processing' | 'complete' }) {
  return (
    <div className="flex items-center gap-3 p-2 bg-card rounded">
      {status === 'complete' && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
      {status === 'processing' && <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />}
      {status === 'pending' && <div className="w-4 h-4 rounded-full bg-muted flex-shrink-0" />}
      <span className={status === 'complete' ? 'text-foreground' : 'text-muted-foreground'} style={{ fontSize: 'var(--text-caption)' }}>
        {label}
      </span>
    </div>
  );
}