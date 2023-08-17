/* eslint-disable prefer-destructuring */
import { FC, ReactNode, useMemo } from 'react';
import {
  NotebookMetaActions,
  NotebookMetaActionsType,
} from '@decipad/react-contexts';
import {
  exportNotebook,
  exportNotebookBackups,
  useMutationResultHandler,
} from '../../../utils';
import {
  useDeleteNotebookMutation,
  useDuplicateNotebookMutation,
  useMoveNotebookMutation,
  useUnarchiveNotebookMutation,
  useUpdateNotebookArchiveMutation,
  useUpdateNotebookStatusMutation,
  useUpdateSectionAddNotebookMutation,
} from '@decipad/graphql-client';
import { useNavigate } from 'react-router-dom';
import { notebooks, workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';

interface NotebookMetaActionsProps {
  readonly workspaceId: string;
  readonly isInArchive?: boolean;
  readonly children: ReactNode;
}

/**
 * Provides access to all required meta data mutations on a notebook.
 */
export const NotebookMetaActionsProvider: FC<NotebookMetaActionsProps> = ({
  workspaceId,
  isInArchive = false,
  children,
}) => {
  const nav = useNavigate();
  const toast = useToast();

  const deleteNotebook = useMutationResultHandler(
    useUpdateNotebookArchiveMutation()[1],
    'Failed to remove notebook'
  ); // soft delete
  const finalDeleteNotebook = useMutationResultHandler(
    useDeleteNotebookMutation()[1],
    'Failed to remove notebook'
  );
  const movePadToSection = useMutationResultHandler(
    useUpdateSectionAddNotebookMutation()[1],
    'Failed to move notebook to section'
  );
  const changeNotebookStatus = useMutationResultHandler(
    useUpdateNotebookStatusMutation()[1],
    'Unable to update notebook status'
  );
  const unarchiveNotebook = useMutationResultHandler(
    useUnarchiveNotebookMutation()[1],
    'Unable to move notebook back'
  );
  const moveNotebook = useMutationResultHandler(
    useMoveNotebookMutation()[1],
    'Unable to move notebook to workspace'
  );
  const duplicateNotebook = useDuplicateNotebookMutation()[1];

  const contextValue = useMemo<NotebookMetaActionsType>(
    () => ({
      onDeleteNotebook(id, showToast) {
        const fn = isInArchive ? finalDeleteNotebook : deleteNotebook;

        // REFACTOR: Into helper function
        const pathname = window.location.pathname;
        if (
          isInArchive &&
          pathname.length > 3 &&
          pathname.slice(0, 3) === '/n/'
        ) {
          nav(workspaces({}).workspace({ workspaceId }).$);
        }

        fn({ id }).then(() => {
          if (!showToast) return;

          if (isInArchive) {
            toast('Successfully deleted notebook.', 'info');
            // We are in the notebook.
          } else {
            toast('Successfully archived notebook.', 'info');
          }
        });
      },
      onDownloadNotebook(id) {
        exportNotebook(id)();
      },
      onDownloadNotebookHistory(id) {
        exportNotebookBackups(id)();
      },
      onMoveToSection(id, secId) {
        movePadToSection({ notebookId: id, sectionId: secId });
      },
      onMoveToWorkspace(id, targetWorkspaceId) {
        moveNotebook({ id, workspaceId: targetWorkspaceId });
      },
      onUnarchiveNotebook(id, showToast) {
        unarchiveNotebook({ id }).then(() => {
          if (showToast) {
            toast('Sucessfully unarchived notebook', 'info');
          }
        });
      },
      onChangeStatus(id, status) {
        changeNotebookStatus({
          id,
          status,
        });
      },
      async onDuplicateNotebook(id, navigateToNotebook) {
        const res = await duplicateNotebook({
          id,
          targetWorkspace: workspaceId,
        });

        if (res.error || !res.data?.duplicatePad) {
          toast('Unable to duplicate notebook.', 'error');
          return false;
        }

        if (navigateToNotebook && res.data?.duplicatePad) {
          nav(notebooks({}).notebook({ notebook: res.data.duplicatePad }).$);
        }

        return true;
      },
    }),
    [
      changeNotebookStatus,
      deleteNotebook,
      duplicateNotebook,
      finalDeleteNotebook,
      isInArchive,
      moveNotebook,
      movePadToSection,
      nav,
      toast,
      unarchiveNotebook,
      workspaceId,
    ]
  );

  return (
    <NotebookMetaActions.Provider value={contextValue}>
      {children}
    </NotebookMetaActions.Provider>
  );
};
