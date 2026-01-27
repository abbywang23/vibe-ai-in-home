import { Box, Container, Typography, Button, Paper, Grid, Card, CardMedia, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { brandColors, spacing } from '../theme/brandTheme';

export default function HomePage() {
  const navigate = useNavigate();

  // AI-generated room examples for instant engagement
  const aiExamples = [
    {
      title: 'Modern Living Room',
      before: '/assets/livingroom.jpg',
      after: '/assets/livingroom02.jpg',
      description: 'AI transformed this space with contemporary furniture',
    },
    {
      title: 'Cozy Bedroom',
      before: '/assets/livingroom.jpg',
      after: '/assets/livingroom02.jpg', 
      description: 'Warm, inviting bedroom design by AI',
    },
    {
      title: 'Minimalist Office',
      before: '/assets/livingroom.jpg',
      after: '/assets/livingroom02.jpg',
      description: 'Clean, productive workspace created by AI',
    },
  ];

  const handleQuickUpload = () => {
    // Navigate directly to planner with image upload focus
    navigate('/planner?tab=image&quick=true');
  };

  const handleTryAI = () => {
    // Navigate to AI-guided setup
    navigate('/planner?mode=ai-guided');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: brandColors.white }}>
      <Container maxWidth="lg" sx={{ py: spacing.xxxl / 8 }}>
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: spacing.xxxl / 8 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom
            sx={{ 
              color: brandColors.sienna,
              mb: spacing.md / 8,
            }}
          >
            Castlery Furniture Planner
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              color: brandColors.darkGray,
              mb: spacing.xl / 8,
              fontWeight: 400,
            }}
          >
            Design your perfect room with AI-powered recommendations
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/planner')}
            sx={{ 
              mt: spacing.lg / 8,
              px: spacing.xl / 8,
              py: spacing.sm / 8,
              fontSize: '1.1rem',
              backgroundColor: brandColors.terracotta,
              '&:hover': {
                backgroundColor: brandColors.sienna,
              }
            }}
          >
            Start Planning
          </Button>
        </Box>

        {/* Features Grid */}
        <Grid container spacing={3}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                elevation={0}
                sx={{
                  p: spacing.lg / 8,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  backgroundColor: brandColors.cream,
                  border: `1px solid ${brandColors.mediumGray}`,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 12px rgba(158, 92, 63, 0.15)',
                  }
                }}
              >
                <Box sx={{ color: brandColors.terracotta, mb: spacing.sm / 8 }}>
                  {feature.icon}
                </Box>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    color: brandColors.sienna,
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ color: brandColors.darkGray }}
                >
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* How It Works Section */}
        <Box sx={{ mt: spacing.xxxl / 8, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{ 
              color: brandColors.sienna,
              mb: spacing.xl / 8,
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={4} sx={{ mt: spacing.sm / 8 }}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: spacing.lg / 8,
                  backgroundColor: brandColors.lightGray,
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: brandColors.terracotta,
                    fontWeight: 600,
                    mb: spacing.sm / 8,
                  }}
                >
                  1. Configure
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ color: brandColors.darkGray }}
                >
                  Enter your room dimensions and select room type
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: spacing.lg / 8,
                  backgroundColor: brandColors.lightGray,
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: brandColors.terracotta,
                    fontWeight: 600,
                    mb: spacing.sm / 8,
                  }}
                >
                  2. Get Recommendations
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ color: brandColors.darkGray }}
                >
                  Set your budget and preferences, let AI suggest furniture
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: spacing.lg / 8,
                  backgroundColor: brandColors.lightGray,
                  borderRadius: 2,
                  height: '100%',
                }}
              >
                <Typography 
                  variant="h5" 
                  gutterBottom
                  sx={{ 
                    color: brandColors.terracotta,
                    fontWeight: 600,
                    mb: spacing.sm / 8,
                  }}
                >
                  3. Visualize & Shop
                </Typography>
                <Typography 
                  variant="body1"
                  sx={{ color: brandColors.darkGray }}
                >
                  See your design in 2D/3D and add items to cart
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
