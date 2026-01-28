import { Box, Paper, Typography } from '@mui/material';
import { RoomDesign } from '../types/domain';
import { brandColors } from '../theme/brandTheme';

interface VisualizationCanvasProps {
  design: RoomDesign;
}

export default function VisualizationCanvas({
  design,
}: VisualizationCanvasProps) {
  const { roomDimensions, furniturePlacements } = design;

  if (!roomDimensions) {
    return (
      <Paper sx={{ p: 3, height: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Configure room dimensions to see visualization
        </Typography>
      </Paper>
    );
  }

  // Calculate scale for visualization
  const maxDimension = Math.max(roomDimensions.width, roomDimensions.length);
  const canvasSize = 400;
  const scale = canvasSize / maxDimension;

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ color: brandColors.sienna }}>
        2D Room Layout
      </Typography>
      
      <Box
        sx={{
          width: canvasSize,
          height: canvasSize * (roomDimensions.length / roomDimensions.width),
          border: `2px solid ${brandColors.mediumGray}`,
          position: 'relative',
          backgroundColor: brandColors.cream,
          margin: '0 auto',
        }}
      >
        {/* Room outline */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: `1px solid ${brandColors.darkGray}`,
          }}
        />

        {/* Furniture items */}
        {furniturePlacements.map((placement) => (
          <Box
            key={placement.placementId}
            sx={{
              position: 'absolute',
              left: `${placement.position.x * 100}%`,
              top: `${placement.position.y * 100}%`,
              width: placement.productDimensions.width * scale,
              height: placement.productDimensions.depth * scale,
              backgroundColor: brandColors.terracotta,
              border: `1px solid ${brandColors.sienna}`,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transform: `rotate(${placement.rotation}deg)`,
              '&:hover': {
                backgroundColor: brandColors.sienna,
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: brandColors.white,
                fontSize: '0.6rem',
                textAlign: 'center',
                wordBreak: 'break-word',
              }}
            >
              {placement.productName.substring(0, 10)}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
        {roomDimensions.width} × {roomDimensions.length} {roomDimensions.unit}
      </Typography>
    </Paper>
  );
}