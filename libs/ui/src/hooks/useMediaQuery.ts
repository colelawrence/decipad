import { useState, useEffect } from 'react';

type UseMediaQuery = (query: string) => boolean;

const useMediaQuery: UseMediaQuery = (query) => {
  // State to hold the matching value
  const [matches, setMatches] = useState(false);

  // Function to clean the query string
  const cleanQuery = (queryString: string): string => {
    // Regex to remove "@media " prefix
    const mediaQueryRegex = /^@media\s*(.*)/;
    const match = queryString.match(mediaQueryRegex);

    return match ? match[1] : queryString;
  };

  useEffect(() => {
    // Clean the media query string
    const cleanedQuery = cleanQuery(query);

    // Create a MediaQueryList object
    const mediaQueryList = window.matchMedia(cleanedQuery);

    // Function to update state based on query match
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for media query changes
    mediaQueryList.addEventListener('change', listener);

    // Set the initial value
    setMatches(mediaQueryList.matches);

    // Clean up by removing the listener
    return () => mediaQueryList.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

export default useMediaQuery;
