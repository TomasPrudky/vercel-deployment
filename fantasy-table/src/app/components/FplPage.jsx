import React, { useState } from 'react';
import Fpl from './Fpl';

const FplPage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false); // kontrola rozšířených statistik

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
      <h1>PL Fantasy results</h1>
      <label style={{ display: 'block', marginBottom: '10px' }}>
        <input
          type="checkbox"
          checked={showAdvanced}
          onChange={(e) => setShowAdvanced(e.target.checked)}
        />{" "}
        Show advanced stats
      </label>
      <Fpl onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data ? (
        <div>
          {data.standings.results.length > 0 ? (
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
                {[...data.standings.results]
                  .sort((a, b) => b.total - a.total)
                  .map((row, index, arr) => {
                    const diffToPrev =
                      index > 0 ? row.total - arr[index - 1].total : null;
                    const diffToNext =
                      index < arr.length - 1
                        ? row.total - arr[index + 1].total
                        : null;

                    return (
                      <tr key={row.id || index}>
                        <td>{getMedal(index, arr.length)}</td>
                        <td>{row.player_name}</td>
                        <td>{row.entry_name}</td>
                        <td>{row.total}</td>
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
        <p>Loading FPL Data...</p>
      )}
    </div>
  );
};

export default FplPage;
