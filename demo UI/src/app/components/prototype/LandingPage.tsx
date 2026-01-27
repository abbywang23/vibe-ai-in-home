import { Sparkles, Zap, Eye, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="mb-6">
              Transform Your Space with AI-Powered Interior Design
            </h1>
            <p className="text-muted-foreground mb-8" style={{ fontSize: 'var(--text-h5)' }}>
              Upload a photo of your room and let our AI create stunning furniture arrangements 
              tailored to your style and budget.
            </p>
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-3 group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Decorative background */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Sparkles className="w-8 h-8" />}
              step="Step 1"
              title="Smart Upload"
              description="Upload your room photo. Our AI instantly detects room type, dimensions, and existing furniture."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              step="Step 2"
              title="Define Your Vision"
              description="Choose your style and budget. AI suggests furniture that matches your preferences."
            />
            <FeatureCard
              icon={<Eye className="w-8 h-8" />}
              step="Step 3"
              title="See & Refine"
              description="View your redesigned room. Swap items, adjust positions, and purchase when ready."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="mb-6">Ready to Transform Your Space?</h2>
          <p className="text-muted-foreground mb-8" style={{ fontSize: 'var(--text-base)' }}>
            Join thousands of homeowners who have redesigned their rooms with AI
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors inline-flex items-center gap-3"
          >
            Start Designing Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  step: string;
  title: string;
  description: string;
}

function FeatureCard({ icon, step, title, description }: FeatureCardProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-caption)' }}>
        {step}
      </div>
      <h3 className="mb-3">{title}</h3>
      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
        {description}
      </p>
    </div>
  );
}
