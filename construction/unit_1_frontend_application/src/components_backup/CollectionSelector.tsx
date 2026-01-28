import {
  Box,
  Typography,
  Chip,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useGetCollectionsQuery } from '../services/aiApi';
import { brandColors, spacing } from '../theme/brandTheme';

interface CollectionSelectorProps {
  selectedCollections: string[];
  onCollectionsChange: (collections: string[]) => void;
}

export default function CollectionSelector({
  selectedCollections,
  onCollectionsChange,
}: CollectionSelectorProps) {
  const { data, isLoading, error } = useGetCollectionsQuery();

  const handleCollectionToggle = (collectionId: string) => {
    const newSelection = selectedCollections.includes(collectionId)
      ? selectedCollections.filter((id) => id !== collectionId)
      : [...selectedCollections, collectionId];
    onCollectionsChange(newSelection);
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
        Failed to load collections
      </Typography>
    );
  }

  const collections = data?.collections || [];

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
        Choose Style Collections (Optional)
      </Typography>
      
      <Typography 
        variant="body2" 
        sx={{ 
          color: brandColors.darkGray,
          mb: spacing.md / 8,
        }}
      >
        Select furniture collections that match your style preferences
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap">
        {collections.map((collection) => (
          <Chip
            key={collection.id}
            label={collection.name}
            onClick={() => handleCollectionToggle(collection.id)}
            sx={{ 
              mb: 1,
              backgroundColor: selectedCollections.includes(collection.id) 
                ? brandColors.terracotta 
                : brandColors.cream,
              color: selectedCollections.includes(collection.id) 
                ? brandColors.white 
                : brandColors.sienna,
              '&:hover': {
                backgroundColor: selectedCollections.includes(collection.id)
                  ? brandColors.sienna
                  : brandColors.mediumGray,
              },
            }}
          />
        ))}
      </Stack>

      {selectedCollections.length > 0 && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.terracotta,
            mt: spacing.sm / 8,
            fontWeight: 500,
          }}
        >
          {selectedCollections.length} collection{selectedCollections.length > 1 ? 's' : ''} selected
        </Typography>
      )}
    </Box>
  );
}