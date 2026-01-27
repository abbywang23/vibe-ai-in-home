import { useState, useEffect } from 'react';
import { Upload, CheckCircle, Home, Ruler, Sofa, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { RoomData } from '@/app/App';
import { ProgressBar } from '@/app/components/prototype/ProgressBar';

interface UploadStepProps {
  onComplete: (data: RoomData) => void;
}

export function UploadStep({ onComplete }: UploadStepProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [detectedData, setDetectedData] = useState<RoomData | null>(null);

  // Simulate file upload
  const handleImageUpload = async () => {
    // Simulate image upload with a placeholder
    const imageUrl = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';
    setUploadedImage(imageUrl);
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    // Simulate AI analysis with progressive updates
    const steps = [
      { progress: 20, delay: 300 },
      { progress: 45, delay: 600 },
      { progress: 70, delay: 800 },
      { progress: 90, delay: 1000 },
      { progress: 100, delay: 1200 }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setAnalysisProgress(step.progress);
    }

    // Set detected data
    const data: RoomData = {
      imageUrl,
      roomType: 'Living Room',
      dimensions: "12' × 15'",
      furniture: ['Sofa', 'Coffee Table', 'Armchair'],
      style: 'Modern Minimalist',
      confidence: 95
    };

    setDetectedData(data);
    setIsAnalyzing(false);
  };

  const handleContinue = () => {
    if (detectedData) {
      onComplete(detectedData);
    }
  };

  return (
    <div className="min-h-screen">
      <ProgressBar currentStep={1} totalSteps={3} />
      
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h2 className="mb-2">Upload Your Room</h2>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            Upload a photo and watch our AI analyze your space in real-time
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Area */}
          <div>
            {!uploadedImage ? (
              <button
                onClick={handleImageUpload}
                className="w-full aspect-[4/3] border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors flex flex-col items-center justify-center gap-4 bg-card group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <h4 className="mb-2">Click to Upload Room Photo</h4>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                    JPG, PNG up to 10MB
                  </p>
                </div>
              </button>
            ) : (
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border">
                <img
                  src={uploadedImage}
                  alt="Uploaded room"
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-card p-6 rounded-lg border border-border max-w-xs w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                        <h5>Analyzing Your Room...</h5>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${analysisProgress}%` }}
                        />
                      </div>
                      <p className="text-muted-foreground text-center" style={{ fontSize: 'var(--text-caption)' }}>
                        {analysisProgress}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Detection Results */}
          <div>
            {!detectedData ? (
              <div className="bg-card border border-border rounded-lg p-6">
                <h4 className="mb-4">AI Will Detect</h4>
                <div className="space-y-3">
                  <DetectionItem icon={<Home />} label="Room Type" placeholder="Living Room, Bedroom, etc." />
                  <DetectionItem icon={<Ruler />} label="Room Dimensions" placeholder="Estimated size" />
                  <DetectionItem icon={<Sofa />} label="Existing Furniture" placeholder="Items in the room" />
                  <DetectionItem icon={<Palette />} label="Current Style" placeholder="Design aesthetic" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    <h4>AI Analysis Complete</h4>
                  </div>
                  <div className="space-y-4">
                    <DetectedItem
                      icon={<Home />}
                      label="Room Type"
                      value={detectedData.roomType}
                      confidence={detectedData.confidence}
                    />
                    <DetectedItem
                      icon={<Ruler />}
                      label="Dimensions"
                      value={`${detectedData.dimensions} (180 sq ft)`}
                      confidence={92}
                    />
                    <DetectedItem
                      icon={<Sofa />}
                      label="Furniture Detected"
                      value={detectedData.furniture.join(', ')}
                      confidence={88}
                    />
                    <DetectedItem
                      icon={<Palette />}
                      label="Current Style"
                      value={detectedData.style}
                      confidence={90}
                    />
                  </div>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full px-6 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-3 group"
                >
                  Continue to Design Vision
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-center text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>
                  You can edit any detected values in the next step
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DetectionItem({ icon, label, placeholder }: { icon: React.ReactNode; label: string; placeholder: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div>
        <div className="font-medium mb-1" style={{ fontSize: 'var(--text-label)' }}>{label}</div>
        <div className="text-muted-foreground" style={{ fontSize: 'var(--text-caption)' }}>{placeholder}</div>
      </div>
    </div>
  );
}

function DetectedItem({ icon, label, value, confidence }: { icon: React.ReactNode; label: string; value: string; confidence: number }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20">
      <div className="text-primary mt-0.5">{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="font-medium" style={{ fontSize: 'var(--text-label)' }}>{label}</span>
          <span className="text-primary px-2 py-0.5 bg-primary/10 rounded" style={{ fontSize: 'var(--text-small)' }}>
            {confidence}% confident
          </span>
        </div>
        <div className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{value}</div>
        <button className="text-accent text-xs mt-1 hover:underline" style={{ fontSize: 'var(--text-small)' }}>
          Edit
        </button>
      </div>
    </div>
  );
}
