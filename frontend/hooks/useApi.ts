'use client';
import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: false,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, error: null, loading: true });
    try {
      const data = await apiCall();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error: any) {
      const message = error.response?.data?.detail || error.message || 'An error occurred';
      setState({ data: null, error: message, loading: false });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, error: null, loading: false });
  }, []);

  return { ...state, execute, reset };
}
