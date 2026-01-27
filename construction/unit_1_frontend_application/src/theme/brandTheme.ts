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
  
  // Compatibility mappings for existing components
  primary: '#A84025',           // Maps to terracotta500
  primaryForeground: '#FFFFFF', // Maps to white
  secondary: '#D25C36',         // Maps to burntOrange500
  secondaryForeground: '#FFFFFF',
  background: '#FFFFFF',        // Maps to white
  foreground: '#2C1B1E',        // Maps to primaryText
  card: '#FFFFFF',              // Maps to white
  border: '#E0E0E0',            // Maps to mediumGray
  input: '#FFFFFF',             // Maps to white
  muted: '#E0E0E0',             // Maps to mediumGray
  mutedForeground: '#757575',   // Maps to darkGray
  destructive: '#d32f2f',       // Standard error color
  accent: '#D25C36',            // Maps to burntOrange500
};

// Typography - Google Fonts: Playfair Display (Display) and Inter (Body)
export const typography = {
  display: {
    fontFamily: '"Playfair Display", serif',
    weights: {
      regular: 400,
      medium: 500,
      bold: 700,
    }
  },
  body: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
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
      paper: brandColors.white,
    },
    text: {
      primary: brandColors.primaryText,
      secondary: brandColors.darkGray,
    },
    error: {
      main: '#d32f2f',
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
    divider: brandColors.mediumGray,
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
            borderRadius: 8,
            backgroundColor: brandColors.white,
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
          boxShadow: 'none',
          border: `1px solid ${brandColors.mediumGray}`,
          backgroundColor: brandColors.white,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: brandColors.white,
        },
        elevation0: {
          boxShadow: 'none',
          border: `1px solid ${brandColors.mediumGray}`,
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
          color: brandColors.terracotta500,
        },
      },
    },
  },
});

export default brandTheme;
