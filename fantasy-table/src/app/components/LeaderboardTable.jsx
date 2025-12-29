'use client';

import React, { useState } from 'react';
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
  onRetry
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (loading) return <LoadingSpinner message={loadingMessage} />;
  if (error) return <ErrorMessage message={error} onRetry={onRetry} />;
  if (!data || data.length === 0) return <p>No data available</p>;

  const sortedData = [...data].sort((a, b) => b[pointsKey] - a[pointsKey]);

  return (
    <div>
      <h1>{title}</h1>
      <label style={{ display: 'block', marginBottom: '10px' }}>
        <input
          type="checkbox"
          checked={showAdvanced}
          onChange={(e) => setShowAdvanced(e.target.checked)}
        />{" "}
        Show advanced stats
      </label>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            {columns.map(col => (
              <th key={col.key}>{col.header}</th>
            ))}
            <th>Total Points</th>
            {showAdvanced && <th>Diff to Next</th>}
            {showAdvanced && <th>Diff to Previous</th>}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index, arr) => {
            const points = row[pointsKey];
            const diffToPrev = index > 0 ? points - arr[index - 1][pointsKey] : null;
            const diffToNext = index < arr.length - 1 ? points - arr[index + 1][pointsKey] : null;

            return (
              <tr key={row.id || index}>
                <td>{getMedal(index, arr.length)}</td>
                {columns.map(col => (
                  <td key={col.key}>{col.render ? col.render(row) : row[col.key]}</td>
                ))}
                <td>{points}</td>
                {showAdvanced && (
                  <td>{diffToPrev !== null ? `${diffToPrev}` : "-"}</td>
                )}
                {showAdvanced && (
                  <td>{diffToNext !== null ? `+${diffToNext}` : "-"}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;
