import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  enabled?: boolean;
  interval?: number;
  immediate?: boolean;
}

export const usePolling = (
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {}
) => {
  const { enabled = true, interval = 5000, immediate = true } = options;
  const savedCallback = useRef(callback);
  const intervalId = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const start = useCallback(() => {
    if (immediate) {
      savedCallback.current();
    }
    intervalId.current = setInterval(() => {
      savedCallback.current();
    }, interval);
  }, [interval, immediate]);

  const stop = useCallback(() => {
    if (intervalId.current) {
      clearInterval(intervalId.current);
      intervalId.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return { start, stop };
};
