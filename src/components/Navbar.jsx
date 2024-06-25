import { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
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

const FancyDivider = styled.div`
  height: 40px;
  width: 2px;
  background: linear-gradient(to bottom, #C8BFC7, #8A7E72);
  margin: 0 16px;
`;



const Background = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: -1;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  // Add any additional styles you want for light/dark mode
  ${({ mode }) => mode === 'dark' && `
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `}
`;

const Navbar = () => {
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleScroll = () => {
    const currentScrollPos = window.pageYOffset;
    const visible = prevScrollPos > currentScrollPos || currentScrollPos < 10;
    setVisible(visible);
    setPrevScrollPos(currentScrollPos);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  });

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

  const navbarAnimation = useSpring({
    transform: visible ? 'translateY(0)' : 'translateY(-100%)',
  });

  return (
    <>
      <animated.div style={navbarAnimation}>
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
      </animated.div>
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
