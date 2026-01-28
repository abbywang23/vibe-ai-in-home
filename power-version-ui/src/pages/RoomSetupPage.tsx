import { useState } from 'react';
import {
  Box,
  Container,
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
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { uploadImage } from '@/services/api';
import { RoomType, DesignMode } from '@/types';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddHomeIcon from '@mui/icons-material/AddHome';

export default function RoomSetupPage() {
  const navigate = useNavigate();
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
      // Create preview
      const preview = URL.createObjectURL(file);
      
      // Upload to server
      const result = await uploadImage(file);

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

    // Navigate based on mode
    if (state.roomSetup.mode === 'replace') {
      navigate('/design/replace');
    } else {
      navigate('/design/empty');
    }
  };

  const isFormValid = 
    state.roomSetup.image && 
    state.roomSetup.roomType && 
    state.roomSetup.mode &&
    state.roomSetup.dimensions.width > 0 &&
    state.roomSetup.dimensions.height > 0 &&
    state.roomSetup.dimensions.length > 0;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        房间信息设置
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Image Upload */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom>
                1. 上传房间照片
              </Typography>
              <Box
                sx={{
                  border: 2,
                  borderColor: 'divider',
                  borderStyle: 'dashed',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                component="label"
              >
                {state.roomSetup.imagePreview ? (
                  <Box>
                    <img
                      src={state.roomSetup.imagePreview}
                      alt="Room preview"
                      style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      点击更换图片
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      {uploading ? '上传中...' : '点击上传房间照片'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      支持 JPG, PNG 格式
                    </Typography>
                  </Box>
                )}
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
                2. 房间尺寸 (米)
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
                3. 选择设计模式
              </Typography>
              <ToggleButtonGroup
                value={state.roomSetup.mode}
                exclusive
                onChange={handleModeChange}
                fullWidth
                sx={{ mt: 2 }}
              >
                <ToggleButton value="replace" sx={{ py: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SwapHorizIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1">替换现有家具</Typography>
                    <Typography variant="caption" color="text.secondary">
                      保留房间布局,替换指定家具
                    </Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="empty" sx={{ py: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <AddHomeIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1">空房间布置</Typography>
                    <Typography variant="caption" color="text.secondary">
                      AI 自动设计完整家具方案
                    </Typography>
                  </Box>
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                  返回
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isFormValid}
                >
                  下一步
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
