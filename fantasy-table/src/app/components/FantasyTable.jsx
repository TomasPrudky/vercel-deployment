'use client';

import React, { useState } from 'react';

const getMedal = (index, totalPlayers) => {
  if (index === 0) return "🥇";
  if (index === 1) return "🥈";
  if (index === 2) return "🥉";
  if (index === totalPlayers - 1) return "💩";
  return index + 1;
};

export default function FantasyTable({ title, rows, loading, error, LoaderComponent }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="table-container" suppressHydrationWarning>
      <h1>{title}</h1>

      <label className="controls-label">
        <input
          type="checkbox"
          checked={showAdvanced}
          onChange={(e) => setShowAdvanced(e.target.checked)}
        />{" "}
        Show advanced stats
      </label>

      {LoaderComponent}
      {error && <p style={{ color: '#dc2626', fontWeight: 600 }}>Error: {error}</p>}

      {loading ? (
        <p>Loading {title}...</p>
      ) : rows && rows.length > 0 ? (
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player Name</th>
                <th>Team Name</th>
                <th>Total Points</th>
                {showAdvanced && <th>Diff to Previous</th>}
                {showAdvanced && <th>Diff to Next</th>}
              </tr>
            </thead>
            <tbody>
              {[...rows]
                .sort((a, b) => b.totalPoints - a.totalPoints)
                .map((row, index, arr) => {
                  const diffToPrev = index > 0 ? row.totalPoints - arr[index - 1].totalPoints : null;
                  const diffToNext = index < arr.length - 1 ? row.totalPoints - arr[index + 1].totalPoints : null;

                  return (
                    <tr key={row.key || index}>
                      <td>{getMedal(index, arr.length)}</td>
                      <td>{row.playerName}</td>
                      <td>{row.teamName}</td>
                      <td>{row.totalPoints}</td>
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
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
}