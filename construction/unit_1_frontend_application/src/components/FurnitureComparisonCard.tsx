import { Check, X, ArrowRight, Ruler, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { FurnitureItem } from './DesignStudio';

interface FurnitureComparisonCardProps {
  item: FurnitureItem;
  index: number;
  isCompleted: boolean;
  onToggle: (id: string) => void;
  onSwap: (id: string) => void;
  isSwapping: boolean;
}

export function FurnitureComparisonCard({ item, index, isCompleted, onToggle, onSwap, isSwapping }: FurnitureComparisonCardProps) {
  const isRefreshMode = !!item.existingItem;

  if (!isRefreshMode) {
    // Standard card for new room mode
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
      </div>
    );
  }

  // Comparison card for refresh mode
  return (
    <div className={`bg-background border rounded-lg overflow-hidden transition-all ${
      item.isSelected 
        ? 'border-primary shadow-sm' 
        : 'border-border opacity-70'
    }`}>
      {/* Header with toggle */}
      <div className="bg-card border-b border-border px-3 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0" style={{ fontSize: 'var(--text-small)' }}>
            {index + 1}
          </span>
          <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>
            {item.category} Replacement
          </span>
        </div>
        {!isCompleted && (
          <button
            onClick={() => onToggle(item.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              item.isSelected
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
            style={{ fontSize: 'var(--text-small)' }}
          >
            {item.isSelected ? (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                Replace
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <X className="w-3.5 h-3.5" />
                Keep Existing
              </span>
            )}
          </button>
        )}
      </div>

      {/* Comparison Content */}
      <div className="p-3">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Existing Item */}
          <div className={`transition-opacity ${item.isSelected ? 'opacity-50' : 'opacity-100'}`}>
            <div className="aspect-square bg-muted rounded overflow-hidden mb-2">
              <img 
                src={item.existingItem!.imageUrl} 
                alt={item.existingItem!.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-muted-foreground mb-1" style={{ fontSize: 'var(--text-small)' }}>
                Current
              </p>
              <p className="font-medium mb-1" style={{ fontSize: 'var(--text-label)' }}>
                {item.existingItem!.name}
              </p>
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                Est. value: ${item.existingItem!.estimatedValue}
              </p>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <ArrowRight className={`w-5 h-5 transition-colors ${
              item.isSelected ? 'text-primary' : 'text-muted-foreground'
            }`} />
          </div>

          {/* New Item */}
          <div className={`transition-opacity ${item.isSelected ? 'opacity-100' : 'opacity-50'}`}>
            <div className="aspect-square bg-muted rounded overflow-hidden mb-2 relative">
              <img 
                src={item.imageUrl} 
                alt={item.name} 
                className="w-full h-full object-cover"
              />
              {item.isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>
            <div>
              <p className="text-accent mb-1" style={{ fontSize: 'var(--text-small)' }}>
                AI Recommended
              </p>
              <p className="font-medium mb-1" style={{ fontSize: 'var(--text-label)' }}>
                {item.name}
              </p>
              <p className="text-primary font-medium" style={{ fontSize: 'var(--text-label)' }}>
                ${item.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Upgrade Details */}
        {item.isSelected && (
          <div className="mt-3 pt-3 border-t border-border space-y-2">
            {/* Dimensions */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
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
        )}
      </div>

      {/* Action Buttons */}
      {!isCompleted && item.isSelected && (
        <div className="border-t border-border px-3 py-2">
          <button 
            onClick={() => onSwap(item.id)}
            disabled={isSwapping}
            className="w-full px-3 py-1.5 bg-card border border-border rounded hover:border-primary transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSwapping ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span style={{ fontSize: 'var(--text-small)' }}>Swapping...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span style={{ fontSize: 'var(--text-small)' }}>Swap Item</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
