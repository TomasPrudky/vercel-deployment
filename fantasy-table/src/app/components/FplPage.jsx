import React, { useState } from 'react';
import Fpl from './Fpl'; // Ujisti se, že cesta k souboru je správná

const SeriePage = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const handleDataFetched = (data) => {
    if (data.error) {
      setError(data.error);
    } else {
      setData(data);
      console.log('Fetched data:', data); // Můžeš zde zpracovat data podle potřeby
    }
  };

  return (
    <div>
      <h1>PL Fantasy results</h1>
      <Fpl onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data ? (
        <div>
          {data.standings.results.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Team Name</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {data.standings.results.map((item) => (
                  <tr key={item.id}>
                    <td>{item.player_name}</td>
                    <td>{item.entry_name}</td>
                    <td>{item.total}</td>
                  </tr>
                ))}
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

export default SeriePage;
