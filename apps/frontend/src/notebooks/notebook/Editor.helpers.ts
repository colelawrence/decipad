import {
  EditorNotebookFragment,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { notebooks } from '@decipad/routing';
import { isServerSideRendering } from '@decipad/support';
import { useCallback, useEffect } from 'react';

export function useSetWorkspaceQuota(
  workspace: EditorNotebookFragment['workspace']
) {
  const { setCurrentWorkspaceInfo } = useCurrentWorkspaceStore();

  useEffect(() => {
    if (!workspace) return;

    setCurrentWorkspaceInfo({
      id: workspace?.id,
      isPremium: Boolean(workspace?.isPremium),
      quotaLimit: workspace?.workspaceExecutedQuery?.quotaLimit,
      queryCount: workspace?.workspaceExecutedQuery?.queryCount,
    });
  }, [workspace, setCurrentWorkspaceInfo]);
}

export function useNotebookTitleChange(notebookId: string) {
  const [, renameNotebook] = useRenameNotebookMutation();
  return useCallback(
    (newName?: string) => {
      if (newName != null && !isServerSideRendering()) {
        const nameTrimmed = newName.trim();
        renameNotebook({
          id: notebookId,
          name: nameTrimmed,
        });
        window.history.replaceState(
          {},
          nameTrimmed,
          notebooks({}).notebook({
            notebook: { id: notebookId, name: nameTrimmed },
          }).$
        );
      }
    },
    [notebookId, renameNotebook]
  );
}
