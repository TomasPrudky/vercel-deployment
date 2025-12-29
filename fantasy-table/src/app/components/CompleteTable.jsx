'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';
import { getErrorMessage, logError } from '../utils/errorHandler';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

const getMedal = (index, totalPlayers) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  if (index === totalPlayers - 1) return "⚰️";
  return index + 1;
};

export default function CompleteTable() {
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchData = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const [serieRes, fplRes] = await Promise.all([
        axios.get(`${apiUrl}/api/serie-a/`),
        axios.get(`${apiUrl}/api/fpl/`)
      ]);

      const combined = players.map(p => {
        const seriePlayer = serieRes.data?.data.find(item => item.id === p.sourceB);
        const fplPlayer = fplRes.data?.standings?.results.find(item => item.id === p.sourceA);

        let seriePoints = seriePlayer?.points || 0;
        if (p.id === BONUS_PLAYER_ID) seriePoints += BONUS_POINTS;

        const totalPoints = seriePoints + (fplPlayer?.total || 0);

        return { ...p, totalPoints };
      });

      combined.sort((a, b) => b.totalPoints - a.totalPoints);

      setPlayersData(combined);
      setLastUpdated(new Date());
    } catch (err) {
      logError('CompleteTable:fetchData', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    intervalRef.current = setInterval(() => {
      fetchData(true); // Background refresh
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  if (loading) return <LoadingSpinner message="Loading Data..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const leaderPoints = playersData[0]?.totalPoints || 0;

  // Compact cell style for mobile
  const cellSx = isMobile ? { px: 1, py: 0.5, fontSize: '0.75rem' } : {};
  const headerCellSx = {
    color: 'white',
    fontWeight: 'bold',
    ...(isMobile ? { px: 1, py: 0.5, fontSize: '0.7rem' } : {})
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 0.5, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 1 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.1rem', sm: '2rem' } }}>
          {isMobile ? 'Fantasy Table 25/26' : 'Complete Fantasy Table 25/26'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {lastUpdated && !isMobile && (
            <Typography variant="body2" color="text.secondary">
              {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          {isMobile ? (
            <IconButton size="small" onClick={() => fetchData()} color="primary">
              <RefreshIcon fontSize="small" />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => fetchData()}
            >
              Refresh
            </Button>
          )}
        </Box>
      </Box>
      <FormControlLabel
        control={
          <Checkbox
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
            size={isMobile ? 'small' : 'medium'}
          />
        }
        label={<Typography variant={isMobile ? 'body2' : 'body1'}>Advanced stats</Typography>}
        sx={{ mb: 1 }}
      />
      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
        <Table size={isMobile ? 'small' : 'medium'}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={headerCellSx}>#</TableCell>
              <TableCell sx={headerCellSx}>{isMobile ? 'Name' : 'Player'}</TableCell>
              <TableCell sx={headerCellSx}>{isMobile ? 'Pts' : 'Total Points'}</TableCell>
              {showAdvanced && (
                <TableCell sx={headerCellSx}>{isMobile ? '△1st' : 'Diff to 1st'}</TableCell>
              )}
              {showAdvanced && (
                <TableCell sx={headerCellSx}>{isMobile ? '△Prev' : 'Diff to Prev'}</TableCell>
              )}
              {showAdvanced && (
                <TableCell sx={headerCellSx}>{isMobile ? '△Next' : 'Diff to Next'}</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {playersData.map((p, index) => {
              const prevPoints = playersData[index - 1]?.totalPoints ?? null;
              const nextPoints = playersData[index + 1]?.totalPoints ?? null;
              const diffTo1st = leaderPoints - p.totalPoints;
              const diffToPrev = prevPoints !== null ? prevPoints - p.totalPoints : null;
              const diffToNext = nextPoints !== null ? p.totalPoints - nextPoints : null;

              // Get short name for mobile (first name + last initial)
              const nameParts = p.name.split(' ');
              const shortName = isMobile && nameParts.length > 1
                ? `${nameParts[0]} ${nameParts[nameParts.length - 1][0]}.`
                : p.name;

              return (
                <TableRow
                  key={p.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>
                    {getMedal(index, playersData.length)}
                  </TableCell>
                  <TableCell sx={cellSx}>{shortName}</TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 'bold' }}>{p.totalPoints}</TableCell>
                  {showAdvanced && (
                    <TableCell sx={{ ...cellSx, color: diffTo1st > 0 ? 'error.main' : 'success.main' }}>
                      {diffTo1st > 0 ? `-${diffTo1st}` : '0'}
                    </TableCell>
                  )}
                  {showAdvanced && (
                    <TableCell sx={{ ...cellSx, color: 'error.main' }}>
                      {diffToPrev !== null ? `-${diffToPrev}` : "-"}
                    </TableCell>
                  )}
                  {showAdvanced && (
                    <TableCell sx={{ ...cellSx, color: diffToNext > 0 ? 'success.main' : 'text.secondary' }}>
                      {diffToNext !== null ? `+${diffToNext}` : "-"}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
