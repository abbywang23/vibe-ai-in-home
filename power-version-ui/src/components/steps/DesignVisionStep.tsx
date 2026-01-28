import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  TextField,
  InputAdornment,
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { getCollections } from '@/services/api';
import { FurnitureCategory } from '@/types';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

interface DesignVisionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function DesignVisionStep({ onNext, onBack }: DesignVisionStepProps) {
  const { state, dispatch } = useAppContext();
  const [collections, setCollections] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReplaceMode = state.roomSetup.mode === 'replace';

  const furnitureCategories: { value: FurnitureCategory; label: string }[] = [
    { value: 'sofa', label: '沙发' },
    { value: 'chair', label: '椅子' },
    { value: 'table', label: '桌子' },
    { value: 'bed', label: '床' },
    { value: 'cabinet', label: '柜子' },
    { value: 'shelf', label: '架子' },
    { value: 'desk', label: '书桌' },
    { value: 'lighting', label: '灯具' },
  ];

  const styles = [
    { value: 'modern', label: '现代简约' },
    { value: 'scandinavian', label: '北欧风格' },
    { value: 'industrial', label: '工业风' },
    { value: 'minimalist', label: '极简主义' },
    { value: 'traditional', label: '传统经典' },
    { value: 'contemporary', label: '当代风格' },
  ];

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
      // Use fallback collections
      setCollections(['Modern', 'Classic', 'Luxury', 'Minimalist', 'Rustic']);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryToggle = (category: FurnitureCategory) => {
    const currentCategories = state.furnitureSelection.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter((c) => c !== category)
      : [...currentCategories, category];

    dispatch({
      type: 'SET_FURNITURE_SELECTION',
      payload: { categories: newCategories },
    });
  };

  const handleCollectionToggle = (collection: string) => {
    const currentCollections = isReplaceMode
      ? state.furnitureSelection.collections
      : state.stylePreferences.collections;

    const newCollections = currentCollections.includes(collection)
      ? currentCollections.filter((c) => c !== collection)
      : [...currentCollections, collection];

    if (isReplaceMode) {
      dispatch({
        type: 'SET_FURNITURE_SELECTION',
        payload: { collections: newCollections },
      });
    } else {
      dispatch({
        type: 'SET_STYLE_PREFERENCES',
        payload: { collections: newCollections },
      });
    }
  };

  const handleNext = () => {
    if (isReplaceMode) {
      if (state.furnitureSelection.categories.length === 0) {
        setError('请至少选择一个家具类别');
        return;
      }
      if (state.furnitureSelection.budget <= 0) {
        setError('请输入有效的预算');
        return;
      }
    } else {
      if (!state.stylePreferences.style) {
        setError('请选择设计风格');
        return;
      }
    }

    onNext();
  };

  const isFormValid = isReplaceMode
    ? state.furnitureSelection.categories.length > 0 && state.furnitureSelection.budget > 0
    : state.stylePreferences.style !== '';

  return (
    <Box>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {isReplaceMode ? '定义替换需求' : '定义设计风格'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isReplaceMode
              ? '选择要替换的家具类别和预算'
              : '选择您喜欢的设计风格和收藏系列'}
          </Typography>

          <Grid container spacing={4}>
            {/* Replace Mode: Furniture Categories */}
            {isReplaceMode && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  选择要替换的家具类别
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  可以选择多个类别
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {furnitureCategories.map((category) => (
                    <Chip
                      key={category.value}
                      label={category.label}
                      onClick={() => handleCategoryToggle(category.value)}
                      icon={
                        state.furnitureSelection.categories.includes(category.value) ? (
                          <CheckBoxIcon />
                        ) : (
                          <CheckBoxOutlineBlankIcon />
                        )
                      }
                      color={
                        state.furnitureSelection.categories.includes(category.value)
                          ? 'primary'
                          : 'default'
                      }
                      variant={
                        state.furnitureSelection.categories.includes(category.value)
                          ? 'filled'
                          : 'outlined'
                      }
                      sx={{ fontSize: '16px', py: 2.5, px: 2 }}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Replace Mode: Budget */}
            {isReplaceMode && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  设置预算
                </Typography>
                <TextField
                  fullWidth
                  label="总预算"
                  type="number"
                  value={state.furnitureSelection.budget || ''}
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_FURNITURE_SELECTION',
                      payload: { budget: parseFloat(e.target.value) || 0 },
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoneyIcon />
                      </InputAdornment>
                    ),
                  }}
                  helperText="AI 将根据您的预算推荐合适的家具"
                />
              </Grid>
            )}

            {/* Empty Mode: Style Selection */}
            {!isReplaceMode && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  选择设计风格
                </Typography>
                <FormControl fullWidth>
                  <InputLabel>风格</InputLabel>
                  <Select
                    value={state.stylePreferences.style}
                    label="风格"
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_STYLE_PREFERENCES',
                        payload: { style: e.target.value },
                      })
                    }
                  >
                    {styles.map((style) => (
                      <MenuItem key={style.value} value={style.value}>
                        {style.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Collections */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                选择收藏系列 (可选)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                选择您喜欢的家具系列
              </Typography>
              {loading ? (
                <Typography variant="body2" color="text.secondary">
                  加载中...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {collections.map((collection) => {
                    const isSelected = isReplaceMode
                      ? state.furnitureSelection.collections.includes(collection)
                      : state.stylePreferences.collections.includes(collection);

                    return (
                      <Chip
                        key={collection}
                        label={collection}
                        onClick={() => handleCollectionToggle(collection)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        sx={{ fontSize: '14px', py: 2 }}
                      />
                    );
                  })}
                </Box>
              )}
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={onBack} size="large">
                  返回
                </Button>
                <Button variant="contained" onClick={handleNext} disabled={!isFormValid} size="large">
                  继续
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
