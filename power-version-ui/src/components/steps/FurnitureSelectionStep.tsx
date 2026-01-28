import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { detectFurniture, replaceFurniture, furnishEmptyRoom } from '@/services/api';

interface FurnitureSelectionStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FurnitureSelectionStep({ onNext, onBack }: FurnitureSelectionStepProps) {
  const { state, dispatch } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isReplaceMode = state.roomSetup.mode === 'replace';

  useEffect(() => {
    if (isReplaceMode) {
      handleDetectFurniture();
    } else {
      handleFurnishRoom();
    }
  }, []);

  const handleDetectFurniture = async () => {
    if (!state.roomSetup.imagePreview) return;

    setLoading(true);
    setError(null);

    try {
      const result = await detectFurniture(state.roomSetup.imagePreview);
      dispatch({
        type: 'SET_DETECTED_FURNITURE',
        payload: result.detectedFurniture,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 检测失败');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRender = async () => {
    if (!state.roomSetup.imagePreview || !state.roomSetup.roomType) return;

    setLoading(true);
    setError(null);

    try {
      let result;

      if (isReplaceMode) {
        result = await replaceFurniture({
          imageUrl: state.roomSetup.imagePreview,
          categories: state.furnitureSelection.categories,
          budget: state.furnitureSelection.budget,
          collections: state.furnitureSelection.collections,
          roomType: state.roomSetup.roomType,
          dimensions: state.roomSetup.dimensions,
        });
      } else {
        result = await furnishEmptyRoom({
          imageUrl: state.roomSetup.imagePreview,
          style: state.stylePreferences.style,
          collections: state.stylePreferences.collections,
          roomType: state.roomSetup.roomType,
          dimensions: state.roomSetup.dimensions,
        });
      }

      dispatch({
        type: 'SET_RENDERING_RESULT',
        payload: {
          imageUrl: result.renderedImageUrl,
          products: result.products,
        },
      });

      onNext();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 渲染失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            {isReplaceMode ? 'AI 家具检测' : 'AI 自动布置'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isReplaceMode
              ? 'AI 正在分析您的房间并检测现有家具'
              : 'AI 正在为您的空房间设计完整的家具方案'}
          </Typography>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 3 }}>
                {isReplaceMode ? 'AI 正在检测家具...' : 'AI 正在生成设计方案...'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                这可能需要几秒钟
              </Typography>
            </Box>
          ) : error ? (
            <Box>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={onBack}>
                  返回
                </Button>
                <Button
                  variant="contained"
                  onClick={isReplaceMode ? handleDetectFurniture : handleFurnishRoom}
                >
                  重试
                </Button>
              </Box>
            </Box>
          ) : (
            <Box>
              {/* Detected Furniture Display */}
              {isReplaceMode && state.detectedFurniture.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    检测到的家具 ({state.detectedFurniture.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {state.detectedFurniture.map((furniture) => (
                      <Grid item xs={12} sm={6} md={4} key={furniture.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body1">{furniture.category}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              置信度: {(furniture.confidence * 100).toFixed(0)}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* Generate Button */}
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" gutterBottom>
                  准备生成 AI 渲染
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {isReplaceMode
                    ? '点击下方按钮，AI 将为您替换选定的家具'
                    : '点击下方按钮，AI 将为您的空房间生成完整的家具布置方案'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button variant="outlined" onClick={onBack} size="large">
                    返回
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleGenerateRender}
                    size="large"
                    disabled={loading}
                  >
                    生成 AI 渲染
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
