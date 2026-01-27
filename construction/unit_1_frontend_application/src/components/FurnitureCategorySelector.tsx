import {
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useGetCategoriesByRoomTypeQuery } from '../services/aiApi';
import { brandColors, spacing } from '../theme/brandTheme';
import { RoomType } from '../types/domain';

interface FurnitureCategorySelectorProps {
  roomType: RoomType;
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export default function FurnitureCategorySelector({
  roomType,
  selectedCategories,
  onCategoriesChange,
}: FurnitureCategorySelectorProps) {
  const { data, isLoading, error } = useGetCategoriesByRoomTypeQuery(roomType);

  const handleCategoryToggle = (categoryId: string) => {
    const newSelection = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onCategoriesChange(newSelection);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={2}>
        <CircularProgress size={24} sx={{ color: brandColors.terracotta }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography 
        variant="body2" 
        color="error"
        sx={{ p: 2, textAlign: 'center' }}
      >
        Failed to load furniture categories
      </Typography>
    );
  }

  const categories = data?.categories || [];

  return (
    <Box>
      <Typography 
        variant="subtitle1" 
        gutterBottom
        sx={{ 
          color: brandColors.darkGray,
          fontWeight: 500,
          mb: spacing.sm / 8,
        }}
      >
        Select Furniture Types for {roomType.replace('_', ' ')}
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: brandColors.darkGray,
          mb: spacing.md / 8,
        }}
      >
        Choose which types of furniture you'd like to replace or add (multiple selection allowed)
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {categories.map((category) => (
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

      {selectedCategories.length > 0 && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.terracotta,
            mt: spacing.sm / 8,
            fontWeight: 500,
          }}
        >
          {selectedCategories.length} furniture type{selectedCategories.length > 1 ? 's' : ''} selected
        </Typography>
      )}
    </Box>
  );
}