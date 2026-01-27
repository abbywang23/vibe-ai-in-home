import { Box, Container, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export default function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 48 }} />,
      title: 'Configure Your Room',
      description: 'Enter room dimensions and select your room type',
    },
    {
      icon: <ChatIcon sx={{ fontSize: 48 }} />,
      title: 'AI Assistant',
      description: 'Get personalized furniture recommendations from AI',
    },
    {
      icon: <ViewInArIcon sx={{ fontSize: 48 }} />,
      title: '2D/3D Visualization',
      description: 'See your room design in 2D or 3D view',
    },
    {
      icon: <ShoppingCartIcon sx={{ fontSize: 48 }} />,
      title: 'Easy Shopping',
      description: 'Add furniture to cart and checkout seamlessly',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
            🏠 Castlery Furniture Planner
          </Typography>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Design your perfect room with AI-powered recommendations
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/planner')}
            sx={{ mt: 4, px: 6, py: 2, fontSize: '1.1rem' }}
          >
            Start Planning
          </Button>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            How It Works
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="primary" gutterBottom>
                1. Configure
              </Typography>
              <Typography variant="body1">
                Enter your room dimensions and select room type
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="primary" gutterBottom>
                2. Get Recommendations
              </Typography>
              <Typography variant="body1">
                Set your budget and preferences, let AI suggest furniture
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="primary" gutterBottom>
                3. Visualize & Shop
              </Typography>
              <Typography variant="body1">
                See your design in 2D/3D and add items to cart
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
