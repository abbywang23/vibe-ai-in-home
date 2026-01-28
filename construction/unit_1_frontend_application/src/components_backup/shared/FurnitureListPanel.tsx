import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import ChairIcon from '@mui/icons-material/Chair';
import { RootState } from '../../store';
import { brandColors, typography } from '../../theme/brandTheme';

export default function FurnitureListPanel() {
  const cart = useSelector((state: RootState) => state.cart);

  const totalCost = cart.items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  const isLoading = false; // TODO: Connect to actual loading state

  if (isLoading) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress
            size={32}
            sx={{ color: brandColors.primary, mb: 1 }}
          />
          <Typography
            sx={{
              color: brandColors.mutedForeground,
              fontSize: typography.sizes.caption,
            }}
          >
            Loading furniture recommendations...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: '400px' }}>
          <ChairIcon
            sx={{
              fontSize: '48px',
              color: brandColors.mutedForeground,
              mb: 2,
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontFamily: typography.display.fontFamily,
              fontSize: typography.sizes.h5,
              mb: 0.5,
            }}
          >
            Furniture Selection
          </Typography>
          <Typography
            sx={{
              color: brandColors.mutedForeground,
              fontSize: typography.sizes.caption,
            }}
          >
            Complete the steps above to see AI-recommended furniture
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontFamily: typography.display.fontFamily,
              fontSize: typography.sizes.h5,
              mb: 0.5,
            }}
          >
            Selected Furniture ({cart.items.length} items)
          </Typography>
          <Typography
            sx={{
              color: brandColors.mutedForeground,
              fontSize: typography.sizes.caption,
            }}
          >
            AI-curated pieces that work together perfectly
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography
            sx={{
              color: brandColors.mutedForeground,
              fontSize: typography.sizes.caption,
              mb: 0.5,
            }}
          >
            Total
          </Typography>
          <Typography
            sx={{
              color: brandColors.primary,
              fontSize: typography.sizes.h5,
              fontWeight: 600,
            }}
          >
            ${totalCost.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* Furniture Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 2,
        }}
      >
        {cart.items.map((item) => (
          <Box
            key={item.itemId}
            sx={{
              backgroundColor: brandColors.background,
              border: `1px solid ${brandColors.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: `${brandColors.primary}80`,
                transform: 'translateY(-2px)',
              },
            }}
          >
            {/* Product Image */}
            <Box
              sx={{
                aspectRatio: '1',
                backgroundColor: brandColors.muted,
                overflow: 'hidden',
              }}
            >
              <img
                src={item.thumbnailUrl || 'https://via.placeholder.com/200'}
                alt={item.productName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
            </Box>

            {/* Product Info */}
            <Box sx={{ p: 1.5 }}>
              <Typography
                sx={{
                  fontFamily: typography.display.fontFamily,
                  fontSize: typography.sizes.small,
                  fontWeight: 600,
                  mb: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.productName}
              </Typography>
              <Typography
                sx={{
                  color: brandColors.mutedForeground,
                  fontSize: typography.sizes.small,
                  mb: 1,
                }}
              >
                Furniture
              </Typography>
              <Typography
                sx={{
                  color: brandColors.primary,
                  fontSize: typography.sizes.label,
                  fontWeight: 600,
                }}
              >
                ${item.unitPrice.amount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
