import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { AppDispatch } from '../../store';
import { updatePreferences } from '../../store/slices/sessionSlice';
import { Money } from '../../types/domain';
import StepCard from '../shared/StepCard';
import { brandColors, typography } from '../../theme/brandTheme';

type DesignIntent = 'refresh' | 'redesign';

interface DesignVisionStepProps {
  step: any;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

export default function DesignVisionStep({ step, isExpanded, onToggle, onComplete }: DesignVisionStepProps) {
  const dispatch = useDispatch<AppDispatch>();
  
  const [intent, setIntent] = useState<DesignIntent>('refresh');
  const [style, setStyle] = useState('Modern Minimalist');
  const [budgetMin, setBudgetMin] = useState(2000);
  const [budgetMax, setBudgetMax] = useState(5000);

  const isCompleted = step.status === 'completed';

  const handleComplete = () => {
    const budget: Money = {
      amount: budgetMax,
      currency: 'USD'
    };
    
    dispatch(updatePreferences({ budget }));
    onComplete();
  };

  return (
    <StepCard
      step={step}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Design Intent */}
        <Box>
          <Typography sx={{ mb: 1, fontWeight: 500, fontSize: typography.sizes.label }}>
            Design Intent
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <Button
              onClick={() => setIntent('refresh')}
              disabled={isCompleted}
              variant={intent === 'refresh' ? 'contained' : 'outlined'}
              sx={{
                p: 1.5,
                textAlign: 'left',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textTransform: 'none',
                backgroundColor: intent === 'refresh' ? `${brandColors.primary}10` : 'transparent',
                borderColor: intent === 'refresh' ? brandColors.primary : brandColors.border,
                color: brandColors.foreground,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <RefreshIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.label }}>Refresh</Typography>
              </Box>
              <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
                Replace items
              </Typography>
            </Button>
            <Button
              onClick={() => setIntent('redesign')}
              disabled={isCompleted}
              variant={intent === 'redesign' ? 'contained' : 'outlined'}
              sx={{
                p: 1.5,
                textAlign: 'left',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textTransform: 'none',
                backgroundColor: intent === 'redesign' ? `${brandColors.primary}10` : 'transparent',
                borderColor: intent === 'redesign' ? brandColors.primary : brandColors.border,
                color: brandColors.foreground,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AutoAwesomeIcon sx={{ fontSize: '16px' }} />
                <Typography sx={{ fontSize: typography.sizes.label }}>Redesign</Typography>
              </Box>
              <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
                Full makeover
              </Typography>
            </Button>
          </Box>
        </Box>

        {/* Style */}
        <Box>
          <Box
            sx={{
              backgroundColor: `${brandColors.accent}10`,
              border: `1px solid ${brandColors.accent}30`,
              borderRadius: '8px',
              p: 1,
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AutoAwesomeIcon sx={{ fontSize: '16px', color: brandColors.accent }} />
            <Typography sx={{ fontSize: typography.sizes.small }}>
              AI recommends: <strong>Modern Minimalist</strong>
            </Typography>
          </Box>
          <FormControl fullWidth disabled={isCompleted}>
            <InputLabel>Style Preference</InputLabel>
            <Select
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              label="Style Preference"
            >
              <MenuItem value="Modern Minimalist">Modern Minimalist</MenuItem>
              <MenuItem value="Contemporary">Contemporary</MenuItem>
              <MenuItem value="Scandinavian">Scandinavian</MenuItem>
              <MenuItem value="Industrial">Industrial</MenuItem>
              <MenuItem value="Mid-Century Modern">Mid-Century Modern</MenuItem>
              <MenuItem value="Traditional">Traditional</MenuItem>
              <MenuItem value="Transitional">Transitional</MenuItem>
              <MenuItem value="Bohemian">Bohemian</MenuItem>
              <MenuItem value="Rustic">Rustic</MenuItem>
              <MenuItem value="Farmhouse">Farmhouse</MenuItem>
              <MenuItem value="Coastal">Coastal</MenuItem>
              <MenuItem value="Eclectic">Eclectic</MenuItem>
              <MenuItem value="Art Deco">Art Deco</MenuItem>
              <MenuItem value="Mediterranean">Mediterranean</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Budget */}
        <Box>
          <Typography sx={{ mb: 1, fontWeight: 500, fontSize: typography.sizes.label }}>
            Budget Range
          </Typography>
          <Box
            sx={{
              backgroundColor: brandColors.background,
              border: `1px solid ${brandColors.border}`,
              borderRadius: '8px',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontSize: typography.sizes.base }}>
                ${budgetMin.toLocaleString()} - ${budgetMax.toLocaleString()}
              </Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
                  Min
                </Typography>
                <Typography sx={{ fontSize: typography.sizes.small }}>
                  ${budgetMin.toLocaleString()}
                </Typography>
              </Box>
              <Slider
                value={budgetMin}
                onChange={(_, value) => setBudgetMin(value as number)}
                min={1000}
                max={10000}
                step={500}
                disabled={isCompleted}
                sx={{
                  color: brandColors.primary,
                  '& .MuiSlider-thumb': {
                    backgroundColor: brandColors.primary,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: brandColors.primary,
                  },
                }}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
                  Max
                </Typography>
                <Typography sx={{ fontSize: typography.sizes.small }}>
                  ${budgetMax.toLocaleString()}
                </Typography>
              </Box>
              <Slider
                value={budgetMax}
                onChange={(_, value) => setBudgetMax(value as number)}
                min={1000}
                max={10000}
                step={500}
                disabled={isCompleted}
                sx={{
                  color: brandColors.primary,
                  '& .MuiSlider-thumb': {
                    backgroundColor: brandColors.primary,
                  },
                  '& .MuiSlider-track': {
                    backgroundColor: brandColors.primary,
                  },
                }}
              />
            </Box>
          </Box>
        </Box>

        {!isCompleted && (
          <Button
            onClick={handleComplete}
            variant="contained"
            fullWidth
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
            }}
          >
            Confirm & Continue
          </Button>
        )}
      </Box>
    </StepCard>
  );
}
