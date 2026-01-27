interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  const steps = [
    { number: 1, label: 'Upload' },
    { number: 2, label: 'Vision' },
    { number: 2.5, label: 'Selection' },
    { number: 3, label: 'Results' }
  ];

  return (
    <div className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.number
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span style={{ fontSize: 'var(--text-caption)' }}>
                    {Math.floor(step.number)}
                  </span>
                </div>
                <span
                  className={`mt-2 text-xs ${
                    currentStep >= step.number ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  style={{ fontSize: 'var(--text-small)' }}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-border">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ 
                      width: currentStep > step.number ? '100%' : '0%' 
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
