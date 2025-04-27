import { useState, useCallback } from 'react';

export function useErrorHandler(): [Error | null, (error: unknown) => void] {
  const [error, setError] = useState<Error | null>(null);
  
  const handleError = useCallback((error: unknown) => {
    console.error('Error caught by useErrorHandler:', error);
    
    if (error instanceof Error) {
      setError(error);
    } else {
      setError(new Error(String(error)));
    }
  }, []);
  
  return [error, handleError];
}
