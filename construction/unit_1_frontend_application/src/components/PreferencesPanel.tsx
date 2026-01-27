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
import { useGetCategoriesQuery, useGetCollectionsQuery } from '../services/aiApi';

interface PreferencesPanelProps {
  onPreferencesChange: (prefs: UserPreferences) => void;
}

export default function PreferencesPanel({ onPreferencesChange }: PreferencesPanelProps) {
  const [budget, setBudget] = useState<string>('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);

  const { data: categoriesData } = useGetCategoriesQuery();
  const { data: collectionsData } = useGetCollectionsQuery();

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCollectionToggle = (collectionId: string) => {
    setSelectedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    );
  };

  const handleSubmit = () => {
    const preferences: UserPreferences = {
      budget: budget
        ? { amount: parseFloat(budget), currency: 'USD' }
        : null,
      selectedCategories,
      selectedCollections,
      preferredProducts: [],
    };
    onPreferencesChange(preferences);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Your Preferences
      </Typography>

      <TextField
        fullWidth
        label="Budget (USD)"
        type="number"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Typography variant="subtitle1" gutterBottom>
        Categories
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {categoriesData?.categories.map((category) => (
          <Chip
            key={category.id}
            label={category.name}
            onClick={() => handleCategoryToggle(category.id)}
            color={selectedCategories.includes(category.id) ? 'primary' : 'default'}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>

      <Typography variant="subtitle1" gutterBottom>
        Collections
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3 }}>
        {collectionsData?.collections.map((collection) => (
          <Chip
            key={collection.id}
            label={collection.name}
            onClick={() => handleCollectionToggle(collection.id)}
            color={selectedCollections.includes(collection.id) ? 'primary' : 'default'}
            sx={{ mb: 1 }}
          />
        ))}
      </Stack>

      <Button variant="contained" fullWidth onClick={handleSubmit}>
        Get Recommendations
      </Button>
    </Paper>
  );
}
