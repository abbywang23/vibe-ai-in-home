import {
  Box,
  Paper,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { FurniturePlacement } from '../types/domain';

interface RecommendationsDisplayProps {
  placements: FurniturePlacement[];
  onAddToCart: (placementId: string) => void;
  onRemove: (placementId: string) => void;
}

export default function RecommendationsDisplay({
  placements,
  onAddToCart,
  onRemove,
}: RecommendationsDisplayProps) {
  if (placements.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary">
          No furniture placed yet. Get AI recommendations or add items manually.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Furniture in Your Design
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {placements.map((placement) => (
          <Box key={placement.placementId} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 11px)' } }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image={`https://via.placeholder.com/300x200?text=${encodeURIComponent(placement.productName)}`}
                alt={placement.productName}
              />
              <CardContent>
                <Typography variant="h6" component="div">
                  {placement.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {placement.isFromAI ? 'AI Recommended' : 'Manually Added'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => onAddToCart(placement.placementId)}>
                  Add to Cart
                </Button>
                <Button size="small" color="error" onClick={() => onRemove(placement.placementId)}>
                  Remove
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
