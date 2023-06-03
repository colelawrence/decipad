import { FC, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSession } from 'next-auth/react';
import { DocSyncEditor } from '@decipad/docsync';
import { Editor, useEditorPlugins } from '@decipad/editor';
import { MyEditor } from '@decipad/editor-types';
import { useNotebookState } from '@decipad/notebook-state';
import {
  ComputerContextProvider,
  EditorPasteInteractionMenuProvider,
} from '@decipad/react-contexts';
import { useToast } from '@decipad/toast';
import { insertLiveConnection } from '@decipad/editor-components';
import { EditorAttachmentsHandler } from '@decipad/editor-attachments';
import { EditorStats } from '@decipad/editor-stats';
import { isFlagEnabled } from '@decipad/feature-flags';
import type { ExternalDataSourcesContextValue } from '@decipad/interfaces';
import {
  EditorUserInteractionsProvider,
  useEditorUserInteractionsContext,
} from '../../react-contexts/src/editor-user-interactions';
import { InitialSelection } from './InitialSelection';
import { ExternalDataSourcesProvider } from './ExternalDataSourcesProvider';

export interface NotebookConnectionParams {
  url: string;
  token: string;
}

export interface NotebookProps {
  notebookId: string;
  notebookMetaLoaded: boolean;
  notebookTitle: string;
  onNotebookTitleChange: (newValue: string) => void;
  readOnly: boolean;
  secret?: string;
  connectionParams: NotebookConnectionParams | undefined;
  initialState?: string;
  onEditor: (editor: MyEditor) => void;
  onDocsync: (docsync: DocSyncEditor) => void;
  getAttachmentForm: (
    file: File
  ) => Promise<undefined | [URL, FormData, string]>;
  onAttached: (handle: string) => Promise<undefined | { url: URL }>;
  useExternalDataSources: (
    notebookId: string
  ) => ExternalDataSourcesContextValue;
}

type InsideNodebookStateProps = Omit<
  NotebookProps,
  'getAttachmentForm' | 'onAttached'
>;

const InsideNotebookState = ({
  notebookId,
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
}: InsideNodebookStateProps) => {
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

export const Notebook: FC<NotebookProps> = (props) => {
  const { getAttachmentForm, onAttached, ...rest } = props;
  return (
    <EditorUserInteractionsProvider>
      <EditorPasteInteractionMenuProvider>
        <EditorAttachmentsHandler
          notebookId={rest.notebookId}
          getAttachmentForm={getAttachmentForm}
          onAttached={onAttached}
        />
        <InsideNotebookState {...rest} />
        {isFlagEnabled('COMPUTER_STATS') && <EditorStats />}
      </EditorPasteInteractionMenuProvider>
    </EditorUserInteractionsProvider>
  );
};
