import React, { useEffect } from 'react';
import axios from 'axios';

const Serie = ({ onDataFetched }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://fantasy-table-server.vercel.app/api/serie-a/');
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
  }, []); // Prázdné pole zajistí, že se efekt spustí pouze jednou

  return null; // Tento komponent nic nevrací
};

export default Serie;
