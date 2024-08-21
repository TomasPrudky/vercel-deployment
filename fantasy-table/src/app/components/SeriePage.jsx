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

  return (
    <div>
      <h1>Serie A Fantasy results</h1>
      <Serie onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data ? (
        <div>
          {data.results.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Player Name</th>
                  <th>Team Name</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.manager}</td>
                    <td>{item.name}</td>
                    <td>{item.total_points}</td>
                  </tr>
                ))}
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
