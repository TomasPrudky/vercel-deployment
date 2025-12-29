import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { getErrorMessage, logError } from '../utils/errorHandler';

const useApiData = (endpoint, options = {}) => {
  const {
    retryCount = 3,
    retryDelay = 2000,
    autoRefresh = false,
    refreshInterval = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async (attempt = 1, isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }
      setError(null);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${apiUrl}${endpoint}`);

      setData(response.data);
      setLastUpdated(new Date());
      setLoading(false);
    } catch (err) {
      logError(`useApiData:${endpoint}`, err);

      if (attempt < retryCount) {
        console.log(`Retrying ${endpoint}, attempt ${attempt}/${retryCount}`);
        setTimeout(() => fetchData(attempt + 1, isBackgroundRefresh), retryDelay);
      } else {
        setError(getErrorMessage(err));
        setLoading(false);
      }
    }
  }, [endpoint, retryCount, retryDelay]);

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchData(1, true); // Background refresh
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, autoRefresh, refreshInterval]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch, lastUpdated };
};

export default useApiData;
