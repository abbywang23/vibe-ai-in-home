import {
  Box,
  Typography,
  CircularProgress,
  Chip,
  List,
  ListItem,
  Divider,
} from '@mui/material';
import { useEffect } from 'react';
import * as React from 'react';
import { useGetSmartProductRecommendationsMutation } from '../services/aiApi';
import { brandColors, spacing } from '../theme/brandTheme';
import { Product, UserPreferences, RoomType, RoomDimensions } from '../types/domain';

interface ProductListDisplayProps {
  preferences: UserPreferences;
  roomType: RoomType;
  roomDimensions: RoomDimensions;
  selectedProductId?: string;
  onProductSelect: (product: Product) => void;
}

export default function ProductListDisplay({
  preferences,
  roomType,
  roomDimensions,
  selectedProductId,
  onProductSelect,
}: ProductListDisplayProps) {
  console.log('ProductListDisplay - Component rendered with props:', { roomType, roomDimensions, preferences });
  
  const [getSmartRecommendations, { data, isLoading, error, isSuccess }] = useGetSmartProductRecommendationsMutation();
  const [recommendationData, setRecommendationData] = React.useState<{
    success: boolean;
    recommendedProductIds: string[];
    reasoning?: string;
    products: Product[];
  } | null>(null);

  useEffect(() => {
    console.log('ProductListDisplay - useEffect triggered');
    
    // Check if required data is available
    if (!roomType || !roomDimensions) {
      console.warn('ProductListDisplay - Missing required props:', { roomType, roomDimensions });
      return;
    }

    // Trigger smart recommendations when component mounts or preferences change
    const requestData = {
      roomType,
      roomDimensions,
      preferences: {
        selectedCategories: preferences.selectedCategories,
        selectedCollections: preferences.selectedCollections,
        budget: preferences.budget || undefined, // Convert null to undefined
      },
      language: 'en' as const, // TODO: Get from user settings
    };
    
    console.log('ProductListDisplay - Component mounted/updated');
    console.log('ProductListDisplay - Props:', { roomType, roomDimensions, preferences });
    console.log('ProductListDisplay - Calling API with:', requestData);
    
    getSmartRecommendations(requestData)
      .unwrap()
      .then((result) => {
        console.log('ProductListDisplay - API Success:', result);
        console.log('ProductListDisplay - Result type:', typeof result);
        console.log('ProductListDisplay - Result keys:', Object.keys(result || {}));
        console.log('ProductListDisplay - Result.products:', result?.products);
        console.log('ProductListDisplay - Result.products type:', Array.isArray(result?.products));
        console.log('ProductListDisplay - Result.products length:', result?.products?.length);
        
        if (result && result.products && Array.isArray(result.products)) {
          setRecommendationData(result);
        } else {
          console.error('ProductListDisplay - Invalid response structure:', result);
          setRecommendationData(null);
        }
      })
      .catch((err) => {
        console.error('ProductListDisplay - API Error:', err);
        console.error('ProductListDisplay - Error details:', {
          status: err?.status,
          data: err?.data,
          message: err?.message,
        });
        setRecommendationData(null);
      });
  }, [
    roomType,
    roomDimensions?.length,
    roomDimensions?.width,
    roomDimensions?.height,
    roomDimensions?.unit,
    preferences.selectedCategories?.join(','),
    preferences.selectedCollections?.join(','),
    preferences.budget?.amount,
    preferences.budget?.currency,
  ]);

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={40} sx={{ color: brandColors.terracotta }} />
        <Typography variant="body1" sx={{ mt: 2, color: brandColors.darkGray }}>
          AI is analyzing your preferences and finding perfect furniture...
        </Typography>
      </Box>
    );
  }

  // Debug: log the response data
  console.log('ProductListDisplay - API Response:', { 
    data, 
    isLoading, 
    error, 
    isSuccess, 
    recommendationData,
    'recommendationData?.products': recommendationData?.products,
    'recommendationData?.products?.length': recommendationData?.products?.length,
    'data?.products': data?.products,
    'data?.products?.length': data?.products?.length,
  });

  // Use recommendationData if available, otherwise fall back to data
  const responseData = recommendationData || data;
  const products = responseData?.products || [];
  
  console.log('ProductListDisplay - Final products array:', products, 'length:', products.length);

  // Show error if API call failed
  if (error) {
    console.error('ProductListDisplay - API Error:', error);
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" color="error" gutterBottom>
          Failed to load products
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {error && 'data' in error ? (error.data as any)?.message || 'Please try again or adjust your preferences' : 'Please try again or adjust your preferences'}
        </Typography>
      </Box>
    );
  }

  // Show empty state only if we have a response but no products
  if (!isLoading && responseData && products.length === 0) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" sx={{ color: brandColors.darkGray, mb: 2 }}>
          No products found
        </Typography>
        <Typography variant="body2" sx={{ color: brandColors.darkGray }}>
          {responseData.reasoning || 'Try adjusting your budget or selecting different categories'}
        </Typography>
      </Box>
    );
  }

  // Show loading if no data yet
  if (!responseData && !isLoading) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="body2" sx={{ color: brandColors.darkGray }}>
          Loading recommendations...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography 
        variant="h6" 
        gutterBottom
        sx={{ 
          color: brandColors.sienna,
          fontWeight: 600,
          mb: spacing.md / 8,
        }}
      >
        AI Recommended Furniture ({products.length} items)
      </Typography>
      
      {responseData?.reasoning && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: brandColors.darkGray,
            mb: spacing.md / 8,
            fontStyle: 'italic',
            p: spacing.sm / 8,
            backgroundColor: brandColors.cream,
            borderRadius: 1,
          }}
        >
          💡 {typeof responseData.reasoning === 'string' && responseData.reasoning.startsWith('{') 
            ? JSON.parse(responseData.reasoning).reasoning || responseData.reasoning
            : responseData.reasoning}
        </Typography>
      )}

      <List sx={{ width: '100%', p: 0 }}>
        {products.map((product, index) => (
          <Box key={product.id} sx={{ mb: spacing.md / 8 }}>
            <ListItem
              disablePadding
              sx={{
                p: 0,
                cursor: 'pointer',
                backgroundColor: selectedProductId === product.id 
                  ? brandColors.cream 
                  : 'transparent',
                border: selectedProductId === product.id 
                  ? `2px solid ${brandColors.terracotta}` 
                  : `1px solid ${brandColors.mediumGray}`,
                borderRadius: 1,
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: brandColors.cream,
                  borderColor: brandColors.terracotta,
                  boxShadow: 2,
                },
                transition: 'all 0.2s ease-in-out',
              }}
              onClick={() => onProductSelect(product)}
            >
            <Box sx={{ display: 'flex', width: '100%', p: spacing.md / 8, alignItems: 'flex-start', gap: spacing.md / 8 }}>
              {/* Product Image */}
              <Box
                sx={{
                  width: 150,
                  height: 150,
                  minWidth: 150,
                  flexShrink: 0,
                  borderRadius: 1,
                  overflow: 'hidden',
                  backgroundColor: brandColors.lightGray,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-furniture.jpg';
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: brandColors.lightGray,
                      color: brandColors.darkGray,
                    }}
                  >
                    <Typography variant="caption">No Image</Typography>
                  </Box>
                )}
              </Box>

              {/* Product Info */}
              <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: spacing.xs / 8 }}>
                {/* Name and Price Row */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing.sm / 8 }}>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      fontWeight: 600,
                      color: brandColors.sienna,
                      flex: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {product.name}
                  </Typography>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: brandColors.terracotta,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    ${product.price.toFixed(2)} {product.currency || 'SGD'}
                  </Typography>
                </Box>

                {/* Category and Tags Row */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                  <Chip 
                    label={product.category} 
                    size="small"
                    sx={{ 
                      backgroundColor: brandColors.cream,
                      color: brandColors.sienna,
                      fontSize: '0.75rem',
                    }}
                  />
                  {product.tags?.filter(tag => tag !== product.category).slice(0, 2).map((tag, idx) => (
                    <Chip 
                      key={idx}
                      label={tag} 
                      size="small"
                      sx={{ 
                        backgroundColor: brandColors.lightGray,
                        color: brandColors.darkGray,
                        fontSize: '0.75rem',
                      }}
                    />
                  ))}
                </Box>

                {/* Dimensions Row */}
                {product.dimensions && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: brandColors.darkGray,
                      fontSize: '0.8rem',
                    }}
                  >
                    {product.dimensions.width}W × {product.dimensions.depth}D × {product.dimensions.height}H {product.dimensions.unit || 'cm'}
                  </Typography>
                )}

                {/* Selected Indicator */}
                {selectedProductId === product.id && (
                  <Box>
                    <Chip 
                      label="Selected" 
                      size="small"
                      sx={{ 
                        backgroundColor: brandColors.terracotta,
                        color: brandColors.white,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </ListItem>
          {index < products.length - 1 && (
            <Divider sx={{ mx: spacing.md / 8, my: spacing.sm / 8 }} />
          )}
          </Box>
        ))}
      </List>
    </Box>
  );
}