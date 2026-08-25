import { useEffect, useRef } from 'react';
import axios from 'axios';

const Serie = ({ onDataFetched, retryCount = 30, retryDelay = 100 }) => {
  // Držíme referenci na callback, aby nemusel být v dependency array
  const onDataFetchedRef = useRef(onDataFetched);
  onDataFetchedRef.current = onDataFetched;

  useEffect(() => {
    let timerId = null;
    let isCancelled = false;

    const fetchData = async (attempt = 1) => {
      try {

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fantasy-table-server.vercel.app';
        const response = await axios.get(`${API_BASE}/api/serie-a/`);

        if (!isCancelled && onDataFetchedRef.current) {
          onDataFetchedRef.current(response.data);
        }
      } catch (error) {
        console.error(`Error fetching Serie A data (attempt ${attempt}):`, error.message);

        if (attempt < retryCount) {
          if (!isCancelled) {
            timerId = setTimeout(() => fetchData(attempt + 1), retryDelay);
          }
        } else {
          if (!isCancelled && onDataFetchedRef.current) {
            onDataFetchedRef.current({ error: 'Failed to fetch data after several attempts' });
          }
        }
      }
    };

    fetchData();

    // Cleanup při unmountu komponenty
    return () => {
      isCancelled = true;
      if (timerId) clearTimeout(timerId);
    };
  }, [retryCount, retryDelay]);

  return null;
};

export default Serie;