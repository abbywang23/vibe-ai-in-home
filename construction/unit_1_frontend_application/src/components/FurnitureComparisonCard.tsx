import { Sparkles, ArrowRight, RefreshCw, X, Check } from 'lucide-react';
import { FurnitureItem } from './DesignStudio';

interface FurnitureComparisonCardProps {
  item: FurnitureItem;
  index: number;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onSwap: (id: string) => void;
  onRemove: (id: string) => void;
}

export function FurnitureComparisonCard({ 
  item, 
  index, 
  isCompleted, 
  onToggle, 
  onSwap, 
  onRemove 
}: FurnitureComparisonCardProps) {
  return (
    <div className={`bg-background border rounded-lg overflow-hidden transition-all ${
      item.isSelected 
        ? 'border-primary shadow-sm' 
        : 'border-border hover:border-primary/50'
    }`}>
      {/* Header with selection toggle */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggle(item.id)}
            disabled={isCompleted}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              item.isSelected
                ? 'bg-primary border-primary text-primary-foreground'
                : 'border-border hover:border-primary'
            } ${isCompleted ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {item.isSelected && <Check className="w-3 h-3" />}
          </button>
          <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>
            {item.category} #{index + 1}
          </span>
        </div>
        {!isCompleted && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSwap(item.id)}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Swap item"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => onRemove(item.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              title="Remove item"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Comparison Content */}
      <div className="p-3">
        {item.existingItem ? (
          // Replacement comparison
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* Existing Item */}
              <div className="text-center">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                  <img 
                    src={item.existingItem.imageUrl} 
                    alt={item.existingItem.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>
                  Current
                </p>
                <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>
                  {item.existingItem.name}
                </p>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  Est. ${item.existingItem.estimatedValue}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary" />
              </div>

              {/* New Item */}
              <div className="text-center">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-primary mb-1" style={{ fontSize: 'var(--text-small)' }}>
                  Recommended
                </p>
                <p className="font-medium" style={{ fontSize: 'var(--text-caption)' }}>
                  {item.name}
                </p>
                <p className="text-primary font-medium" style={{ fontSize: 'var(--text-small)' }}>
                  ${item.price.toLocaleString()}
                </p>
              </div>
            </div>

            {/* AI Reasoning */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-accent font-medium mb-1" style={{ fontSize: 'var(--text-small)' }}>
                    Why this upgrade?
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {item.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="text-center">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                Dimensions: {item.dimensions}
              </p>
            </div>
          </div>
        ) : (
          // New item (no existing comparison)
          <div className="space-y-3">
            <div className="text-center">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h5 className="mb-1">{item.name}</h5>
              <p className="text-primary font-medium mb-2" style={{ fontSize: 'var(--text-base)' }}>
                ${item.price.toLocaleString()}
              </p>
            </div>

            {/* AI Reasoning */}
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-accent font-medium mb-1" style={{ fontSize: 'var(--text-small)' }}>
                    AI Recommendation
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {item.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="text-center">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                Dimensions: {item.dimensions}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}