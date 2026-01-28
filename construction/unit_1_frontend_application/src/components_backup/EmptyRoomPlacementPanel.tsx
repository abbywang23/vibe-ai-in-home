import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Slider,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useSearchProductsQuery } from '../services/aiApi';

interface EmptyRoomPlacementPanelProps {
  onPlaceFurniture: (productId: string, position: { x: number; y: number }, rotation: number, scale: number) => void;
  isLoading?: boolean;
}

export default function EmptyRoomPlacementPanel({
  onPlaceFurniture,
  isLoading,
}: EmptyRoomPlacementPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(1.0);

  const { data: productsData } = useSearchProductsQuery(
    { q: searchQuery },
    { skip: searchQuery.length < 2 }
  );

  const handlePlaceFurniture = () => {
    if (selectedProduct) {
      onPlaceFurniture(selectedProduct, position, rotation, scale);
      // Reset after placement
      setSelectedProduct(null);
      setRotation(0);
      setScale(1.0);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Place Furniture in Empty Room
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Search for furniture and adjust position, rotation, and scale before placing.
      </Typography>

      {/* Product Search */}
      <TextField
        fullWidth
        label="Search Furniture"
        placeholder="e.g., sofa, table, chair"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Product Results */}
      {productsData && productsData.products.length > 0 && (
        <Box sx={{ mb: 3, maxHeight: 200, overflow: 'auto' }}>
          <Typography variant="subtitle2" gutterBottom>
            Search Results:
          </Typography>
          <Grid container spacing={1}>
            {productsData.products.map((product) => (
              <Grid size={12} key={product.id}>
                <Button
                  variant={selectedProduct === product.id ? 'contained' : 'outlined'}
                  fullWidth
                  onClick={() => setSelectedProduct(product.id)}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {product.name}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Placement Controls */}
      {selectedProduct && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Placement Settings:
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" gutterBottom>
              Position X: {position.x}%
            </Typography>
            <Slider
              value={position.x}
              onChange={(_, value) => setPosition({ ...position, x: value as number })}
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" gutterBottom>
              Position Y: {position.y}%
            </Typography>
            <Slider
              value={position.y}
              onChange={(_, value) => setPosition({ ...position, y: value as number })}
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" gutterBottom>
              Rotation: {rotation}°
            </Typography>
            <Slider
              value={rotation}
              onChange={(_, value) => setRotation(value as number)}
              min={0}
              max={360}
              valueLabelDisplay="auto"
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" gutterBottom>
              Scale: {scale.toFixed(1)}x
            </Typography>
            <Slider
              value={scale}
              onChange={(_, value) => setScale(value as number)}
              min={0.5}
              max={2.0}
              step={0.1}
              valueLabelDisplay="auto"
            />
          </Box>

          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={handlePlaceFurniture}
            disabled={isLoading}
          >
            Place Furniture
          </Button>
        </Box>
      )}

      {!selectedProduct && searchQuery.length < 2 && (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          Start typing to search for furniture
        </Typography>
      )}
    </Paper>
  );
}
