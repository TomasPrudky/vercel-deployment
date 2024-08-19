import React, { useEffect } from 'react';
import axios from 'axios';

const Fpl = ({ onDataFetched }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://fantasy-table-server.vercel.app/api/fpl/');
        if (onDataFetched) {
          onDataFetched(response.data); // Zavolej callback s daty
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (onDataFetched) {
          onDataFetched({ error: 'Failed to fetch data' }); // Zavolej callback s chybou
        }
      }
    };

    fetchData();
  }, []); // Prázdné pole zajišťuje, že efekt se spustí pouze jednou

  return null; // Tento komponent nic nevrací
};

export default Fpl;
