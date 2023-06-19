import { Editor, useEditorPlugins } from '@decipad/editor';
import { insertLiveConnection } from '@decipad/editor-components';
import { useNotebookState } from '@decipad/notebook-state';
import { ComputerContextProvider } from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { useSession } from 'next-auth/react';
import { FC, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEditorUserInteractionsContext } from '../../react-contexts/src/editor-user-interactions';
import { ExternalDataSourcesProvider } from './ExternalDataSourcesProvider';
import { InitialSelection } from './InitialSelection';
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
  // User warning
  const toast = useToast();
  const { data: session } = useSession();

  const {
    initComputer,
    initEditor,
    editor,
    computer,
    loadedFromRemote,
    timedOutLoadingFromRemote,
    hasLocalChanges,
    destroy,
    isNewNotebook,
  } = useNotebookState(notebookId);

  const interactions = useEditorUserInteractionsContext();

  const plugins = useEditorPlugins({
    notebookId,
    computer,
    readOnly,
    notebookTitle,
    onNotebookTitleChange,
    interactions,
  });
  const loaded = loadedFromRemote || timedOutLoadingFromRemote;

  useEffect(() => {
    if (editor) {
      onEditor(editor);
    }
  }, [editor, onEditor]);

  useEffect(() => {
    if (!computer) {
      initComputer();
    } else if (notebookMetaLoaded && plugins) {
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
    computer,
    connectionParams,
    editor,
    initComputer,
    initEditor,
    initialState,
    notebookId,
    notebookMetaLoaded,
    plugins,
    readOnly,
    secret,
    session,
  ]);

  const location = useLocation();

  useEffect(() => {
    return destroy; // always destroy the editor on unmount
  }, [destroy, location]);

  // docSync

  useEffect(() => {
    if (editor) {
      onDocsync(editor);
    }
  }, [editor, onDocsync]);

  // changes warning

  const warning: string | false =
    readOnly &&
    `Changes to this notebook are not saved${
      (session?.user &&
        '. Please duplicate to customize and make it your own.') ||
      ''
    }`;
  const [toastedWarning, setToastedWarning] = useState(false);

  useEffect(() => {
    if (warning && hasLocalChanges && !toastedWarning) {
      setToastedWarning(true);
      toast(warning as string, 'warning', { autoDismiss: false });
    }
  }, [editor, hasLocalChanges, toast, toastedWarning, warning]);

  // import external doc
  const { search } = useLocation();
  const qs = useMemo(() => new URLSearchParams(search), [search]);
  useEffect(() => {
    const importThing = qs.get('import');
    if (loaded && computer && editor && importThing) {
      (async () => {
        try {
          await insertLiveConnection({
            computer,
            editor,
            source: 'gsheets',
            url: importThing,
          });
        } catch (err) {
          toast((err as Error).message, 'error');
        }
      })();
    }
  }, [computer, editor, loaded, qs, toast]);

  if (editor) {
    return (
      <ExternalDataSourcesProvider
        notebookId={notebookId}
        useExternalDataSources={useExternalDataSources}
      >
        <ComputerContextProvider computer={computer}>
          <Editor
            notebookId={notebookId}
            workspaceId={workspaceId}
            loaded={loaded}
            isSavedRemotely={editor.isSavedRemotely()}
            editor={editor}
            readOnly={readOnly}
            isNewNotebook={isNewNotebook}
          >
            <InitialSelection
              notebookId={notebookId}
              loaded={loaded}
              editor={editor}
            />
          </Editor>
        </ComputerContextProvider>
      </ExternalDataSourcesProvider>
    );
  }
  return null;
};
