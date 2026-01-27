import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  AppBar,
  Toolbar,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { brandColors } from '../theme/brandTheme';
import RoomSetupStep from '../components/steps/RoomSetupStep';
import DesignVisionStep from '../components/steps/DesignVisionStep';
import FurnitureSelectionStep from '../components/steps/FurnitureSelectionStep';
import FinalReviewStep from '../components/steps/FinalReviewStep';
import RenderingCanvas from '../components/shared/RenderingCanvas';
import FurnitureListPanel from '../components/shared/FurnitureListPanel';
import NotificationSnackbar from '../components/NotificationSnackbar';

type StepId = 'upload' | 'vision' | 'selection' | 'confirmation';
type StepStatus = 'pending' | 'active' | 'completed' | 'locked';

interface Step {
  id: StepId;
  number: number;
  title: string;
  subtitle: string;
  status: StepStatus;
}

export default function PlannerFlowPage() {
  const navigate = useNavigate();

  const [steps, setSteps] = useState<Step[]>([
    { id: 'upload', number: 1, title: 'Room Setup', subtitle: 'Upload & analyze your space', status: 'active' },
    { id: 'vision', number: 2, title: 'Design Vision', subtitle: 'Define style & preferences', status: 'pending' },
    { id: 'selection', number: 3, title: 'Furniture Selection', subtitle: 'Review AI recommendations', status: 'pending' },
    { id: 'confirmation', number: 4, title: 'Final Review', subtitle: 'Generate & purchase', status: 'pending' }
  ]);

  const [expandedStep, setExpandedStep] = useState<StepId>('upload');

  // Update step status
  const updateStepStatus = (stepId: StepId, status: StepStatus) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  };

  // Complete step and activate next
  const completeStep = (stepId: StepId) => {
    updateStepStatus(stepId, 'completed');
    
    const currentIndex = steps.findIndex(s => s.id === stepId);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      updateStepStatus(nextStep.id, 'active');
      setExpandedStep(nextStep.id);
    }
  };

  const activeStep = steps.find(s => s.status === 'active');

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: brandColors.background }}>
      <NotificationSnackbar />
      
      {/* Header */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          backgroundColor: brandColors.card,
          borderBottom: `1px solid ${brandColors.border}`,
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography 
              variant="h4"
              sx={{ 
                color: brandColors.foreground,
                mb: 0.5,
              }}
            >
              AI Interior Design Studio
            </Typography>
            <Typography 
              variant="caption"
              sx={{ color: brandColors.mutedForeground }}
            >
              {activeStep && `Step ${activeStep.number}/4: ${activeStep.title}`}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="text"
              sx={{ color: brandColors.mutedForeground }}
            >
              Save Progress
            </Button>
            <Button
              variant="outlined"
            >
              Help
            </Button>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ 
                color: brandColors.primary,
              }}
            >
              Home
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel - Steps */}
        <Box 
          sx={{ 
            width: '480px',
            borderRight: `1px solid ${brandColors.border}`,
            backgroundColor: brandColors.card,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RoomSetupStep
                step={steps[0]}
                isExpanded={expandedStep === 'upload'}
                onToggle={() => setExpandedStep(expandedStep === 'upload' ? 'upload' : 'upload')}
                onComplete={() => completeStep('upload')}
              />
              <DesignVisionStep
                step={steps[1]}
                isExpanded={expandedStep === 'vision'}
                onToggle={() => setExpandedStep(expandedStep === 'vision' ? 'vision' : 'vision')}
                onComplete={() => completeStep('vision')}
              />
              <FurnitureSelectionStep
                step={steps[2]}
                isExpanded={expandedStep === 'selection'}
                onToggle={() => setExpandedStep(expandedStep === 'selection' ? 'selection' : 'selection')}
                onComplete={() => completeStep('selection')}
              />
              <FinalReviewStep
                step={steps[3]}
                isExpanded={expandedStep === 'confirmation'}
                onToggle={() => setExpandedStep(expandedStep === 'confirmation' ? 'confirmation' : 'confirmation')}
                onComplete={() => completeStep('confirmation')}
              />
            </Box>
          </Box>
        </Box>

        {/* Right Panel - Visualization */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: brandColors.background }}>
          {/* Rendering Canvas */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            <RenderingCanvas />
          </Box>

          {/* Furniture List Panel */}
          <Box 
            sx={{ 
              height: '280px',
              borderTop: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.card,
              overflowY: 'auto',
            }}
          >
            <FurnitureListPanel />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
