import { Box, Paper, Typography, ToggleButtonGroup, ToggleButton, Button } from '@mui/material';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import GridOnIcon from '@mui/icons-material/GridOn';
import { RoomDesign, FurniturePlacement, Position3D } from '../types/domain';

interface VisualizationCanvasProps {
  mode: '2D' | '3D';
  design: RoomDesign;
  onFurnitureSelect?: (placementId: string) => void;
  onFurnitureMove?: (placementId: string, position: Position3D) => void;
  onFurnitureRotate?: (placementId: string, rotation: number) => void;
  onModeChange: (mode: '2D' | '3D') => void;
}

export default function VisualizationCanvas({
  mode,
  design,
  onModeChange,
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

  // Calculate scale for canvas
  const canvasWidth = 600;
  const canvasHeight = 400;
  const scale = Math.min(
    canvasWidth / roomDimensions.length,
    canvasHeight / roomDimensions.width
  );

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Room Visualization</Typography>
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, newMode) => newMode && onModeChange(newMode)}
          size="small"
        >
          <ToggleButton value="2D">
            <GridOnIcon sx={{ mr: 0.5 }} />
            2D
          </ToggleButton>
          <ToggleButton value="3D">
            <ViewInArIcon sx={{ mr: 0.5 }} />
            3D
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {mode === '2D' ? (
        <Box
          sx={{
            width: canvasWidth,
            height: canvasHeight,
            border: '2px solid #ccc',
            position: 'relative',
            backgroundColor: '#f5f5f5',
            margin: '0 auto',
          }}
        >
          {/* Room outline */}
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: roomDimensions.length * scale,
              height: roomDimensions.width * scale,
              border: '3px solid #333',
              backgroundColor: 'white',
            }}
          >
            {/* Room dimensions label */}
            <Typography
              variant="caption"
              sx={{
                position: 'absolute',
                top: -25,
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'white',
                padding: '2px 8px',
                border: '1px solid #ccc',
              }}
            >
              {roomDimensions.length} × {roomDimensions.width} {roomDimensions.unit}
            </Typography>

            {/* Furniture placements */}
            {furniturePlacements.map((placement: FurniturePlacement) => (
              <Box
                key={placement.placementId}
                sx={{
                  position: 'absolute',
                  left: placement.position.x * scale,
                  top: placement.position.z * scale,
                  width: placement.productDimensions.length * scale,
                  height: placement.productDimensions.width * scale,
                  backgroundColor: placement.isFromAI ? '#1976d2' : '#9c27b0',
                  opacity: 0.7,
                  border: '2px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transform: `rotate(${placement.rotation}deg)`,
                  transformOrigin: 'center',
                  '&:hover': {
                    opacity: 0.9,
                  },
                }}
                title={placement.productName}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontSize: '10px',
                    textAlign: 'center',
                    padding: '2px',
                  }}
                >
                  {placement.productName.substring(0, 15)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            width: canvasWidth,
            height: canvasHeight,
            border: '2px solid #ccc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            margin: '0 auto',
          }}
        >
          <Typography variant="body1" color="text.secondary">
            3D view coming soon (requires Three.js integration)
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Legend:
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#1976d2', opacity: 0.7 }} />
          <Typography variant="caption">AI Recommended</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 16, height: 16, backgroundColor: '#9c27b0', opacity: 0.7 }} />
          <Typography variant="caption">Manual</Typography>
        </Box>
      </Box>
    </Paper>
  );
}
