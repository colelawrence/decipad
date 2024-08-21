import type { FC } from 'react';
import { Suspense, useCallback, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { lastValueFrom } from 'rxjs';
import { useEditorUserInteractionsContext } from '@decipad/react-contexts';
import { useEditorPlugins } from '@decipad/editor-config';
import { useNotebookState } from '@decipad/notebook-state';
import { isServerSideRendering } from '@decipad/support';
import { EditorPlaceholder } from '@decipad/ui';
import { useNotebookWarning } from './useNotebookWarning';
import type { NotebookProps } from './types';
import { useLocalBackupNotice } from './useLocalBackupNotice';
import { TabEditorComponent } from '@decipad/editor';
import { useNotebookRoute } from '@decipad/routing';
import { OutsideTabHiddenLanguageElements } from './OutsideTabHiddenLanguageElements';
import { useEditorEvents } from './useEditorEvents';

type NotebookLoaderProps = Omit<
  NotebookProps,
  'getAttachmentForm' | 'onAttached'
>;

export const NotebookLoader: FC<NotebookLoaderProps> = ({
  notebookId,
  workspaceId,
  notebookMetaLoaded,
  readOnly,
  secret,
  connectionParams,
  initialState,
  onNotebookTitleChange,
}) => {
  const { data: session } = useSession();

  const [
    notebookLoadedPromise,
    initEditor,
    editor,
    computer,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasNotSavedRemotelyInAWhile,
  ] = useNotebookState(
    notebookId,
    (s) =>
      [
        s.notebookLoadedPromise,
        s.initEditor,
        s.editor,
        s.computer,
        s.loadedFromRemote,
        s.timedOutLoadingFromRemote,
        s.hasNotSavedRemotelyInAWhile,
      ] as const
  );

  const loaded = loadedFromRemote || timedOutLoadingFromRemote;
  const interactions = useEditorUserInteractionsContext();

  const plugins = useEditorPlugins({
    computer,
    interactions,
  });

  useEditorEvents(editor);

  const init = useCallback(() => {
    if (notebookMetaLoaded && plugins) {
      initEditor({
        notebookId,
        options: {
          plugins,
          docsync: {
            readOnly,
            authSecret: secret,
            connectionParams,
            initialState,
            protocolVersion: 2,
          },
          onChangeTitle: onNotebookTitleChange,
        },
        getSession: () => session ?? undefined,
        interactions,
      });
    }
  }, [
    connectionParams,
    initEditor,
    initialState,
    interactions,
    notebookId,
    notebookMetaLoaded,
    onNotebookTitleChange,
    plugins,
    readOnly,
    secret,
    session,
  ]);

  // notebook initialization: client-side rendering
  // We take `editor`, because if that dependency changes
  // we want to force `init` to run to get us an up to date editor.
  useEffect(init, [init, editor]);

  // notebook initialization: SSR
  if (isServerSideRendering()) {
    // we need this for SSR
    init();
  }

  useNotebookWarning({ notebookId });
  useLocalBackupNotice(editor, hasNotSavedRemotelyInAWhile);

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

  const { tabId } = useNotebookRoute();

  if (editor) {
    return (
      <Suspense fallback={<EditorPlaceholder />}>
        <div
          data-editorloaded={loaded}
          data-hydrated={!isServerSideRendering() && loaded}
        >
          <TabEditorComponent
            notebookId={notebookId}
            workspaceId={workspaceId}
            loaded={loaded}
            controller={readOrSuspendEditor.read()}
            readOnly={readOnly}
          >
            <OutsideTabHiddenLanguageElements editor={editor} tabId={tabId} />
          </TabEditorComponent>
        </div>
      </Suspense>
    );
  }
  return null;
};
