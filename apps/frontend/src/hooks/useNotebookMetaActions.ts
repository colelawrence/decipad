/* eslint-disable prefer-destructuring */
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useCreateOrUpdateNotebookSnapshotMutation,
  useDeleteNotebookMutation,
  useDuplicateNotebookMutation,
  useMoveNotebookMutation,
  useSetNotebookPublishStateMutation,
  useUnarchiveNotebookMutation,
  useUpdateNotebookAllowDuplicateMutation,
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
import {
  NotebookMetaActionsReturn,
  PublishedVersionName,
} from '@decipad/interfaces';
import { getLocalNotebookUpdates } from '@decipad/docsync';
import { captureException } from '@sentry/browser';
import md5 from 'md5';
import { canonicalize } from 'json-canonicalize';
import { Doc, applyUpdate } from 'yjs';
import { toSlateDoc } from '@decipad/slate-yjs';

const SNAPSHOT_NAME = PublishedVersionName.Published;

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
  const remoteUpdateNotebookPublishState = useMutationResultHandler(
    useSetNotebookPublishStateMutation()[1],
    'Unable to change public status of notebook'
  );
  const updateAllowDuplicate = useMutationResultHandler(
    useUpdateNotebookAllowDuplicateMutation()[1],
    'Unable to change allow duplicate permission'
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
  >(
    async (notebookId) => {
      try {
        await exportNotebook(notebookId)();
      } catch (err) {
        console.error(err);
        captureException(err);
        toast.error('Error downloading notebook');
      }
    },
    [toast]
  );

  const onDownloadNotebookHistory = useCallback<
    NotebookMetaActionsReturn['onDownloadNotebookHistory']
  >(
    async (notebookId) => {
      try {
        await exportNotebookBackups(notebookId)();
      } catch (err) {
        console.error(err);
        toast('Error downloading notebook', 'error');
        captureException(err);
      }
    },
    [toast]
  );

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
        console.error(res.error);
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

  /**
   * Prevents the user from calling this function multiple times,
   * before the mutation returns.
   */
  const isPublishingMutex = useRef(false);

  const onPublishNotebook = useCallback<
    NotebookMetaActionsReturn['onPublishNotebook']
  >(
    async (notebookId) => {
      if (isPublishingMutex.current) return;
      isPublishingMutex.current = true;

      const localState = await getLocalNotebookUpdates(notebookId);

      const base64State = localState && Buffer.from(localState);

      let version: string | undefined;

      if (base64State) {
        const doc = new Doc();
        applyUpdate(doc, base64State);
        version = md5(canonicalize(toSlateDoc(doc.getArray())));
      }

      await createOrUpdateSnapshot({
        params: {
          notebookId,
          snapshotName: SNAPSHOT_NAME,
          remoteState: base64State?.toString('base64'),
          remoteVersion: version,
        },
      });

      isPublishingMutex.current = false;
    },
    [createOrUpdateSnapshot]
  );

  const onUpdatePublishState = useCallback<
    NotebookMetaActionsReturn['onUpdatePublishState']
  >(
    async (notebookId, publishState) => {
      await remoteUpdateNotebookPublishState({
        id: notebookId,
        publishState,
      });
    },
    [remoteUpdateNotebookPublishState]
  );

  const onUpdateAllowDuplicate = useCallback<
    NotebookMetaActionsReturn['onUpdateAllowDuplicate']
  >(
    async (notebookId, allowDuplicate) => {
      await updateAllowDuplicate({ id: notebookId, allowDuplicate });
    },
    [updateAllowDuplicate]
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
    onUpdatePublishState,
    onPublishNotebook,
    onUpdateAllowDuplicate,
  };
}
