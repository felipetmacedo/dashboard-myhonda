import { useState, useEffect, useRef } from 'react';

export interface AutoRefreshOptions {
  enabled: boolean;
  interval: number; // in seconds
  onRefresh: () => void;
}

export const useAutoRefresh = ({ enabled, interval, onRefresh }: AutoRefreshOptions) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(interval);

  useEffect(() => {
    if (enabled && interval > 0) {
      // Reset time remaining when enabled or interval changes
      setTimeRemaining(interval);
      
      // Start countdown timer
      const countdownInterval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            onRefresh();
            return interval; // Reset to full interval
          }
          return prev - 1;
        });
      }, 1000);

      intervalRef.current = countdownInterval;

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      // Clear interval when disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeRemaining(interval);
    }
  }, [enabled, interval, onRefresh]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { timeRemaining };
};