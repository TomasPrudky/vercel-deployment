'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const ThemeContext = createContext();

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  useEffect(() => {
    // Load saved preference from localStorage
    const savedMode = localStorage.getItem('themeMode');
    if (savedMode) {
      setMode(savedMode);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setMode('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // Light mode
            primary: { main: '#1976d2' },
            secondary: { main: '#dc004e' },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff'
            }
          }
        : {
            // Dark mode
            primary: { main: '#90caf9' },
            secondary: { main: '#f48fb1' },
            background: {
              default: '#121212',
              paper: '#1e1e1e'
            }
          })
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: mode === 'light' ? '#1976d2' : '#1e1e1e',
            color: '#ffffff',
            fontWeight: 'bold'
          }
        }
      }
    }
  }), [mode]);

  const value = useMemo(() => ({
    mode,
    toggleTheme,
    isDark: mode === 'dark'
  }), [mode]);

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
