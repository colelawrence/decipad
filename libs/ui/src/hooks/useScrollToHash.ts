import { RefObject, useEffect, useRef } from 'react';

/**
 * Hook to allow for smooth scrolling to an element with ID
 * corresponding to the hash value.
 *
 * @returns ref for element you want to scroll.
 */
export function useScrollToHash<T extends HTMLElement>(): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const { hash } = window.location;
      if (hash && ref.current) {
        const elementId = hash.replace('#', '');
        // React element IDs do not follow the standard CSS selector naming rules, so we can't simply use querySelector(#<something>)
        const targetElement = document.querySelector(`[id="${elementId}"]`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', ' ');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return ref;
}
