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
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Shopping Cart
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your cart is empty
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Shopping Cart ({items.length} items)
      </Typography>

      <List>
        {items.map((item) => (
          <ListItem
            key={item.itemId}
            secondaryAction={
              <IconButton edge="end" onClick={() => onRemove(item.itemId)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <Box sx={{ width: '100%' }}>
              <ListItemText
                primary={item.productName}
                secondary={`${item.unitPrice.currency} ${item.unitPrice.amount.toFixed(2)}`}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(item.itemId, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                >
                  <RemoveIcon />
                </IconButton>
                <Typography variant="body2">{item.quantity}</Typography>
                <IconButton
                  size="small"
                  onClick={() => onUpdateQuantity(item.itemId, item.quantity + 1)}
                >
                  <AddIcon />
                </IconButton>
                <Typography variant="body2" sx={{ ml: 'auto' }}>
                  Subtotal: {item.unitPrice.currency} {(item.unitPrice.amount * item.quantity).toFixed(2)}
                </Typography>
              </Box>
              {!item.isInStock && (
                <Typography variant="caption" color="error">
                  Out of stock
                </Typography>
              )}
            </Box>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ my: 2 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Total:</Typography>
        <Typography variant="h6">
          {total.currency} {total.amount.toFixed(2)}
        </Typography>
      </Box>

      <Button
        variant="contained"
        fullWidth
        onClick={onCheckout}
        disabled={items.some((item) => !item.isInStock)}
      >
        Checkout
      </Button>
    </Paper>
  );
}
