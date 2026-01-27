import { createTheme } from '@mui/material/styles';

// Brand Colors from Castlery design system
export const brandColors = {
  // Primary palette
  terracotta500: '#A84025',      // Primary brand color
  primaryText: '#2C1B1E',        // Dark text color
  leafGreen500: '#4D4228',       // Accent green
  
  // Secondary palette
  burntOrange500: '#D25C36',     // Secondary orange
  freshwaterBlue500: '#6A85C1',  // Secondary blue
  
  // Extended neutrals
  cream: '#F5E6D3',
  white: '#FFFFFF',
  lightGray: '#F5F5F5',
  mediumGray: '#E0E0E0',
  darkGray: '#757575',
  black: '#000000',
  
  // Legacy colors (for backward compatibility)
  sienna: '#A84025',
  plum: '#2C1B1E',
  olive: '#4D4228',
  terracotta: '#D25C36',
  slate: '#6A85C1',
};

// Typography - Google Fonts: Playfair Display (Display) and Inter (Body)
export const typography = {
  display: {
    fontFamily: '"Playfair Display", serif',
    weights: {
      bold: 700,
      medium: 500,
      regular: 400,
    }
  },
  body: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    weights: {
      bold: 700,
      medium: 500,
      regular: 400,
    }
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

// Create Material-UI theme
export const brandTheme = createTheme({
  palette: {
    primary: {
      main: brandColors.terracotta500,
      dark: brandColors.primaryText,
      light: brandColors.cream,
      contrastText: brandColors.white,
    },
    secondary: {
      main: brandColors.burntOrange500,
      light: brandColors.freshwaterBlue500,
      dark: brandColors.leafGreen500,
      contrastText: brandColors.white,
    },
    background: {
      default: brandColors.white,
      paper: brandColors.lightGray,
    },
    text: {
      primary: brandColors.primaryText,
      secondary: brandColors.darkGray,
    },
    error: {
      main: '#D32F2F',
    },
    success: {
      main: brandColors.leafGreen500,
    },
    info: {
      main: brandColors.freshwaterBlue500,
    },
    warning: {
      main: brandColors.burntOrange500,
    },
  },
  typography: {
    fontFamily: typography.body.fontFamily,
    h1: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.bold,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.medium,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontFamily: typography.display.fontFamily,
      fontWeight: typography.display.weights.medium,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.weights.bold,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h5: {
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.weights.medium,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.weights.regular,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.weights.regular,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      fontFamily: typography.body.fontFamily,
      fontWeight: typography.body.weights.medium,
      fontSize: '1rem',
      textTransform: 'none',
    },
  },
  spacing: 8,
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: typography.body.weights.medium,
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: brandColors.terracotta500,
          color: brandColors.white,
          '&:hover': {
            backgroundColor: brandColors.primaryText,
          },
        },
        containedSecondary: {
          backgroundColor: brandColors.burntOrange500,
          color: brandColors.white,
          '&:hover': {
            backgroundColor: brandColors.leafGreen500,
          },
        },
        outlined: {
          borderColor: brandColors.terracotta500,
          color: brandColors.terracotta500,
          '&:hover': {
            borderColor: brandColors.primaryText,
            backgroundColor: 'rgba(168, 64, 37, 0.04)',
          },
        },
        text: {
          color: brandColors.terracotta500,
          '&:hover': {
            backgroundColor: 'rgba(168, 64, 37, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 4,
            '& fieldset': {
              borderColor: brandColors.mediumGray,
            },
            '&:hover fieldset': {
              borderColor: brandColors.darkGray,
            },
            '&.Mui-focused fieldset': {
              borderColor: brandColors.terracotta500,
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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
          color: brandColors.terracotta500,
        },
      },
    },
  },
});

export default brandTheme;
