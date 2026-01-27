import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { RoomType, DimensionUnit, RoomDimensions } from '../types/domain';
import RoomConfigurationService from '../services/RoomConfigurationService';
import RoomImageUpload from './RoomImageUpload';
import { brandColors, spacing } from '../theme/brandTheme';

export enum SetupMode {
  REPLACE_FURNITURE = 'replace',
  EMPTY_ROOM = 'empty',
}

interface RoomInformationSetupProps {
  onSetupComplete: (config: {
    roomType: RoomType;
    dimensions: RoomDimensions;
    imageFile?: File;
    imagePreviewUrl?: string;
  }) => void;
  onImageUpload?: (file: File, previewUrl: string) => void;
  isUploadingImage?: boolean;
}

const steps = ['Upload Image', 'Room Type & Dimensions'];

export default function RoomInformationSetup({
  onSetupComplete,
  onImageUpload,
  isUploadingImage = false,
}: RoomInformationSetupProps) {
  const [activeStep, setActiveStep] = useState(0);
  
  // Step 1: Image Upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  // Step 2: Room Configuration
  const [roomType, setRoomType] = useState<RoomType>(RoomType.LIVING_ROOM);
  const [unit, setUnit] = useState<DimensionUnit>(DimensionUnit.METERS);
  const [length, setLength] = useState<string>('5');
  const [width, setWidth] = useState<string>('4');
  const [height, setHeight] = useState<string>('3');
  const [currentDimensions, setCurrentDimensions] = useState<RoomDimensions>({
    length: 5,
    width: 4,
    height: 3,
    unit: DimensionUnit.METERS,
  });
  

  // Handle unit conversion
  const handleUnitChange = (newUnit: DimensionUnit | null) => {
    if (!newUnit || newUnit === unit) return;

    const converted = RoomConfigurationService.convertDimensions(currentDimensions, newUnit);
    
    setUnit(newUnit);
    setLength(converted.length.toFixed(2));
    setWidth(converted.width.toFixed(2));
    setHeight(converted.height.toFixed(2));
    setCurrentDimensions(converted);
  };

  // Update current dimensions when values change
  useEffect(() => {
    setCurrentDimensions({
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 0,
      unit,
    });
  }, [length, width, height, unit]);

  // Handle image upload
  const handleImageUpload = (file: File, previewUrl: string) => {
    setImageFile(file);
    setImagePreviewUrl(previewUrl);
    if (onImageUpload) {
      onImageUpload(file, previewUrl);
    }
    // User needs to click Next button to proceed to next step
  };

  // Handle next step
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Final step - complete setup
      const dimensions: RoomDimensions = {
        length: parseFloat(length),
        width: parseFloat(width),
        height: parseFloat(height),
        unit,
      };
      
      onSetupComplete({
        roomType,
        dimensions,
        imageFile: imageFile || undefined,
        imagePreviewUrl: imagePreviewUrl || undefined,
      });
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Check if current step is valid
  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return imageFile !== null;
      case 1:
        return (
          parseFloat(length) > 0 &&
          parseFloat(width) > 0 &&
          parseFloat(height) > 0
        );
      default:
        return false;
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                mb: spacing.md / 8,
              }}
            >
              Upload Your Room Image
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: spacing.lg / 8 }}
            >
              Upload a photo of your room. AI will analyze it to detect furniture or identify it as an empty room.
            </Typography>
            
            {imagePreviewUrl ? (
              <Box sx={{ mb: spacing.md / 8 }}>
                <Paper
                  sx={{
                    p: 2,
                    border: `2px dashed ${brandColors.terracotta}`,
                    borderRadius: 2,
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={imagePreviewUrl}
                    alt="Room preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 300,
                      borderRadius: 8,
                    }}
                  />
                  <Typography variant="body2" sx={{ mt: 1, color: brandColors.darkGray }}>
                    {imageFile?.name}
                  </Typography>
                </Paper>
              </Box>
            ) : (
              <RoomImageUpload
                onImageUpload={handleImageUpload}
                isLoading={isUploadingImage}
              />
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                mb: spacing.md / 8,
              }}
            >
              Room Type & Dimensions
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: spacing.lg / 8 }}
            >
              Select your room type and enter the dimensions. This helps AI recommend furniture that fits perfectly.
            </Typography>

            <FormControl 
              fullWidth 
              sx={{ mb: spacing.md / 8 }}
            >
              <InputLabel>Room Type</InputLabel>
              <Select
                value={roomType}
                label="Room Type"
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.mediumGray,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.darkGray,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: brandColors.terracotta,
                  },
                }}
              >
                <MenuItem value={RoomType.LIVING_ROOM}>Living Room</MenuItem>
                <MenuItem value={RoomType.BEDROOM}>Bedroom</MenuItem>
                <MenuItem value={RoomType.DINING_ROOM}>Dining Room</MenuItem>
                <MenuItem value={RoomType.HOME_OFFICE}>Home Office</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ mb: spacing.md / 8 }}>
              <Typography 
                variant="subtitle2" 
                gutterBottom
                sx={{ 
                  color: brandColors.darkGray,
                  fontWeight: 500,
                  mb: spacing.xs / 8,
                }}
              >
                Unit
              </Typography>
              <ToggleButtonGroup
                value={unit}
                exclusive
                onChange={(_, newUnit) => handleUnitChange(newUnit)}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    color: brandColors.darkGray,
                    borderColor: brandColors.mediumGray,
                    '&.Mui-selected': {
                      backgroundColor: brandColors.terracotta,
                      color: brandColors.white,
                      '&:hover': {
                        backgroundColor: brandColors.sienna,
                      },
                    },
                  },
                }}
              >
                <ToggleButton value={DimensionUnit.METERS}>Meters</ToggleButton>
                <ToggleButton value={DimensionUnit.FEET}>Feet</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <TextField
              fullWidth
              label="Length"
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
              sx={{ mb: spacing.md / 8 }}
            />

            <TextField
              fullWidth
              label="Width"
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              sx={{ mb: spacing.md / 8 }}
            />

            <TextField
              fullWidth
              label="Height"
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              sx={{ mb: spacing.md / 8 }}
            />
          </Box>
        );


      default:
        return null;
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: spacing.lg / 8,
        border: `1px solid ${brandColors.mediumGray}`,
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: brandColors.sienna,
          fontWeight: 600,
          mb: spacing.lg / 8,
        }}
      >
        Room Information Setup
      </Typography>

      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: spacing.xl / 8 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Box sx={{ mb: spacing.xl / 8, minHeight: 300 }}>
        {renderStepContent()}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{
            color: brandColors.darkGray,
          }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!isStepValid()}
          sx={{
            backgroundColor: brandColors.terracotta,
            color: brandColors.white,
            px: spacing.xl / 8,
            '&:hover': {
              backgroundColor: brandColors.sienna,
            },
            '&:disabled': {
              backgroundColor: brandColors.mediumGray,
            },
          }}
        >
          {activeStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
        </Button>
      </Box>
    </Paper>
  );
}
