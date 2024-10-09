import { useEffect, useState } from 'react';

export const usePromise = <T>(
  p?: Promise<T>
): [resolved: T | undefined, loading: boolean, error?: Error] => {
  const [resolved, setResolved] = useState<T | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (p) {
      setLoading(true);
      p.then(setResolved)
        .catch(setError)
        .finally(() => setLoading(false));
    }
  }, [p]);

  return [resolved, loading, error];
};
