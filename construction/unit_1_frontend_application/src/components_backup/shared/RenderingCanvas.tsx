import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import HomeIcon from '@mui/icons-material/Home';
import RulerIcon from '@mui/icons-material/Straighten';
import ChairIcon from '@mui/icons-material/Chair';
import PaletteIcon from '@mui/icons-material/Palette';
import { RootState } from '../../store';
import { brandColors, typography } from '../../theme/brandTheme';

export default function RenderingCanvas() {
  const design = useSelector((state: RootState) => state.design);
  const session = useSelector((state: RootState) => state.session);
  const cart = useSelector((state: RootState) => state.cart);

  const totalCost = cart.items.reduce((sum, item) => sum + item.unitPrice.amount * item.quantity, 0);
  const hasRoomImage = design.roomImage !== null;

  if (!hasRoomImage) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
        }}
      >
        <Box sx={{ textAlign: 'center', maxWidth: '400px' }}>
          <Box
            sx={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: `${brandColors.muted}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <VisibilityIcon sx={{ fontSize: '48px', color: brandColors.mutedForeground }} />
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontFamily: typography.display.fontFamily,
              fontSize: typography.sizes.h4,
              mb: 2,
            }}
          >
            AI Visualization Canvas
          </Typography>
          <Typography
            sx={{
              color: brandColors.mutedForeground,
              fontSize: typography.sizes.base,
            }}
          >
            Upload a room photo to begin. AI will analyze your space and render furniture in real-time.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', p: 3 }}>
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image Display */}
        <Box sx={{ flex: 1, mb: 2 }}>
          <Box
            sx={{
              position: 'relative',
              height: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              border: `1px solid ${brandColors.border}`,
              backgroundColor: brandColors.muted,
            }}
          >
            <img
              src={design.roomImage?.originalUrl || ''}
              alt="Room"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {design.furniturePlacements.length > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  px: 2,
                  py: 1,
                  backgroundColor: brandColors.primary,
                  color: brandColors.primaryForeground,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: '20px' }} />
                <Typography sx={{ fontSize: typography.sizes.label }}>
                  AI Rendered
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Info Panel */}
        {design.furniturePlacements.length > 0 ? (
          <Box
            sx={{
              backgroundColor: brandColors.card,
              border: `1px solid ${brandColors.border}`,
              borderRadius: '8px',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: typography.display.fontFamily,
                    fontSize: typography.sizes.h5,
                    mb: 0.5,
                  }}
                >
                  Your Redesigned {design.roomType || 'Room'}
                </Typography>
                <Typography
                  sx={{
                    color: brandColors.mutedForeground,
                    fontSize: typography.sizes.caption,
                  }}
                >
                  {session.preferences.budget?.currency || 'Modern'} • {cart.items.length} items • ${totalCost.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    borderColor: brandColors.border,
                    color: brandColors.foreground,
                    '&:hover': {
                      borderColor: brandColors.primary,
                    },
                  }}
                >
                  <RefreshIcon sx={{ fontSize: '16px' }} />
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    minWidth: 'auto',
                    p: 1,
                    borderColor: brandColors.border,
                    color: brandColors.foreground,
                    '&:hover': {
                      borderColor: brandColors.primary,
                    },
                  }}
                >
                  <DownloadIcon sx={{ fontSize: '16px' }} />
                </Button>
              </Box>
            </Box>
          </Box>
        ) : (
          <Box
            sx={{
              backgroundColor: brandColors.card,
              border: `1px solid ${brandColors.border}`,
              borderRadius: '8px',
              p: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontFamily: typography.display.fontFamily,
                fontSize: typography.sizes.h5,
                mb: 2,
              }}
            >
              AI Detection Results
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2 }}>
              <DetectionBadge
                icon={<HomeIcon />}
                label="Type"
                value={design.roomType || 'Living Room'}
              />
              <DetectionBadge
                icon={<RulerIcon />}
                label="Size"
                value={design.roomDimensions ? `${design.roomDimensions.width}' × ${design.roomDimensions.length}'` : 'N/A'}
              />
              <DetectionBadge
                icon={<ChairIcon />}
                label="Furniture"
                value={`${design.furniturePlacements.length} items`}
              />
              <DetectionBadge
                icon={<PaletteIcon />}
                label="Style"
                value={session.preferences.budget?.currency || 'Modern'}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

interface DetectionBadgeProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DetectionBadge({ icon, label, value }: DetectionBadgeProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 1,
        backgroundColor: `${brandColors.primary}10`,
        border: `1px solid ${brandColors.primary}30`,
        borderRadius: '8px',
      }}
    >
      <Box sx={{ color: brandColors.primary }}>{icon}</Box>
      <Box>
        <Typography
          sx={{
            color: brandColors.mutedForeground,
            fontSize: typography.sizes.small,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: typography.sizes.caption,
          }}
        >
          {value}
        </Typography>
      </Box>
    </Box>
  );
}
