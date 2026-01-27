import { useState, useEffect } from 'react';
import { ChevronLeft, ArrowRight, Sparkles, DollarSign, RefreshCw, Zap } from 'lucide-react';
import { RoomData, DesignPreferences, FurnitureItem } from '@/app/App';
import { ProgressBar } from '@/app/components/prototype/ProgressBar';

interface SelectionStepProps {
  roomData: RoomData;
  preferences: DesignPreferences;
  onComplete: (furniture: FurnitureItem[]) => void;
  onBack: () => void;
}

export function SelectionStep({ roomData, preferences, onComplete, onBack }: SelectionStepProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFurniture, setSelectedFurniture] = useState<FurnitureItem[]>([]);
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);

  useEffect(() => {
    // Simulate AI recommendation generation
    const timeout = setTimeout(() => {
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
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const totalCost = selectedFurniture.reduce((sum, item) => sum + item.price, 0);
  const withinBudget = totalCost <= preferences.budget.max;

  const handleContinue = () => {
    onComplete(selectedFurniture);
  };

  const handleRemoveItem = (id: string) => {
    setSelectedFurniture(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="min-h-screen">
      <ProgressBar currentStep={2.5} totalSteps={3} />
      
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2>AI Furniture Recommendations</h2>
          </div>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            We've selected furniture that matches your {preferences.style.toLowerCase()} style and fits your space perfectly
          </p>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/10">
              <Zap className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <h4 className="mb-2">AI is selecting furniture...</h4>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              Analyzing thousands of products to find the perfect match
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Furniture Grid */}
            <div className="lg:col-span-2 space-y-4">
              {selectedFurniture.map((item) => (
                <FurnitureCard
                  key={item.id}
                  item={item}
                  onRemove={handleRemoveItem}
                  onShowAlternatives={() => setShowAlternatives(item.id)}
                />
              ))}
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-lg p-6 sticky top-6 space-y-6">
                <div>
                  <h5 className="mb-4">Selection Summary</h5>
                  <div className="space-y-3">
                    {selectedFurniture.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                          {item.name}
                        </span>
                        <span className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>
                          ${item.price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span style={{ fontSize: 'var(--text-label)' }}>Total Cost</span>
                    <span className="text-primary" style={{ fontSize: 'var(--text-h4)' }}>
                      ${totalCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                      Your Budget
                    </span>
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                      ${preferences.budget.min.toLocaleString()} - ${preferences.budget.max.toLocaleString()}
                    </span>
                  </div>
                  {withinBudget ? (
                    <div className="mt-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-primary text-center" style={{ fontSize: 'var(--text-caption)' }}>
                        ✓ Within your budget
                      </p>
                    </div>
                  ) : (
                    <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-destructive text-center" style={{ fontSize: 'var(--text-caption)' }}>
                        ${(totalCost - preferences.budget.max).toLocaleString()} over budget
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleContinue}
                  disabled={!withinBudget || selectedFurniture.length === 0}
                  className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Generate My Design
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  {selectedFurniture.length} items selected
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FurnitureCardProps {
  item: FurnitureItem;
  onRemove: (id: string) => void;
  onShowAlternatives: () => void;
}

function FurnitureCard({ item, onRemove, onShowAlternatives }: FurnitureCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex gap-4">
        <div className="w-32 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h5 className="mb-1">{item.name}</h5>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                {item.category}
              </p>
            </div>
            <div className="text-right">
              <div className="text-primary" style={{ fontSize: 'var(--text-h5)' }}>
                ${item.price.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 mb-3 p-3 bg-accent/5 border border-accent/20 rounded-lg">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
            <p className="text-accent" style={{ fontSize: 'var(--text-caption)' }}>
              <strong>AI Insight:</strong> {item.reason}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onShowAlternatives}
              className="flex items-center gap-2 text-accent hover:underline"
              style={{ fontSize: 'var(--text-caption)' }}
            >
              <RefreshCw className="w-4 h-4" />
              See alternatives
            </button>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
              {item.dimensions}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              className="ml-auto text-destructive hover:underline"
              style={{ fontSize: 'var(--text-caption)' }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
