import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid,
  Alert,
  InputAdornment,
  Checkbox,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { FurnitureCategory } from '@/types';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function FurnitureSelectionPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [error, setError] = useState<string | null>(null);

  const furnitureCategories: { value: FurnitureCategory; label: string; description: string }[] = [
    { value: 'sofa', label: '沙发', description: '客厅主要座椅' },
    { value: 'chair', label: '椅子', description: '餐椅、办公椅等' },
    { value: 'table', label: '桌子', description: '餐桌、茶几等' },
    { value: 'bed', label: '床', description: '卧室床具' },
    { value: 'cabinet', label: '柜子', description: '储物柜、衣柜等' },
    { value: 'shelf', label: '架子', description: '书架、展示架等' },
    { value: 'desk', label: '书桌', description: '办公桌、学习桌' },
    { value: 'lighting', label: '灯具', description: '吊灯、台灯等' },
  ];

  const handleCategoryToggle = (category: FurnitureCategory) => {
    const currentCategories = state.furnitureSelection.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    dispatch({
      type: 'SET_FURNITURE_SELECTION',
      payload: { categories: newCategories },
    });
  };

  const handleBudgetChange = (value: string) => {
    const budget = parseFloat(value) || 0;
    dispatch({
      type: 'SET_FURNITURE_SELECTION',
      payload: { budget },
    });
  };

  const handleNext = () => {
    if (state.furnitureSelection.categories.length === 0) {
      setError('请至少选择一个家具类别');
      return;
    }

    if (state.furnitureSelection.budget <= 0) {
      setError('请输入有效的预算金额');
      return;
    }

    navigate('/design/replace/collections');
  };

  const isFormValid =
    state.furnitureSelection.categories.length > 0 &&
    state.furnitureSelection.budget > 0;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        选择要替换的家具
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Step Indicator */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Chip label="步骤 1/3" color="primary" />
                <Typography variant="body2" color="text.secondary">
                  选择家具类别和预算
                </Typography>
              </Box>
            </Grid>

            {/* Room Info Summary */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <CheckCircleIcon color="success" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    房间类型: {state.roomSetup.roomType}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    尺寸: {state.roomSetup.dimensions.width}m × {state.roomSetup.dimensions.length}m × {state.roomSetup.dimensions.height}m
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Furniture Categories */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                1. 选择要替换的家具类别
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                可以选择多个类别
              </Typography>

              <FormGroup>
                <Grid container spacing={2}>
                  {furnitureCategories.map((category) => (
                    <Grid item xs={12} sm={6} key={category.value}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: 2,
                          borderColor: state.furnitureSelection.categories.includes(category.value)
                            ? 'primary.main'
                            : 'divider',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                          },
                        }}
                        onClick={() => handleCategoryToggle(category.value)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Checkbox
                              checked={state.furnitureSelection.categories.includes(category.value)}
                              onChange={() => handleCategoryToggle(category.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Box>
                              <Typography variant="h6">{category.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {category.description}
                              </Typography>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </Grid>

            {/* Selected Categories Summary */}
            {state.furnitureSelection.categories.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" color="text.secondary">
                    已选择:
                  </Typography>
                  {state.furnitureSelection.categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={furnitureCategories.find(c => c.value === cat)?.label}
                      color="primary"
                      size="small"
                      onDelete={() => handleCategoryToggle(cat)}
                    />
                  ))}
                </Box>
              </Grid>
            )}

            {/* Budget */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                2. 设置预算
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                AI 将根据您的预算推荐合适的家具
              </Typography>

              <TextField
                fullWidth
                label="总预算"
                type="number"
                value={state.furnitureSelection.budget || ''}
                onChange={(e) => handleBudgetChange(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoneyIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Typography variant="body2" color="text.secondary">
                        USD
                      </Typography>
                    </InputAdornment>
                  ),
                }}
                helperText="建议预算范围: $500 - $10,000"
              />

              {state.furnitureSelection.budget > 0 && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    平均每件家具预算: ${(state.furnitureSelection.budget / Math.max(state.furnitureSelection.categories.length, 1)).toFixed(2)}
                  </Typography>
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
                <Button variant="outlined" onClick={() => navigate('/design')}>
                  返回
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isFormValid}
                >
                  下一步: 选择收藏系列
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
