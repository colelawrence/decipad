import {
  useFinishOnboarding,
  useGetNotebookMetaQuery,
  useRecordPadEventMutation,
} from '@decipad/graphql-client';
import {
  useCurrentWorkspaceStore,
  useAiCreditsStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import {
  EditorPlaceholder,
  NotebookPage,
  TopbarPlaceholder,
  AddCreditsModal,
  PaywallModal,
  useSetCssVarWidth,
} from '@decipad/ui';
import type { FC } from 'react';
import { Suspense, useEffect, useCallback } from 'react';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { Topbar, Tabs, Sidebar, Editor } from './LoadComponents';
import { useEditorClientEvents } from '../../hooks/useEditorClientEvents';
import { ClientEventsContext } from '@decipad/client-events';
import { useInitializeResourceUsage } from '../../hooks';
import { getAnonUserMetadata } from '@decipad/utils';
import { DataDrawer } from './data-drawer';
import { useNotebookRoute } from '@decipad/routing';
import { useIsReadOnlyPermission } from './hooks';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { NotebookErrorBoundary } from './Errors';

/**
 * Entire Application Wrapper.
 *
 * It does no requesting or suspending itself (And should remain this way).
 * And instead renders the suspense barriers, and components that will suspend themselves.
 *
 * This is the only component that should contain suspend barriers.
 */
export const Notebook: FC = () => {
  const { notebookId, isEmbed, aliasId } = useNotebookRoute();

  const { setWorkspacePlan } = useNotebookMetaData();

  const setPermission = useNotebookWithIdState((s) => s.setPermission);

  const [{ data: notebookMetadaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

  useEffect(() => {
    setPermission(
      notebookMetadaData?.getPadById?.myPermissionType ?? undefined
    );
  }, [notebookMetadaData?.getPadById?.myPermissionType, setPermission]);

  const isReadOnly = useIsReadOnlyPermission();

  const [, recordPadEvent] = useRecordPadEventMutation();

  const onRecordPadEvent = useCallback(
    async (name: string, meta: string) => {
      if (aliasId) {
        await recordPadEvent({
          padId: notebookId,
          aliasId,
          name,
          meta,
        });
      }
    },
    [notebookId, recordPadEvent, aliasId]
  );

  // TODO: fix all this stuffs
  useEffect(() => {
    const onRecordReaderLoadPad = async () => {
      const meta = (await getAnonUserMetadata()).join(', ');
      if (isReadOnly) {
        return;
      }
      await onRecordPadEvent('notebook_load', meta);
    };

    onRecordReaderLoadPad();
  }, [isReadOnly, onRecordPadEvent]);

  useInitializeResourceUsage(notebookMetadaData?.getPadById?.workspace);

  useEffect(() => {
    setWorkspacePlan(notebookMetadaData?.getPadById?.workspace?.plan || 'free');
  }, [
    notebookId,
    notebookMetadaData?.getPadById?.workspace?.plan,
    setWorkspacePlan,
  ]);

  useAnimateMutations();
  useFinishOnboarding();

  const { isBuyCreditsModalOpen, setIsBuyCreditsModalOpen } =
    useAiCreditsStore();
  const {
    setIsUpgradeWorkspaceModalOpen,
    isUpgradeWorkspaceModalOpen,
    workspaceInfo,
  } = useCurrentWorkspaceStore();

  const docsync = useNotebookWithIdState((s) => s.editor);

  const articleRef = useSetCssVarWidth('editorWidth');
  const props = {
    notebookId,
    docsync,
  };

  const editorClientEvents = useEditorClientEvents(notebookId);

  return (
    <NotebookErrorBoundary>
      <ClientEventsContext.Provider value={editorClientEvents}>
        <NotebookPage
          articleRef={articleRef}
          notebook={
            <Suspense fallback={<EditorPlaceholder />}>
              <Editor notebookId={notebookId} docsync={docsync} />
            </Suspense>
          }
          topbar={
            <Suspense fallback={<TopbarPlaceholder />}>
              <Topbar {...props} />
            </Suspense>
          }
          sidebar={
            <Suspense>
              <Sidebar {...props} />
            </Suspense>
          }
          tabs={
            !isEmbed && docsync ? (
              <Tabs
                notebookId={notebookId}
                controller={docsync}
                docsync={docsync}
              />
            ) : null
          }
          dataDrawer={<DataDrawer />}
          isEmbed={isEmbed}
          isReadOnly={docsync?.isReadOnly}
          permission={notebookMetadaData?.getPadById?.myPermissionType}
        />
        <Suspense>
          {isBuyCreditsModalOpen && (
            <AddCreditsModal
              closeAction={() => setIsBuyCreditsModalOpen(false)}
            />
          )}
          {isUpgradeWorkspaceModalOpen && (
            <PaywallModal
              onClose={() => setIsUpgradeWorkspaceModalOpen(false)}
              workspaceId={workspaceInfo.id ?? ''}
              hasFreeWorkspaceSlot={false}
              currentPlan={workspaceInfo.plan ?? undefined}
              isCreatingNewWorkspace={false}
            />
          )}
        </Suspense>
      </ClientEventsContext.Provider>
    </NotebookErrorBoundary>
  );
};

export default Notebook;
