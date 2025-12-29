'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Container from '@mui/material/Container';
import SeriePage from './components/SeriePage';
import FplPage from './components/FplPage';
import CompleteTable from './components/CompleteTable';
import Header from './components/Header';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ paddingTop: '16px' }}>
      {value === index && children}
    </div>
  );
}

export default function Home() {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header />
      <Container maxWidth="lg">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            <Tab label="Combined" />
            <Tab label="Premier League" />
            <Tab label="Serie A" />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <CompleteTable />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <FplPage />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          <SeriePage />
        </TabPanel>
      </Container>
    </Box>
  );
}
