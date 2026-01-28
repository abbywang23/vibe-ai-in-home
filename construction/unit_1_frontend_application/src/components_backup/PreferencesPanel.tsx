import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import { UserPreferences } from '../types/domain';
import { useGetCategoriesQuery } from '../services/aiApi';
import { brandColors, spacing } from '../theme/brandTheme';

interface PreferencesPanelProps {
  onPreferencesChange: (prefs: UserPreferences) => void;
}

export default function PreferencesPanel({ onPreferencesChange }: PreferencesPanelProps) {
  const [budget, setBudget] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const { data: categoriesData } = useGetCategoriesQuery();
  // const { data: collectionsData } = useGetCollectionsQuery(); // Removed as backend doesn't support collections

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };


  const handleSubmit = () => {
    const preferences: UserPreferences = {
      budget: budget
        ? { amount: parseFloat(budget), currency: 'SGD' } // Changed to SGD to match backend
        : null,
      selectedCategories,
      selectedCollections: [], // Empty since we don't support collections yet
      preferredProducts: [],
    };
    onPreferencesChange(preferences);
  };

  return (
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
          mb: spacing.md / 8,
        }}
      >
        Your Preferences
      </Typography>

      <TextField
        fullWidth
        label="Budget (SGD)"
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        sx={{ mb: spacing.lg / 8 }}
      />

      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{ 
          color: brandColors.darkGray,
          fontWeight: 500,
          mb: spacing.sm / 8,
        }}
      >
        Categories
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: spacing.lg / 8 }}>
        {categoriesData?.categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            onClick={() => handleCategoryToggle(category.id)}
            sx={{ 
              mb: 1,
              backgroundColor: selectedCategories.includes(category.id) 
                ? brandColors.terracotta 
                : brandColors.cream,
              color: selectedCategories.includes(category.id) 
                ? brandColors.white 
                : brandColors.sienna,
              '&:hover': {
                backgroundColor: selectedCategories.includes(category.id)
                  ? brandColors.sienna
                  : brandColors.mediumGray,
              },
            }}
          />
        ))}
      </Stack>

      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{ 
          color: brandColors.darkGray,
          fontWeight: 500,
          mb: spacing.sm / 8,
        }}
      >
        Collections
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: spacing.lg / 8 }}>
        <Typography 
          variant="body2" 
          sx={{ color: brandColors.darkGray }}
        >
          Collections feature coming soon...
        </Typography>
      </Stack>

      <Button 
        variant="contained" 
        fullWidth 
        onClick={handleSubmit}
        sx={{
          backgroundColor: brandColors.terracotta,
          color: brandColors.white,
          py: spacing.sm / 8,
          fontSize: '1rem',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: brandColors.sienna,
          },
        }}
      >
        Get Recommendations
      </Button>
    </Paper>
  );
}
