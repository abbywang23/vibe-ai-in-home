import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from '@mui/material';
import { useAppContext } from '@/context/AppContext';
import { uploadImage } from '@/services/api';
import { RoomType, DesignMode } from '@/types';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddHomeIcon from '@mui/icons-material/AddHome';

interface RoomSetupStepProps {
  onNext: () => void;
}

export default function RoomSetupStep({ onNext }: RoomSetupStepProps) {
  const { state, dispatch } = useAppContext();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roomTypes: { value: RoomType; label: string }[] = [
    { value: 'living_room', label: '客厅' },
    { value: 'bedroom', label: '卧室' },
    { value: 'dining_room', label: '餐厅' },
    { value: 'office', label: '办公室' },
    { value: 'kitchen', label: '厨房' },
  ];

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const preview = URL.createObjectURL(file);
      await uploadImage(file);

      dispatch({
        type: 'SET_ROOM_SETUP',
        payload: {
          image: file,
          imagePreview: preview,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleModeChange = (_: React.MouseEvent<HTMLElement>, newMode: DesignMode | null) => {
    if (newMode) {
      dispatch({
        type: 'SET_ROOM_SETUP',
        payload: { mode: newMode },
      });
    }
  };

  const handleNext = () => {
    if (!state.roomSetup.image || !state.roomSetup.roomType || !state.roomSetup.mode) {
      setError('请完成所有必填项');
      return;
    }

    if (
      state.roomSetup.dimensions.width <= 0 ||
      state.roomSetup.dimensions.height <= 0 ||
      state.roomSetup.dimensions.length <= 0
    ) {
      setError('请输入有效的房间尺寸');
      return;
    }

    onNext();
  };

  const isFormValid =
    state.roomSetup.image &&
    state.roomSetup.roomType &&
    state.roomSetup.mode &&
    state.roomSetup.dimensions.width > 0 &&
    state.roomSetup.dimensions.height > 0 &&
    state.roomSetup.dimensions.length > 0;

  return (
    <Box>
      {/* Visualization Canvas */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          {state.roomSetup.imagePreview ? (
            <Box>
              <img
                src={state.roomSetup.imagePreview}
                alt="Room preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: 400,
                  borderRadius: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                点击下方重新上传
              </Typography>
            </Box>
          ) : (
            <Box>
              <VisibilityIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                AI Visualization Canvas
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload a room photo to begin. AI will analyze your
                <br />
                space and render furniture in real-time.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Room Setup Form */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Image Upload */}
            <Grid item xs={12}>
              <Box
                sx={{
                  border: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                  borderRadius: 2,
                  p: 3,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'primary.main',
                  },
                }}
                component="label"
              >
                <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" gutterBottom>
                  {uploading ? '上传中...' : state.roomSetup.image ? '更换房间照片' : '上传房间照片'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  支持 JPG, PNG 格式，最大 10MB
                </Typography>
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </Box>
            </Grid>

            {/* Room Type */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>房间类型</InputLabel>
                <Select
                  value={state.roomSetup.roomType || ''}
                  label="房间类型"
                  onChange={(e) =>
                    dispatch({
                      type: 'SET_ROOM_SETUP',
                      payload: { roomType: e.target.value as RoomType },
                    })
                  }
                >
                  {roomTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Dimensions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                房间尺寸 (米)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="宽度"
                    type="number"
                    value={state.roomSetup.dimensions.width || ''}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_ROOM_SETUP',
                        payload: {
                          dimensions: {
                            ...state.roomSetup.dimensions,
                            width: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="长度"
                    type="number"
                    value={state.roomSetup.dimensions.length || ''}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_ROOM_SETUP',
                        payload: {
                          dimensions: {
                            ...state.roomSetup.dimensions,
                            length: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="高度"
                    type="number"
                    value={state.roomSetup.dimensions.height || ''}
                    onChange={(e) =>
                      dispatch({
                        type: 'SET_ROOM_SETUP',
                        payload: {
                          dimensions: {
                            ...state.roomSetup.dimensions,
                            height: parseFloat(e.target.value) || 0,
                          },
                        },
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Design Mode */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                选择设计模式
              </Typography>
              <ToggleButtonGroup
                value={state.roomSetup.mode}
                exclusive
                onChange={handleModeChange}
                fullWidth
                sx={{ mt: 2 }}
              >
                <ToggleButton value="replace" sx={{ py: 3, flexDirection: 'column' }}>
                  <SwapHorizIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    替换现有家具
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    保留房间布局，替换指定家具
                  </Typography>
                </ToggleButton>
                <ToggleButton value="empty" sx={{ py: 3, flexDirection: 'column' }}>
                  <AddHomeIcon sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    空房间布置
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    AI 自动设计完整家具方案
                  </Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            {/* Actions */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button variant="contained" onClick={handleNext} disabled={!isFormValid} size="large">
                  继续
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Furniture Selection Placeholder */}
      <Card sx={{ mt: 3, textAlign: 'center', py: 4 }}>
        <CardContent>
          <Box sx={{ color: 'text.disabled' }}>
            <CloudUploadIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Furniture Selection
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete the steps above to see AI-recommended furniture
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
