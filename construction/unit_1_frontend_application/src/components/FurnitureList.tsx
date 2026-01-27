import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { FurniturePlacement } from '../types/domain';

interface FurnitureListProps {
  placements: FurniturePlacement[];
  onRemove: (placementId: string) => void;
  onAddToCart: (placementId: string) => void;
}

export default function FurnitureList({
  placements,
  onRemove,
  onAddToCart,
}: FurnitureListProps) {
  if (placements.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No furniture placed yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Placed Furniture ({placements.length})
      </Typography>
      <List>
        {placements.map((placement) => (
          <ListItem
            key={placement.placementId}
            secondaryAction={
              <Box>
                <IconButton
                  edge="end"
                  onClick={() => onAddToCart(placement.placementId)}
                  sx={{ mr: 1 }}
                >
                  <ShoppingCartIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => onRemove(placement.placementId)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemAvatar>
              <Avatar variant="rounded">
                {placement.productName.charAt(0)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={placement.productName}
              secondary={
                <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                  {placement.isFromAI && (
                    <Chip label="AI" size="small" color="primary" />
                  )}
                  <Typography variant="caption">
                    {placement.productDimensions.length} × {placement.productDimensions.width} × {placement.productDimensions.height} {placement.productDimensions.unit}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
