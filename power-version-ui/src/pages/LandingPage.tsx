import { Box, Container, Typography, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ViewInArIcon from '@mui/icons-material/ViewInAr';

export default function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <HomeIcon sx={{ fontSize: 48 }} />,
      title: '上传房间照片',
      description: '轻松上传您的房间照片,开始您的设计之旅',
    },
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 48 }} />,
      title: 'AI 智能推荐',
      description: 'AI 分析您的空间,推荐最适合的家具搭配',
    },
    {
      icon: <ViewInArIcon sx={{ fontSize: 48 }} />,
      title: '实时可视化',
      description: '实时预览家具在您房间中的效果',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h1" component="h1" gutterBottom sx={{ mb: 3 }}>
            AI 驱动的家居设计
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}>
            让 AI 帮助您打造梦想中的家居空间
            <br />
            智能推荐 · 实时预览 · 一键购买
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/design')}
            sx={{ px: 6, py: 2 }}
          >
            开始设计
          </Button>
        </Box>

        {/* Features */}
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  p: 3,
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {feature.icon}
                </Box>
                <CardContent>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2024 Vibe AI In-Home. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
