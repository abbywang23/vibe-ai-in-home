import { Box, Container, Typography, Button, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { brandColors, spacing } from '../theme/brandTheme';

export default function HomePage() {
  const navigate = useNavigate();

  // Features list matching the UI design
  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      step: 'Step 1',
      title: 'Smart Upload',
      description: 'Upload your room photo. Our AI instantly detects room type, dimensions, and existing furniture.',
    },
    {
      icon: <CameraAltIcon sx={{ fontSize: 40 }} />,
      step: 'Step 2',
      title: 'Define Your Vision',
      description: 'Choose your style and budget. AI suggests furniture that matches your preferences.',
    },
    {
      icon: <VisibilityIcon sx={{ fontSize: 40 }} />,
      step: 'Step 3',
      title: 'See & Refine',
      description: 'View your redesigned room. Swap items, adjust positions, and purchase when ready.',
    },
  ];

  const handleGetStarted = () => {
    navigate('/planner');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: brandColors.white }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          py: spacing.xxxl / 8,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: '800px', mx: 'auto' }}>
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                mb: spacing.md / 8,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
              }}
            >
              Transform Your Space with AI-Powered Interior Design
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                color: brandColors.darkGray,
                mb: spacing.xl / 8,
                fontWeight: 400,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
              }}
            >
              Upload a photo of your room and let our AI create stunning furniture arrangements 
              tailored to your style and budget.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                mt: spacing.lg / 8,
                px: spacing.xl / 8,
                py: spacing.md / 8,
                fontSize: '1.1rem',
                backgroundColor: brandColors.terracotta,
                '&:hover': {
                  backgroundColor: brandColors.sienna,
                }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Container>

        {/* Decorative background */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: -1,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              top: '25%',
              left: '25%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              backgroundColor: brandColors.terracotta,
              opacity: 0.05,
              filter: 'blur(60px)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '25%',
              right: '25%',
              width: '400px',
              height: '400px',
              borderRadius: '50%',
              backgroundColor: brandColors.sienna,
              opacity: 0.05,
              filter: 'blur(60px)',
            }}
          />
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: spacing.xxxl / 8, backgroundColor: brandColors.cream, borderTop: `1px solid ${brandColors.mediumGray}` }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            sx={{ 
              textAlign: 'center',
              mb: spacing.xl / 8,
              color: brandColors.sienna,
              fontWeight: 600,
            }}
          >
            How It Works
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid size={{ xs: 12, md: 4 }} key={index}>
                <Paper
                  elevation={0}
                  sx={{
                    p: spacing.lg / 8,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    backgroundColor: 'transparent',
                    border: 'none',
                  }}
                >
                  <Box 
                    sx={{ 
                      color: brandColors.terracotta, 
                      mb: spacing.md / 8,
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: `${brandColors.terracotta}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: brandColors.darkGray,
                      mb: spacing.xs / 8,
                      fontSize: '0.875rem',
                    }}
                  >
                    {feature.step}
                  </Typography>
                  <Typography 
                    variant="h5" 
                    gutterBottom
                    sx={{ 
                      color: brandColors.sienna,
                      fontWeight: 600,
                      mb: spacing.sm / 8,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: brandColors.darkGray,
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: spacing.xxxl / 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              gutterBottom
              sx={{ 
                color: brandColors.sienna,
                mb: spacing.md / 8,
                fontWeight: 600,
              }}
            >
              Ready to Transform Your Space?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: brandColors.darkGray,
                mb: spacing.xl / 8,
                fontSize: '1.1rem',
              }}
            >
              Join thousands of homeowners who have redesigned their rooms with AI
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForwardIcon />}
              sx={{ 
                px: spacing.xl / 8,
                py: spacing.md / 8,
                fontSize: '1.1rem',
                backgroundColor: brandColors.terracotta,
                '&:hover': {
                  backgroundColor: brandColors.sienna,
                }
              }}
            >
              Start Designing Now
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
