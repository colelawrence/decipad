/* eslsnt-disable prefer-destructuring */
import {
  type RemoteComputer,
  getRemoteComputer,
} from '@decipad/remote-computer';
import type { DocSyncEditor } from '@decipad/docsync';
import {
  useFinishOnboarding,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import type { AnnotationArray } from '@decipad/react-contexts';
import {
  ComputerContextProvider,
  ControllerProvider,
  EditorChangeContextProvider,
  useAiCreditsStore,
  AnnotationsProvider,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import {
  EditorPlaceholder,
  NotebookPage,
  TopbarPlaceholder,
  AddCreditsModal,
  useSetCssVarWidth,
} from '@decipad/ui';
import type { FC } from 'react';
import { Suspense, useState, useEffect, useMemo } from 'react';
import { Subject } from 'rxjs';
import { ErrorPage } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { Topbar, Tabs, Sidebar, Editor } from './LoadComponents';
import { useScenarioNavigate } from './hooks/useScenarioNavigate';
import { useEditorClientEvents } from '../../hooks/useEditorClientEvents';
import { ClientEventsContext } from '@decipad/client-events';

/**
 * Entire Application Wrapper.
 *
 * It does no requesting or suspending itself (And should remain this way).
 * And instead renders the suspense barriers, and components that will suspend themselves.
 *
 * This is the only component that should contain suspend barriers.
 */
export const Notebook: FC = () => {
  const {
    notebook: { id: notebookId },
    embed: _embed,
  } = useRouteParams(notebooks({}).notebook);
  const isEmbed = Boolean(_embed);

  const [changeSubject] = useState(() => new Subject<undefined>());
  const [docsync, setDocsync] = useState<DocSyncEditor | undefined>();
  const [computer, setComputer] = useState<RemoteComputer>(getRemoteComputer());
  const [error, setError] = useState<Error | undefined>(undefined);

  const { setWorkspacePlan } = useNotebookMetaData();

  const [{ data: notebookMetadaData }] = useGetNotebookMetaQuery({
    variables: { id: notebookId },
  });

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

  const articleRef = useSetCssVarWidth('editorWidth');
  const [scenarioId] = useScenarioNavigate();
  const props = {
    notebookId,
    docsync,
  };

  const canDeleteComments = useMemo(() => {
    return notebookMetadaData?.getPadById?.myPermissionType === 'ADMIN';
  }, [notebookMetadaData?.getPadById?.myPermissionType]);

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
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
          <ComputerContextProvider computer={computer}>
            <AnnotationsProvider
              value={{
                annotations,
                setAnnotations,
                articleRef,
                scenarioId: scenarioId || null,
                expandedBlockId,
                setExpandedBlockId,
                canDeleteComments,
              }}
            >
              <NotebookPage
                notebook={
                  <Suspense fallback={<EditorPlaceholder />}>
                    <Editor
                      notebookId={notebookId}
                      docsync={docsync}
                      setDocsync={setDocsync}
                      setComputer={setComputer}
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
                isEmbed={isEmbed}
                isReadOnly={docsync?.isReadOnly}
              />
              <Suspense>
                {isBuyCreditsModalOpen && (
                  <AddCreditsModal
                    closeAction={() => setIsBuyCreditsModalOpen(false)}
                  />
                )}
              </Suspense>
            </AnnotationsProvider>
          </ComputerContextProvider>
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
