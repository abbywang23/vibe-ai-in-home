import { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  IconButton,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ShareIcon from '@mui/icons-material/Share';
import DownloadIcon from '@mui/icons-material/Download';

interface FinalReviewStepProps {
  onBack: () => void;
}

export default function FinalReviewStep({ onBack }: FinalReviewStepProps) {
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleAddToCart = (productId: string) => {
    const product = state.renderingResult?.products.find((p) => p.id === productId);
    if (product) {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    }
  };

  const handleAddAllToCart = () => {
    state.renderingResult?.products.forEach((product) => {
      dispatch({ type: 'ADD_TO_CART', payload: product });
    });
  };

  const totalPrice = state.renderingResult?.products.reduce((sum, p) => sum + p.price, 0) || 0;

  return (
    <Box>
      {/* Rendered Image */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          {state.renderingResult?.imageUrl ? (
            <Box sx={{ position: 'relative' }}>
              <img
                src={state.renderingResult.imageUrl}
                alt="AI Rendered Room"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 600,
                  objectFit: 'contain',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  display: 'flex',
                  gap: 1,
                }}
              >
                <IconButton
                  sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
                >
                  <FavoriteIcon />
                </IconButton>
                <IconButton
                  sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
                >
                  <ShareIcon />
                </IconButton>
                <IconButton
                  sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'background.paper' } }}
                >
                  <DownloadIcon />
                </IconButton>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="body1" color="text.secondary">
                暂无渲染结果
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Product List */}
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4">推荐的家具</Typography>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={handleAddAllToCart}
            >
              全部加入购物车
            </Button>
          </Box>

          <Grid container spacing={3}>
            {state.renderingResult?.products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        暂无图片
                      </Typography>
                    )}
                  </Box>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Chip label={product.category} size="small" sx={{ mb: 1 }} />
                    <Typography variant="h5" color="primary" gutterBottom>
                      ${product.price.toFixed(2)}
                    </Typography>
                    {product.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {product.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      尺寸: {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height} cm
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => handleAddToCart(product.id)}
                      >
                        加入购物车
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Summary */}
          <Box>
            <Typography variant="h5" gutterBottom>
              订单摘要
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body1">商品数量:</Typography>
              <Typography variant="body1">{state.renderingResult?.products.length || 0}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">总计:</Typography>
              <Typography variant="h6" color="primary">
                ${totalPrice.toFixed(2)}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button variant="outlined" onClick={onBack} size="large">
              返回修改
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  dispatch({ type: 'RESET_STATE' });
                  navigate('/');
                }}
                size="large"
              >
                开始新设计
              </Button>
              <Button
                variant="contained"
                startIcon={<ShoppingCartIcon />}
                onClick={() => navigate('/cart')}
                size="large"
              >
                查看购物车 ({state.cart.length})
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
