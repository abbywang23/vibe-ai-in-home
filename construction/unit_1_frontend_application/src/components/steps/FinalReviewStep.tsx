import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { RootState } from '../../store';
import { brandColors, typography } from '../../theme/brandTheme';
import StepCard from '../shared/StepCard';

interface FinalReviewStepProps {
  step: {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    status: 'pending' | 'active' | 'completed' | 'locked';
  };
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

export default function FinalReviewStep({ step, isExpanded, onToggle, onComplete }: FinalReviewStepProps) {
  const cart = useSelector((state: RootState) => state.cart);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);

  const totalCost = cart.items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);

  const handleGenerateRender = async () => {
    setIsRendering(true);
    setRenderProgress(0);

    const steps = [15, 40, 65, 85, 100];
    for (const progress of steps) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setRenderProgress(progress);
    }

    await new Promise(resolve => setTimeout(resolve, 500));
    setIsRendering(false);
    setShowFinalResult(true);
    onComplete();
  };

  return (
    <StepCard
      step={step}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {!showFinalResult ? (
          <>
            {/* Ready to Generate */}
            <Box
              sx={{
                backgroundColor: `${brandColors.primary}10`,
                border: `1px solid ${brandColors.primary}30`,
                borderRadius: '8px',
                p: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontFamily: typography.display.fontFamily,
                  fontSize: typography.sizes.h5,
                  mb: 1,
                }}
              >
                Ready to Generate
              </Typography>
              <Typography
                sx={{
                  color: brandColors.mutedForeground,
                  fontSize: typography.sizes.caption,
                  mb: 2,
                }}
              >
                AI will place your selected furniture into the room with realistic lighting and shadows
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: brandColors.mutedForeground }}>
                <FlashOnIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.small }}>
                  Estimated time: 15-20 seconds
                </Typography>
              </Box>
            </Box>

            {/* Rendering Progress */}
            {isRendering && (
              <Box>
                <Box sx={{ mb: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={renderProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: brandColors.muted,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: brandColors.primary,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    color: brandColors.mutedForeground,
                    fontSize: typography.sizes.caption,
                    textAlign: 'center',
                  }}
                >
                  {renderProgress}% complete
                </Typography>
              </Box>
            )}

            {/* Generate Button */}
            <Button
              variant="contained"
              fullWidth
              onClick={handleGenerateRender}
              disabled={isRendering}
              startIcon={isRendering ? <CircularProgress size={20} sx={{ color: 'inherit' }} /> : <VisibilityIcon />}
              sx={{
                backgroundColor: brandColors.secondary,
                color: brandColors.secondaryForeground,
                py: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '2.8px',
                fontSize: typography.sizes.button,
                fontFamily: typography.body.fontFamily,
                '&:hover': {
                  backgroundColor: `${brandColors.secondary}dd`,
                },
                '&:disabled': {
                  opacity: 0.5,
                },
              }}
            >
              {isRendering ? 'Generating...' : 'Generate Rendering'}
            </Button>
          </>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Success Message */}
            <Box
              sx={{
                backgroundColor: `${brandColors.primary}10`,
                border: `1px solid ${brandColors.primary}30`,
                borderRadius: '8px',
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CheckCircleIcon sx={{ color: brandColors.primary, fontSize: '20px' }} />
                <Typography
                  variant="h5"
                  sx={{
                    color: brandColors.primary,
                    fontFamily: typography.display.fontFamily,
                    fontSize: typography.sizes.h5,
                  }}
                >
                  Rendering Complete!
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: brandColors.mutedForeground,
                  fontSize: typography.sizes.caption,
                }}
              >
                Your redesigned room is ready. Review the result and purchase when ready.
              </Typography>
            </Box>

            {/* Purchase Button */}
            <Button
              variant="contained"
              fullWidth
              startIcon={<ShoppingCartIcon />}
              sx={{
                backgroundColor: brandColors.primary,
                color: brandColors.primaryForeground,
                py: 2,
                textTransform: 'uppercase',
                letterSpacing: '2.8px',
                fontSize: typography.sizes.button,
                fontFamily: typography.body.fontFamily,
                '&:hover': {
                  backgroundColor: `${brandColors.primary}dd`,
                },
              }}
            >
              Purchase All (${totalCost.toLocaleString()})
            </Button>

            {/* Action Buttons */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <Button
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1,
                  borderColor: brandColors.border,
                  color: brandColors.foreground,
                  '&:hover': {
                    borderColor: brandColors.primary,
                  },
                }}
              >
                <RefreshIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.small }}>Re-generate</Typography>
              </Button>
              <Button
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1,
                  borderColor: brandColors.border,
                  color: brandColors.foreground,
                  '&:hover': {
                    borderColor: brandColors.primary,
                  },
                }}
              >
                <DownloadIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.small }}>Download</Typography>
              </Button>
              <Button
                variant="outlined"
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1,
                  borderColor: brandColors.border,
                  color: brandColors.foreground,
                  '&:hover': {
                    borderColor: brandColors.primary,
                  },
                }}
              >
                <ShareIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.small }}>Share</Typography>
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </StepCard>
  );
}
