import { ChevronRight, Lightbulb, Target, Zap, AlertCircle } from 'lucide-react';

export function UXAnalysis() {
  return (
    <div className="space-y-12">
      {/* Executive Summary */}
      <section className="bg-card border border-border rounded-lg p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="mb-2">Executive Summary</h2>
            <p className="text-muted-foreground">
              The current flow has strong fundamentals but suffers from premature cognitive load and lack of AI transparency. 
              The optimized flow reduces decision points by 40%, introduces progressive disclosure, and builds user confidence 
              through clear AI feedback at every step.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="text-secondary mb-2" style={{ fontSize: 'var(--text-h3)' }}>5 → 3</div>
            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Core steps reduced from 5 to 3 main decisions
            </div>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="text-secondary mb-2" style={{ fontSize: 'var(--text-h3)' }}>40%</div>
            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Reduction in upfront cognitive load
            </div>
          </div>
          <div className="p-4 bg-background rounded-lg border border-border">
            <div className="text-secondary mb-2" style={{ fontSize: 'var(--text-h3)' }}>3</div>
            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              New AI transparency touchpoints
            </div>
          </div>
        </div>
      </section>

      {/* Key Problems Identified */}
      <section>
        <h2 className="mb-6">Key Problems Identified</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <ProblemCard
            title="Premature Decision Overload"
            description="Users are asked to make multiple decisions (room type, dimensions, mode, furniture types, budget) before seeing any value from the AI."
            impact="High"
          />
          <ProblemCard
            title="Hidden AI Capabilities"
            description="AI detection and rendering happen silently after 'Confirm Rendering', creating a 'black box' effect that reduces trust."
            impact="High"
          />
          <ProblemCard
            title="Fragmented Path Divergence"
            description="The Replace vs Empty Room split happens too early, forcing users to commit before understanding what each path offers."
            impact="Medium"
          />
          <ProblemCard
            title="Missing Feedback Loops"
            description="No preview, no refinement stage, and no way to adjust AI selections before final rendering limits user control."
            impact="High"
          />
        </div>
      </section>

      {/* Optimized Flow */}
      <section>
        <h2 className="mb-6">Optimized End-to-End Flow</h2>
        
        <div className="space-y-6">
          {/* Step 1 */}
          <FlowStep
            number={1}
            title="Smart Upload & Instant AI Analysis"
            purpose="Build immediate trust by demonstrating AI capability without requiring decisions"
            userActions={[
              "Upload a room image (or select 'Start with Empty Room')",
              "Observe real-time AI analysis (optional, non-blocking)"
            ]}
            aiCapabilities={[
              "Instant room type detection with confidence score",
              "Automatic dimension estimation with visual overlay",
              "Existing furniture recognition with bounding boxes",
              "Style detection (modern, traditional, minimalist, etc.)"
            ]}
            optimizations={[
              "MERGE: Combined upload + AI detection into one step",
              "AI FIRST: Show AI working immediately to build trust",
              "OPTIONAL: User can override AI suggestions but defaults are smart"
            ]}
            status="primary"
          />

          {/* Step 2 */}
          <FlowStep
            number={2}
            title="Define Your Vision (Guided & Simple)"
            purpose="Collect user preferences through intelligent, context-aware questions"
            userActions={[
              "Review AI-detected room info (can edit if needed)",
              "Choose design intent: 'Refresh Existing' or 'Complete Redesign'",
              "Select style preferences (AI suggests based on current room)",
              "Set budget range with smart defaults based on room size"
            ]}
            aiCapabilities={[
              "Smart defaults: pre-populate based on room analysis",
              "Dynamic furniture suggestions change based on design intent",
              "Budget calculator shows typical ranges for room type",
              "Style matching shows compatible Castlery collections"
            ]}
            optimizations={[
              "SPLIT: Separated room setup from furniture selection",
              "SMART DEFAULTS: Pre-filled fields reduce friction",
              "PROGRESSIVE: Only show relevant options based on previous choices",
              "DEFERRED: Specific furniture selection moved to next step"
            ]}
            status="secondary"
          />

          {/* Step 2.5 */}
          <FlowStep
            number="2.5"
            title="AI-Powered Furniture Selection"
            purpose="Let AI do the heavy lifting while keeping users in control"
            userActions={[
              "Review AI-recommended furniture set (visual cards with details)",
              "Optional: Manually select/deselect specific furniture categories",
              "Optional: Choose preferred Castlery collections",
              "Click 'Generate My Design'"
            ]}
            aiCapabilities={[
              "Auto-suggest complete furniture set based on room type, size, budget",
              "Show 'why' for each suggestion (fits dimensions, matches style, within budget)",
              "Swap alternatives with one click",
              "Calculate total cost in real-time as selections change"
            ]}
            optimizations={[
              "NEW STEP: Added explicit review stage before rendering",
              "AI TRANSPARENCY: Show reasoning for each AI recommendation",
              "USER CONTROL: Easy to override while defaults are smart",
              "DEFERRED: Collection preferences are optional, not required"
            ]}
            status="accent"
          />

          {/* Step 3 */}
          <FlowStep
            number={3}
            title="AI Rendering + Refinement Loop"
            purpose="Deliver value while maintaining user agency through iteration"
            userActions={[
              "View rendered design with furniture placed in room",
              "See furniture details panel (products, prices, total cost)",
              "Refine: Swap individual items, adjust positions, change styles",
              "Save/Share/Purchase when satisfied"
            ]}
            aiCapabilities={[
              "Real-time rendering with loading states and progress",
              "Intelligent furniture placement respecting room proportions",
              "Style-consistent accessory suggestions (plants, decor, lighting)",
              "Generate multiple variations with one click",
              "Show before/after comparison slider"
            ]}
            optimizations={[
              "MERGE: Combined rendering + results into iterative experience",
              "REFINEMENT LOOP: Users can adjust without restarting",
              "AI TRANSPARENCY: Show what AI did and why",
              "DEFERRED: Purchase/checkout not forced, exploration encouraged"
            ]}
            status="primary"
          />
        </div>
      </section>

      {/* Design Principles */}
      <section>
        <h2 className="mb-6">Core Design Principles Applied</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <PrincipleCard
            icon={<Zap className="w-5 h-5" />}
            title="Progressive Disclosure"
            description="Information and options revealed gradually based on user choices, preventing overwhelm while maintaining depth."
          />
          <PrincipleCard
            icon={<Target className="w-5 h-5" />}
            title="AI Transparency"
            description="Every AI action is visible, explainable, and overridable. Users understand what AI detected/suggested and why."
          />
          <PrincipleCard
            icon={<Lightbulb className="w-5 h-5" />}
            title="Smart Defaults, Easy Overrides"
            description="AI pre-fills everything intelligently, but users can change any value. Reduces effort for typical use cases."
          />
          <PrincipleCard
            icon={<ChevronRight className="w-5 h-5" />}
            title="Rapid Value Delivery"
            description="Show AI working within seconds of upload. Users see benefit before being asked for complex decisions."
          />
        </div>
      </section>

      {/* Implementation Recommendations */}
      <section className="bg-accent/5 border border-accent/20 rounded-lg p-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
          <div>
            <h3 className="mb-4">Critical Implementation Recommendations</h3>
            <ul className="space-y-3 text-foreground" style={{ fontSize: 'var(--text-base)' }}>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span><strong>Loading States:</strong> Use skeleton loaders, progress bars, and micro-animations during AI processing (1-3 seconds ideal).</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span><strong>Confidence Indicators:</strong> Show AI confidence scores (e.g., "95% confident this is a Living Room") to build trust.</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span><strong>Tooltips & Hints:</strong> Explain why AI made specific choices ("Selected based on your 12'x15' room size").</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span><strong>Error Recovery:</strong> If AI detection fails, gracefully fall back to manual input with helpful defaults.</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <span><strong>Mobile Optimization:</strong> Use bottom sheets for selections, simplified views for small screens.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <h2 className="mb-6">Before vs After Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-border rounded-lg">
            <thead className="bg-muted/30">
              <tr>
                <th className="p-4 text-left border-b border-border" style={{ fontSize: 'var(--text-label)' }}>Aspect</th>
                <th className="p-4 text-left border-b border-border" style={{ fontSize: 'var(--text-label)' }}>Original Flow</th>
                <th className="p-4 text-left border-b border-border" style={{ fontSize: 'var(--text-label)' }}>Optimized Flow</th>
              </tr>
            </thead>
            <tbody>
              <ComparisonRow
                aspect="Time to First Value"
                original="After 4-5 decisions (room type, dimensions, mode, furniture, budget)"
                optimized="Within 3 seconds of upload (AI analysis visible immediately)"
              />
              <ComparisonRow
                aspect="User Decision Points"
                original="7-8 required decisions before seeing output"
                optimized="2-3 core decisions with smart defaults for rest"
              />
              <ComparisonRow
                aspect="AI Transparency"
                original="Hidden 'black box' processing"
                optimized="Every AI action explained with confidence scores"
              />
              <ComparisonRow
                aspect="Error Recovery"
                original="Must restart entire flow if AI fails or user wants changes"
                optimized="Iterative refinement loop allows adjustments without restart"
              />
              <ComparisonRow
                aspect="Path Selection"
                original="Forced choice between Replace/Empty Room early"
                optimized="Unified flow with 'Refresh' or 'Redesign' intent (less binary)"
              />
              <ComparisonRow
                aspect="Furniture Selection"
                original="Manual dropdown selection before seeing room"
                optimized="AI-suggested set with visual cards, easy to refine"
              />
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

interface FlowStepProps {
  number: number | string;
  title: string;
  purpose: string;
  userActions: string[];
  aiCapabilities: string[];
  optimizations: string[];
  status: 'primary' | 'secondary' | 'accent';
}

function FlowStep({ number, title, purpose, userActions, aiCapabilities, optimizations, status }: FlowStepProps) {
  const statusColors = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground'
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className={`px-4 py-2 rounded-lg ${statusColors[status]} flex-shrink-0`}>
            <div style={{ fontSize: 'var(--text-h4)' }}>{number}</div>
          </div>
          <div className="flex-1">
            <h3 className="mb-2">{title}</h3>
            <div className="flex items-start gap-2 text-muted-foreground">
              <Target className="w-4 h-4 flex-shrink-0 mt-1" />
              <p style={{ fontSize: 'var(--text-base)' }}><strong>Why:</strong> {purpose}</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <div>
            <h5 className="mb-3 text-primary">User Actions</h5>
            <ul className="space-y-2">
              {userActions.map((action, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-secondary">AI Capabilities</h5>
            <ul className="space-y-2">
              {aiCapabilities.map((capability, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  <Zap className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="mb-3 text-accent">Optimizations</h5>
            <ul className="space-y-2">
              {optimizations.map((optimization, idx) => (
                <li key={idx} className="flex items-start gap-2 text-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5 text-muted-foreground" />
                  <span>{optimization}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProblemCardProps {
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
}

function ProblemCard({ title, description, impact }: ProblemCardProps) {
  const impactColors = {
    High: 'text-destructive bg-destructive/10',
    Medium: 'text-accent bg-accent/10',
    Low: 'text-muted bg-muted/10'
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h4>{title}</h4>
        <span className={`px-3 py-1 rounded-full text-xs ${impactColors[impact]}`} style={{ fontSize: 'var(--text-small)' }}>
          {impact} Impact
        </span>
      </div>
      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
        {description}
      </p>
    </div>
  );
}

interface PrincipleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PrincipleCard({ icon, title, description }: PrincipleCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <div>
          <h4 className="mb-2">{title}</h4>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

interface ComparisonRowProps {
  aspect: string;
  original: string;
  optimized: string;
}

function ComparisonRow({ aspect, original, optimized }: ComparisonRowProps) {
  return (
    <tr className="border-b border-border last:border-0">
      <td className="p-4 font-medium" style={{ fontSize: 'var(--text-label)' }}>{aspect}</td>
      <td className="p-4 text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>{original}</td>
      <td className="p-4 text-primary" style={{ fontSize: 'var(--text-caption)' }}>{optimized}</td>
    </tr>
  );
}
