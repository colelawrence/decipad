/* eslint-disable prefer-destructuring */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateOrUpdateNotebookSnapshotMutation,
  useDeleteNotebookMutation,
  useDuplicateNotebookMutation,
  useMoveNotebookMutation,
  useSetNotebookPublicMutation,
  useUnarchiveNotebookMutation,
  useUpdateNotebookArchiveMutation,
  useUpdateNotebookStatusMutation,
  useUpdateSectionAddNotebookMutation,
} from '@decipad/graphql-client';
import { notebooks, workspaces } from '@decipad/routing';
import { useToast } from '@decipad/toast';
import {
  exportNotebook,
  exportNotebookBackups,
  useMutationResultHandler,
} from '../utils';
import { NotebookMetaActionsReturn } from '@decipad/interfaces';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { getLocalNotebookUpdates } from '@decipad/docsync';

const SNAPSHOT_NAME = 'Published 1';

/**
 * Hook that provides actions to edit meta information about the notebook.
 *
 * This includes: Status, Publishing, Archive, Section, Workspace etc...
 */
export function useNotebookMetaActions(
  isInArchive?: boolean
): NotebookMetaActionsReturn {
  const nav = useNavigate();
  const toast = useToast();
  const [hasPublished] = useNotebookMetaData((s) => [s.hasPublished]);

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
  const createOrUpdateSnapshot = useMutationResultHandler(
    useCreateOrUpdateNotebookSnapshotMutation()[1],
    'Unable to publish notebook'
  );
  const remoteUpdateNotebookIsPublic = useMutationResultHandler(
    useSetNotebookPublicMutation()[1],
    'Unable to change public status of notebook'
  );

  const duplicateNotebook = useDuplicateNotebookMutation()[1];

  const onDeleteNotebook = useCallback<
    NotebookMetaActionsReturn['onDeleteNotebook']
  >(
    (notebookId, showToast) => {
      // TODO: What to do with this.
      const fn = isInArchive ? finalDeleteNotebook : deleteNotebook;

      // REFACTOR: Into helper function
      const pathname = window.location.pathname;
      if (
        isInArchive &&
        pathname.length > 3 &&
        pathname.slice(0, 3) === '/n/'
      ) {
        nav(workspaces({}).workspace.template);
      }

      fn({ id: notebookId }).then(() => {
        if (!showToast) return;

        if (isInArchive) {
          toast('Successfully deleted notebook.', 'info');
          // We are in the notebook.
        } else {
          toast('Successfully archived notebook.', 'info');
        }
      });
    },
    [deleteNotebook, finalDeleteNotebook, isInArchive, nav, toast]
  );

  const onDownloadNotebook = useCallback<
    NotebookMetaActionsReturn['onDownloadNotebook']
  >((notebookId) => {
    exportNotebook(notebookId)();
  }, []);

  const onDownloadNotebookHistory = useCallback<
    NotebookMetaActionsReturn['onDownloadNotebookHistory']
  >((notebookId) => {
    exportNotebookBackups(notebookId)();
  }, []);

  const onMoveToSection = useCallback<
    NotebookMetaActionsReturn['onMoveToSection']
  >(
    (notebookId, sectionId) => {
      movePadToSection({ notebookId, sectionId });
    },
    [movePadToSection]
  );

  const onMoveToWorkspace = useCallback<
    NotebookMetaActionsReturn['onMoveToWorkspace']
  >(
    (notebookId, workspaceId) => {
      toast('Successfully moved notebook!', 'info');
      moveNotebook({ id: notebookId, workspaceId });
    },
    [moveNotebook, toast]
  );

  const onUnarchiveNotebook = useCallback<
    NotebookMetaActionsReturn['onUnarchiveNotebook']
  >(
    (notebookId, showToast) => {
      unarchiveNotebook({ id: notebookId }).then(() => {
        if (showToast) {
          toast('Sucessfully unarchived notebook', 'info');
        }
      });
    },
    [toast, unarchiveNotebook]
  );

  const onChangeStatus = useCallback<
    NotebookMetaActionsReturn['onChangeStatus']
  >(
    (notebookId, status) => {
      changeNotebookStatus({
        id: notebookId,
        status,
      });
    },
    [changeNotebookStatus]
  );

  const onDuplicateNotebook = useCallback<
    NotebookMetaActionsReturn['onDuplicateNotebook']
  >(
    async (notebookId, navigateToNotebook, workspaceId) => {
      const res = await duplicateNotebook({
        id: notebookId,
        targetWorkspace: workspaceId ?? '',
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
    [duplicateNotebook, nav, toast]
  );

  const onPublishNotebook = useCallback<
    NotebookMetaActionsReturn['onPublishNotebook']
  >(
    async (notebookId) => {
      // Let other parts of the UI know that we have published a new version
      hasPublished.next(undefined);

      const localState = await getLocalNotebookUpdates(notebookId);

      await createOrUpdateSnapshot({
        notebookId,
        snapshotName: SNAPSHOT_NAME,
        remoteState: localState && Buffer.from(localState).toString('base64'),
      });
      await remoteUpdateNotebookIsPublic({ id: notebookId, isPublic: true });
    },
    [createOrUpdateSnapshot, hasPublished, remoteUpdateNotebookIsPublic]
  );

  const onUnpublishNotebook = useCallback<
    NotebookMetaActionsReturn['onUnpublishNotebook']
  >(
    async (notebookId) => {
      await remoteUpdateNotebookIsPublic({ id: notebookId, isPublic: false });
    },
    [remoteUpdateNotebookIsPublic]
  );

  return {
    onDeleteNotebook,
    onUnarchiveNotebook,
    onDownloadNotebook,
    onDownloadNotebookHistory,
    onMoveToSection,
    onMoveToWorkspace,
    onChangeStatus,
    onDuplicateNotebook,
    onPublishNotebook,
    onUnpublishNotebook,
  };
}
