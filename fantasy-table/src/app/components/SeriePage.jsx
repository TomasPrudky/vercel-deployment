import React, { useState } from 'react';
import Serie from './Serie'; // Ujisti se, že cesta k souboru je správná

const SeriePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataFetched = (data) => {
    if (data.error) {
      setError(data.error);
    } else {
      setData(data);
    }
  };

  const players = [
  { id: 1, sourceA: 70147727, sourceB: 43454, name: "Pavel Scheiner"}, //Scheiny
  { id: 2, sourceA: 63841682, sourceB: -1, name: "Marek Štencl"}, //Stenclik
  { id: 3, sourceA: 69567445, sourceB: 44098, name: "Tomáš Bělehrádek" }, //Tom
  { id: 4, sourceA: 68621775, sourceB: 42945, name: "Vojtěch Cichra"}, //Vojtas
  { id: 5, sourceA: 62787347, sourceB: 41986, name: "Tomáš Prudký" }, //Tomko
  { id: 6, sourceA: 63159074, sourceB: 44460, name: "Zdenek Stanek"}, //Zdenda
  { id: 7, sourceA: 58126350, sourceB: 42330, name: "Jakub Odehnal" }, //Kubson
  { id: 8, sourceA: 71989614, sourceB: 43160, name: "Stanislav Dvořáček" }, //Standa
  { id: 9, sourceA: 61755492, sourceB: 42290, name: "Jan Prochazka" } //Jenda
];

  return (
    <div>
      <h1>Serie A Fantasy results</h1>
      <Serie onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data ? (
        <div>
          {data.data.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Team Name</th>
                  <th>Total Points</th>
                </tr>
              </thead>
                <tbody>
                  {data.data.map((item, index) => {
                    // najdeme hráče podle sourceB
                    const player = players.find(p => p.sourceB === item.id);

                    return (
                      <tr key={item.id || index}>
                        <td>{player ? player.name : "Unknown"}</td>
                        <td>{item.name}</td>
                        <td>{item.points}</td>
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
