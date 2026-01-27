import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  CircularProgress,
} from '@mui/material';
import { RoomConfig, UserPreferences } from '../types';
import { apiService } from '../services/api';

interface PreferencesPanelProps {
  roomConfig: RoomConfig;
  onComplete: (preferences: UserPreferences) => void;
  onBack: () => void;
  loading: boolean;
}

const PreferencesPanel = ({ roomConfig, onComplete, onBack, loading }: PreferencesPanelProps) => {
  const [budget, setBudget] = useState<string>('5000');
  const [currency] = useState<string>('SGD');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['sofa']);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiService.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const preferences: UserPreferences = {
      budget: budget ? {
        amount: parseFloat(budget),
        currency,
      } : undefined,
      selectedCategories: selectedCategories.length > 0 ? selectedCategories : undefined,
    };

    onComplete(preferences);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        步骤 2: 设置偏好 / Step 2: Set Preferences
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        房间: {roomConfig.roomType} ({roomConfig.dimensions.length} × {roomConfig.dimensions.width} × {roomConfig.dimensions.height} {roomConfig.dimensions.unit})
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="预算 / Budget (SGD)"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          inputProps={{ min: 0, step: 100 }}
          sx={{ mb: 3 }}
          helperText="留空表示无预算限制 / Leave empty for no budget limit"
        />

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>家具类别 / Furniture Categories</InputLabel>
          <Select
            multiple
            value={selectedCategories}
            onChange={(e) => setSelectedCategories(e.target.value as string[])}
            input={<OutlinedInput label="家具类别 / Furniture Categories" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => {
                  const category = categories.find((c) => c.id === value);
                  return <Chip key={value} label={category?.name || value} />;
                })}
              </Box>
            )}
          >
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name} ({category.productCount} 件)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={loading}
            fullWidth
          >
            返回 / Back
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                生成推荐中... / Generating...
              </>
            ) : (
              '获取推荐 / Get Recommendations'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default PreferencesPanel;
