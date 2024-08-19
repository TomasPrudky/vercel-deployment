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
      console.log('Fetched data:', data); // Můžeš zde zpracovat data podle potřeby
    }
  };

  return (
    <div>
      <h1>Data Fetch Example</h1>
      <Serie onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data && (
        <div>
          <h2>Standings</h2>
          {data.results.length > 0 ? (
            <ul>
              {data.results.map((item) => (
                <li key={item.id}>
                  <strong>Player Name:</strong> {item.manager}<br />
                  <strong>Total Points:</strong> {item.total_points}<br />
                  <strong>Entry Name:</strong> {item.name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No data available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SeriePage;
