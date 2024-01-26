/* eslsnt-disable prefer-destructuring */
import {
  type RemoteComputer,
  getRemoteComputer,
} from '@decipad/remote-computer';
import { DocSyncEditor } from '@decipad/docsync';
import { useFinishOnboarding } from '@decipad/graphql-client';
import {
  ComputerContextProvider,
  ControllerProvider,
  EditorChangeContextProvider,
  useAiCreditsStore,
} from '@decipad/react-contexts';
import { notebooks, useRouteParams } from '@decipad/routing';
import {
  EditorPlaceholder,
  NotebookPage,
  TopbarPlaceholder,
  AssistantChatPlaceholder,
  AddCreditsModal,
} from '@decipad/ui';
import { FC, Suspense, createContext, useState } from 'react';
import { Subject } from 'rxjs';
import { ErrorPage, RequireSession } from '../../meta';
import { useAnimateMutations } from './hooks/useAnimateMutations';
import { isFlagEnabled } from '@decipad/feature-flags';
import { Topbar, Tabs, Sidebar, Editor, AssistantChat } from './LoadComponents';

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

  useAnimateMutations();
  useFinishOnboarding();

  const { isBuyCreditsModalOpen, setIsBuyCreditsModalOpen } =
    useAiCreditsStore();

  if (error) {
    return getNotebookError(error);
  }

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
                  <Topbar notebookId={notebookId} docsync={docsync} />
                </Suspense>
              }
              sidebar={<Sidebar docsync={docsync} />}
              tabs={
                !isEmbed && docsync && isFlagEnabled('TABS') ? (
                  <Tabs
                    notebookId={notebookId}
                    controller={docsync}
                    docsync={docsync}
                  />
                ) : null
              }
              assistant={
                isFlagEnabled('AI_ASSISTANT_CHAT') ? (
                  <Suspense fallback={<AssistantChatPlaceholder />}>
                    <AssistantChat notebookId={notebookId} docsync={docsync} />
                  </Suspense>
                ) : null
              }
              isEmbed={isEmbed}
            />
            {
              <Suspense>
                {isBuyCreditsModalOpen && (
                  <AddCreditsModal
                    closeAction={() => setIsBuyCreditsModalOpen(false)}
                  />
                )}
              </Suspense>
            }
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
