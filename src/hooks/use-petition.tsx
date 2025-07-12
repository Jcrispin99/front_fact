'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface UsePetitionOptions<T> {
  enabled?: boolean; 
  dependencies?: readonly unknown[]; 
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UsePetitionReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

function usePetition<T = unknown>(
  endpoint: string,
  options: UsePetitionOptions<T> = {}
): UsePetitionReturn<T> {
  const { enabled = true, dependencies = [], onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Usar el método customRequest del apiClient para mantener consistencia
      const response = await apiClient.customRequest<T>(endpoint, 'GET');
      
      setData(response);
      
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la petición';
      setError(errorMessage);
      
      if (onError) {
        onError(err instanceof Error ? err : new Error(errorMessage));
      }
      
      console.error(`Error fetching ${endpoint}:`, err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, onSuccess, onError]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (enabled && endpoint) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, endpoint, fetchData, ...dependencies]); // fetchData está memoizado con useCallback

  return {
    data,
    loading,
    error,
    refetch,
    clearError
  };
}

export default usePetition;

// Hook específico para peticiones con parámetros dinámicos
export function useDynamicPetition<T = unknown>(
  endpointBuilder: (...args: unknown[]) => string,
  params: unknown[],
  options: UsePetitionOptions<T> = {}
): UsePetitionReturn<T> {
  const endpoint = params.every(param => param !== null && param !== undefined) 
    ? endpointBuilder(...params)
    : '';
    
  return usePetition<T>(endpoint, {
    ...options,
    enabled: options.enabled !== false && !!endpoint,
    dependencies: [...(options.dependencies || []), ...params]
  });
}

// Hook para peticiones con POST/PUT/DELETE
export function useMutation<TData = unknown, TVariables = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST'
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutate = useCallback(async (variables?: TVariables): Promise<TData> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.customRequest<TData>(
        endpoint,
        method,
        variables
      );
      
      setData(response);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error en la mutación';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [endpoint, method]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    mutate,
    loading,
    error,
    data,
    clearError
  };
}