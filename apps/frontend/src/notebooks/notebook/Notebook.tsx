/* eslsnt-disable prefer-destructuring */
import {
  type RemoteComputer,
  getRemoteComputer,
} from '@decipad/remote-computer';
import { DocSyncEditor } from '@decipad/docsync';
import {
  useFinishOnboarding,
  useGetNotebookMetaQuery,
} from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  ControllerProvider,
  EditorChangeContextProvider,
  useAiCreditsStore,
  useNotebookMetaData,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import {
  EditorPlaceholder,
  NotebookPage,
  TopbarPlaceholder,
  AddCreditsModal,
} from '@decipad/ui';
import { FC, Suspense, createContext, useState, useEffect } from 'react';
import { Subject } from 'rxjs';
import { ErrorPage, RequireSession } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { Topbar, Tabs, Sidebar, Editor } from './LoadComponents';

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

  if (error) {
    return getNotebookError(error);
  }

  const props = {
    notebookId,
    docsync,
  };

  return (
    <EditorChangeContextProvider changeSubject={changeSubject}>
      <DocsyncEditorProvider.Provider value={docsync} key={notebookId}>
        <ControllerProvider.Provider value={docsync}>
          <ComputerContextProvider computer={computer}>
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
    if (/no such/i.test(error?.message))
      return <ErrorPage Heading="h1" wellKnown="404" />;
    if (/forbidden/i.test(error?.message)) {
      return (
        <RequireSession>
          <ErrorPage Heading="h1" wellKnown="403" />
        </RequireSession>
      );
    }
    throw error;
  }
  return null;
}
