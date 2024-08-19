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
      <h1>Data Fetch Example</h1>
      <Fpl onDataFetched={handleDataFetched} />
      {error && <p>Error: {error}</p>}
      {data && (
        <div>
          <h2>Standings</h2>
          {data.standings.results.length > 0 ? (
            <ul>
              {data.standings.results.map((item) => (
                <li key={item.id}>
                  <strong>Player Name:</strong> {item.player_name}<br />
                  <strong>Total Points:</strong> {item.total}<br />
                  <strong>Entry Name:</strong> {item.entry_name}
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
