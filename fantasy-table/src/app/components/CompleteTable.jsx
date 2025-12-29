'use client';

import React, { useEffect, useState, useCallback } from 'react';
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
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

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

  const fetchData = useCallback(async () => {
    setLoading(true);
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
    } catch (err) {
      console.error(err);
      setError('Error loading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <LoadingSpinner message="Loading Data..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  const leaderPoints = playersData[0]?.totalPoints || 0;

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Complete Fantasy Table 25/26
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={showAdvanced}
            onChange={(e) => setShowAdvanced(e.target.checked)}
          />
        }
        label="Show advanced stats"
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper} elevation={2}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Player</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Points</TableCell>
              {showAdvanced && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diff to 1st</TableCell>
              )}
              {showAdvanced && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diff to Prev</TableCell>
              )}
              {showAdvanced && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diff to Next</TableCell>
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

              return (
                <TableRow
                  key={p.id}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {getMedal(index, playersData.length)}
                  </TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{p.totalPoints}</TableCell>
                  {showAdvanced && (
                    <TableCell sx={{ color: diffTo1st > 0 ? 'error.main' : 'success.main' }}>
                      {diffTo1st > 0 ? `-${diffTo1st}` : '0'}
                    </TableCell>
                  )}
                  {showAdvanced && (
                    <TableCell sx={{ color: 'error.main' }}>
                      {diffToPrev !== null ? `-${diffToPrev}` : "-"}
                    </TableCell>
                  )}
                  {showAdvanced && (
                    <TableCell sx={{ color: diffToNext > 0 ? 'success.main' : 'text.secondary' }}>
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
