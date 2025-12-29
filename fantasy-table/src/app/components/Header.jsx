'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import Box from '@mui/material/Box';

const Header = () => {
  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <SportsSoccerIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Fantasy Football Dashboard
        </Typography>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" color="inherit">
            Season 25/26
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
