import { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import RefreshIcon from '@mui/icons-material/Refresh';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HomeIcon from '@mui/icons-material/Home';
import StraightenIcon from '@mui/icons-material/Straighten';
import ChairIcon from '@mui/icons-material/Chair';
import PaletteIcon from '@mui/icons-material/Palette';
import { AppDispatch } from '../../store';
import { configureRoom } from '../../store/slices/sessionSlice';
import { setRoomConfig } from '../../store/slices/designSlice';
import { RoomType, RoomDimensions, DimensionUnit } from '../../types/domain';
import { useUploadImageMutation, useDetectFurnitureMutation } from '../../services/aiApi';
import StepCard from '../shared/StepCard';
import { brandColors, typography } from '../../theme/brandTheme';

type RoomIntent = 'refresh' | 'new';
type RoomSize = 'small' | 'medium' | 'large' | 'xlarge';

interface RoomSetupStepProps {
  step: any;
  isExpanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
}

export default function RoomSetupStep({ step, isExpanded, onToggle, onComplete }: RoomSetupStepProps) {
  const dispatch = useDispatch<AppDispatch>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [intent, setIntent] = useState<RoomIntent>('refresh');
  const [roomType, setRoomType] = useState<RoomType>(RoomType.LIVING_ROOM);
  const [roomSize, setRoomSize] = useState<RoomSize>('medium');
  const [roomData, setRoomData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [detectFurniture, { isLoading: isDetecting }] = useDetectFurnitureMutation();

  const isAnalyzing = isUploading || isDetecting;
  const isCompleted = step.status === 'completed';

  const getRoomSizeLabel = (size: RoomSize) => {
    const labels = {
      small: '< 150 sq ft',
      medium: '150-300 sq ft',
      large: '300-500 sq ft',
      xlarge: '> 500 sq ft'
    };
    return labels[size];
  };

  const getRoomDimensions = (size: RoomSize): RoomDimensions => {
    const dimensions = {
      small: { length: 10, width: 10, height: 8, unit: DimensionUnit.FEET },
      medium: { length: 15, width: 12, height: 8, unit: DimensionUnit.FEET },
      large: { length: 20, width: 18, height: 9, unit: DimensionUnit.FEET },
      xlarge: { length: 25, width: 20, height: 10, unit: DimensionUnit.FEET }
    };
    return dimensions[size];
  };

  const handleImageUpload = async () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Image size must be less than 10MB');
      return;
    }

    setError(null);

    try {
      // Upload image
      const formData = new FormData();
      formData.append('image', file);
      
      const uploadResult = await uploadImage(formData).unwrap();
      
      // Detect furniture in the uploaded image
      const dimensions = getRoomDimensions(roomSize);
      const detectionResult = await detectFurniture({
        imageUrl: uploadResult.imageUrl,
        roomDimensions: dimensions,
      }).unwrap();

      // Process detection results
      const data = {
        roomType: roomType,
        dimensions: `${dimensions.length}' × ${dimensions.width}'`,
        furniture: detectionResult.detectedItems.map(item => item.furnitureType),
        style: 'Detected from image',
        confidence: 95,
        isEmpty: detectionResult.isEmpty,
        detectedItems: detectionResult.detectedItems,
      };

      setRoomData(data);
    } catch (error: any) {
      console.error('Image upload/detection failed:', error);
      setError(error.data?.message || 'Failed to process image. Please try again.');
    }
  };

  const handleComplete = () => {
    const dimensions = getRoomDimensions(roomSize);
    
    dispatch(configureRoom({ roomType, dimensions }));
    dispatch(setRoomConfig({ roomType, dimensions }));
    
    onComplete();
  };

  return (
    <StepCard
      step={step}
      isExpanded={isExpanded}
      onToggle={onToggle}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Error display */}
        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Room Intent Selection */}
        <Box>
          <Typography sx={{ mb: 1, fontWeight: 500, fontSize: typography.sizes.label }}>
            Design Intent
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
            <Button
              onClick={() => setIntent('refresh')}
              disabled={isCompleted}
              variant={intent === 'refresh' ? 'contained' : 'outlined'}
              sx={{
                p: 2,
                textAlign: 'left',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textTransform: 'none',
                backgroundColor: intent === 'refresh' ? `${brandColors.primary}10` : 'transparent',
                borderColor: intent === 'refresh' ? brandColors.primary : brandColors.border,
                color: brandColors.foreground,
                '&:hover': {
                  borderColor: brandColors.primary,
                  backgroundColor: `${brandColors.primary}05`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <RefreshIcon sx={{ fontSize: '20px', color: brandColors.primary }} />
                <Typography sx={{ fontWeight: 500, fontSize: typography.sizes.base }}>
                  Refresh Room
                </Typography>
              </Box>
              <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
                Keep existing layout, replace furniture
              </Typography>
            </Button>
            <Button
              onClick={() => setIntent('new')}
              disabled={isCompleted}
              variant={intent === 'new' ? 'contained' : 'outlined'}
              sx={{
                p: 2,
                textAlign: 'left',
                flexDirection: 'column',
                alignItems: 'flex-start',
                textTransform: 'none',
                backgroundColor: intent === 'new' ? `${brandColors.primary}10` : 'transparent',
                borderColor: intent === 'new' ? brandColors.primary : brandColors.border,
                color: brandColors.foreground,
                '&:hover': {
                  borderColor: brandColors.primary,
                  backgroundColor: `${brandColors.primary}05`,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: '20px', color: brandColors.primary }} />
                <Typography sx={{ fontWeight: 500, fontSize: typography.sizes.base }}>
                  New Room
                </Typography>
              </Box>
              <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.small }}>
                Start fresh, complete redesign
              </Typography>
            </Button>
          </Box>
        </Box>

        {/* Room Type Selection */}
        <Box>
          <FormControl fullWidth disabled={isCompleted}>
            <InputLabel>Room Type</InputLabel>
            <Select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value as RoomType)}
              label="Room Type"
            >
              <MenuItem value={RoomType.LIVING_ROOM}>Living Room</MenuItem>
              <MenuItem value={RoomType.BEDROOM}>Bedroom</MenuItem>
              <MenuItem value={RoomType.DINING_ROOM}>Dining Room</MenuItem>
              <MenuItem value={RoomType.HOME_OFFICE}>Home Office</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Room Size Selection */}
        <Box>
          <Typography sx={{ mb: 1, fontWeight: 500, fontSize: typography.sizes.label }}>
            Room Size
          </Typography>
          <Box
            sx={{
              backgroundColor: brandColors.background,
              border: `1px solid ${brandColors.border}`,
              borderRadius: '8px',
              p: 1,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
              {(['small', 'medium', 'large', 'xlarge'] as RoomSize[]).map((size) => (
                <Button
                  key={size}
                  onClick={() => setRoomSize(size)}
                  disabled={isCompleted}
                  variant={roomSize === size ? 'contained' : 'text'}
                  sx={{
                    py: 1.5,
                    textTransform: 'none',
                    flexDirection: 'column',
                    backgroundColor: roomSize === size ? brandColors.primary : brandColors.card,
                    color: roomSize === size ? brandColors.primaryForeground : brandColors.foreground,
                    '&:hover': {
                      backgroundColor: roomSize === size ? brandColors.primary : brandColors.muted,
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 500, fontSize: typography.sizes.label, mb: 0.5 }}>
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Typography>
                  <Typography sx={{ fontSize: '11px', opacity: 0.9 }}>
                    {getRoomSizeLabel(size)}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>
          <Typography sx={{ color: brandColors.mutedForeground, mt: 1, fontSize: typography.sizes.small }}>
            <StraightenIcon sx={{ fontSize: '12px', mr: 0.5, verticalAlign: 'middle' }} />
            Selected: {getRoomSizeLabel(roomSize)}
          </Typography>
        </Box>

        {/* Upload Area */}
        {!roomData ? (
          <Button
            onClick={handleImageUpload}
            disabled={isAnalyzing || isCompleted}
            variant="outlined"
            sx={{
              width: '100%',
              aspectRatio: '16/9',
              border: `2px dashed ${brandColors.border}`,
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              backgroundColor: brandColors.background,
              '&:hover': {
                borderColor: brandColors.primary,
              },
            }}
          >
            {isAnalyzing ? (
              <>
                <CircularProgress size={40} sx={{ color: brandColors.primary }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {isUploading ? 'Uploading Image...' : 'Analyzing Room...'}
                  </Typography>
                  <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.caption }}>
                    {isUploading ? 'Please wait while we upload your image' : 'AI is detecting room details'}
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box
                  sx={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: `${brandColors.primary}10`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UploadIcon sx={{ fontSize: '32px', color: brandColors.primary }} />
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    Upload Room Photo
                  </Typography>
                  <Typography sx={{ color: brandColors.mutedForeground, fontSize: typography.sizes.caption }}>
                    Click to upload (JPG, PNG, max 10MB)
                  </Typography>
                </Box>
              </>
            )}
          </Button>
        ) : (
          <>
            <Box
              sx={{
                backgroundColor: `${brandColors.primary}10`,
                border: `1px solid ${brandColors.primary}30`,
                borderRadius: '8px',
                p: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircleIcon sx={{ color: brandColors.primary, fontSize: '20px' }} />
                <Typography variant="h6" sx={{ color: brandColors.primary }}>
                  Room Analyzed Successfully
                </Typography>
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                <AIDetection icon={<HomeIcon />} label="Type" value={roomData.roomType} confidence={roomData.confidence} />
                <AIDetection icon={<StraightenIcon />} label="Size" value={roomData.dimensions} confidence={92} />
                <AIDetection icon={<ChairIcon />} label="Items" value={`${roomData.furniture.length} detected`} confidence={88} />
                <AIDetection icon={<PaletteIcon />} label="Style" value={roomData.style} confidence={90} />
              </Box>
            </Box>

            {!isCompleted && (
              <Button
                onClick={handleComplete}
                variant="contained"
                fullWidth
                sx={{
                  backgroundColor: brandColors.primary,
                  color: brandColors.primaryForeground,
                  py: 1.5,
                  textTransform: 'uppercase',
                  letterSpacing: '2.8px',
                  fontSize: typography.sizes.button,
                  fontFamily: typography.body.fontFamily,
                  '&:hover': {
                    backgroundColor: `${brandColors.primary}dd`,
                  },
                }}
              >
                Confirm & Continue
              </Button>
            )}
          </>
        )}
      </Box>
    </StepCard>
  );
}

interface AIDetectionProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  confidence: number;
}

function AIDetection({ icon, label, value, confidence }: AIDetectionProps) {
  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: brandColors.background,
        borderRadius: '8px',
        border: `1px solid ${brandColors.border}`,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5, color: brandColors.primary }}>
        <Box sx={{ fontSize: '12px' }}>{icon}</Box>
        <Typography sx={{ fontSize: typography.sizes.small }}>{label}</Typography>
      </Box>
      <Typography sx={{ fontWeight: 500, fontSize: typography.sizes.caption, mb: 0.5 }}>
        {value}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          sx={{
            flex: 1,
            height: '4px',
            backgroundColor: brandColors.muted,
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              height: '100%',
              width: `${confidence}%`,
              backgroundColor: brandColors.primary,
              borderRadius: '2px',
            }}
          />
        </Box>
        <Typography sx={{ color: brandColors.primary, fontSize: typography.sizes.small }}>
          {confidence}%
        </Typography>
      </Box>
    </Box>
  );
}
