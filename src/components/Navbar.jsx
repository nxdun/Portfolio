import { useContext, useState, useEffect } from 'react';
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
import { useTheme } from '@mui/material/styles';

// Styled component for the divider
const FancyDivider = styled.div`
  height: 40px;
  width: 2px;
  background: linear-gradient(to bottom, #C8BFC7, #8A7E72);
  margin: 0 16px;
`;

// Styled component for the AppBar with blur effect and gradient background
const AnimatedAppBar = styled(AppBar)`
  
  backdrop-filter: blur(10px);
  box-shadow: none;
  z-index: 1;
  margin: 10px 20px ;
  border-radius: 15px;
  padding: 10px; //set vertical size
  width: calc(100% - 500px);
  max-width: 1200px;
  transition: all 0.3s ease-in-out;
 
`;

// Styled component for the navigation links
const NavLink = styled(Link)`
  text-decoration: none;
  padding: 0 8px;
  color: inherit;
  position: relative;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.palette.accent.main};
  }

  &:after {
    content: '';
    display: block;
    width: 0;
    height: 2px;
    background: ${({ theme }) => theme.palette.accent.main};
    transition: width 0.3s;
    position: absolute;
    bottom: -4px;
    left: 0;
  }

  &:hover:after {
    width: 100%;
  }
`;

// Styled component for the drawer content
const DrawerContent = styled(List)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  animation: fadeIn 0.5s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

// Styled component for the animated switch
const AnimatedSwitch = styled(Switch)`
  && {
    transition: transform 0.3s ease-in-out;
  }

  &&:hover {
    transform: scale(1.1);
  }
`;

const Navbar = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useContext(ThemeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle scroll event to show/hide navbar based on scroll position
  const handleScroll = () => {
    const currentScrollPos = window.scrollY;
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

  // Drawer component with navigation links
  const drawer = (
    <DrawerContent>
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
    </DrawerContent>
  );

  return (
    <>
      <AnimatedAppBar
        position="fixed"
        theme={theme}
        style={{ transform: visible ? 'translateY(0)' : 'translateY(-100%)',  }}
      >
        <Toolbar sx={{ paddingLeft: '16px', paddingRight: '16px', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            My Portfolio
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <NavLink to="/" theme={theme}>
              Home
            </NavLink>
            <FancyDivider />
            <NavLink to="/projects" theme={theme}>
              Projects
            </NavLink>
            <FancyDivider />
            <NavLink to="/contact" theme={theme}>
              Contact
            </NavLink>
            <FancyDivider />
            <AnimatedSwitch checked={mode === 'dark'} onChange={toggleTheme} />
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AnimatedAppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
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
