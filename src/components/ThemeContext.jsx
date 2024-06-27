// ThemeContext.jsx
import { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';

export const ThemeContext = createContext();

const commonTypography = {
  fontFamily: 'Inter, sans-serif',
};

const neonDreamLightTheme = {
  palette: {
    mode: 'light',
    primary: { main: '#00f6ff' },
    secondary: { main: '#bf00ff' },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    accent: { main: '#ff0066' },
    highlight: { main: '#00ff66' },
    dark: { main: '#232323' },
  },
  typography: commonTypography,
};

const neonDreamDarkTheme = {
  palette: {
    mode: 'dark',
    primary: { main: '#00f6ff' },
    secondary: { main: '#bf00ff' },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    },
    accent: { main: '#ff0066' },
    highlight: { main: '#00ff66' },
    dark: { main: '#232323' },
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

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
