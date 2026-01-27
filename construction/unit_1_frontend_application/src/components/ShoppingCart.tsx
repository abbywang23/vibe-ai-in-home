import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { CartItem, Money } from '../types/domain';
import { brandColors, spacing } from '../theme/brandTheme';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onCheckout: () => void;
}

export default function ShoppingCart({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
}: ShoppingCartProps) {
  const calculateTotal = (): Money => {
    const total = items.reduce((sum, item) => {
      return sum + item.unitPrice.amount * item.quantity;
    }, 0);
    return {
      amount: total,
      currency: items[0]?.unitPrice.currency || 'USD',
    };
  };

  const total = calculateTotal();

  if (items.length === 0) {
    return (
      <Paper 
        elevation={0}
        sx={{ 
          p: spacing.lg / 8,
          border: `1px solid ${brandColors.mediumGray}`,
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          sx={{ 
            color: brandColors.sienna,
            fontWeight: 600,
          }}
        >
          Shopping Cart
        </Typography>
        <Typography 
          variant="body2" 
          sx={{ color: brandColors.darkGray }}
        >
          Your cart is empty
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: spacing.lg / 8,
        border: `1px solid ${brandColors.mediumGray}`,
      }}
    >
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: brandColors.sienna,
          fontWeight: 600,
          mb: spacing.md / 8,
        }}
      >
        Shopping Cart ({items.length} items)
      </Typography>

      <List>
        {items.map((item) => (
          <ListItem
            key={item.itemId}
            secondaryAction={
              <IconButton 
                edge="end" 
                onClick={() => onRemove(item.itemId)}
                sx={{ 
                  color: brandColors.terracotta,
                  '&:hover': {
                    backgroundColor: 'rgba(217, 116, 73, 0.08)',
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            }
            sx={{
              borderBottom: `1px solid ${brandColors.lightGray}`,
              pb: spacing.sm / 8,
              mb: spacing.sm / 8,
            }}
          >
            <Box sx={{ width: '100%' }}>
              <ListItemText
                primary={
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: brandColors.sienna,
                      fontWeight: 500,
                    }}
                  >
                    {item.productName}
                  </Typography>
                }
                secondary={
                  <Typography 
                    variant="body2" 
                    sx={{ color: brandColors.darkGray }}
                  >
                    {item.unitPrice.currency} {item.unitPrice.amount.toFixed(2)}
                  </Typography>
                }
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                  sx={{ 
                    color: brandColors.terracotta,
                    '&:hover': {
                      backgroundColor: 'rgba(217, 116, 73, 0.08)',
                    },
                    '&.Mui-disabled': {
                      color: brandColors.mediumGray,
                    }
                  }}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography 
                  variant="body2"
                  sx={{ 
                    minWidth: 30,
                    textAlign: 'center',
                    color: brandColors.sienna,
                    fontWeight: 500,
                  }}
                >
                  {item.quantity}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                  sx={{ 
                    color: brandColors.terracotta,
                    '&:hover': {
                      backgroundColor: 'rgba(217, 116, 73, 0.08)',
                    }
                  }}
                >
                  <AddIcon />
                </IconButton>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    ml: 'auto',
                    color: brandColors.sienna,
                    fontWeight: 500,
                  }}
                >
                  Subtotal: {item.unitPrice.currency} {(item.unitPrice.amount * item.quantity).toFixed(2)}
                </Typography>
              </Box>
              {!item.isInStock && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: '#D32F2F',
                    display: 'block',
                    mt: spacing.xs / 8,
                  }}
                >
                  Out of stock
                </Typography>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: spacing.md / 8, borderColor: brandColors.mediumGray }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: spacing.md / 8 }}>
        <Typography 
          variant="h6"
          sx={{ 
            color: brandColors.sienna,
            fontWeight: 600,
          }}
        >
          Total:
        </Typography>
        <Typography 
          variant="h6"
          sx={{ 
            color: brandColors.terracotta,
            fontWeight: 600,
          }}
        >
          {total.currency} {total.amount.toFixed(2)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={onCheckout}
        disabled={items.some((item) => !item.isInStock)}
        sx={{
          backgroundColor: brandColors.terracotta,
          color: brandColors.white,
          py: spacing.sm / 8,
          fontSize: '1rem',
          fontWeight: 500,
          '&:hover': {
            backgroundColor: brandColors.sienna,
          },
          '&.Mui-disabled': {
            backgroundColor: brandColors.mediumGray,
            color: brandColors.darkGray,
          }
        }}
      >
        Checkout
      </Button>
    </Paper>
  );
}
