import React, { useState, useCallback } from 'react';
import Serie from './Serie';

const SeriePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Obalení do useCallback zabrání nekonečné smyčce
  const handleDataFetched = useCallback((fetchedData) => {
    if (fetchedData?.error) {
      setError(fetchedData.error);
    } else {
      setData(fetchedData);
    }
  }, []);

  const players = [
    { id: 1, sourceA: 4329613, sourceB: 725, name: "Pavel Scheiner" },
    { id: 2, sourceA: 4589170, sourceB: 1019, name: "Lukáš Budiš" },
    { id: 3, sourceA: 6411289, sourceB: 1132, name: "Tomáš Bělehrádek" },
    { id: 4, sourceA: 1884869, sourceB: 969, name: "Vojtěch Cichra" },
    { id: 5, sourceA: 48521, sourceB: 236, name: "Tomáš Prudký" },
    { id: 6, sourceA: 3659748, sourceB: 1177, name: "Zdenek Stanek" },
    { id: 7, sourceA: 1881097, sourceB: 288, name: "Jakub Odehnal" },
    { id: 8, sourceA: 1882099, sourceB: 927, name: "Stanislav Dvořáček" },
    { id: 9, sourceA: 730983, sourceB: 219, name: "Jan Prochazka" }
  ];

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
          {data.length > 0 ? (
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
                {[...data]
                  .map(item => {
                    const player = players.find(p => p.sourceB === (item.teamId || item.id));
                    let points = item.totalPoints ?? item.points ?? 0;
                    return {
                      ...item,
                      playerName: player ? player.name : (item.manager || "Unknown"),
                      displayPoints: points,
                      displayName: item.teamName || item.name
                    };
                  })
                  .sort((a, b) => b.displayPoints - a.displayPoints)
                  .map((row, index, arr) => {
                    const diffToPrev =
                      index > 0 ? row.displayPoints - arr[index - 1].displayPoints : null;
                    const diffToNext =
                      index < arr.length - 1 ? row.displayPoints - arr[index + 1].displayPoints : null;

                    return (
                      <tr key={row.teamId || row.id || index}>
                        <td>{getMedal(index, arr.length)}</td>
                        <td>{row.playerName}</td>
                        <td>{row.displayName}</td>
                        <td>{row.displayPoints}</td>
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