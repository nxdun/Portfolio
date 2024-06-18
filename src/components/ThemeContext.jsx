import { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import PropTypes from 'prop-types';
export const ThemeContext = createContext();

const lightTheme = {
  palette: {
    mode: 'light',
    primary: {
      main: '#090302',
    },
    secondary: {
      main: '#C8BFC7',
    },
    background: {
      default: '#C8BFC7',
      paper: '#ffffff',
    },
    text: {
      primary: '#090302',
    },
  },
};

const darkTheme = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#C8BFC7',
    },
    secondary: {
      main: '#090302',
    },
    background: {
      default: '#090302',
      paper: '#333333',
    },
    text: {
      primary: '#C8BFC7',
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