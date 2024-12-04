import type { EditorNotebookFragment } from '@decipad/graphql-client';
import { useRenameNotebookMutation } from '@decipad/graphql-client';
import { useCurrentWorkspaceStore } from '@decipad/react-contexts';
import { isServerSideRendering } from '@decipad/support';
import { useCallback, useEffect, useMemo } from 'react';
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
      plan: workspace?.plan,
      name: workspace?.name,
      membersCount: workspace?.membersCount || 1,
    });
  }, [workspace, setCurrentWorkspaceInfo]);
}

export function useNotebookTitleChange(
  notebookId: string,
  notebookTitle?: string
) {
  const [, renameNotebook] = useRenameNotebookMutation();
  const { changeNotebookTitle } = useTabNavigate(false);

  const onNotebookTitleChange = useCallback(
    (newName?: string) => {
      if (newName != null && !isServerSideRendering()) {
        const nameTrimmed = newName.trim();

        if (notebookTitle?.trim() === nameTrimmed) {
          return;
        }

        renameNotebook({
          id: notebookId,
          name: nameTrimmed,
        });

        changeNotebookTitle(nameTrimmed);
      }
    },
    [changeNotebookTitle, notebookId, notebookTitle, renameNotebook]
  );

  return useMemo(
    () => ({
      onNotebookTitleChange,
    }),
    [onNotebookTitleChange]
  );
}
