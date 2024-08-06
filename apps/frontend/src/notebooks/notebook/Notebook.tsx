import type { DocSyncEditor } from '@decipad/docsync';
import {
  useFinishOnboarding,
  useGetNotebookMetaQuery,
  useRecordPadEventMutation,
} from '@decipad/graphql-client';
import {
  AnnotationArray,
  useCurrentWorkspaceStore,
  ControllerProvider,
  EditorChangeContextProvider,
  useAiCreditsStore,
  AnnotationsProvider,
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
import { Suspense, useState, useEffect, useCallback } from 'react';
import { Subject } from 'rxjs';
import { ErrorPage } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { Topbar, Tabs, Sidebar, Editor } from './LoadComponents';
import { useScenarioNavigate } from './hooks/useScenarioNavigate';
import { useEditorClientEvents } from '../../hooks/useEditorClientEvents';
import { ClientEventsContext } from '@decipad/client-events';
import { useInitializeResourceUsage } from '../../hooks';
import { useIsEmbed, useNotebookRouterId } from './hooks';
import { getAnonUserMetadata } from '@decipad/utils';
import { notebooks, useRouteParams } from '@decipad/routing';
import { DataDrawer } from './data-drawer';

/**
 * Entire Application Wrapper.
 *
 * It does no requesting or suspending itself (And should remain this way).
 * And instead renders the suspense barriers, and components that will suspend themselves.
 *
 * This is the only component that should contain suspend barriers.
 */
export const Notebook: FC = () => {
  const notebookId = useNotebookRouterId();
  const isEmbed = useIsEmbed();
  const { alias: aliasId } = useRouteParams(notebooks({}).notebook);

  const [changeSubject] = useState(() => new Subject<undefined>());
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();
  const [error, setError] = useState<Error | undefined>(undefined);

  const { setWorkspacePlan } = useNotebookMetaData();

  const [{ data: notebookMetadaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

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
      if (!docsync?.isReadOnly) {
        return;
      }
      await onRecordPadEvent('notebook_load', meta);
    };

    if (docsync) {
      onRecordReaderLoadPad();
    }
  }, [docsync, onRecordPadEvent]);

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

  const articleRef = useSetCssVarWidth('editorWidth');
  const [scenarioId] = useScenarioNavigate();
  const props = {
    notebookId,
    docsync,
  };

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  const { setSidebar, sidebar } = useNotebookMetaData((state) => ({
    setSidebar: state.setSidebar,
    sidebar: state.sidebarComponent,
  }));

  const handleExpandedBlockId = useCallback(
    (blockId: string | null) => {
      if (sidebar !== 'annotations') {
        setSidebar('annotations');
      }
      setExpandedBlockId(blockId);
    },
    [setExpandedBlockId, setSidebar, sidebar]
  );

  const [annotations, setAnnotations] = useState<AnnotationArray | undefined>(
    undefined
  );

  const editorClientEvents = useEditorClientEvents(notebookId);

  if (error) {
    return getNotebookError(error);
  }

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <ControllerProvider.Provider value={docsync}>
        <ClientEventsContext.Provider value={editorClientEvents}>
          <AnnotationsProvider
            value={{
              annotations,
              setAnnotations,
              aliasId: aliasId || null,
              scenarioId: scenarioId || null,
              expandedBlockId,
              handleExpandedBlockId,
              permission:
                notebookMetadaData?.getPadById?.myPermissionType ?? null,
            }}
          >
            <NotebookPage
              notebook={
                <Suspense fallback={<EditorPlaceholder />}>
                  <Editor
                    notebookId={notebookId}
                    docsync={docsync}
                    setDocsync={setDocsync}
                    setError={setError}
                  />
                </Suspense>
              }
              topbar={
                <Suspense fallback={<TopbarPlaceholder />}>
                  <Topbar {...props} />
                </Suspense>
              }
              articleRef={articleRef}
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
          </AnnotationsProvider>
        </ClientEventsContext.Provider>
      </ControllerProvider.Provider>
    </EditorChangeContextProvider>
  );
};

export default Notebook;

export function getNotebookError(error: Error | undefined): JSX.Element | null {
  if (error) {
    if (/no such/i.test(error?.message) || /forbidden/i.test(error?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    throw error;
  }
  return null;
}
