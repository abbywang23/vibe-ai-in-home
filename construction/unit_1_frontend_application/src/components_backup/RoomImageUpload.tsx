import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import ImageProcessingService from '../services/ImageProcessingService';

interface RoomImageUploadProps {
  onImageUpload: (file: File, previewUrl: string) => void;
  isLoading?: boolean;
}

export default function RoomImageUpload({ onImageUpload, isLoading }: RoomImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate image
    const validation = ImageProcessingService.validateImage(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid image');
      return;
    }

    // Clear previous error
    setError(null);

    // Create preview
    const preview = ImageProcessingService.createPreviewUrl(file);
    setPreviewUrl(preview);

    // Notify parent
    onImageUpload(file, preview);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    if (previewUrl) {
      ImageProcessingService.revokePreviewUrl(previewUrl);
    }
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Upload Room Photo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload a photo of your room. AI will detect if it's empty or has existing furniture.
      </Typography>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!previewUrl ? (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
          onClick={handleButtonClick}
        >
          <ImageIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            Click to upload or drag and drop
          </Typography>
          <Typography variant="caption" color="text.secondary">
            JPEG or PNG (max 10MB)
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              maxHeight: 400,
              overflow: 'hidden',
              borderRadius: 2,
              mb: 2,
            }}
          >
            <img
              src={previewUrl}
              alt="Room preview"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
            {isLoading && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                }}
              >
                <CircularProgress />
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              Change Image
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleClear}
              disabled={isLoading}
            >
              Clear
            </Button>
          </Box>
        </Box>
      )}
    </Paper>
  );
}
