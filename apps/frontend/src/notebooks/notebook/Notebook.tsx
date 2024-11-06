import { ClientEventsContext } from '@decipad/client-events';
import { isFlagEnabled } from '@decipad/feature-flags';
import {
  useFinishOnboarding,
  useGetNotebookMetaQuery,
  useRecordPadEventMutation,
} from '@decipad/graphql-client';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import {
  useAiCreditsStore,
  useCurrentWorkspaceStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { useCanUseDom } from '@decipad/react-utils';
import { useNotebookRoute } from '@decipad/routing';
import {
  AddCreditsModal,
  EditorPlaceholder,
  NotebookPage,
  PaywallModal,
  Toolbar,
  TopbarPlaceholder,
  useSetCssVarWidth,
  NotebookListPlaceholder,
} from '@decipad/ui';
import { getAnonUserMetadata } from '@decipad/utils';
import { FC, Suspense, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  useInitializeResourceUsage,
  useNotebookMetaActions,
} from '../../hooks';
import { useEditorClientEvents } from '../../hooks/useEditorClientEvents';
import { DataDrawer } from './data-drawer';
import { NotebookErrorBoundary } from './Errors';
import { useIsReadOnlyPermission } from './hooks';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import {
  Editor,
  NavigationSidebar,
  Sidebar,
  Tabs,
  Topbar,
} from './LoadComponents';

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
  const canUseDom = useCanUseDom();
  const actions = useNotebookMetaActions();

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
    workspaceId: workspaceInfo.id ?? '',
    workspaces: notebookMetadaData?.workspaces ?? [],
    actions,
  };

  const editorClientEvents = useEditorClientEvents(notebookId);

  const shouldRenderNavigationSidebar = useMemo(() => {
    if (!notebookMetadaData?.getPadById) {
      return false;
    }
    return (
      isFlagEnabled('NAV_SIDEBAR') &&
      ['ADMIN', 'WRITE'].includes(
        notebookMetadaData.getPadById.myPermissionType || ''
      )
    );
  }, [notebookMetadaData]);

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
          /* even if this logic seems redundant please
           * do not remove it because otherwise this will
           * break newly created notebooks
           */
          shouldRenderNavigationSidebar={shouldRenderNavigationSidebar}
          leftSidebar={
            <Suspense fallback={<NotebookListPlaceholder />}>
              {shouldRenderNavigationSidebar ? (
                <NavigationSidebar {...props} />
              ) : null}
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
              <Suspense fallback={<></>}>
                <Tabs
                  notebookId={notebookId}
                  controller={docsync}
                  docsync={docsync}
                />
              </Suspense>
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
      {/* Feature flagging the feature flag switcher makes it unreacheable in
      production, even if you press the shortcut, unless you know how */}
      {canUseDom &&
        isFlagEnabled('DEVELOPER_TOOLBAR') &&
        createPortal(<Toolbar />, document.getElementById('root')!)}
    </NotebookErrorBoundary>
  );
};

export default Notebook;
