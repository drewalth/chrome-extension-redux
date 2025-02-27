import { useEffect, useState } from 'react';
import { Ditto } from './types';

export const useDittoData = () => {
  const [data, setData] = useState<Ditto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  useEffect(() => {
    // First get cached data
    chrome.runtime.sendMessage({ action: "GET_CACHED_DATA" }, (response) => {
      if (response.success && response.data) {
        setData(response.data);
        setLastUpdated(response.lastUpdated);
        setIsLoading(false);
      }
      
      // Then fetch fresh data
      chrome.runtime.sendMessage({ action: "FETCH_DATA" }, (response) => {
        setIsLoading(false);
        if (response.success) {
          setData(response.data);
          setLastUpdated(Date.now());
          setError(null);
        } else {
          setError(response.error || "Failed to fetch data");
        }
      });
    });
  }, []);

  return { data, isLoading, error, lastUpdated };
};