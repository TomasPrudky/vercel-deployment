import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

// Funkce pro odstranění diakritiky z textu
const removeDiacritics = (text) => {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

// Funkce pro získání příjmení z celého jména a odstranění diakritiky
const getNormalizedLastName = (name) => {
  const parts = name.trim().split(' ');
  const lastName = parts.length > 1 ? parts[parts.length - 1] : name;
  return removeDiacritics(lastName).toLowerCase();
};

const CompleteTable = () => {
  const [dataSerie, setDataSerie] = useState(null);
  const [dataFpl, setDataFpl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch data from Serie API
    axios.get('https://fantasy-table-server.vercel.app/api/serie-a/')
      .then(response => {
        setDataSerie(response.data);
      })
      .catch(error => {
        console.error('Error fetching Serie data:', error);
        setError('Failed to fetch Serie data');
      });

    // Fetch data from FPL API
    axios.get('https://fantasy-table-server.vercel.app/api/fpl/')
      .then(response => {
        setDataFpl(response.data);
      })
      .catch(error => {
        console.error('Error fetching FPL data:', error);
        setError('Failed to fetch FPL data');
      });
  }, []);

  const combinedData = useMemo(() => {
    if (!dataSerie || !dataFpl) return [];

    // Create a map from Serie data using normalized last name
    const serieMap = dataSerie.results.reduce((acc, item) => {
      const lastName = getNormalizedLastName(item.manager);
      if (!acc[lastName]) {
        acc[lastName] = { name: item.manager, serieTotal: 0 };
      }
      acc[lastName].serieTotal += item.total_points;
      return acc;
    }, {});

    // Update the map with FPL data using normalized last name
    dataFpl.standings.results.forEach(item => {
      const lastName = getNormalizedLastName(item.player_name);
      if (!serieMap[lastName]) {
        serieMap[lastName] = { name: item.player_name, fplTotal: 0 };
      }
      if (!serieMap[lastName].fplTotal) {
        serieMap[lastName].fplTotal = 0;
      }
      serieMap[lastName].fplTotal += item.total;
    });

    // Convert the map to an array
    const combinedArray = Object.values(serieMap).map(item => ({
      name: item.name,
      totalPoints: (item.serieTotal || 0) + (item.fplTotal || 0)
    }));

    // Sort the array by totalPoints in descending order
    return combinedArray.sort((a, b) => b.totalPoints - a.totalPoints);
  }, [dataSerie, dataFpl]);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Overall Fantasy results</h1>
      {combinedData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {combinedData.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.totalPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Loading table...</p>
      )}
    </div>
  );
};

export default CompleteTable;
