// theme switching

import { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
export const ThemeContext = createContext();

//Inter font
const commonTypography = {
  fontFamily: 'Inter, sans-serif',
};

const neonDreamLightTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#00f6ff', // Neon Blue
    },
    secondary: {
      main: '#bf00ff', // Electric Purple
    },
    background: {
      default: '#FAFAFA', // Light Grey
      paper: '#FFFFFF', // White
    },
    text: {
      primary: '#333333', // Dark Grey
      secondary: '#666666', // Medium Grey
    },
    accent: {
      main: '#ff0066', // Hot Pink
    },
    highlight: {
      main: '#00ff66', // Lime Green
    },
    dark: {
      main: '#232323', // Dark Slate
    },
  },
  typography: commonTypography,
};

const neonDreamDarkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#00f6ff', // Neon Blue
    },
    secondary: {
      main: '#bf00ff', // Electric Purple
    },
    background: {
      default: '#121212', // Dark Background
      paper: '#1E1E1E', // Darker Background
    },
    text: {
      primary: '#E0E0E0', // Light Grey
      secondary: '#B0B0B0', // Medium Grey
    },
    accent: {
      main: '#ff0066', // Hot Pink
    },
    highlight: {
      main: '#00ff66', // Lime Green
    },
    dark: {
      main: '#232323', // Dark Slate
    },
  },
  typography: commonTypography,
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => createTheme(mode === 'light' ? neonDreamLightTheme : neonDreamDarkTheme), [mode]);

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Validate props
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
