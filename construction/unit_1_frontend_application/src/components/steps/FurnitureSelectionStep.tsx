import { useSelector } from 'react-redux';
import { Box, Typography, Button, CircularProgress } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { RootState } from '../../store';
import StepCard from '../shared/StepCard';
import { brandColors, typography } from '../../theme/brandTheme';

interface FurnitureSelectionStepProps {
  step: any;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

export default function FurnitureSelectionStep({ step, isExpanded, onToggle, onComplete }: FurnitureSelectionStepProps) {
  const cart = useSelector((state: RootState) => state.cart);
  const session = useSelector((state: RootState) => state.session);
  
  const isLoading = false;
  const totalCost = cart.items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  const budgetMax = session.preferences.budget?.amount || 5000;
  const withinBudget = totalCost <= budgetMax;
  const isCompleted = step.status === 'completed';

  if (isLoading) {
    return (
      <StepCard step={step} isExpanded={isExpanded} onToggle={onToggle}>
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <CircularProgress size={40} sx={{ color: brandColors.primary, mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 0.5 }}>
            AI is selecting furniture...
          </Typography>
          <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.caption }}>
            Analyzing your preferences and room dimensions
          </Typography>
        </Box>
      </StepCard>
    );
  }

  return (
    <StepCard step={step} isExpanded={isExpanded} onToggle={onToggle}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Budget Summary */}
        <Box
          sx={{
            borderRadius: '8px',
            p: 2,
            border: `1px solid ${withinBudget ? brandColors.primary + '30' : brandColors.destructive + '30'}`,
            backgroundColor: withinBudget ? `${brandColors.primary}10` : `${brandColors.destructive}10`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShoppingCartIcon
                sx={{
                  fontSize: '20px',
                  color: withinBudget ? brandColors.primary : brandColors.destructive,
                }}
              />
              <Typography sx={{ fontWeight: 500, fontSize: typography.sizes.label }}>
                {cart.items.length} Items Selected
              </Typography>
            </Box>
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: typography.sizes.h5,
                color: withinBudget ? brandColors.primary : brandColors.destructive,
              }}
            >
              ${totalCost.toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
              Budget: ${session.preferences.budget?.amount.toLocaleString() || '5,000'}
            </Typography>
            {withinBudget ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: brandColors.primary }}>
                <CheckIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.small }}>Within budget</Typography>
              </Box>
            ) : (
              <Typography sx={{ color: brandColors.destructive, fontSize: typography.sizes.small }}>
                ${(totalCost - budgetMax).toLocaleString()} over budget
              </Typography>
            )}
          </Box>
        </Box>

        {/* AI Selection Note */}
        <Box
          sx={{
            backgroundColor: `${brandColors.accent}10`,
            border: `1px solid ${brandColors.accent}30`,
            borderRadius: '8px',
            p: 2,
            display: 'flex',
            alignItems: 'start',
            gap: 1,
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: '16px', color: brandColors.accent, mt: 0.5 }} />
          <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
            AI selected these items based on your room size, style preferences, and budget. Each item includes an explanation.
          </Typography>
        </Box>

        {/* Furniture Items Placeholder */}
        {cart.items.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: 'center',
              border: `1px dashed ${brandColors.border}`,
              borderRadius: '8px',
            }}
          >
            <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.base }}>
              No furniture items selected yet. Complete previous steps to get AI recommendations.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
              {cart.items.length} furniture items in your selection
            </Typography>
          </Box>
        )}

        {/* Confirm Button */}
        {!isCompleted && (
          <Button
            onClick={onComplete}
            disabled={!withinBudget || cart.items.length === 0}
            variant="contained"
            fullWidth
            startIcon={withinBudget ? <CheckIcon /> : <AttachMoneyIcon />}
            sx={{
              backgroundColor: brandColors.primary,
              color: brandColors.primaryForeground,
              py: 1.5,
              textTransform: 'uppercase',
              letterSpacing: '2.8px',
              fontSize: typography.sizes.button,
              fontFamily: typography.body.fontFamily,
              '&:hover': {
                backgroundColor: `${brandColors.primary}dd`,
              },
              '&:disabled': {
                opacity: 0.5,
              },
            }}
          >
            {withinBudget ? 'Confirm Selection' : 'Adjust Budget or Items'}
          </Button>
        )}
      </Box>
    </StepCard>
  );
}
