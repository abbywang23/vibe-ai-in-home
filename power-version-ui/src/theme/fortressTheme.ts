import { createTheme } from '@mui/material/styles';

// Fortress 2.0 Design System Colors
const colors = {
  primary: {
    main: 'rgba(132, 64, 37, 1.00)',      // 主色调 - 深棕色
    light: 'rgba(210, 92, 27, 1.00)',     // 次要色 - 橙棕色
    dark: 'rgba(60, 16, 30, 1.00)',       // 深紫红
    contrastText: 'rgba(246, 243, 231, 1.00)', // 主色调文字
  },
  secondary: {
    main: 'rgba(210, 92, 27, 1.00)',      // 次要色 - 橙棕色
    contrastText: 'rgba(246, 243, 231, 1.00)',
  },
  background: {
    default: 'rgba(251, 249, 244, 1.00)', // 应用背景 - 米白色
    paper: 'rgba(251, 249, 244, 1.00)',   // 卡片背景
  },
  text: {
    primary: 'rgba(60, 16, 30, 1.00)',    // 主要文字 - 深紫红
    secondary: 'rgba(165, 145, 152, 1.00)', // 次要文字
    disabled: 'rgba(190, 190, 190, 1.00)', // 禁用文字
  },
  error: {
    main: 'rgba(179, 38, 30, 1.00)',      // 危险操作 - 红色
    contrastText: 'rgba(255, 255, 255, 1.00)',
  },
  divider: 'rgba(190, 190, 190, 1.00)',   // 边框
};

// Create Fortress 2.0 theme
export const fortressTheme = createTheme({
  palette: colors,
  typography: {
    fontFamily: "'Aime', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontSize: '34px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    h2: {
      fontSize: '32px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    h3: {
      fontSize: '28px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    h4: {
      fontSize: '22px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '-0.54px',
    },
    body1: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
      textTransform: 'uppercase',
      letterSpacing: '2.8px',
    },
  },
  shape: {
    borderRadius: 8, // --radius: 8px
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'uppercase',
          letterSpacing: '2.8px',
          fontSize: '14px',
          fontWeight: 400,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});
