// Fpl.jsx
import React, { useEffect } from 'react';
import axios from 'axios';

const Fpl = ({ onDataFetched, retryCount = 30, retryDelay = 100 }) => {
  useEffect(() => {
    const fetchData = async (attempt = 1) => {
      try {
        
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fantasy-table-server.vercel.app';
        const response = await axios.get(`${API_BASE}/api/fpl/`);
        
        if (onDataFetched) {
          onDataFetched(response.data); // Zavolej callback s daty
        }
      } catch (error) {
        console.error(`Error fetching data (attempt ${attempt}):`, error);

        if (attempt < retryCount) {
          // Pokud počet pokusů ještě nedosáhl limitu, počkej a zkus to znovu
          console.log('Failed to fetch FPL data, attempt ' + attempt + '/' + retryCount);
          setTimeout(() => fetchData(attempt + 1), retryDelay);
        } else {
          // Pokud se pokusy vyčerpají, vrať chybu
          if (onDataFetched) {
            onDataFetched({ error: 'Failed to fetch data after several attempts' }); // Zavolej callback s chybou
          }
        }
      }
    };

    fetchData();
  }, []); // Prázdné pole zajišťuje, že efekt se spustí pouze jednou

  return null; // Tento komponent nic nevrací
};

export default Fpl;
