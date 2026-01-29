import { useRef, useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface RenderUploadAreaProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadProgress?: number;
}

export function RenderUploadArea({ onFileSelect, isUploading, uploadProgress = 0 }: RenderUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - 与 RenderPreview 保持一致 */}
      <div className="px-3 py-2 border-b border-border" style={{ backgroundColor: '#f6f3e7' }}>
        <h3 className="text-sm font-medium" style={{ color: '#3C101E' }}>Upload room photo</h3>
      </div>
      
      {/* Upload Area */}
      <div className="flex-1 flex items-center justify-center p-4" style={{ backgroundColor: '#f9f7ef' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        <div
          onClick={handleClick}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            w-full h-full min-h-[200px] border-2 border-dashed rounded-lg
            flex flex-col items-center justify-center gap-3
            transition-all duration-200
            ${dragActive ? 'border-[rgb(210,92,27)] bg-[rgb(210,92,27)]/10 scale-[0.98]' : 'border-border/50 bg-background'}
            ${isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-[rgb(210,92,27)] hover:bg-[rgb(210,92,27)]/5 hover:shadow-sm'}
          `}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-12 h-12 text-[rgb(210,92,27)] animate-spin" />
              <div className="text-center px-4">
                <p className="text-sm font-medium text-foreground mb-2">Uploading...</p>
                {uploadProgress > 0 && (
                  <div className="w-40 mx-auto">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[rgb(210,92,27)] transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">{uploadProgress}%</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-[rgb(210,92,27)]/10 flex items-center justify-center mb-1">
                <Upload className="w-8 h-8 text-[rgb(210,92,27)]" />
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-muted-foreground">
                  Click or drag to upload
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPG, PNG (max 10MB)
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
