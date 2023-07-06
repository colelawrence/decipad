import { FC, Suspense, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { lastValueFrom } from 'rxjs';
import {
  ComputerContextProvider,
  useEditorUserInteractionsContext,
} from '@decipad/react-contexts';
import { useEditorPlugins } from '@decipad/editor-config';
import { useNotebookState } from '@decipad/notebook-state';
import { isServerSideRendering } from '@decipad/support';
import { EditorPlaceholder } from '@decipad/ui';
import { useNotebookWarning } from './useNotebookWarning';
import { SuspendedNotebook } from './SuspendedNotebook';
import { ExternalDataSourcesProvider } from './ExternalDataSourcesProvider';
import type { NotebookProps } from './types';

type NotebookLoaderProps = Omit<
  NotebookProps,
  'getAttachmentForm' | 'onAttached'
>;

export const NotebookLoader: FC<NotebookLoaderProps> = ({
  notebookId,
  workspaceId,
  notebookMetaLoaded,
  notebookTitle,
  onNotebookTitleChange,
  readOnly,
  secret,
  connectionParams,
  initialState,
  onEditor,
  onDocsync,
  useExternalDataSources,
}) => {
  const { data: session } = useSession();

  const {
    notebookLoadedPromise,
    initEditor,
    editor,
    computer,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    destroy,
    isNewNotebook,
  } = useNotebookState(notebookId);

  const loaded = loadedFromRemote || timedOutLoadingFromRemote;
  const interactions = useEditorUserInteractionsContext();

  const plugins = useEditorPlugins({
    notebookId,
    computer,
    readOnly,
    notebookTitle,
    onNotebookTitleChange,
    interactions,
  });

  useEffect(() => {
    if (editor) {
      onEditor(editor);
    }
  }, [editor, onEditor]);

  const init = useCallback(() => {
    if (notebookMetaLoaded && plugins) {
      initEditor(
        notebookId,
        {
          plugins,
          docsync: {
            readOnly,
            authSecret: secret,
            connectionParams,
            initialState,
            protocolVersion: 2,
          },
        },
        () => session ?? undefined
      );
    }
  }, [
    connectionParams,
    initEditor,
    initialState,
    notebookId,
    notebookMetaLoaded,
    plugins,
    readOnly,
    secret,
    session,
  ]);

  // notebook initialization: client-side rendering
  useEffect(init, [init]);

  // notebook initialization: SSR
  if (isServerSideRendering()) {
    // we need this for SSR
    init();
  }

  useEffect(() => {
    return () => {
      const { pathname } = window.location;
      const match = pathname.match(/^\/n\/.*%3A(.*)$/);
      if (!match || match[1] !== notebookId) {
        destroy(); // destroy the editor on unmount
      }
    };
  }, [destroy, notebookId]);

  // docSync

  useEffect(() => {
    if (editor) {
      onDocsync(editor);
    }
  }, [editor, onDocsync]);

  useNotebookWarning({ notebookId });

  const readOrSuspendEditor = useMemo(
    () => ({
      read: () => {
        if (notebookLoadedPromise.resolved) {
          return notebookLoadedPromise.resolved;
        }
        throw notebookLoadedPromise;
      },
    }),
    [notebookLoadedPromise]
  );

  if (
    isServerSideRendering() &&
    computer &&
    !computer?.results$.get().blockResults
  ) {
    throw lastValueFrom(computer.results);
  }

  if (editor) {
    return (
      <ExternalDataSourcesProvider
        notebookId={notebookId}
        useExternalDataSources={useExternalDataSources}
      >
        <ComputerContextProvider computer={computer}>
          <Suspense fallback={<EditorPlaceholder />}>
            <div
              data-editorloaded={loaded}
              data-hydrated={!isServerSideRendering() && loaded}
            >
              <SuspendedNotebook
                notebookId={notebookId}
                workspaceId={workspaceId}
                loaded={loaded}
                isSavedRemotely={editor.isSavedRemotely()}
                editor={readOrSuspendEditor}
                readOnly={readOnly}
                isNewNotebook={isNewNotebook}
              />
            </div>
          </Suspense>
        </ComputerContextProvider>
      </ExternalDataSourcesProvider>
    );
  }
  return null;
};
