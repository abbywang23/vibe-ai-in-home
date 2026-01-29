import { Eye, Loader2 } from 'lucide-react';

interface RenderPreviewProps {
  imageUrl?: string;
  isLoading?: boolean;
  title: string;
  emptyText: string;
}

export function RenderPreview({ imageUrl, isLoading, title, emptyText }: RenderPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-2 border-b border-border" style={{ backgroundColor: '#f6f3e7' }}>
        <h3 className="text-sm font-medium" style={{ color: '#3C101E' }}>{title}</h3>
      </div>
      
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4" style={{ backgroundColor: '#f9f7ef' }}>
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-[rgb(210,92,27)] animate-spin" />
            <p className="text-sm text-muted-foreground">Processing...</p>
          </div>
        ) : imageUrl ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={imageUrl}
              alt={title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Eye className="w-8 h-8" />
            </div>
            <p className="text-sm text-center px-4 max-w-[200px]">{emptyText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
