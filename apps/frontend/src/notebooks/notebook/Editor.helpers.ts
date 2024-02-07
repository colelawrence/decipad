import {
  EditorNotebookFragment,
  useRenameNotebookMutation,
} from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { isServerSideRendering } from '@decipad/support';
import { useCallback, useEffect } from 'react';
import { useTabNavigate } from './hooks';

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
  const { changeNotebookTitle } = useTabNavigate(false);
  return useCallback(
    (newName?: string) => {
      if (newName != null && !isServerSideRendering()) {
        const nameTrimmed = newName.trim();
        renameNotebook({
          id: notebookId,
          name: nameTrimmed,
        });

        changeNotebookTitle(nameTrimmed);
      }
    },
    [changeNotebookTitle, notebookId, renameNotebook]
  );
}
