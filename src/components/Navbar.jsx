import { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import WorkIcon from '@mui/icons-material/Work';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { ThemeContext } from './ThemeContext';
import styled from 'styled-components';
import tealmodeSvg from '../assets/waveNavbarTealMode.svg';

const FancyDivider = styled.div`
  height: 40px;
  width: 2px;
  background: linear-gradient(to bottom, #C8BFC7, #8A7E72);
  margin: 0 16px;
`;

const darkmodeSvg = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNDQwIDMyMCI+PHBhdGggZmlsbD0iIzJDN0E3QiIgZmlsbC1vcGFjaXR5PSIxLjIiIGQ9Ik0wLDE2MEwyNCwxNjUuM0M0OCwxNzEsOTYsMTgxLDE0NCwxODYuN0MxOTIsMTkyLDI0MCwxOTIsMjg4LDE5Ny4zQzMzNiwyMDMsMzg0LDIxMyw0MzIsMTkyQzQ4MCwxNzEsNTI4LDExNyw1NzYsOTAuN0M2MjQsNjQsNjcyLDY0LDcyMCw4NS4zQzc2OCwxMDcsODE2LDE0OSw4NjQsMTQ5LjNDOTEyLDE0OSw5NjAsMTA3LDEwMDgsMTI4QzEwNTYsMTQ5LDExMDQsMjM1LDExNTIsMjQ1LjNDMTIwMCwyNTYsMTI0OCwxOTIsMTI5NiwxNTQuN0MxMzQ0LDExNywxMzkyLDEwNywxNDE2LDEwMS4zTDE0NDAsOTZMMTQ0MCwwTDE0MTYsMEMxMzkyLDAsMTM0NCwwLDEyOTYsMEMxMjQ4LDAsMTIwMCwwLDExNTIsMEMxMTA0LDAsMTA1NiwwLDEwMDgsMEM5NjAsMCw5MTIsMCw4NjQsMEM4MTYsMCw3NjgsMCw3MjAsMEM2NzIsMCw2MjQsMCw1NzYsMEM1MjgsMCw0ODAsMCw0MzIsMEMzODQsMCwzMzYsMCwyODgsMEMyNDAsMCwxOTIsMCwxNDQsMEM5NiwwLDQ4LDAsMjQsMEwwLDBaIj48L3BhdGg+PC9zdmc+';

const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  z-index: -1;
  background: url(${({ mode }) => mode === 'dark' 
    ? darkmodeSvg
    :tealmodeSvg });
  background-position: center;
  background-size: cover;
`;

const Navbar = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem button component={Link} to="/" onClick={handleDrawerToggle} disabled={location.pathname === '/'}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/about" onClick={handleDrawerToggle} disabled={location.pathname === '/about'}>
          <ListItemIcon><InfoIcon /></ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
        <ListItem button component={Link} to="/projects" onClick={handleDrawerToggle} disabled={location.pathname === '/projects'}>
          <ListItemIcon><WorkIcon /></ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItem>
        <ListItem button component={Link} to="/contact" onClick={handleDrawerToggle} disabled={location.pathname === '/contact'}>
          <ListItemIcon><ContactMailIcon /></ListItemIcon>
          <ListItemText primary="Contact" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'transparent', boxShadow: 'none', zIndex: 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            My Portfolio
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Typography 
              variant="body1" 
              component={location.pathname === '/' ? 'span' : Link} 
              to="/" 
              style={{ 
                textDecoration: 'none', 
                padding: '0 8px', 
                color: location.pathname === '/' ? 'grey' : 'inherit',
                pointerEvents: location.pathname === '/' ? 'none' : 'auto'
              }}
            >
              Home
            </Typography>
            <FancyDivider />
            <Typography 
              variant="body1" 
              component={location.pathname === '/about' ? 'span' : Link} 
              to="/about" 
              style={{ 
                textDecoration: 'none', 
                padding: '0 8px', 
                color: location.pathname === '/about' ? 'grey' : 'inherit',
                pointerEvents: location.pathname === '/about' ? 'none' : 'auto'
              }}
            >
              About
            </Typography>
            <FancyDivider />
            <Typography 
              variant="body1" 
              component={location.pathname === '/projects' ? 'span' : Link} 
              to="/projects" 
              style={{ 
                textDecoration: 'none', 
                padding: '0 8px', 
                color: location.pathname === '/projects' ? 'grey' : 'inherit',
                pointerEvents: location.pathname === '/projects' ? 'none' : 'auto'
              }}
            >
              Projects
            </Typography>
            <FancyDivider />
            <Typography 
              variant="body1" 
              component={location.pathname === '/contact' ? 'span' : Link} 
              to="/contact" 
              style={{ 
                textDecoration: 'none', 
                padding: '0 8px', 
                color: location.pathname === '/contact' ? 'grey' : 'inherit',
                pointerEvents: location.pathname === '/contact' ? 'none' : 'auto'
              }}
            >
              Contact
            </Typography>
            <FancyDivider />
            <Switch checked={mode === 'dark'} onChange={toggleTheme} />
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Background mode={mode} />
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;