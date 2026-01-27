import { useState } from 'react';
import { Box, Paper, Typography, Alert, CircularProgress } from '@mui/material';
import RoomImageUpload from './RoomImageUpload';
import FurnitureDetectionPanel from './FurnitureDetectionPanel';
import EmptyRoomPlacementPanel from './EmptyRoomPlacementPanel';
import { RoomImage, DetectedFurnitureItem } from '../types/domain';

interface RoomImageManagerProps {
  roomImage: RoomImage | null;
  onImageUpload: (file: File, previewUrl: string) => void;
  onDetectFurniture: () => void;
  onReplaceItem: (itemId: string) => void;
  onViewReplacements: (itemId: string) => void;
  onPlaceFurniture: (productId: string, position: { x: number; y: number }, rotation: number, scale: number) => void;
  isUploading?: boolean;
  isDetecting?: boolean;
  isProcessing?: boolean;
}

export default function RoomImageManager({
  roomImage,
  onImageUpload,
  onDetectFurniture,
  onReplaceItem,
  onViewReplacements,
  onPlaceFurniture,
  isUploading,
  isDetecting,
  isProcessing,
}: RoomImageManagerProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedFile(file);
    onImageUpload(file, previewUrl);
    // Automatically trigger detection after upload
    setTimeout(() => {
      onDetectFurniture();
    }, 500);
  };

  return (
    <Box>
      {/* Upload Section */}
      <RoomImageUpload
        onImageUpload={handleImageUpload}
        isLoading={isUploading || isDetecting}
      />

      {/* Detection Status */}
      {isDetecting && (
        <Paper sx={{ p: 2, mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={24} />
          <Typography variant="body2">
            AI is analyzing your room image...
          </Typography>
        </Paper>
      )}

      {/* Results Section */}
      {roomImage && !isDetecting && (
        <Box sx={{ mt: 2 }}>
          {/* Empty Room */}
          {roomImage.isEmpty && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Empty room detected! You can now place furniture in your room.
              </Alert>
              <EmptyRoomPlacementPanel
                onPlaceFurniture={onPlaceFurniture}
                isLoading={isProcessing}
              />
              
              {/* Show placed furniture */}
              {roomImage.appliedPlacements.length > 0 && (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Placed Furniture ({roomImage.appliedPlacements.length})
                  </Typography>
                  {roomImage.appliedPlacements.map((placement) => (
                    <Typography key={placement.placementId} variant="body2">
                      • {placement.productName} at ({placement.imagePosition.x}, {placement.imagePosition.y})
                    </Typography>
                  ))}
                </Paper>
              )}
            </>
          )}

          {/* Furnished Room */}
          {!roomImage.isEmpty && roomImage.detectedFurniture.length > 0 && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                Furniture detected! You can replace existing items with Castlery products.
              </Alert>
              <FurnitureDetectionPanel
                detectedItems={roomImage.detectedFurniture}
                onReplaceItem={onReplaceItem}
                onViewReplacements={onViewReplacements}
              />

              {/* Show replacements */}
              {roomImage.appliedReplacements.length > 0 && (
                <Paper sx={{ p: 2, mt: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Applied Replacements ({roomImage.appliedReplacements.length})
                  </Typography>
                  {roomImage.appliedReplacements.map((replacement) => (
                    <Typography key={replacement.detectedItemId} variant="body2">
                      • Replaced with {replacement.replacementProductName}
                    </Typography>
                  ))}
                </Paper>
              )}
            </>
          )}

          {/* Processed Image Display */}
          {roomImage.processedUrl && (
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Processed Image
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  overflow: 'hidden',
                  borderRadius: 2,
                }}
              >
                <img
                  src={roomImage.processedUrl}
                  alt="Processed room"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                  }}
                />
              </Box>
            </Paper>
          )}
        </Box>
      )}
    </Box>
  );
}
