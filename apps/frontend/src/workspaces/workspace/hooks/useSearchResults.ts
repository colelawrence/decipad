import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { WorkspaceNotebookFragment } from '@decipad/graphql-client';
import {
  acceptableStatus,
  acceptableVisibility,
  buildFuseQuery,
  parseSearchInput,
} from './fuse.utils';

/**
 * Searches using `fuse.js` through notebooks, and returns filtered notebooks.
 */
export function useSearchResults(
  notebooks: Array<WorkspaceNotebookFragment>,
  search: string,
  status: string[],
  visibility: string
): Array<WorkspaceNotebookFragment> {
  const fuse = useMemo(
    () =>
      new Fuse(notebooks, {
        minMatchCharLength: 1,
        useExtendedSearch: true,
        keys: ['name', 'isPublic', 'status'],
      }),
    [notebooks]
  );

  // Since this changes very often whilst searching.
  // Memoizing makes the app slower.

  const searchResults = useMemo(() => {
    const [include, exclude] = parseSearchInput(search);

    const params = [
      ...acceptableStatus(status),
      ...acceptableVisibility(visibility),
    ].flat();

    const query = buildFuseQuery({
      include,
      exclude: exclude || [],
      params: params.filter((a) => a !== undefined),
    });
    return fuse.search(query).map((n) => n.item);
  }, [fuse, search, status, visibility]);

  return searchResults;
}
