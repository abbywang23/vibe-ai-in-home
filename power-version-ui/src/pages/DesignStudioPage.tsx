import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import SaveIcon from '@mui/icons-material/Save';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PaletteIcon from '@mui/icons-material/Palette';
import ChairIcon from '@mui/icons-material/Chair';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Import step components
import RoomSetupStep from '@/components/steps/RoomSetupStep';
import DesignVisionStep from '@/components/steps/DesignVisionStep';
import FurnitureSelectionStep from '@/components/steps/FurnitureSelectionStep';
import FinalReviewStep from '@/components/steps/FinalReviewStep';

const steps = [
  {
    label: 'Room Setup',
    description: 'Upload & analyze your space',
    icon: <UploadFileIcon />,
  },
  {
    label: 'Design Vision',
    description: 'Define style & preferences',
    icon: <PaletteIcon />,
  },
  {
    label: 'Furniture Selection',
    description: 'Review AI recommendations',
    icon: <ChairIcon />,
  },
  {
    label: 'Final Review',
    description: 'Generate & purchase',
    icon: <CheckCircleIcon />,
  },
];

export default function DesignStudioPage() {
  const navigate = useNavigate();
  const { state } = useAppContext();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleStepClick = (stepIndex: number) => {
    // Only allow clicking on completed or current step
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
    }
  };

  const handleSaveProgress = () => {
    // TODO: Implement save progress
    console.log('Saving progress...');
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <RoomSetupStep onNext={handleNext} />;
      case 1:
        return <DesignVisionStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <FurnitureSelectionStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <FinalReviewStep onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          py: 2,
          px: 3,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" component="h1">
                AI Interior Design Studio
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Step {activeStep + 1}/4: {steps[activeStep].label}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<SaveIcon />}
                onClick={handleSaveProgress}
              >
                Save Progress
              </Button>
              <Tooltip title="Get help">
                <IconButton>
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Left Sidebar - Step Navigation */}
          <Card
            sx={{
              width: 380,
              flexShrink: 0,
              height: 'fit-content',
              position: 'sticky',
              top: 24,
            }}
          >
            <Box sx={{ p: 3 }}>
              <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                  <Step key={step.label} completed={index < activeStep}>
                    <StepLabel
                      onClick={() => handleStepClick(index)}
                      sx={{
                        cursor: index <= activeStep ? 'pointer' : 'default',
                        '& .MuiStepLabel-label': {
                          fontSize: '16px',
                          fontWeight: index === activeStep ? 500 : 400,
                        },
                      }}
                      icon={
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor:
                              index === activeStep
                                ? 'primary.main'
                                : index < activeStep
                                ? 'success.main'
                                : 'action.disabled',
                            color: 'white',
                          }}
                        >
                          {step.icon}
                        </Box>
                      }
                    >
                      <Typography variant="body1" sx={{ fontWeight: index === activeStep ? 500 : 400 }}>
                        {step.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {step.description}
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      {/* Optional: Add step-specific info here */}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Card>

          {/* Right Content Area */}
          <Box sx={{ flex: 1 }}>
            {renderStepContent(activeStep)}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
