import { useEffect } from 'react';

/**
 * Hok to import a JS file and add it to the document.
 *
 * Useful for loading 3rd party libraries during run-time, instead of
 * on load.
 */
export const useCustomScript = (url: string, onload: () => void): void => {
  useEffect(() => {
    const script = document.createElement('script');

    script.src = url;
    script.async = true;
    script.defer = true;
    script.onload = onload;

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
};
