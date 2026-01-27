import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { UserPreferences, RoomType } from '../types/domain';
import { brandColors, spacing } from '../theme/brandTheme';
import FurnitureCategorySelector from './FurnitureCategorySelector';
import CollectionSelector from './CollectionSelector';

interface PreferenceSelectionStepProps {
  roomType: RoomType;
  onPreferencesConfirm: (preferences: UserPreferences) => void;
  onBack: () => void;
}

const steps = ['Room Setup', 'Preferences', 'Furniture Selection'];

export default function PreferenceSelectionStep({
  roomType,
  onPreferencesConfirm,
  onBack,
}: PreferenceSelectionStepProps) {
  const [budget, setBudget] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const handleConfirm = () => {
    const preferences: UserPreferences = {
      budget: budget
        ? { amount: parseFloat(budget), currency: 'SGD' }
        : null,
      selectedCategories,
      selectedCollections,
      preferredProducts: [],
    };
    onPreferencesConfirm(preferences);
  };

  const isValid = selectedCategories.length > 0;

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
          Set Your Preferences
        </Typography>

        <Typography 
          variant="body1" 
          sx={{ 
            color: brandColors.darkGray,
            mb: spacing.lg / 8,
          }}
        >
          Tell us about your preferences so we can recommend the perfect furniture for your {roomType.replace('_', ' ')}.
        </Typography>

        {/* Budget Section */}
        <Box sx={{ mb: spacing.lg / 8 }}>
          <Typography 
            variant="subtitle1" 
            gutterBottom
            sx={{ 
              color: brandColors.darkGray,
              fontWeight: 500,
              mb: spacing.sm / 8,
            }}
          >
            Budget (Optional)
          </Typography>
          <TextField
            fullWidth
            label="Maximum budget in SGD"
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 5000"
            sx={{ 
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: brandColors.terracotta,
                },
                '&.Mui-focused fieldset': {
                  borderColor: brandColors.terracotta,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: brandColors.terracotta,
              },
            }}
          />
        </Box>

        <Divider sx={{ my: spacing.lg / 8 }} />

        {/* Furniture Categories Section */}
        <Box sx={{ mb: spacing.lg / 8 }}>
          <FurnitureCategorySelector
            roomType={roomType}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />
        </Box>

        <Divider sx={{ my: spacing.lg / 8 }} />

        {/* Collections Section */}
        <Box sx={{ mb: spacing.xl / 8 }}>
          <CollectionSelector
            selectedCollections={selectedCollections}
            onCollectionsChange={setSelectedCollections}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
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
            Confirm Preferences
          </Button>
        </Box>

        {!isValid && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: brandColors.terracotta,
              mt: spacing.sm / 8,
              textAlign: 'center',
              fontStyle: 'italic',
            }}
          >
            Please select at least one furniture type to continue
          </Typography>
        )}
      </Paper>
    </Box>
  );
}