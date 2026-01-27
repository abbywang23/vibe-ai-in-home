import { createTheme } from '@mui/material/styles';

// Brand Colors from demo UI design system
export const brandColors = {
  // Primary colors (from demo UI)
  background: '#FBF9F4',      // rgba(251, 249, 244, 1.00)
  foreground: '#3C101E',      // rgba(60, 16, 30, 1.00)
  primary: '#844025',         // rgba(132, 64, 37, 1.00)
  primaryForeground: '#F6F3E7', // rgba(246, 243, 231, 1.00)
  
  // Secondary colors
  secondary: '#D25C1B',       // rgba(210, 92, 27, 1.00)
  secondaryForeground: '#F6F3E7',
  
  // Accent
  accent: '#D25C1B',
  accentForeground: '#F6F3E7',
  
  // Muted
  muted: '#BEBEBE',           // rgba(190, 190, 190, 1.00)
  mutedForeground: '#A59198', // rgba(165, 145, 152, 1.00)
  
  // Card
  card: '#FBF9F4',
  cardForeground: '#3C101E',
  
  // Border and input
  border: '#BEBEBE',
  input: '#FBF9F4',
  ring: '#844025',
  
  // Destructive
  destructive: '#B3261E',     // rgba(179, 38, 30, 1.00)
  destructiveForeground: '#FFFFFF',
  
  // Legacy compatibility (mapped to new colors)
  sienna: '#844025',
  terracotta: '#D25C1B',
  cream: '#F6F3E7',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  mediumGray: '#BEBEBE',
  darkGray: '#A59198',
  black: '#3C101E',
};

// Typography - Aime (Display) and Sanomat Sans (Body) from demo UI
export const typography = {
  display: {
    fontFamily: 'aime, "Playfair Display", serif',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    }
  },
  body: {
    fontFamily: 'sanomat-sans, "Inter", "Helvetica", "Arial", sans-serif',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    }
  },
  sizes: {
    h1: '34px',
    h2: '32px',
    h3: '28px',
    h4: '22px',
    h5: '18px',
    base: '18px',
    label: '16px',
    caption: '14px',
    small: '12px',
    button: '14px',
  }
};

// Spacing scale (in pixels)
export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
  xxxl: 80,
  xxxxl: 96,
};

// Create Material-UI theme matching demo UI
export const brandTheme = createTheme({
  palette: {
    primary: {
      main: brandColors.primary,
      light: brandColors.primaryForeground,
      dark: brandColors.sienna,
      contrastText: brandColors.primaryForeground,
    },
    secondary: {
      main: brandColors.secondary,
      light: brandColors.secondaryForeground,
      contrastText: brandColors.secondaryForeground,
    },
    background: {
      default: brandColors.background,
      paper: brandColors.card,
    },
    text: {
      primary: brandColors.foreground,
      secondary: brandColors.mutedForeground,
    },
    error: {
      main: brandColors.destructive,
    },
    success: {
      main: '#4CAF50',
    },
    divider: brandColors.border,
  },
  typography: {
    fontFamily: typography.body.fontFamily,
    h1: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.h1,
      lineHeight: 1.5,
    },
    h2: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.h2,
      lineHeight: 1.5,
    },
    h3: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.h3,
      lineHeight: 1.5,
    },
    h4: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.h4,
      lineHeight: 1.5,
    },
    h5: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.h5,
      lineHeight: 1.5,
      letterSpacing: '-0.54px',
    },
    body1: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.base,
      lineHeight: 1.5,
    },
    body2: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.regular,
      fontSize: typography.sizes.caption,
      lineHeight: 1.5,
    },
    button: {
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.weights.regular,
      fontSize: typography.sizes.button,
      textTransform: 'uppercase',
      letterSpacing: '2.8px',
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: typography.display.fontFamily,
      fontSize: typography.sizes.caption,
      lineHeight: 1.5,
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '12px 24px',
          textTransform: 'uppercase',
          letterSpacing: '2.8px',
          fontWeight: typography.body.weights.regular,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: brandColors.primary,
          color: brandColors.primaryForeground,
          '&:hover': {
            backgroundColor: brandColors.sienna,
          },
        },
        containedSecondary: {
          backgroundColor: brandColors.secondary,
          color: brandColors.secondaryForeground,
          '&:hover': {
            backgroundColor: '#B84E17',
          },
        },
        outlined: {
          borderColor: brandColors.border,
          color: brandColors.foreground,
          '&:hover': {
            borderColor: brandColors.primary,
            backgroundColor: 'rgba(132, 64, 37, 0.04)',
          },
        },
        text: {
          color: brandColors.mutedForeground,
          '&:hover': {
            backgroundColor: 'rgba(132, 64, 37, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: brandColors.input,
            '& fieldset': {
              borderColor: brandColors.border,
            },
            '&:hover fieldset': {
              borderColor: brandColors.mutedForeground,
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.ring,
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          border: `1px solid ${brandColors.border}`,
          backgroundColor: brandColors.card,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: brandColors.card,
        },
        elevation0: {
          boxShadow: 'none',
          border: `1px solid ${brandColors.border}`,
        },
        elevation1: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        filled: {
          backgroundColor: brandColors.cream,
          color: brandColors.primary,
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontFamily: typography.display.fontFamily,
          fontSize: typography.sizes.caption,
        },
      },
    },
  },
});

export default brandTheme;
