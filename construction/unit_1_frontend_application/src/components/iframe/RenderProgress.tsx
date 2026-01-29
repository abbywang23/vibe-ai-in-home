import { Upload, Search, Sparkles, CheckCircle, Loader2 } from 'lucide-react';
import { RenderStatus } from '../../types/iframe';

interface RenderProgressProps {
  status: RenderStatus;
  progress?: number;
}

export function RenderProgress({ status, progress = 0 }: RenderProgressProps) {
  const steps = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'detect', label: 'Detect', icon: Search },
    { id: 'render', label: 'Render', icon: Sparkles },
  ];

  const getStepStatus = (stepId: string): 'completed' | 'active' | 'pending' => {
    if (status === 'completed') return 'completed';
    if (status === 'error') return 'pending';
    
    if (stepId === 'upload') {
      if (status === 'uploading') return 'active';
      if (['detecting', 'rendering', 'completed'].includes(status)) return 'completed';
    }
    if (stepId === 'detect') {
      if (status === 'detecting') return 'active';
      if (['rendering', 'completed'].includes(status)) return 'completed';
    }
    if (stepId === 'render') {
      if (status === 'rendering') return 'active';
      if (status === 'completed') return 'completed';
    }
    
    return 'pending';
  };

  return (
    <div className="flex flex-col items-center px-6 py-4" style={{ backgroundColor: '#f9f7ef' }}>
      {/* 标题和描述 */}
      <div className="text-center mb-4">
        <h2 className="text-lg font-semibold text-[rgb(210,92,27)] mb-1">
          Visualize Your Space
        </h2>
        <p className="text-xs text-[rgb(210,92,27)]">
          Upload your room photo and see how our furniture transforms your space instantly
        </p>
      </div>
      
      {/* 进度指示器 */}
      <div className="flex items-start w-full max-w-[260px]">
        {steps.map((step, index) => {
          const stepStatus = getStepStatus(step.id);
          const nextStepStatus = index < steps.length - 1 ? getStepStatus(steps[index + 1].id) : 'pending';
          const Icon = step.icon;
          
          return (
            <>
              <div key={step.id} className="flex flex-col items-center gap-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                    ${stepStatus === 'completed' ? 'bg-[rgb(210,92,27)] text-white shadow-sm' : ''}
                    ${stepStatus === 'active' ? 'bg-[rgb(210,92,27)]/15 text-[rgb(210,92,27)] ring-2 ring-[rgb(210,92,27)]/30' : ''}
                    ${stepStatus === 'pending' ? 'bg-muted text-muted-foreground' : ''}
                  `}
                >
                  {stepStatus === 'completed' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : stepStatus === 'active' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`
                    text-[10px] font-medium transition-colors whitespace-nowrap
                    ${stepStatus === 'completed' || stepStatus === 'active' ? 'text-[rgb(210,92,27)]' : 'text-muted-foreground'}
                  `}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  key={`line-${step.id}`}
                  className="flex-1 flex items-center"
                  style={{ height: '32px' }}
                >
                  <div
                    className={`
                      w-full h-0.5 transition-all duration-300 rounded-full
                      ${nextStepStatus === 'completed' || nextStepStatus === 'active' ? 'bg-[rgb(210,92,27)]' : 'bg-muted'}
                    `}
                  />
                </div>
              )}
            </>
          );
        })}
      </div>
    </div>
  );
}
