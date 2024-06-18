import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import styled from 'styled-components';

const FancyDivider = styled.div`
  height: 24px;
  width: 2px;
  background: linear-gradient(to bottom, #C8BFC7, #8A7E72);
  margin: 0 16px;
`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        <ListItem button component={Link} to="/" onClick={handleDrawerToggle}>
          <ListItemIcon><HomeIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/about" onClick={handleDrawerToggle}>
          <ListItemIcon><InfoIcon /></ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
        <ListItem button component={Link} to="/projects" onClick={handleDrawerToggle}>
          <ListItemIcon><WorkIcon /></ListItemIcon>
          <ListItemText primary="Projects" />
        </ListItem>
        <ListItem button component={Link} to="/contact" onClick={handleDrawerToggle}>
          <ListItemIcon><ContactMailIcon /></ListItemIcon>
          <ListItemText primary="Contact" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="static" style={{ backgroundColor: '#090302' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: '#C8BFC7' }}>
            My Portfolio
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Typography variant="body1" component={Link} to="/" style={{ color: '#C8BFC7', textDecoration: 'none', padding: '0 8px' }}>
              Home
            </Typography>
            <FancyDivider />
            <Typography variant="body1" component={Link} to="/about" style={{ color: '#C8BFC7', textDecoration: 'none', padding: '0 8px' }}>
              About
            </Typography>
            <FancyDivider />
            <Typography variant="body1" component={Link} to="/projects" style={{ color: '#C8BFC7', textDecoration: 'none', padding: '0 8px' }}>
              Projects
            </Typography>
            <FancyDivider />
            <Typography variant="body1" component={Link} to="/contact" style={{ color: '#C8BFC7', textDecoration: 'none', padding: '0 8px' }}>
              Contact
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" aria-label="open drawer" edge="end" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
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
