import React, { useState } from 'react';
import Serie from './Serie'; // cesta k tvé komponentě Serie

const SeriePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleDataFetched = (data) => {
    if (data.error) setError(data.error);
    else setData(data);
  };

  const players = [
    { id: 1, sourceA: 70147727, sourceB: 43454, name: "Pavel Scheiner" },
    { id: 2, sourceA: 63841682, sourceB: 44933, name: "Marek Štencl" },
    { id: 3, sourceA: 69567445, sourceB: 44098, name: "Tomáš Bělehrádek" },
    { id: 4, sourceA: 68621775, sourceB: 42945, name: "Vojtěch Cichra" },
    { id: 5, sourceA: 62787347, sourceB: 41986, name: "Tomáš Prudký" },
    { id: 6, sourceA: 63159074, sourceB: 44460, name: "Zdenek Stanek" },
    { id: 7, sourceA: 58126350, sourceB: 42330, name: "Jakub Odehnal" },
    { id: 8, sourceA: 71989614, sourceB: 43160, name: "Stanislav Dvořáček" },
    { id: 9, sourceA: 61755492, sourceB: 42290, name: "Jan Prochazka" }
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
                    if (player?.id === 2) points += 54; // bonus pro Stenclika
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
