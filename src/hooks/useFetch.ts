import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions<T> {
    initialData?: T;
    immediate?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
}

interface UseFetchResult<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
    const {
        initialData = null,
        immediate = true,
        onSuccess,
        onError,
    } = options;

    const [data, setData] = useState<T | null>(initialData);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchFn();
            setData(result);
            onSuccess?.(result);
        } catch (err: any) {
            setError(err.message || 'Erro ao buscar dados');
            onError?.(err);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, onSuccess, onError]);

    useEffect(() => {
        if (immediate) {
            fetchData();
        }
    }, [fetchData, immediate]);

    return { data, loading, error, refetch: fetchData };
}

export default useFetch;