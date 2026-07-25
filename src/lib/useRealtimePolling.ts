import { useEffect, useState, useRef, useCallback } from "react";

export interface RealtimeOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function usePolling<T>(
  fetcher: () => Promise<T>,
  options: RealtimeOptions = {}
) {
  const { interval = 5000, enabled = true, onError } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);
      const result = await fetcher();
      if (isMountedRef.current) {
        setData(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      if (isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher, enabled, onError]);

  useEffect(() => {
    if (!enabled) return;

    fetch();
    timeoutRef.current = setInterval(fetch, interval);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
      }
    };
  }, [fetch, enabled, interval]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { data, loading, error, refetch: fetch };
}

export function useRealtimeOrders(options: RealtimeOptions = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("ss-auth-token");

  const fetcher = useCallback(async () => {
    if (!token) return [];
    const response = await fetch(`${API_BASE}/api/orders/user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.data || [];
  }, [token]);

  return usePolling(fetcher, { interval: 10000, ...options });
}

export function useRealtimeProductStock(productId: string, options: RealtimeOptions = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  const fetcher = useCallback(async () => {
    const response = await fetch(`${API_BASE}/api/products/${productId}`);
    const data = await response.json();
    return data.data?.stock_quantity || 0;
  }, [productId]);

  return usePolling(fetcher, { interval: 15000, ...options });
}

export function useRealtimeInventory(options: RealtimeOptions = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("ss-auth-token");

  const fetcher = useCallback(async () => {
    if (!token) return [];
    const response = await fetch(`${API_BASE}/api/inventory`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.data || [];
  }, [token]);

  return usePolling(fetcher, { interval: 30000, ...options });
}

export function useRealtimeAnalytics(days: number = 30, options: RealtimeOptions = {}) {
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const token = localStorage.getItem("ss-auth-token");

  const fetcher = useCallback(async () => {
    if (!token) return null;
    const response = await fetch(`${API_BASE}/api/analytics/metrics`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    return data.metrics || null;
  }, [token]);

  return usePolling(fetcher, { interval: 60000, ...options });
}
