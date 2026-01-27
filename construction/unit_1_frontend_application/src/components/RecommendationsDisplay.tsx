import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Divider,
} from '@mui/material';
import { Recommendation, Money, RoomConfig } from '../types';

interface RecommendationsDisplayProps {
  recommendations: Recommendation[];
  totalPrice: number;
  budgetExceeded: boolean;
  budget?: Money;
  roomConfig: RoomConfig;
  onStartOver: () => void;
}

const RecommendationsDisplay = ({
  recommendations,
  totalPrice,
  budgetExceeded,
  budget,
  roomConfig,
  onStartOver,
}: RecommendationsDisplayProps) => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          🎉 推荐结果 / Recommendations
        </Typography>
        <Typography variant="body2" color="text.secondary">
          房间: {roomConfig.roomType} ({roomConfig.dimensions.length} × {roomConfig.dimensions.width} × {roomConfig.dimensions.height} {roomConfig.dimensions.unit})
        </Typography>
      </Paper>

      {budgetExceeded && budget && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          ⚠️ 总价超出预算 / Total price exceeds budget: SGD {totalPrice} &gt; SGD {budget.amount}
        </Alert>
      )}

      {!budgetExceeded && budget && (
        <Alert severity="success" sx={{ mb: 3 }}>
          ✓ 在预算范围内 / Within budget: SGD {totalPrice} / SGD {budget.amount}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          总价 / Total Price: SGD {totalPrice.toFixed(2)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          共 {recommendations.length} 件家具 / {recommendations.length} furniture items
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {recommendations.map((rec, index) => (
          <Grid item xs={12} md={6} key={rec.productId}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {index + 1}. {rec.productName}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    价格 / Price
                  </Typography>
                  <Typography variant="h6" color="primary">
                    SGD {rec.price.toFixed(2)}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    位置 / Position
                  </Typography>
                  <Typography variant="body1">
                    ({rec.position.x.toFixed(2)}, {rec.position.y.toFixed(2)}, {rec.position.z.toFixed(2)})
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    旋转角度 / Rotation
                  </Typography>
                  <Typography variant="body1">
                    {rec.rotation}°
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    推荐理由 / Reasoning
                  </Typography>
                  <Typography variant="body2">
                    {rec.reasoning}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {recommendations.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            😔 没有找到合适的推荐
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            请尝试调整预算或选择不同的家具类别
          </Typography>
        </Paper>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onStartOver}
        >
          重新开始 / Start Over
        </Button>
      </Box>
    </Box>
  );
};

export default RecommendationsDisplay;
