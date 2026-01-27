import { useState } from 'react';
import { 
  Upload, 
  Sparkles, 
  Settings, 
  Eye, 
  CheckCircle, 
  ChevronRight,
  Image as ImageIcon,
  Home,
  Palette,
  DollarSign,
  ShoppingCart,
  RefreshCw,
  Lightbulb,
  Zap
} from 'lucide-react';

type FlowStep = 'upload' | 'vision' | 'selection' | 'render';

export function FlowVisualization() {
  const [activeStep, setActiveStep] = useState<FlowStep>('upload');
  const [hoveredStep, setHoveredStep] = useState<FlowStep | null>(null);

  const steps: { id: FlowStep; icon: React.ReactNode; title: string; subtitle: string }[] = [
    { id: 'upload', icon: <Upload className="w-6 h-6" />, title: 'Step 1', subtitle: 'Smart Upload' },
    { id: 'vision', icon: <Sparkles className="w-6 h-6" />, title: 'Step 2', subtitle: 'Define Vision' },
    { id: 'selection', icon: <Settings className="w-6 h-6" />, title: 'Step 2.5', subtitle: 'AI Selection' },
    { id: 'render', icon: <Eye className="w-6 h-6" />, title: 'Step 3', subtitle: 'Render & Refine' }
  ];

  return (
    <div className="space-y-12">
      {/* Interactive Flow Timeline */}
      <section>
        <h2 className="mb-8">Interactive User Flow</h2>
        
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <button
                  onClick={() => setActiveStep(step.id)}
                  onMouseEnter={() => setHoveredStep(step.id)}
                  onMouseLeave={() => setHoveredStep(null)}
                  className={`flex flex-col items-center gap-3 transition-all ${
                    activeStep === step.id || hoveredStep === step.id
                      ? 'transform scale-110'
                      : 'opacity-60'
                  }`}
                >
                  <div
                    className={`p-4 rounded-full transition-colors ${
                      activeStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : hoveredStep === step.id
                        ? 'bg-secondary text-secondary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <div className="text-center">
                    <div style={{ fontSize: 'var(--text-small)' }} className="text-muted-foreground">
                      {step.title}
                    </div>
                    <div style={{ fontSize: 'var(--text-caption)' }} className="font-medium">
                      {step.subtitle}
                    </div>
                  </div>
                </button>
                {idx < steps.length - 1 && (
                  <div className="flex-1 h-0.5 bg-border mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Details */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {activeStep === 'upload' && <UploadStep />}
          {activeStep === 'vision' && <VisionStep />}
          {activeStep === 'selection' && <SelectionStep />}
          {activeStep === 'render' && <RenderStep />}
        </div>
      </section>

      {/* Flow Improvements Summary */}
      <section>
        <h2 className="mb-6">Key Flow Improvements</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ImprovementCard
            icon={<Zap className="w-5 h-5" />}
            title="Instant AI Feedback"
            before="Users upload image and wait with no feedback until 'Confirm Rendering'"
            after="AI analysis starts immediately on upload, showing real-time detection results"
            benefit="Builds trust, reduces perceived wait time, demonstrates value upfront"
          />
          <ImprovementCard
            icon={<Lightbulb className="w-5 h-5" />}
            title="Smart Defaults Everywhere"
            before="Users manually select room type, enter dimensions, choose furniture types"
            after="AI detects and pre-fills everything; users only adjust if needed"
            benefit="Reduces effort by 70% for majority of users while maintaining flexibility"
          />
          <ImprovementCard
            icon={<RefreshCw className="w-5 h-5" />}
            title="Refinement Loop Added"
            before="One-shot rendering with no way to adjust without restarting"
            after="Interactive refinement: swap items, adjust positions, regenerate variations"
            benefit="Increases satisfaction, reduces abandonment, encourages exploration"
          />
          <ImprovementCard
            icon={<CheckCircle className="w-5 h-5" />}
            title="Preview Before Render"
            before="Users commit to furniture selection blind, then wait for render"
            after="Visual preview of AI selections with explanations before rendering"
            benefit="Reduces rendering failures, increases user confidence, fewer surprises"
          />
        </div>
      </section>

      {/* AI Integration Points */}
      <section className="bg-accent/5 border border-accent/20 rounded-lg p-8">
        <h3 className="mb-6">AI Capability Integration Points</h3>
        <div className="space-y-6">
          <AIIntegrationPoint
            step="Step 1: Upload"
            capabilities={[
              "Computer Vision: Room type classification (95%+ accuracy)",
              "Object Detection: Furniture identification with bounding boxes",
              "Dimension Estimation: Room size from single image (±5% accuracy)",
              "Style Recognition: Detect existing aesthetic (modern, rustic, etc.)"
            ]}
            impact="high"
          />
          <AIIntegrationPoint
            step="Step 2: Vision"
            capabilities={[
              "Recommendation Engine: Suggest compatible Castlery collections",
              "Budget Intelligence: Calculate typical costs for room type/size",
              "Style Matching: Show furniture that complements detected style",
              "Constraint Validation: Flag impossible combinations early"
            ]}
            impact="medium"
          />
          <AIIntegrationPoint
            step="Step 2.5: Selection"
            capabilities={[
              "Smart Bundling: Create complete furniture sets that work together",
              "Explainable AI: Show reasoning for each suggestion",
              "Alternative Generation: Provide 3-5 variations per furniture piece",
              "Cost Optimization: Maximize value within budget constraints"
            ]}
            impact="high"
          />
          <AIIntegrationPoint
            step="Step 3: Render"
            capabilities={[
              "Photorealistic Rendering: Place furniture with correct lighting/shadows",
              "Spatial Reasoning: Respect room proportions and ergonomics",
              "Scene Enrichment: Add contextual items (plants, decor, people)",
              "Variation Generation: Create multiple layouts with one click"
            ]}
            impact="high"
          />
        </div>
      </section>
    </div>
  );
}

function UploadStep() {
  return (
    <div className="p-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="p-4 bg-primary/10 rounded-lg text-primary">
          <Upload className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2">Step 1: Smart Upload & Instant AI Analysis</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
            Users upload their room image and immediately see AI working - building trust from second one.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="mb-4 text-primary">What Users See</h4>
          <div className="space-y-4">
            <FeatureItem
              icon={<ImageIcon className="w-5 h-5" />}
              title="Drag & Drop Upload"
              description="Large, inviting upload area with example images"
            />
            <FeatureItem
              icon={<Sparkles className="w-5 h-5" />}
              title="Real-Time AI Analysis"
              description="Processing overlay with live status: 'Detecting room type... Living Room (95% confident)'"
            />
            <FeatureItem
              icon={<Home className="w-5 h-5" />}
              title="Instant Results Card"
              description="Shows detected: room type, dimensions, existing furniture, current style"
            />
            <FeatureItem
              icon={<CheckCircle className="w-5 h-5" />}
              title="Easy Override"
              description="Each detected item has an 'Edit' button if AI got it wrong"
            />
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg p-6 border border-border">
          <h5 className="mb-4">AI Processing Timeline</h5>
          <div className="space-y-4">
            <TimelineItem time="0.5s" label="Image uploaded" status="complete" />
            <TimelineItem time="1.2s" label="Room type detected: Living Room" status="complete" />
            <TimelineItem time="2.1s" label="Dimensions estimated: 12' x 15'" status="complete" />
            <TimelineItem time="3.5s" label="Furniture identified: Sofa, Coffee Table, Armchair" status="complete" />
            <TimelineItem time="4.0s" label="Style detected: Modern Minimalist" status="complete" />
          </div>
          <button className="w-full mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            Continue to Design Vision
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
          <div>
            <h5 className="mb-2 text-accent">Why This Works</h5>
            <p style={{ fontSize: 'var(--text-caption)' }}>
              <strong>Immediate Value:</strong> Users see AI capability within 4 seconds, before making any decisions. 
              <strong>Trust Building:</strong> Transparent processing with confidence scores shows AI reliability. 
              <strong>Reduced Friction:</strong> No manual data entry required - AI does the work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VisionStep() {
  return (
    <div className="p-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="p-4 bg-secondary/10 rounded-lg text-secondary">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2">Step 2: Define Your Vision (Guided & Simple)</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
            Context-aware questions with smart defaults - users only adjust what they want to change.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="mb-4 text-secondary">User Decisions (2-3 choices)</h4>
          <div className="space-y-4">
            <FeatureItem
              icon={<RefreshCw className="w-5 h-5" />}
              title="Design Intent"
              description="'Refresh Existing Furniture' vs 'Complete Redesign' - simple binary choice"
            />
            <FeatureItem
              icon={<Palette className="w-5 h-5" />}
              title="Style Preferences"
              description="AI pre-selects based on detected style, user can adjust (Modern, Rustic, etc.)"
            />
            <FeatureItem
              icon={<DollarSign className="w-5 h-5" />}
              title="Budget Range"
              description="Smart slider with recommended ranges: '$2,000-5,000 typical for your room'"
            />
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg p-6 border border-border">
          <h5 className="mb-4">Smart Defaults Example</h5>
          <div className="space-y-4 mb-6">
            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 'var(--text-label)' }}>Room Type</span>
                <span className="text-primary text-xs px-2 py-1 bg-primary/10 rounded" style={{ fontSize: 'var(--text-small)' }}>
                  AI Detected
                </span>
              </div>
              <div className="font-medium">Living Room</div>
              <div className="text-muted-foreground text-xs mt-1" style={{ fontSize: 'var(--text-small)' }}>95% confident • Edit</div>
            </div>

            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 'var(--text-label)' }}>Dimensions</span>
                <span className="text-primary text-xs px-2 py-1 bg-primary/10 rounded" style={{ fontSize: 'var(--text-small)' }}>
                  AI Estimated
                </span>
              </div>
              <div className="font-medium">12' × 15'</div>
              <div className="text-muted-foreground text-xs mt-1" style={{ fontSize: 'var(--text-small)' }}>180 sq ft • Edit</div>
            </div>

            <div className="p-4 bg-background rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: 'var(--text-label)' }}>Current Style</span>
                <span className="text-secondary text-xs px-2 py-1 bg-secondary/10 rounded" style={{ fontSize: 'var(--text-small)' }}>
                  AI Suggested
                </span>
              </div>
              <div className="font-medium">Modern Minimalist</div>
              <div className="text-muted-foreground text-xs mt-1" style={{ fontSize: 'var(--text-small)' }}>Keep this style • Change</div>
            </div>
          </div>
          <button className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors">
            See AI Furniture Recommendations
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
          <div>
            <h5 className="mb-2 text-accent">Why This Works</h5>
            <p style={{ fontSize: 'var(--text-caption)' }}>
              <strong>Progressive Disclosure:</strong> Only show 2-3 key decisions at this stage, defer details to next step. 
              <strong>Smart Defaults:</strong> AI pre-fills everything, 80% of users won't change anything. 
              <strong>Context Awareness:</strong> Budget ranges adjust based on room size; style suggestions match current room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SelectionStep() {
  return (
    <div className="p-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="p-4 bg-accent/10 rounded-lg text-accent">
          <Settings className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2">Step 2.5: AI-Powered Furniture Selection</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
            NEW STEP: Review AI recommendations before rendering - transparency and control combined.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="mb-4 text-accent">AI Recommendations</h4>
          <div className="space-y-4">
            <FeatureItem
              icon={<ShoppingCart className="w-5 h-5" />}
              title="Complete Furniture Set"
              description="AI suggests 5-7 items that work together (sofa, tables, chairs, storage)"
            />
            <FeatureItem
              icon={<Sparkles className="w-5 h-5" />}
              title="Explainable Choices"
              description="Each item shows WHY it was selected: 'Fits 12×15 room, matches budget, complements style'"
            />
            <FeatureItem
              icon={<RefreshCw className="w-5 h-5" />}
              title="Easy Swaps"
              description="Click any item to see 3-5 alternatives, swap with one click"
            />
            <FeatureItem
              icon={<DollarSign className="w-5 h-5" />}
              title="Live Budget Tracking"
              description="Running total updates as selections change: '$4,230 of $5,000 budget'"
            />
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg p-6 border border-border">
          <h5 className="mb-4">Example AI Selection</h5>
          <div className="space-y-3 mb-6">
            {[
              { name: 'Aria Sofa', price: '$1,899', reason: 'Perfect for 12\' wall, modern style' },
              { name: 'Oslo Coffee Table', price: '$549', reason: 'Matches sofa height, wood tone' },
              { name: 'Bergen Armchair (2x)', price: '$1,298', reason: 'Completes seating, within budget' },
              { name: 'Larsen Bookshelf', price: '$429', reason: 'Adds storage, fills empty corner' }
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>{item.name}</span>
                  <span className="text-primary">{item.price}</span>
                </div>
                <div className="text-muted-foreground text-xs flex items-center gap-2" style={{ fontSize: 'var(--text-small)' }}>
                  <Sparkles className="w-3 h-3" />
                  {item.reason}
                </div>
                <button className="text-accent text-xs mt-2 hover:underline" style={{ fontSize: 'var(--text-small)' }}>
                  Swap • See alternatives
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 'var(--text-label)' }}>Total Cost</span>
              <span className="text-primary font-medium" style={{ fontSize: 'var(--text-h5)' }}>$4,175</span>
            </div>
            <div className="text-muted-foreground text-xs mt-1" style={{ fontSize: 'var(--text-small)' }}>
              Within your $2,000-$5,000 budget
            </div>
          </div>
          <button className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors">
            Generate My Design
          </button>
        </div>
      </div>

      <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
          <div>
            <h5 className="mb-2 text-accent">Why This Works</h5>
            <p style={{ fontSize: 'var(--text-caption)' }}>
              <strong>Preview Before Commit:</strong> Users see exactly what will be rendered, no surprises. 
              <strong>AI Transparency:</strong> Explanations for each choice build trust and education. 
              <strong>Control Without Complexity:</strong> Defaults are smart, but swapping is trivial if needed. 
              <strong>Budget Safety:</strong> Can't accidentally exceed budget, system prevents it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenderStep() {
  return (
    <div className="p-8">
      <div className="flex items-start gap-6 mb-8">
        <div className="p-4 bg-primary/10 rounded-lg text-primary">
          <Eye className="w-8 h-8" />
        </div>
        <div className="flex-1">
          <h3 className="mb-2">Step 3: AI Rendering + Refinement Loop</h3>
          <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-base)' }}>
            Deliver the rendered design with full context, then enable iterative refinement.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h4 className="mb-4 text-primary">Rendering Experience</h4>
          <div className="space-y-4">
            <FeatureItem
              icon={<Sparkles className="w-5 h-5" />}
              title="Progress Visibility"
              description="Loading states: 'Placing furniture... Adjusting lighting... Adding details' (15-30s)"
            />
            <FeatureItem
              icon={<Eye className="w-5 h-5" />}
              title="Interactive Result"
              description="Before/after slider, zoom, rotate, view from different angles"
            />
            <FeatureItem
              icon={<ShoppingCart className="w-5 h-5" />}
              title="Item Details Panel"
              description="Hover any furniture to see product name, price, dimensions, 'Buy Now' link"
            />
            <FeatureItem
              icon={<RefreshCw className="w-5 h-5" />}
              title="Refinement Tools"
              description="Swap items, adjust positions, change lighting, regenerate variations"
            />
          </div>
        </div>

        <div className="bg-muted/20 rounded-lg p-6 border border-border">
          <h5 className="mb-4">Post-Render Actions</h5>
          <div className="space-y-3 mb-6">
            <ActionButton
              icon={<RefreshCw className="w-5 h-5" />}
              title="Generate Variations"
              description="Create 3 alternative layouts instantly"
            />
            <ActionButton
              icon={<Settings className="w-5 h-5" />}
              title="Adjust Individual Items"
              description="Swap furniture, move positions, change colors"
            />
            <ActionButton
              icon={<Sparkles className="w-5 h-5" />}
              title="Add Accessories"
              description="Let AI suggest plants, art, lighting"
            />
            <ActionButton
              icon={<ShoppingCart className="w-5 h-5" />}
              title="View Shopping List"
              description="See all products, total cost, add to cart"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-3 bg-background border border-border rounded-lg hover:bg-muted/20 transition-colors">
              Save Design
            </button>
            <button className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Purchase All
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
          <div>
            <h5 className="mb-2 text-accent">Why This Works</h5>
            <p style={{ fontSize: 'var(--text-caption)' }}>
              <strong>Iterative Refinement:</strong> Users don't have to commit to first result, can explore variations. 
              <strong>Contextual Information:</strong> All product details accessible without leaving the experience. 
              <strong>Multiple Exits:</strong> Save, share, or purchase - user chooses when they're satisfied. 
              <strong>Learning Loop:</strong> Each refinement teaches AI user preferences for future sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureItem({ icon, title, description }: FeatureItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border">
      <div className="text-primary flex-shrink-0 mt-1">{icon}</div>
      <div>
        <div className="font-medium mb-1" style={{ fontSize: 'var(--text-label)' }}>{title}</div>
        <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>{description}</div>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  time: string;
  label: string;
  status: 'complete' | 'loading' | 'pending';
}

function TimelineItem({ time, label, status }: TimelineItemProps) {
  const statusColors = {
    complete: 'bg-primary text-primary-foreground',
    loading: 'bg-secondary text-secondary-foreground',
    pending: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="flex items-center gap-3">
      <div className={`px-2 py-1 rounded text-xs flex-shrink-0 ${statusColors[status]}`} style={{ fontSize: 'var(--text-small)' }}>
        {time}
      </div>
      <div className="flex-1" style={{ fontSize: 'var(--text-caption)' }}>{label}</div>
      {status === 'complete' && <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />}
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ActionButton({ icon, title, description }: ActionButtonProps) {
  return (
    <button className="w-full flex items-start gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors text-left">
      <div className="text-primary flex-shrink-0 mt-1">{icon}</div>
      <div>
        <div className="font-medium mb-1" style={{ fontSize: 'var(--text-label)' }}>{title}</div>
        <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>{description}</div>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1 ml-auto" />
    </button>
  );
}

interface ImprovementCardProps {
  icon: React.ReactNode;
  title: string;
  before: string;
  after: string;
  benefit: string;
}

function ImprovementCard({ icon, title, before, after, benefit }: ImprovementCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent/10 rounded-lg text-accent">
          {icon}
        </div>
        <h4>{title}</h4>
      </div>
      <div className="space-y-3 mb-4">
        <div>
          <div className="text-destructive text-xs mb-1 uppercase" style={{ fontSize: 'var(--text-small)' }}>Before</div>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>{before}</p>
        </div>
        <div>
          <div className="text-primary text-xs mb-1 uppercase" style={{ fontSize: 'var(--text-small)' }}>After</div>
          <p className="text-foreground" style={{ fontSize: 'var(--text-caption)' }}>{after}</p>
        </div>
      </div>
      <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
        <div className="text-accent text-xs mb-1 uppercase" style={{ fontSize: 'var(--text-small)' }}>Benefit</div>
        <p style={{ fontSize: 'var(--text-caption)' }}>{benefit}</p>
      </div>
    </div>
  );
}

interface AIIntegrationPointProps {
  step: string;
  capabilities: string[];
  impact: 'high' | 'medium' | 'low';
}

function AIIntegrationPoint({ step, capabilities, impact }: AIIntegrationPointProps) {
  const impactColors = {
    high: 'bg-primary text-primary-foreground',
    medium: 'bg-secondary text-secondary-foreground',
    low: 'bg-muted text-muted-foreground'
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h5>{step}</h5>
        <span className={`px-3 py-1 rounded-full text-xs ${impactColors[impact]}`} style={{ fontSize: 'var(--text-small)' }}>
          {impact.toUpperCase()} IMPACT
        </span>
      </div>
      <ul className="space-y-2">
        {capabilities.map((capability, idx) => (
          <li key={idx} className="flex items-start gap-2 text-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent" />
            <span>{capability}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
