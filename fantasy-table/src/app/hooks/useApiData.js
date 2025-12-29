import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useApiData = (endpoint, options = {}) => {
  const { retryCount = 3, retryDelay = 2000 } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (attempt = 1) => {
    try {
      setLoading(true);
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}${endpoint}`);

      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${endpoint} (attempt ${attempt}):`, err);

      if (attempt < retryCount) {
        console.log(`Retrying ${endpoint}, attempt ${attempt}/${retryCount}`);
        setTimeout(() => fetchData(attempt + 1), retryDelay);
      } else {
        setError('Failed to fetch data after several attempts');
        setLoading(false);
      }
    }
  }, [endpoint, retryCount, retryDelay]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

export default useApiData;
