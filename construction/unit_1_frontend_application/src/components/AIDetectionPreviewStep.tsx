import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Checkbox,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { DetectedFurnitureItem } from '../types/domain';
import { SetupMode } from './RoomInformationSetup';
import { brandColors, spacing } from '../theme/brandTheme';

interface AIDetectionPreviewStepProps {
  roomImageUrl: string;
  mode: SetupMode;
  detectedItems: DetectedFurnitureItem[];
  isDetecting: boolean;
  onItemsConfirm: (selectedItemIds: string[]) => void;
  onBack: () => void;
}

const steps = ['Room Setup', 'AI Detection', 'Preferences', 'Furniture Selection'];

export default function AIDetectionPreviewStep({
  roomImageUrl,
  mode,
  detectedItems,
  isDetecting,
  onItemsConfirm,
  onBack,
}: AIDetectionPreviewStepProps) {
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Auto-select all items when detection completes
  useEffect(() => {
    if (detectedItems.length > 0 && selectedItemIds.length === 0) {
      setSelectedItemIds(detectedItems.map(item => item.itemId));
    }
  }, [detectedItems]);

  const handleItemToggle = (itemId: string) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleConfirm = () => {
    onItemsConfirm(selectedItemIds);
  };

  const isValid = mode === SetupMode.EMPTY_ROOM || selectedItemIds.length > 0;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Stepper */}
      <Box sx={{ mb: spacing.lg / 8 }}>
        <Stepper activeStep={1} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: brandColors.darkGray,
                    '&.Mui-active': {
                      color: brandColors.terracotta,
                      fontWeight: 600,
                    },
                    '&.Mui-completed': {
                      color: brandColors.sienna,
                    },
                  },
                  '& .MuiStepIcon-root': {
                    color: brandColors.mediumGray,
                    '&.Mui-active': {
                      color: brandColors.terracotta,
                    },
                    '&.Mui-completed': {
                      color: brandColors.sienna,
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left Panel - Image Preview */}
        <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: spacing.lg / 8,
              border: `1px solid ${brandColors.mediumGray}`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                fontWeight: 600,
                mb: spacing.lg / 8,
              }}
            >
              Your Room
            </Typography>

            <Box 
              sx={{ 
                width: '100%',
                borderRadius: 2,
                overflow: 'hidden',
                border: `2px solid ${brandColors.mediumGray}`,
                backgroundColor: brandColors.cream,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
                position: 'relative',
              }}
            >
              {isDetecting ? (
                <Box textAlign="center" sx={{ p: spacing.xl / 8 }}>
                  <CircularProgress size={40} sx={{ color: brandColors.terracotta, mb: 2 }} />
                  <Typography variant="body1" sx={{ color: brandColors.darkGray }}>
                    AI is analyzing your room...
                  </Typography>
                </Box>
              ) : roomImageUrl ? (
                <img
                  src={roomImageUrl}
                  alt="Room"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    maxHeight: 600,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography variant="body1" sx={{ color: brandColors.darkGray }}>
                  No image available
                </Typography>
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Detection Results */}
        <Box sx={{ flex: { xs: '1', md: '0 0 50%' } }}>
          <Paper 
            elevation={0}
            sx={{ 
              p: spacing.lg / 8,
              border: `1px solid ${brandColors.mediumGray}`,
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                fontWeight: 600,
                mb: spacing.lg / 8,
              }}
            >
              AI Detection Results
            </Typography>

            {mode === SetupMode.EMPTY_ROOM ? (
              <Alert severity="info" sx={{ mb: spacing.md / 8 }}>
                Empty room detected. You can proceed to set your preferences and AI will recommend furniture to place in your room.
              </Alert>
            ) : (
              <>
                {isDetecting ? (
                  <Box textAlign="center" sx={{ py: spacing.xl / 8 }}>
                    <CircularProgress size={40} sx={{ color: brandColors.terracotta, mb: 2 }} />
                    <Typography variant="body1" sx={{ color: brandColors.darkGray }}>
                      Detecting furniture in your room...
                    </Typography>
                  </Box>
                ) : detectedItems.length > 0 ? (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: spacing.md / 8 }}>
                      <CheckCircleIcon sx={{ color: brandColors.terracotta, mr: 1 }} />
                      <Typography variant="body1" sx={{ color: brandColors.darkGray }}>
                        AI detected {detectedItems.length} furniture item{detectedItems.length > 1 ? 's' : ''}
                      </Typography>
                    </Box>

                    <Alert severity="info" sx={{ mb: spacing.md / 8 }}>
                      Select the furniture items you want to replace. You can ignore any items that were incorrectly detected.
                    </Alert>

                    <Box sx={{ mb: spacing.lg / 8 }}>
                      {detectedItems.map((item) => (
                        <Paper
                          key={item.itemId}
                          sx={{
                            p: spacing.md / 8,
                            mb: spacing.sm / 8,
                            border: selectedItemIds.includes(item.itemId)
                              ? `2px solid ${brandColors.terracotta}`
                              : `1px solid ${brandColors.mediumGray}`,
                            borderRadius: 1,
                            backgroundColor: selectedItemIds.includes(item.itemId)
                              ? `${brandColors.terracotta}10`
                              : 'transparent',
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedItemIds.includes(item.itemId)}
                                onChange={() => handleItemToggle(item.itemId)}
                                sx={{
                                  color: brandColors.terracotta,
                                  '&.Mui-checked': {
                                    color: brandColors.terracotta,
                                  },
                                }}
                              />
                            }
                            label={
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                    {item.furnitureType}
                                  </Typography>
                                  <Chip
                                    label={`${Math.round(item.confidence * 100)}%`}
                                    size="small"
                                    sx={{
                                      backgroundColor: item.confidence > 0.8 
                                        ? `${brandColors.terracotta}20` 
                                        : `${brandColors.sienna}20`,
                                      color: item.confidence > 0.8 
                                        ? brandColors.terracotta 
                                        : brandColors.sienna,
                                    }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ color: brandColors.darkGray }}>
                                  Position: ({Math.round(item.boundingBox.x)}, {Math.round(item.boundingBox.y)})
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </Paper>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Alert severity="warning" sx={{ mb: spacing.md / 8 }}>
                    No furniture detected in the image. You can proceed to empty room mode or try uploading a different image.
                  </Alert>
                )}
            </>
          )}
        </Paper>
      </Box>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: spacing.lg / 8 }}>
        <Button 
          variant="outlined" 
          onClick={onBack}
          sx={{
            borderColor: brandColors.mediumGray,
            color: brandColors.darkGray,
            px: spacing.lg / 8,
            py: spacing.sm / 8,
            '&:hover': {
              borderColor: brandColors.terracotta,
              backgroundColor: 'transparent',
            },
          }}
        >
          Back
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handleConfirm}
          disabled={!isValid}
          sx={{
            backgroundColor: isValid ? brandColors.terracotta : brandColors.mediumGray,
            color: brandColors.white,
            px: spacing.lg / 8,
            py: spacing.sm / 8,
            fontSize: '1rem',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: isValid ? brandColors.sienna : brandColors.mediumGray,
            },
            '&:disabled': {
              backgroundColor: brandColors.mediumGray,
              color: brandColors.darkGray,
            },
          }}
        >
          Continue to Preferences
        </Button>
      </Box>

      {!isValid && mode === SetupMode.REPLACE_FURNITURE && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.terracotta,
            mt: spacing.sm / 8,
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          Please select at least one furniture item to replace
        </Typography>
      )}
    </Box>
  );
}
