'use client';

import React, { useState } from 'react';
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
import RefreshIcon from '@mui/icons-material/Refresh';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const getMedal = (index, totalPlayers) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  if (index === totalPlayers - 1) return "💩";
  return index + 1;
};

const LeaderboardTable = ({
  title,
  data,
  loading,
  error,
  columns,
  pointsKey = 'points',
  loadingMessage = 'Loading data...',
  onRetry,
  lastUpdated
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (loading) return <LoadingSpinner message={loadingMessage} />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  if (!data || data.length === 0) return <Typography>No data available</Typography>;

  const sortedData = [...data].sort((a, b) => b[pointsKey] - a[pointsKey]);

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 2 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {lastUpdated && (
            <Typography variant="body2" color="text.secondary">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
          {onRetry && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
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
          />
        }
        label="Show advanced stats"
        sx={{ mb: 2 }}
      />
      <TableContainer component={Paper} elevation={2} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rank</TableCell>
              {columns.map(col => (
                <TableCell key={col.key} sx={{ color: 'white', fontWeight: 'bold' }}>
                  {col.header}
                </TableCell>
              ))}
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Points</TableCell>
              {showAdvanced && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diff to Prev</TableCell>
              )}
              {showAdvanced && (
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Diff to Next</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, index, arr) => {
              const points = row[pointsKey];
              const diffToPrev = index > 0 ? points - arr[index - 1][pointsKey] : null;
              const diffToNext = index < arr.length - 1 ? points - arr[index + 1][pointsKey] : null;

              return (
                <TableRow
                  key={row.id || index}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                    {getMedal(index, arr.length)}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 'bold' }}>{points}</TableCell>
                  {showAdvanced && (
                    <TableCell sx={{ color: diffToPrev < 0 ? 'error.main' : 'text.secondary' }}>
                      {diffToPrev !== null ? `${diffToPrev}` : "-"}
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
};

export default LeaderboardTable;
