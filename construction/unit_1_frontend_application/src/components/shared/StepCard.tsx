import { ReactNode } from 'react';
import { Box, Typography, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import LockIcon from '@mui/icons-material/Lock';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { brandColors } from '../../theme/brandTheme';

type StepStatus = 'pending' | 'active' | 'completed' | 'locked';

interface Step {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  status: StepStatus;
}

interface StepCardProps {
  step: Step;
  isExpanded: boolean;
  onToggle: () => void;
  isLast?: boolean;
  icon?: ReactNode;
  children: ReactNode;
}

export default function StepCard({ step, isExpanded, onToggle, isLast = false, icon, children }: StepCardProps) {
  const canInteract = step.status === 'active' || step.status === 'completed';
  const isCompleted = step.status === 'completed';
  const isPending = step.status === 'pending';
  const isActive = step.status === 'active';

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Vertical Line */}
      {!isLast && (
        <Box
          sx={{
            position: 'absolute',
            left: '19px',
            top: '44px',
            bottom: '-16px',
            width: '2px',
            backgroundColor: brandColors.border,
          }}
        />
      )}

      <Box
        sx={{
          position: 'relative',
          borderRadius: '8px',
          border: isExpanded && canInteract
            ? `1px solid ${brandColors.primary}`
            : `1px solid ${brandColors.border}`,
          backgroundColor: isExpanded && canInteract
            ? brandColors.background
            : isCompleted
            ? brandColors.background
            : isPending
            ? brandColors.muted + '20'
            : brandColors.background,
          boxShadow: isExpanded && canInteract ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none',
          transition: 'all 0.2s',
        }}
      >
        {/* Step Header */}
        <Button
          onClick={onToggle}
          disabled={!canInteract}
          sx={{
            width: '100%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textAlign: 'left',
            textTransform: 'none',
            color: 'inherit',
            '&:hover': canInteract ? {
              backgroundColor: brandColors.muted + '30',
            } : {},
            '&.Mui-disabled': {
              cursor: 'not-allowed',
              opacity: 0.6,
            },
          }}
        >
          {/* Step Number/Status Icon */}
          <Box
            sx={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              backgroundColor: isCompleted
                ? brandColors.primary
                : isActive
                ? brandColors.primary + '10'
                : brandColors.muted,
              color: isCompleted
                ? brandColors.primaryForeground
                : isActive
                ? brandColors.primary
                : brandColors.mutedForeground,
              border: isActive ? `2px solid ${brandColors.primary}` : 'none',
              transition: 'all 0.2s',
            }}
          >
            {isCompleted ? (
              <CheckIcon sx={{ fontSize: '20px' }} />
            ) : isPending ? (
              <LockIcon sx={{ fontSize: '20px' }} />
            ) : (
              icon || <Typography variant="body2">{step.number}</Typography>
            )}
          </Box>

          {/* Step Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h5"
              sx={{ 
                mb: 0.5,
                color: brandColors.foreground,
              }}
            >
              {step.title}
            </Typography>
            <Typography 
              variant="caption"
              sx={{ color: brandColors.mutedForeground }}
            >
              {step.subtitle}
            </Typography>
          </Box>

          {/* Expand/Collapse Icon */}
          {canInteract && (
            <Box sx={{ color: brandColors.mutedForeground }}>
              {isExpanded ? (
                <ExpandLessIcon sx={{ fontSize: '20px' }} />
              ) : (
                <ExpandMoreIcon sx={{ fontSize: '20px' }} />
              )}
            </Box>
          )}
        </Button>

        {/* Step Content */}
        {isExpanded && canInteract && (
          <Box 
            sx={{ 
              px: 2,
              pb: 2,
              borderTop: `1px solid ${brandColors.border}`,
            }}
          >
            <Box sx={{ pt: 2 }}>
              {children}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
