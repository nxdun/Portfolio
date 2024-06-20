

import { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
export const ThemeContext = createContext();

const lightTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#2C7A7B', // Teal
    },
    secondary: {
      main: '#FF6F61', // Coral
    },
    background: {
      default: '#FAFAFA', // Light Grey
      paper: '#FFFFFF', // White
    },
    text: {
      primary: '#333333', // Dark Grey
      secondary: '#666666', // Medium Grey
    },
  },
};



const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90E0EF', // Light Teal
    },
    secondary: {
      main: '#0077B6', // 
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#E0E0E0',
      secondary: '#B0B0B0',
    },
  },
};


export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('dark');

  const theme = useMemo(() => createTheme(mode === 'light' ? lightTheme : darkTheme), [mode]);

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
//validate props
ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};