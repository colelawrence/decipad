/* eslsnt-disable prefer-destructuring */
import {
  type RemoteComputer,
  getRemoteComputer,
} from '@decipad/remote-computer';
import { DocSyncEditor } from '@decipad/docsync';
import {
  useFinishOnboarding,
  useGetNotebookAnnotationsQuery,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  ControllerProvider,
  EditorChangeContextProvider,
  useAiCreditsStore,
  AnnotationsContext,
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
import {
  FC,
  Suspense,
  createContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import { Subject } from 'rxjs';
import { ErrorPage } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { Topbar, Tabs, Sidebar, Editor } from './LoadComponents';
import { useScenarioNavigate } from './hooks/useScenarioNavigate';

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
  const [annotations, refetch] = useGetNotebookAnnotationsQuery({
    variables: {
      notebookId,
    },
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!docsync || docsync.isReadOnly) {
      return;
    }
    refetch({
      requestPolicy: 'network-only',
      variables: {
        notebookId,
      },
    });
    clearInterval(intervalRef.current ?? undefined);
    intervalRef.current = setInterval(() => {
      refetch({
        requestPolicy: 'network-only',
        variables: {
          notebookId,
        },
      });
    }, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch, notebookId, docsync]);

  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);

  if (error) {
    return getNotebookError(error);
  }

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <DocsyncEditorProvider.Provider value={docsync} key={notebookId}>
        <ControllerProvider.Provider value={docsync}>
          <ComputerContextProvider computer={computer}>
            <AnnotationsContext.Provider
              value={{
                annotations:
                  annotations.data?.getAnnotationsByPadId || undefined,
                articleRef,
                scenarioId: scenarioId || null,
                expandedBlockId,
                setExpandedBlockId,
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
            </AnnotationsContext.Provider>
          </ComputerContextProvider>
        </ControllerProvider.Provider>
      </DocsyncEditorProvider.Provider>
    </EditorChangeContextProvider>
  );
};

export default Notebook;

const DocsyncEditorProvider = createContext<DocSyncEditor | undefined>(
  undefined
);

export function getNotebookError(error: Error | undefined): JSX.Element | null {
  if (error) {
    if (/no such/i.test(error?.message) || /forbidden/i.test(error?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    throw error;
  }
  return null;
}
