import React, { useState } from 'react';
import Serie from './Serie';
import { players, BONUS_PLAYER_ID, BONUS_POINTS } from '../config/players';

const SeriePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDataFetched = (data) => {
    if (data.error) setError(data.error);
    else setData(data);
  };

  const getMedal = (index, totalPlayers) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    if (index === totalPlayers - 1) return "💩";
    return index + 1;
  };

  return (
    <div>
      <h1>Serie A Fantasy results</h1>
      <label style={{ display: 'block', marginBottom: '10px' }}>
        <input
          type="checkbox"
          checked={showAdvanced}
          onChange={(e) => setShowAdvanced(e.target.checked)}
        />{" "}
        Show advanced stats
      </label>
      <Serie onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data ? (
        <div>
          {data.data.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player Name</th>
                  <th>Team Name</th>
                  <th>Total Points</th>
                  {showAdvanced && <th>Diff to Next</th>}
                  {showAdvanced && <th>Diff to Previous</th>}
                </tr>
              </thead>
              <tbody>
                {[...data.data]
                  .map(item => {
                    const player = players.find(p => p.sourceB === item.id);
                    let points = item.points;
                    if (player?.id === BONUS_PLAYER_ID) points += BONUS_POINTS;
                    return {
                      ...item,
                      playerName: player ? player.name : "Unknown",
                      totalPoints: points
                    };
                  })
                  .sort((a, b) => b.totalPoints - a.totalPoints)
                  .map((row, index, arr) => {
                    const diffToPrev =
                      index > 0 ? row.totalPoints - arr[index - 1].totalPoints : null;
                    const diffToNext =
                      index < arr.length - 1 ? row.totalPoints - arr[index + 1].totalPoints : null;

                    return (
                      <tr key={row.id || index}>
                        <td>{getMedal(index, arr.length)}</td>
                        <td>{row.playerName}</td>
                        <td>{row.name}</td>
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
          ) : (
            <p>No data available</p>
          )}
        </div>
      ) : (
        <p>Loading Serie A Data...</p>
      )}
    </div>
  );
};

export default SeriePage;
