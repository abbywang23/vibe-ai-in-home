import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { DetectedFurnitureItem } from '../types/domain';

interface FurnitureDetectionPanelProps {
  detectedItems: DetectedFurnitureItem[];
  onReplaceItem: (itemId: string) => void;
  onViewReplacements: (itemId: string) => void;
}

export default function FurnitureDetectionPanel({
  detectedItems,
  onReplaceItem,
  onViewReplacements,
}: FurnitureDetectionPanelProps) {
  if (detectedItems.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body2" color="text.secondary">
          No furniture detected in the image
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <CheckCircleIcon color="success" sx={{ mr: 1 }} />
        <Typography variant="h6">
          Detected Furniture ({detectedItems.length})
        </Typography>
      </Box>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        AI has detected the following furniture items. Click to view replacement options.
      </Typography>

      <List>
        {detectedItems.map((item, index) => (
          <Box key={item.itemId}>
            <ListItem
              sx={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {item.furnitureType}
                      </Typography>
                      <Chip
                        label={`${Math.round(item.confidence * 100)}% confidence`}
                        size="small"
                        color={item.confidence > 0.8 ? 'success' : 'warning'}
                      />
                    </Box>
                  }
                  secondary={`Position: (${item.boundingBox.x}, ${item.boundingBox.y})`}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<SwapHorizIcon />}
                  onClick={() => onViewReplacements(item.itemId)}
                  fullWidth
                >
                  View Replacements
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onReplaceItem(item.itemId)}
                  fullWidth
                >
                  Replace with AI Suggestion
                </Button>
              </Box>
            </ListItem>
            {index < detectedItems.length - 1 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
}
