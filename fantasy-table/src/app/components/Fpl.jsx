import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Fpl = ({ onDataFetched }) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('https://fantasy-table-server.vercel.app/api/fpl/')
      .then(response => {
        setData(response.data);
        if (onDataFetched) {
          onDataFetched(response.data); // Zavolej callback, pokud je definován
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        if (onDataFetched) {
          onDataFetched({ error: 'Failed to fetch data' }); // Zavolej callback s chybou
        }
      });
  }, [onDataFetched]);

  // Můžeš použít data v rámci useEffect nebo jiných částí kódu
  return null; // Tento komponent nic nevrací
};

export default Fpl;
