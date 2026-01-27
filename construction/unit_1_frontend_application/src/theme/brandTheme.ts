import { createTheme } from '@mui/material/styles';

<<<<<<< HEAD
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
=======
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
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
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
<<<<<<< HEAD
      main: brandColors.primary,
      light: brandColors.primaryForeground,
      dark: brandColors.sienna,
      contrastText: brandColors.primaryForeground,
    },
    secondary: {
      main: brandColors.secondary,
      light: brandColors.secondaryForeground,
      contrastText: brandColors.secondaryForeground,
=======
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
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
    },
    background: {
      default: brandColors.background,
      paper: brandColors.card,
    },
    text: {
<<<<<<< HEAD
      primary: brandColors.foreground,
      secondary: brandColors.mutedForeground,
=======
      primary: brandColors.primaryText,
      secondary: brandColors.darkGray,
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
    },
    error: {
      main: brandColors.destructive,
    },
    success: {
<<<<<<< HEAD
      main: '#4CAF50',
=======
      main: brandColors.leafGreen500,
    },
    info: {
      main: brandColors.freshwaterBlue500,
    },
    warning: {
      main: brandColors.burntOrange500,
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
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
<<<<<<< HEAD
          backgroundColor: brandColors.primary,
          color: brandColors.primaryForeground,
=======
          backgroundColor: brandColors.terracotta500,
          color: brandColors.white,
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
          '&:hover': {
            backgroundColor: brandColors.primaryText,
          },
        },
        containedSecondary: {
<<<<<<< HEAD
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
=======
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
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
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
<<<<<<< HEAD
              borderColor: brandColors.ring,
              borderWidth: '2px',
=======
              borderColor: brandColors.terracotta500,
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
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
<<<<<<< HEAD
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
=======
          color: brandColors.terracotta500,
>>>>>>> 15e0fed867648ee45a16db94eea2068bf2036072
        },
      },
    },
  },
});

export default brandTheme;
