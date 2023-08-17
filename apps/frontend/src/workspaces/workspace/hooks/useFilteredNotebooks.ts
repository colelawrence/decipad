import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { WorkspaceNotebookFragment } from '@decipad/graphql-client';

export type PageTypes = 'workspace' | 'archived' | 'shared' | 'section';

/**
 * Handles the filtering of notebooks.
 */
export function useFilteredNotebooks(
  pageType: PageTypes,
  notebooks: Array<WorkspaceNotebookFragment>,
  sharedNotebooks: Array<WorkspaceNotebookFragment>
): Array<WorkspaceNotebookFragment> {
  const params = useParams();

  const filteredNotebooks = useMemo<Array<WorkspaceNotebookFragment>>(() => {
    switch (pageType) {
      case 'workspace':
        return notebooks.filter((n) => !n.archived);
      case 'archived':
        return notebooks.filter((n) => n.archived);
      case 'shared':
        return sharedNotebooks;
      case 'section':
        return notebooks.filter((n) => n.section?.id === params.sectionId);
      default:
        return [];
    }
  }, [notebooks, params.sectionId, sharedNotebooks, pageType]);

  return filteredNotebooks;
}
