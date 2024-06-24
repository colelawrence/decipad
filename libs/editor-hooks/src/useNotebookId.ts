import { useMemo } from 'react';

const isTesting = !!(
  process.env.JEST_WORKER_ID ?? process.env.VITEST_WORKER_ID
);

const useTestNotebookId = () => 'testing';

export const useNotebookId = isTesting
  ? useTestNotebookId
  : () => {
      const pathname =
        typeof window !== 'undefined' && window.location.pathname;
      return useMemo(() => {
        const notebookId = 'playground';
        if (pathname) {
          const notebookName = pathname.match(/\/n\/([^/]+)/)?.[1];
          if (notebookName) {
            const parts = decodeURIComponent(notebookName).split(':');
            if (parts.length === 1) {
              return parts[0];
            }
            return parts.slice(1).join(':') || notebookId;
          }
        }
        return notebookId;
      }, [pathname]);
    };
