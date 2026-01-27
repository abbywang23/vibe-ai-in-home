import { Sparkles, Zap, Eye, ArrowRight, Upload, Palette, ShoppingCart, Check, Target, Clock } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h4>AI Interior Studio</h4>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-caption)' }}>Powered by Advanced AI</span>
            </div>
            
            <h1 className="mb-6">
              Transform Your Space with AI-Powered Interior Design
            </h1>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto" style={{ fontSize: 'var(--text-h5)' }}>
              Upload a photo of your room and let our AI create stunning furniture arrangements 
              tailored to your style and budget. Professional results in minutes.
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-3 group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 border border-border bg-card rounded-lg hover:border-primary transition-colors">
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-8 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span style={{ fontSize: 'var(--text-caption)' }}>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span style={{ fontSize: 'var(--text-caption)' }}>95% AI accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span style={{ fontSize: 'var(--text-caption)' }}>Results in 60 seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: 'var(--text-base)' }}>
              Our intelligent system guides you through a simple 4-step process to create your perfect room design
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <ProcessStep
              number={1}
              icon={<Upload className="w-8 h-8" />}
              title="Upload Room Photo"
              description="Upload your room photo. AI instantly detects room type, dimensions, existing furniture, and style with 95% accuracy."
            />
            <ProcessStep
              number={2}
              icon={<Palette className="w-8 h-8" />}
              title="Define Your Vision"
              description="Choose your design intent (refresh or redesign), select style preferences, and set your budget range."
            />
            <ProcessStep
              number={3}
              icon={<Sparkles className="w-8 h-8" />}
              title="AI Furniture Selection"
              description="Review AI-recommended furniture sets with explanations. Swap items easily and see real-time budget tracking."
            />
            <ProcessStep
              number={4}
              icon={<Eye className="w-8 h-8" />}
              title="Generate & Purchase"
              description="AI renders your redesigned room with photorealistic quality. Purchase all items with one click."
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4">Powered by Advanced AI Technology</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: 'var(--text-base)' }}>
              Our intelligent system combines computer vision, style matching, and spatial reasoning 
              to create perfect furniture arrangements
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              title="Computer Vision"
              description="Automatic room detection with confidence scores and dimension estimation"
            />
            <FeatureCard
              icon={<Sparkles className="w-6 h-6" />}
              title="Smart Recommendations"
              description="AI suggests furniture that works together based on style, size, and budget"
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Real-Time Rendering"
              description="See your redesigned room in seconds with photorealistic quality"
            />
            <FeatureCard
              icon={<ShoppingCart className="w-6 h-6" />}
              title="Budget Tracking"
              description="Stay within budget with live cost updates and smart alternatives"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="mb-4">Why Choose AI Interior Studio?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: 'var(--text-base)' }}>
              Professional interior design made accessible, affordable, and instant
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard
              icon={<Target className="w-8 h-8" />}
              title="95% Accuracy"
              description="Our AI has been trained on millions of room designs to ensure accurate detection and style matching"
              metric="95%"
            />
            <BenefitCard
              icon={<Clock className="w-8 h-8" />}
              title="60 Second Results"
              description="Get professional-quality room redesigns in under a minute, not days or weeks"
              metric="<60s"
            />
            <BenefitCard
              icon={<ShoppingCart className="w-8 h-8" />}
              title="Budget Control"
              description="Set your budget and AI will only recommend furniture within your price range"
              metric="100%"
            />
          </div>
        </div>
      </section>

      {/* How AI Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full mb-4">
                <Sparkles className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-caption)' }}>AI Technology</span>
              </div>
              
              <h2 className="mb-4">Intelligent Design Process</h2>
              <p className="text-muted-foreground mb-6" style={{ fontSize: 'var(--text-base)' }}>
                Our AI system analyzes your room in multiple dimensions to create the perfect design:
              </p>
              
              <div className="space-y-4">
                <AICapability
                  title="Computer Vision Analysis"
                  description="Detects room type, dimensions, existing furniture, and architectural features"
                />
                <AICapability
                  title="Style Recognition"
                  description="Identifies your current style and suggests compatible furniture collections"
                />
                <AICapability
                  title="Spatial Reasoning"
                  description="Ensures furniture fits perfectly and maintains proper proportions"
                />
                <AICapability
                  title="Budget Optimization"
                  description="Maximizes design value while staying within your specified budget"
                />
              </div>
            </div>
            
            <div className="bg-muted/30 rounded-lg p-8 border border-border">
              <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Sparkles className="w-24 h-24 text-primary mx-auto mb-4" />
                  <h4 className="mb-2">AI Visualization</h4>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                    Preview placeholder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="mb-6 text-primary-foreground">Ready to Transform Your Space?</h2>
          <p className="mb-8 opacity-90" style={{ fontSize: 'var(--text-h5)' }}>
            Join thousands of homeowners who have redesigned their rooms with AI. 
            Start your free design in less than 60 seconds.
          </p>
          
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center gap-3 group"
          >
            Start Designing Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <p className="mt-6 opacity-75" style={{ fontSize: 'var(--text-caption)' }}>
            No credit card required • Free to start • Results in 60 seconds
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="mb-1">AI Interior Studio</h5>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                Professional interior design powered by AI
              </p>
            </div>
            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              © 2025 AI Interior Studio. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface ProcessStepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ProcessStep({ number, icon, title, description }: ProcessStepProps) {
  return (
    <div className="relative">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center border-2 border-background">
            <span style={{ fontSize: 'var(--text-caption)' }}>{number}</span>
          </div>
        </div>
        <h4 className="mb-3">{title}</h4>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-all hover:shadow-sm">
      <div className="inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h4 className="mb-2">{title}</h4>
      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
        {description}
      </p>
    </div>
  );
}

interface BenefitCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  metric: string;
}

function BenefitCard({ icon, title, description, metric }: BenefitCardProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-primary mb-3" style={{ fontSize: 'var(--text-h2)' }}>
        {metric}
      </div>
      <h4 className="mb-3">{title}</h4>
      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
        {description}
      </p>
    </div>
  );
}

interface AICapabilityProps {
  title: string;
  description: string;
}

function AICapability({ title, description }: AICapabilityProps) {
  return (
    <div className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
      <div>
        <h5 className="mb-1">{title}</h5>
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
          {description}
        </p>
      </div>
    </div>
  );
}
