import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
} from '@mui/material';
import { UserPreferences, Product, DetectedFurnitureItem, RoomType, RoomDimensions } from '../types/domain';
import { brandColors, spacing } from '../theme/brandTheme';
import { useReplaceFurnitureMutation, usePlaceFurnitureMutation } from '../services/aiApi';
import ProductListDisplay from './ProductListDisplay';

interface ProductSelectionStepProps {
  preferences: UserPreferences;
  roomImageUrl: string;
  roomType: RoomType;
  roomDimensions: RoomDimensions;
  mode: 'replace' | 'empty_room';
  detectedItems?: DetectedFurnitureItem[]; // For replace mode
  onComplete: (result: { processedImageUrl: string; selectedProduct: Product }) => void;
  onBack: () => void;
}

const steps = ['Room Setup', 'Preferences', 'Furniture Selection'];

export default function ProductSelectionStep({
  preferences,
  roomImageUrl,
  roomType,
  roomDimensions,
  mode,
  detectedItems = [],
  onComplete,
  onBack,
}: ProductSelectionStepProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string>('');

  const [replaceFurniture] = useReplaceFurnitureMutation();
  const [placeFurniture] = usePlaceFurnitureMutation();

  // Auto-render when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      handleRenderProduct(selectedProduct);
    }
  }, [selectedProduct]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setRenderError('');
  };

  const handleRenderProduct = async (product: Product) => {
    if (!product) return;

    setIsRendering(true);
    setRenderError('');

    try {
      if (mode === 'replace' && detectedItems.length > 0) {
        // Replace mode: replace the first detected item with the selected product
        const firstDetectedItem = detectedItems[0];
        const result = await replaceFurniture({
          imageUrl: roomImageUrl,
          detectedItemId: firstDetectedItem.itemId,
          replacementProductId: product.id,
        }).unwrap();
        
        setProcessedImageUrl(result.processedImageUrl);
      } else {
        // Empty room mode: place furniture in the center
        const result = await placeFurniture({
          imageUrl: roomImageUrl,
          productId: product.id,
          imagePosition: { x: 0.5, y: 0.5 }, // Center of the image
          rotation: 0,
          scale: 1.0,
        }).unwrap();
        
        setProcessedImageUrl(result.processedImageUrl);
      }
    } catch (error: any) {
      console.error('Rendering error:', error);
      setRenderError(error.data?.message || 'Failed to render furniture. Please try again.');
    } finally {
      setIsRendering(false);
    }
  };

  const handleComplete = () => {
    if (selectedProduct && processedImageUrl) {
      onComplete({
        processedImageUrl,
        selectedProduct,
      });
    }
  };

  const canComplete = selectedProduct && processedImageUrl && !isRendering;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Progress Stepper */}
      <Box sx={{ mb: spacing.lg / 8 }}>
        <Stepper activeStep={2} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  '& .MuiStepLabel-label': {
                    color: brandColors.darkGray,
                    '&.Mui-active': {
                      color: brandColors.terracotta,
                      fontWeight: 600,
                    },
                    '&.Mui-completed': {
                      color: brandColors.sienna,
                    },
                  },
                  '& .MuiStepIcon-root': {
                    color: brandColors.mediumGray,
                    '&.Mui-active': {
                      color: brandColors.terracotta,
                    },
                    '&.Mui-completed': {
                      color: brandColors.sienna,
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <Grid container spacing={3}>
        {/* Left Panel - Product List */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: spacing.lg / 8,
              border: `1px solid ${brandColors.mediumGray}`,
              height: 'fit-content',
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
              Choose Your Furniture
            </Typography>

            <Typography 
              variant="body1" 
              sx={{ 
                color: brandColors.darkGray,
                mb: spacing.lg / 8,
              }}
            >
              Select a piece of furniture to see how it looks in your room. 
              {mode === 'replace' ? ' We\'ll replace existing furniture with your selection.' : ' We\'ll place it in your empty room.'}
            </Typography>

            <ProductListDisplay
              preferences={preferences}
              roomType={roomType}
              roomDimensions={roomDimensions}
              selectedProductId={selectedProduct?.id}
              onProductSelect={handleProductSelect}
            />
          </Paper>
        </Grid>

        {/* Right Panel - Rendered Result */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: spacing.lg / 8,
              border: `1px solid ${brandColors.mediumGray}`,
              minHeight: '500px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                fontWeight: 600,
                mb: spacing.lg / 8,
              }}
            >
              Preview
            </Typography>

            <Box 
              sx={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: brandColors.lightGray,
                borderRadius: 1,
                minHeight: '400px',
                position: 'relative',
              }}
            >
              {isRendering && (
                <Box textAlign="center">
                  <CircularProgress size={40} sx={{ color: brandColors.terracotta, mb: 2 }} />
                  <Typography variant="body1" sx={{ color: brandColors.darkGray }}>
                    Rendering furniture in your room...
                  </Typography>
                </Box>
              )}

              {!isRendering && !processedImageUrl && !selectedProduct && (
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: brandColors.darkGray,
                    textAlign: 'center',
                  }}
                >
                  Select a furniture item to see the preview
                </Typography>
              )}

              {!isRendering && processedImageUrl && (
                <img
                  src={processedImageUrl}
                  alt="Room with selected furniture"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '4px',
                  }}
                />
              )}

              {renderError && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    right: 16,
                  }}
                >
                  {renderError}
                </Alert>
              )}
            </Box>

            {selectedProduct && (
              <Box sx={{ mt: spacing.md / 8, p: spacing.md / 8, backgroundColor: brandColors.cream, borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ color: brandColors.sienna, fontWeight: 600 }}>
                  Selected: {selectedProduct.name}
                </Typography>
                <Typography variant="body2" sx={{ color: brandColors.darkGray }}>
                  ${selectedProduct.price.toFixed(2)} {selectedProduct.currency || 'SGD'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: spacing.lg / 8 }}>
        <Button 
          variant="outlined" 
          onClick={onBack}
          sx={{
            borderColor: brandColors.mediumGray,
            color: brandColors.darkGray,
            px: spacing.lg / 8,
            py: spacing.sm / 8,
            '&:hover': {
              borderColor: brandColors.terracotta,
              backgroundColor: 'transparent',
            },
          }}
        >
          Back to Preferences
        </Button>
        
        <Button 
          variant="contained" 
          onClick={handleComplete}
          disabled={!canComplete}
          sx={{
            backgroundColor: canComplete ? brandColors.terracotta : brandColors.mediumGray,
            color: brandColors.white,
            px: spacing.lg / 8,
            py: spacing.sm / 8,
            fontSize: '1rem',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: canComplete ? brandColors.sienna : brandColors.mediumGray,
            },
            '&:disabled': {
              backgroundColor: brandColors.mediumGray,
              color: brandColors.darkGray,
            },
          }}
        >
          Complete Design
        </Button>
      </Box>

      {!canComplete && selectedProduct && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.terracotta,
            mt: spacing.sm / 8,
            textAlign: 'center',
            fontStyle: 'italic',
          }}
        >
          {isRendering ? 'Please wait for rendering to complete...' : 'Select a furniture item to continue'}
        </Typography>
      )}
    </Box>
  );
}